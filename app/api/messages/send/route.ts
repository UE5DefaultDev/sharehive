/**
 * SECURE MESSAGE SENDING ENDPOINT
 * 
 * ROLE:
 * This is the primary endpoint for submitting chat messages. It orchestrates the 
 * decryption-then-re-encryption flow required for hybrid E2EE.
 * 
 * WORKFLOW:
 * 1. Receive: Accepts an `EncryptedMessageToServer` payload from the sender.
 * 2. Decrypt: Uses the Server's Private Key to extract the plaintext message.
 * 3. Store: Saves the plaintext in the `Message` table (as per project requirements).
 * 4. Deliver: For every participant in the chat, it fetches their Public Key and 
 *    generates a unique `MessageDelivery` (encrypted payload) specifically for them.
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { decryptFromClient, encryptForRecipient } from "@/lib/crypto/server";

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json();

    // 1. Basic validation
    if (payload.version !== 1) {
      return NextResponse.json({ error: "Unsupported version" }, { status: 400 });
    }

    // 2. Find sender in DB
    const sender = await prisma.user.findUnique({
      where: { clerkId },
    });
    if (!sender) {
      return NextResponse.json({ error: "Sender not found" }, { status: 404 });
    }

    // Ensure senderUserId in payload matches authed user
    if (payload.senderUserId !== sender.id) {
       return NextResponse.json({ error: "Invalid sender ID" }, { status: 400 });
    }

    // 3. Decrypt message from client
    const serverPrivateKeyPem = process.env.SERVER_RSA_PRIVATE_KEY_PEM;
    if (!serverPrivateKeyPem) {
      return NextResponse.json({ error: "Server crypto not configured" }, { status: 500 });
    }

    let plaintext: string;
    try {
      plaintext = await decryptFromClient(payload, serverPrivateKeyPem);
    } catch (err) {
      console.error("Decryption failed:", err);
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // 4. Store plaintext message in DB
    const message = await prisma.message.create({
      data: {
        content: plaintext,
        authorId: sender.id,
        courseId: payload.conversationId,
      },
    });

    // 5. Find recipients (author + followers of the course)
    const course = await prisma.course.findUnique({
      where: { id: payload.conversationId },
      include: {
        author: {
           include: { keys: { where: { revokedAt: null }, orderBy: { createdAt: "desc" }, take: 1 } }
        },
        followedBy: {
           include: { keys: { where: { revokedAt: null }, orderBy: { createdAt: "desc" }, take: 1 } }
        }
      }
    });

    if (!course) {
       return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const recipients = [course.author, ...course.followedBy];
    // We unique them just in case author is also a follower
    const uniqueRecipients = Array.from(new Set(recipients.map(r => r.id)))
      .map(id => recipients.find(r => r.id === id)!);
    
    // 6. Encrypt for each recipient and store in message_deliveries
    const deliveryPromises = uniqueRecipients.map(async (recipient) => {
      const activeKey = recipient.keys[0];
      if (!activeKey) {
        console.warn(`No active key for recipient ${recipient.id}, skipping delivery.`);
        return;
      }

      const encryptedPayload = await encryptForRecipient(
        plaintext,
        {
          messageId: message.id,
          senderUserId: sender.id,
          recipientUserId: recipient.id,
          conversationId: course.id,
          sentAt: message.createdAt.toISOString(),
        },
        activeKey.publicKeyPem
      );

      // Add sender info for UI display
      (encryptedPayload as any).senderInfo = {
        name: sender.name,
        username: sender.username,
        image: sender.image,
      };

      return prisma.messageDelivery.create({
        data: {
          messageId: message.id,
          recipientUserId: recipient.id,
          encryptedPayloadJson: JSON.stringify(encryptedPayload),
        }
      });
    });

    await Promise.all(deliveryPromises);

    return NextResponse.json({ messageId: message.id });
  } catch (error) {
    console.error("Error in messages/send:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
