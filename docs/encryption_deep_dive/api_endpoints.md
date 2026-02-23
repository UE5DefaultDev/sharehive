# API Endpoints: Communication Layers

These Next.js route handlers connect the frontend and backend crypto engines.

---

## 📚 Line-by-Line Breakdown

### 1. `GET /api/crypto/server-public-key`
*Purpose: Allows any client to fetch the server's public key.*

```typescript
export async function GET() {
  const publicKeyPem = process.env.SERVER_RSA_PUBLIC_KEY_PEM;
  // 👆 Reads the key from the server environment.

  if (!publicKeyPem) {
    return NextResponse.json({ error: "..." }, { status: 500 });
    // 👆 Safety check: If keys aren't configured, the system stops here.
  }

  return NextResponse.json({
    version: 1,
    alg: "RSA-OAEP-256",
    serverPublicKeyPem: publicKeyPem,
  });
}
```

### 2. `POST /api/crypto/user-public-key`
*Purpose: Registers the user's local public key with the database.*

```typescript
export async function POST(req: Request) {
  // 1. Authenticate the user via Clerk.
  const { userId: clerkId } = await auth();

  // 2. Verify the key strength (2048-bit minimum).
  const key = crypto.createPublicKey(publicKeyPem);
  const keyDetails = key.asymmetricKeyDetails;
  if (keyDetails?.modulusLength < 2048) { ... }

  // 3. Verify Fingerprint integrity.
  const computedFingerprint = crypto.createHash("sha256").update(der).digest("hex");
  if (computedFingerprint !== fingerprint) { ... }

  // 4. Update the DB in a transaction.
  await prisma.$transaction([
    prisma.userKey.updateMany({ ... revokedAt: new Date() }), // Revoke old keys
    prisma.userKey.create({ ... }) // Register new key
  ]);
}
```

### 3. `POST /api/messages/send`
*Purpose: Handles the hybrid decryption/re-encryption lifecycle.*

```typescript
export async function POST(req: Request) {
  // 1. Decrypt the inbound message from the client.
  const plaintext = await decryptFromClient(payload, serverPrivateKeyPem);

  // 2. Store the plaintext in the `Message` table.
  const message = await prisma.message.create({ ... });

  // 3. Fetch all participants (Author + Followers).
  const course = await prisma.course.findUnique({ 
    include: { author: { include: { keys: true } }, followedBy: { include: { keys: true } } } 
  });

  // 4. For EACH recipient, generate a unique encrypted delivery.
  const deliveryPromises = recipients.map(async (recipient) => {
    const encryptedPayload = await encryptForRecipient(plaintext, meta, key.publicKeyPem);
    
    return prisma.messageDelivery.create({
      data: { encryptedPayloadJson: JSON.stringify(encryptedPayload) }
    });
  });

  await Promise.all(deliveryPromises);
}
```
