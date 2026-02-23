[Back to Index](index.md)

# UI Integration: Providers & Components

This explains how the E2EE integrates into the React component tree and the user experience.

---

## 📚 Line-by-Line Breakdown

### 1. `components/CryptoProvider.tsx`
This provider wraps the entire application. It acts as the "Bootloader" for cryptography.

```typescript
export function CryptoProvider({ children }) {
  useEffect(() => {
    async function initCrypto() {
      // 1. Fetch the server's public key immediately on load.
      const res = await fetch("/api/crypto/server-public-key");
      setServerPublicKeyPem(serverPublicKeyPem);

      // 2. Fetch or Generate the user's local keypair.
      // This function internally checks IndexedDB (lib/crypto/client.ts).
      const { publicKeyPem, fingerprint } = await getOrCreateUserKeypair();

      // 3. Send the public key to the server to ensure we can receive messages.
      await fetch("/api/crypto/user-public-key", { 
        method: "POST", body: JSON.stringify({ publicKeyPem, fingerprint }) 
      });

      setIsReady(true); // Signal to the rest of the app that crypto is live.
    }
    initCrypto();
  }, [isSignedIn]);
}
```

### 2. `components/ChatInterface.tsx`
The primary interface where encryption and decryption are visible.

#### Sending a Message
```typescript
const handleSendMessage = () => {
  startTransition(async () => {
    if (isReady) {
      // 1. Use the client library to encrypt the message for the server.
      const payload = await encryptForServer(content, currentUserId, courseId, serverPublicKeyPem);

      // 2. Send the encrypted payload to the API.
      const res = await fetch("/api/messages/send", { ... body: JSON.stringify(payload) });

      // 3. Optimistically add the message to the screen so the user sees it instantly.
      setMessages(prev => [...prev, newMessage]);
    }
  });
};
```

#### Receiving Messages (Polling)
```typescript
useEffect(() => {
  const interval = setInterval(async () => {
    // 1. Fetch encrypted deliveries from the inbox.
    const res = await fetch(`/api/messages/inbox?since=${since}`);
    const encryptedPayloads = await res.json();

    // 2. Decrypt each delivery locally using the user's private key.
    const decryptedMessages = await Promise.all(
      encryptedPayloads.map(async (payload) => {
        const plaintext = await decryptFromServer(payload);
        return { ...plaintext }; // Return the readable message.
      })
    );

    // 3. Update the state with ONLY unique new messages.
    setMessages(prev => { ... deduplicate and sort ... });
  }, 4000);
}, [messages, isReady]);
```

[Back to Index](index.md)
