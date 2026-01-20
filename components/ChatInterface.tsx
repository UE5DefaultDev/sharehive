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
  initialMessages,
  currentUserId,
}: ChatInterfaceProps) {
  // We use a state that updates whenever initialMessages changes (server revalidation)
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Sync state with props when server data changes
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const content = inputValue;
    setInputValue(""); // Optimistically clear input

    startTransition(async () => {
      try {
        await createMessage(courseId, content);
      } catch (error) {
        toast.error("Failed to send message");
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
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 px-4 py-6">
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
      </ScrollArea>

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