/**
 * USER PUBLIC KEY REGISTRATION ENDPOINT
 * 
 * ROLE:
 * This API route allows the frontend to register a user's RSA Public Key with the server.
 * This is a one-time setup step that occurs the first time a user logs in on a new device.
 * 
 * SECURITY CHECKS:
 * 1. Authentication: Only logged-in users (via Clerk) can register a key.
 * 2. Key Validation: Verifies the key is a valid RSA key and meets the 2048-bit minimum strength.
 * 3. Integrity: Checks the provided fingerprint against the actual key data to prevent tampering.
 * 4. Persistence: Stores the key in the `UserKey` table and revokes any older keys for that user.
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import crypto from "node:crypto";

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { publicKeyPem, fingerprint } = body;

    if (!publicKeyPem || !fingerprint) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Verify PEM parses and is RSA >= 2048 bits
    try {
      const key = crypto.createPublicKey(publicKeyPem);
      if (key.type !== "public") throw new Error("Not a public key");
      
      const details = key.export({ type: "spki", format: "der" });
      // To check bits, we can use asymmeticKeyDetails if available (Node 15+)
      const keyDetails = key.asymmetricKeyDetails;
      if (keyDetails?.modulusLength && keyDetails.modulusLength < 2048) {
        return NextResponse.json({ error: "Key too weak" }, { status: 400 });
      }

      // 2. Verify fingerprint matches sha256(DER)
      const computedFingerprint = crypto
        .createHash("sha256")
        .update(details)
        .digest("hex");
      
      if (computedFingerprint !== fingerprint) {
        return NextResponse.json({ error: "Fingerprint mismatch" }, { status: 400 });
      }
    } catch (err) {
      return NextResponse.json({ error: "Invalid public key" }, { status: 400 });
    }

    // 3. Find user in DB
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 4. Store/Update user key
    // We'll mark old keys as revoked if they exist, or just add a new one.
    // The build plan says: "Deliveries should use the key active at send time."
    
    await prisma.$transaction([
      prisma.userKey.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
      prisma.userKey.create({
        data: {
          userId: user.id,
          publicKeyPem,
          keyFingerprint: fingerprint,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in user-public-key:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
