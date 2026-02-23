# Data Layer: The Database Schema (`prisma/schema.prisma`)

This file defines the structure of the tables that store our cryptographic data.

---

## 📚 Line-by-Line Breakdown

### 1. The `UserKey` Table
This stores the "Inbound" public keys for every user. Anyone can use these to send a message *to* that user.

```prisma
model UserKey {
  id             String   @id @default(cuid())
  // 👆 A unique ID for the key record.

  userId         String
  // 👆 Links the key to a specific user.

  publicKeyPem   String
  // 👆 The actual RSA Public Key (SPKI) stored as a text-based PEM string.
  // This is what other users fetch to encrypt messages for this user.

  keyFingerprint String
  // 👆 A SHA-256 hash of the public key. 
  // Used to quickly verify that the key hasn't been tampered with.

  createdAt      DateTime @default(now())
  // 👆 When the key was first registered.

  revokedAt      DateTime?
  // 👆 If the user logs in on a new device, we mark old keys as "revoked" 
  // so people don't use them anymore.

  user User @relation("UserKeys", fields: [userId], references: [id], onDelete: Cascade)
  // 👆 A relation to the User table. If a user is deleted, their keys are too.
}
```

### 2. The `MessageDelivery` Table
This is the "Outbound" table. It stores the specific encrypted payload for every recipient of every message.

```prisma
model MessageDelivery {
  id                   String   @id @default(cuid())
  // 👆 A unique ID for each delivery instance.

  messageId            String
  // 👆 Links to the original (plaintext) message in the `Message` table.

  recipientUserId      String
  // 👆 The specific user this delivery is for.

  encryptedPayloadJson String   
  // 👆 The core of the E2EE. This is a JSON string containing:
  // - The AES ciphertext
  // - The AES IV (Initialization Vector)
  // - The RSA-wrapped AES key
  // - The AAD (Additional Authenticated Data)

  deliveredAt          DateTime?
  readAt               DateTime?
  // 👆 Used to track if the user has fetched and decrypted the message yet.

  message   Message @relation("MessageDeliveries", fields: [messageId], references: [id], onDelete: Cascade)
  recipient User    @relation("UserDeliveries", fields: [recipientUserId], references: [id], onDelete: Cascade)
}
```

---

## 🔒 Why This Design?
By storing the **Public Key** in `UserKey` and the **Encrypted Payload** in `MessageDelivery`, we ensure that:
1.  **Transparency**: Anyone can audit which public key was used for a specific delivery.
2.  **Privacy**: Even if the `MessageDelivery` table is leaked, only the person with the corresponding **Private Key** (stored in their browser) can read it.
