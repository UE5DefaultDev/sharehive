# Encryption Deep Dive: Master Index

This documentation suite provides a line-by-line explanation of every file in the Sharehive end-to-end encryption (E2EE) implementation. It's designed to be readable for anyone, from a curious developer to a security auditor.

---

## 📚 Table of Contents

### 1. [Foundations: The Math & Concepts](./math_and_concepts.md)
*Why we use RSA + AES, and how the underlying numbers work.*

### 2. [Visual Guide: The Encryption Flow](./visual_flow.md)
*A Mermaid diagram showing how keys move between Client and Server.*

### 3. [Data Layer: The Database Schema](./database.md)
*A line-by-line breakdown of `prisma/schema.prisma` updates.*

### 4. [Frontend Engine: `lib/crypto/client.ts`](./client_lib.md)
*How the browser generates keys and performs encryption/decryption.*

### 5. [Backend Engine: `lib/crypto/server.ts`](./server_lib.md)
*How the server unwraps keys and distributes deliveries.*

### 6. [API Endpoints: Communication Layers](./api_endpoints.md)
*Line-by-line breakdown of all `/api/crypto/` and `/api/messages/` routes.*

### 7. [UI Integration: Providers & Components](./frontend_integration.md)
*How `CryptoProvider` and `ChatInterface` manage state and user experience.*

### 8. [Infrastructure: Setup Scripts](./setup_scripts.md)
*How `scripts/generate_server_key.ts` initializes the system.*

---

## 🛠 Project File Map

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
