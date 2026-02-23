import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const since = searchParams.get("since");

    const user = await prisma.user.findUnique({
      where: { clerkId },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find deliveries for this user
    const deliveries = await prisma.messageDelivery.findMany({
      where: {
        recipientUserId: user.id,
        ...(since ? { message: { createdAt: { gt: new Date(since) } } } : {}),
      },
      include: {
        message: {
          select: { createdAt: true }
        }
      },
      orderBy: { message: { createdAt: "desc" } },
    });

    const payloads = deliveries.map(d => JSON.parse(d.encryptedPayloadJson));

    return NextResponse.json(payloads);
  } catch (error) {
    console.error("Error in messages/inbox:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
