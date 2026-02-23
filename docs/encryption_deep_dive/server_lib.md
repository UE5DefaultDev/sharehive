# Backend Engine: `lib/crypto/server.ts`

This file handles the backend's role in the "Hybrid" scheme using Node.js's native `crypto` module.

---

## 📚 Line-by-Line Breakdown

### 1. Decrypting from Client (`decryptFromClient`)
This is the first thing that happens when a message arrives at the server.

```typescript
export async function decryptFromClient(payload: any, serverPrivateKeyPem: string) {
  // 1. RSA-OAEP Decryption
  // The server uses its Private Key (from .env) to decrypt the wrapped AES key.
  const aesKey = crypto.privateDecrypt(
    {
      key: serverPrivateKeyPem,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    wrappedKeyBuffer
  );

  // 2. AAD Reconstruction
  // We MUST reconstruct the AAD exactly as the client sent it.
  const aadString = JSON.stringify({
    conversationId: payload.aad.conversationId,
    senderUserId: payload.aad.senderUserId,
  });

  // 3. AES-GCM Decryption
  // In Node.js, we must separate the Auth Tag (last 16 bytes) from the ciphertext.
  const decipher = crypto.createDecipheriv("aes-256-gcm", aesKey, iv);
  decipher.setAAD(Buffer.from(aadString));
  decipher.setAuthTag(tag); // Verifies the message wasn't tampered with.

  let decrypted = decipher.update(ciphertext);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString("utf8");
}
```

### 2. Encrypting for Recipient (`encryptForRecipient`)
This runs once for every person in the chat (fan-out).

```typescript
export async function encryptForRecipient(plaintext, meta, recipientPublicKeyPem) {
  // 1. Fresh AES Key Generation
  // SECURITY: We generate a NEW random AES key for every recipient.
  const aesKey = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);

  // 2. Recipient-Specific AAD
  // We bind this encryption to the recipient's ID and the message ID.
  const aadObj = {
    conversationId: meta.conversationId,
    senderUserId: meta.senderUserId,
    recipientUserId: meta.recipientUserId,
    messageId: meta.messageId,
  };

  // 3. AES-GCM Encryption
  const cipher = crypto.createCipheriv("aes-256-gcm", aesKey, iv);
  cipher.setAAD(Buffer.from(JSON.stringify(aadObj)));
  
  let ciphertext = cipher.update(plaintext, "utf8");
  ciphertext = Buffer.concat([ciphertext, cipher.final()]);
  const tag = cipher.getAuthTag(); // Generate the tamper-proof tag.

  // 4. RSA-OAEP Key Wrapping
  // Encrypt the fresh AES key with the recipient's Public Key.
  const wrappedKey = crypto.publicEncrypt(
    {
      key: recipientPublicKeyPem,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    aesKey
  );

  return { ... }; // Return the full JSON payload (delivery)
}
```

---

## 🔒 Security Note: Why Plaintext?
As per your build plan, the server decrypts the message to store a plaintext copy in the `Message` table. This is why the server needs its own RSA keypair. This allows you to view history easily, even if your local browser keys are lost.
