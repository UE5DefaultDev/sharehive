# Frontend Engine: `lib/crypto/client.ts`

This file is the "Heart" of the E2EE. It performs all cryptographic operations inside the user's browser.

---

## 📚 Line-by-Line Breakdown

### 1. Key Persistence (`getStoredKeys`)
This function ensures that your private key doesn't disappear when you refresh the page.

```typescript
async function getStoredKeys() {
  const db = await openDB(); // Opens the IndexedDB instance
  const tx = db.transaction(STORE_NAME, "readonly"); // Starts a read-only transaction
  const store = tx.objectStore(STORE_NAME); // Accesses the "user_keys" store
  
  // We fetch all three items we need:
  const privReq = store.get(PRIVATE_KEY_ID); 
  const pubReq = store.get(PUBLIC_KEY_ID);
  const fingerReq = store.get(FINGERPRINT_ID);

  // When the transaction completes, we verify all three exist:
  tx.oncomplete = () => {
    if (privReq.result && pubReq.result && fingerReq.result) {
      resolve({ ... }); // Success: Return the existing keys
    } else {
      resolve(null); // Failure: New keys must be generated
    }
  };
}
```

### 2. Encryption (`encryptForServer`)
This runs when you hit "Send."

```typescript
export async function encryptForServer(...) {
  // 1. Convert the Server's Public Key PEM into a format WebCrypto understands (SPKI)
  const serverPubKey = await window.crypto.subtle.importKey(
    "spki", binaryDer, RSA_ALGORITHM, false, ["encrypt"]
  );

  // 2. Generate a fresh, random AES-256 key and a 12-byte IV.
  const aesKey = await window.crypto.subtle.generateKey(AES_ALGORITHM, true, ["encrypt", "decrypt"]);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  // 3. Build the AAD (Additional Authenticated Data) object.
  // This binds the encryption to the Conversation and the Sender.
  const aadObj = { conversationId, senderUserId };
  const aadBytes = new TextEncoder().encode(JSON.stringify(aadObj));

  // 4. Perform the actual AES-GCM encryption on the message content.
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: aadBytes },
    aesKey,
    new TextEncoder().encode(plaintext)
  );

  // 5. Encrypt (Wrap) the random AES key with the Server's RSA Public Key.
  const rawAesKey = await window.crypto.subtle.exportKey("raw", aesKey);
  const wrappedKey = await window.crypto.subtle.encrypt(RSA_ALGORITHM, serverPubKey, rawAesKey);

  // 6. Return the full payload as Base64 strings for the API.
  return { ... };
}
```

### 3. Decryption (`decryptFromServer`)
This runs when you receive a message.

```typescript
export async function decryptFromServer(payload: any) {
  // 1. Fetch your Private Key from IndexedDB.
  const keys = await getStoredKeys();
  const privateKey = await window.crypto.subtle.importKey(
    "pkcs8", binaryDer, RSA_ALGORITHM, false, ["decrypt"]
  );

  // 2. Use your RSA Private Key to decrypt (unwrap) the AES key from the payload.
  const rawAesKey = await window.crypto.subtle.decrypt(RSA_ALGORITHM, privateKey, wrappedKey);

  // 3. Rebuild the exact AAD byte string used by the server.
  const aadString = JSON.stringify(payload.aad);
  const aadBytes = new TextEncoder().encode(aadString);

  // 4. Use the unwrapped AES key and the AAD to decrypt the message content.
  const decryptedBytes = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv, additionalData: aadBytes },
    aesKey,
    ciphertext
  );

  return new TextDecoder().decode(decryptedBytes);
}
```
