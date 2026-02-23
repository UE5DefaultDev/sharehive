"use client";

import { createMessage } from "@/actions/message.action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { SendIcon } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { useCrypto } from "@/components/CryptoProvider";
import { encryptForServer, decryptFromServer } from "@/lib/crypto/client";

type Message = {
  id: string;
  content: string;
  createdAt: Date;
  authorId: string;
  author: {
    name: string | null;
    username: string;
    image: string | null;
  };
};

type ChatInterfaceProps = {
  courseId: string;
  initialMessages: Message[];
  currentUserId: string;
};

export function ChatInterface({
  courseId,
  initialMessages: initialEncryptedMessages,
  currentUserId,
}: {
  courseId: string;
  initialMessages: any[];
  currentUserId: string;
}) {
  const { serverPublicKeyPem, isReady } = useCrypto();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Decrypt initial messages when ready
  useEffect(() => {
    async function decryptInitial() {
      if (!isReady || !initialEncryptedMessages.length) return;

      const decrypted = await Promise.all(
        initialEncryptedMessages.map(async (payload) => {
          try {
            const plaintext = await decryptFromServer(payload);
            return {
              id: payload.messageId,
              content: plaintext,
              createdAt: new Date(payload.sentAt),
              authorId: payload.senderUserId,
              author: {
                name: payload.senderInfo?.name || "User",
                username: payload.senderInfo?.username || "user",
                image: payload.senderInfo?.image || null,
              },
            };
          } catch (err) {
            return null;
          }
        })
      );
      
      const valid = decrypted.filter(m => m !== null) as Message[];
      setMessages(prev => {
        // Build a Map of all existing and new messages to ensure uniqueness by ID
        const allMessagesMap = new Map();
        prev.forEach(m => allMessagesMap.set(m.id, m));
        valid.forEach(m => allMessagesMap.set(m.id, m));
        
        return Array.from(allMessagesMap.values()).sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
    }

    decryptInitial();
  }, [isReady, initialEncryptedMessages]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      // Use requestAnimationFrame for more reliable scrolling in Turbopack/React 19
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, [messages]);

  // Poll for new messages using the encrypted inbox
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!isReady) return;

      const lastMessage = messages[messages.length - 1];
      const since = lastMessage 
        ? (lastMessage.createdAt instanceof Date ? lastMessage.createdAt.toISOString() : new Date(lastMessage.createdAt).toISOString())
        : new Date(0).toISOString();

      try {
        const res = await fetch(`/api/messages/inbox?since=${encodeURIComponent(since)}`);
        if (!res.ok) return;
        
        const encryptedPayloads = await res.json();
        if (!encryptedPayloads || !Array.isArray(encryptedPayloads) || encryptedPayloads.length === 0) return;

        const decryptedMessages = await Promise.all(
          encryptedPayloads
            .filter((p: any) => p.conversationId === courseId)
            .map(async (payload: any) => {
              try {
                const plaintext = await decryptFromServer(payload);
                return {
                  id: payload.messageId,
                  content: plaintext,
                  createdAt: new Date(payload.sentAt),
                  authorId: payload.senderUserId,
                  author: {
                    name: payload.senderInfo?.name || "User",
                    username: payload.senderInfo?.username || "user",
                    image: payload.senderInfo?.image || null,
                  },
                };
              } catch (err) {
                return null;
              }
            })
        );

        const validMessages = decryptedMessages.filter(m => m !== null) as Message[];
        
        if (validMessages.length > 0) {
          setMessages((prev) => {
            const allMessagesMap = new Map();
            prev.forEach(m => allMessagesMap.set(m.id, m));
            validMessages.forEach(m => allMessagesMap.set(m.id, m));
            
            const result = Array.from(allMessagesMap.values()).sort((a, b) => 
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );

            if (result.length === prev.length) return prev; // Avoid unnecessary re-renders
            return result;
          });
        }
      } catch (error) {
        console.error("Polling error", error);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [messages, courseId, isReady]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const content = inputValue;
    setInputValue(""); // Optimistically clear input

    startTransition(async () => {
      try {
        if (isReady && serverPublicKeyPem) {
          // Use encrypted message flow
          const payload = await encryptForServer(
            content,
            currentUserId,
            courseId,
            serverPublicKeyPem
          );

          const res = await fetch("/api/messages/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Failed to send message");
          }

          const { messageId } = await res.json();
          // Add message to local state so sender sees it
          const newMessage: Message = {
            id: messageId,
            content: content,
            createdAt: new Date(),
            authorId: currentUserId,
            author: {
              name: null, // You might want to get these from a user store/clerk
              username: "me",
              image: null,
            },
          };
          setMessages(prev => [...prev, newMessage]);
        } else {
          // Fallback to plaintext flow if crypto not ready
          await createMessage(courseId, content);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to send message");
        setInputValue(content); // Restore input on failure
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-6 w-full pb-4">
          {messages.map((msg) => {
            const isMe = msg.authorId === currentUserId;
            // Generate initials for avatar fallback
            const name = msg.author.name || msg.author.username || "User";
            const initials = name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={msg.id}
                className={cn(
                  "flex w-full gap-3",
                  isMe ? "justify-end" : "justify-start"
                )}
              >
                {/* Avatar for others */}
                {!isMe && (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarImage src={msg.author.image || undefined} />
                    <AvatarFallback className="text-xs bg-muted-foreground/20">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={cn(
                    "flex flex-col max-w-[75%]",
                    isMe ? "items-end" : "items-start"
                  )}
                >
                  {/* Header (Name & Time) */}
                  <div className="flex items-center gap-2 mb-1 px-1">
                    {!isMe && (
                      <span className="font-semibold text-xs text-muted-foreground">
                        {msg.author.name || msg.author.username}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground/70">
                      {format(new Date(msg.createdAt), "h:mm a")}
                    </span>
                  </div>

                  {/* Bubble */}
                  <div
                    className={cn(
                      "px-4 py-2.5 rounded-xl text-sm shadow-sm whitespace-pre-wrap", // whitespace-pre-wrap handles newlines
                      isMe
                        ? "bg-primary/90 text-primary-foreground rounded-tr-sm"
                        : "bg-card border border-border/50 rounded-tl-sm"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}
           {/* Invisible element to scroll to */}
           <div ref={bottomRef} />
        </div>
      </div>

      <div className="p-4 bg-background border-t">
        <div className="w-full flex gap-3 items-end">
          <Input
            placeholder="Type a new message"
            className="flex-1 bg-card border-border/60 focus-visible:ring-1 min-h-[44px]"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isPending}
          />
          <Button
            size="icon"
            className="h-11 w-11 rounded-full shadow-sm"
            onClick={handleSendMessage}
            disabled={isPending || !inputValue.trim()}
          >
            <SendIcon className="h-5 w-5 ml-0.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}