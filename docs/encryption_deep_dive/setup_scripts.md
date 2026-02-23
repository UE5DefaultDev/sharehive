# Infrastructure: Setup Scripts (`scripts/generate_server_key.ts`)

This script is used only by the developer to initialize the server's cryptographic identity.

---

## 📚 Line-by-Line Breakdown

```typescript
import { generateServerKeypair } from "../lib/crypto/server";

// 1. Call the server utility to generate a new RSA-2048 keypair.
// Internally, this uses node:crypto.generateKeyPairSync.
const { publicKeyPem, privateKeyPem } = generateServerKeypair();

// 2. Print the Public Key to the console.
// This is used for the SERVER_RSA_PUBLIC_KEY_PEM environment variable.
console.log("--- SERVER PUBLIC KEY PEM ---");
console.log(publicKeyPem);

// 3. Print the Private Key to the console.
// This is used for the SERVER_RSA_PRIVATE_KEY_PEM environment variable.
// CRITICAL: This must never be committed to source control!
console.log("
--- SERVER PRIVATE KEY PEM ---");
console.log(privateKeyPem);

console.log("
To use these in your environment, add them to your .env file...");
// 👆 Instructional footer for the developer.
```

---

## 🔒 Security Best Practices
When running this script:
1.  **Do not commit the output**: Never save these keys in a file that is tracked by Git.
2.  **Use `.env.local`**: If you save them locally, ensure `.env.local` is in your `.gitignore`.
3.  **Production Secrets**: In production (Vercel, AWS, etc.), use their specific Secret Management UI to store these values.
