# Technical Specification: RSA + AES Hybrid Encryption

This document provides a low-level technical deep dive into the end-to-end encryption (E2EE) implementation for Sharehive. It explains the "Hybrid" approach, key management, and the lifecycle of a message.

---

## 1. Architectural Overview: The Hybrid Scheme

RSA is powerful but slow and has a strict data size limit (e.g., a 2048-bit RSA key cannot encrypt more than ~190 bytes). AES is extremely fast and handles arbitrary data sizes but requires both parties to share the same secret key.

**Our Solution:**
1. **AES-256-GCM** encrypts the actual message content.
2. **RSA-OAEP** encrypts (wraps) the AES key.

This provides the security of RSA key exchange with the performance and flexibility of AES.

---

## 2. Key Management

### A. Server Keypair (Inbound)
*   **Role:** Used by clients to encrypt messages *to* the server.
*   **Storage:** `SERVER_RSA_PRIVATE_KEY_PEM` and `SERVER_RSA_PUBLIC_KEY_PEM` in the server's `.env` file.
*   **Safety:** The Private Key never leaves the server.

### B. User Keypairs (Outbound/Recipients)
*   **Role:** Used by the server to encrypt messages *to* specific recipients.
*   **Storage (Public):** Stored in the database (`UserKey` table) so anyone can send to that user.
*   **Storage (Private):** Stored **locally in the user's browser** via IndexedDB. It is never sent to the server.
*   **Location:** `lib/crypto/client.ts` handles the IndexedDB logic using the `getOrCreateUserKeypair` function.

---

## 3. Data Models (`prisma/schema.prisma`)

We added two primary tables to support this:

```prisma
model UserKey {
  id             String   @id @default(cuid())
  userId         String
  publicKeyPem   String   // The RSA Public Key in PEM format
  keyFingerprint String   // SHA-256 hash of the key for quick verification
  createdAt      DateTime @default(now())
  revokedAt      DateTime? // Used for key rotation
  user           User     @relation("UserKeys", fields: [userId], references: [id])
}

model MessageDelivery {
  id                   String   @id @default(cuid())
  messageId            String
  recipientUserId      String
  encryptedPayloadJson String   // The full JSON envelope containing the wrapped key and ciphertext
  deliveredAt          DateTime?
  readAt               DateTime?
  message              Message  @relation("MessageDeliveries", fields: [messageId], references: [id])
  recipient            User     @relation("UserDeliveries", fields: [recipientUserId], references: [id])
}
```

---

## 4. The Message Lifecycle (Low Level)

### Step 1: Sending (Browser)
**File:** `components/ChatInterface.tsx` -> `lib/crypto/client.ts` (`encryptForServer`)

1. **AES Key Gen:** Generate a random 256-bit AES key and a 12-byte IV (Initialization Vector).
2. **AAD Construction:** Create "Additional Authenticated Data" (AAD). This binds the encryption to a specific context (Conversation + Sender) so a hacker can't move a valid ciphertext to a different chat.
   *   `AAD = { conversationId: "...", senderUserId: "..." }`
3. **AES Encryption:** Encrypt the plaintext using `AES-256-GCM`. The GCM mode includes an "Auth Tag" that ensures the message hasn't been tampered with.
4. **RSA Wrapping:** Fetch the **Server's Public Key** and encrypt the AES key using `RSA-OAEP`.
5. **Payload:** Send a JSON object to `/api/messages/send`.

### Step 2: Processing (Server)
**File:** `app/api/messages/send/route.ts` -> `lib/crypto/server.ts` (`decryptFromClient` & `encryptForRecipient`)

1. **Unwrap:** The server uses its **Private Key** to decrypt the AES key.
2. **Decrypt Content:** The server uses that AES key to decrypt the message and stores the plaintext in the `Message` table.
3. **Fan-out Encryption:** For **each** recipient in the chat (including the sender):
    a. Generate a **new, unique** AES key and IV.
    b. Encrypt the plaintext again using the recipient's specific AAD (which includes `messageId` and `recipientUserId`).
    c. Encrypt this new AES key using the **Recipient's Public Key**.
    d. Save the resulting JSON in the `MessageDelivery` table.

### Step 3: Receiving (Recipient Browser)
**File:** `components/ChatInterface.tsx` (Polling) -> `lib/crypto/client.ts` (`decryptFromServer`)

1. **Poll:** The browser polls `/api/messages/inbox?since=...`.
2. **Fetch:** It receives the encrypted payload from `MessageDelivery`.
3. **Local Decryption:**
    a. Fetch the user's **Private Key** from IndexedDB.
    b. Decrypt the wrapped AES key using `RSA-OAEP`.
    c. Decrypt the message content using that AES key and the specific AAD context.

---

## 5. Critical Security Implementation Details

### A. AAD (Additional Authenticated Data)
We enforce a strict JSON key ordering for AAD to ensure the browser and server always produce the exact same byte string, otherwise decryption fails.
*   **Sender AAD:** `{ conversationId, senderUserId }`
*   **Recipient AAD:** `{ conversationId, senderUserId, recipientUserId, messageId }`

### B. Persistent Keys
We use a custom logic in `lib/crypto/client.ts` to ensure keys persist across refreshes:
```typescript
async function getStoredKeys() {
  // Checks IndexedDB for PRIVATE_KEY_ID, PUBLIC_KEY_ID, and FINGERPRINT_ID
  // If all three exist, it returns them instead of generating new ones.
}
```

### C. Error Handling
We use `OperationError` catching to gracefully handle "Zombie" messages—messages encrypted with old keys that no longer exist in the browser. Instead of crashing, the UI simply skips them.

---

## 6. Project File Locations

| Component | File Path |
| :--- | :--- |
| **Database Schema** | `prisma/schema.prisma` |
| **Server Crypto Lib** | `lib/crypto/server.ts` |
| **Client Crypto Lib** | `lib/crypto/client.ts` |
| **Frontend Provider** | `components/CryptoProvider.tsx` |
| **Chat Interface** | `components/ChatInterface.tsx` |
| **Public Key Endpoint** | `app/api/crypto/server-public-key/route.ts` |
| **Register User Key** | `app/api/crypto/user-public-key/route.ts` |
| **Send Message API** | `app/api/messages/send/route.ts` |
| **Inbox/History API** | `app/api/messages/inbox/route.ts` |
| **Setup Script** | `scripts/generate_server_key.ts` |

---

## 7. How to Verify
1.  Open Chrome DevTools -> **Application** -> **IndexedDB**. You should see the `SharehiveCrypto` database with your private key.
2.  Open **Network** tab. Inspect the request to `/api/messages/send`. You will see the `ciphertext_b64` and `wrapped_key_b64`—proof that no plaintext is sent over the wire.
3.  Inspect the `MessageDelivery` table in your database. Every entry is a unique encryption specific to one user.
