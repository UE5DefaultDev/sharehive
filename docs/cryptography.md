# Cryptography Implementation: RSA + AES Hybrid Encryption

This document tracks the implementation of the RSA message crypto build plan as specified in `docs/nextjs_rsa_message_crypto_build_plan.txt`.

## Status: Completed (Phase 1 Implementation)

## Implementation Plan Overview

The system uses a hybrid encryption scheme:
- **AES-256-GCM** for encrypting the message content.
- **RSA-OAEP (SHA-256)** for wrapping (encrypting) the AES key.
- **Server Keypair**: For inbound encryption from clients to the server.
- **User Keypair**: For outbound encryption from the server to recipients.

## Step 1: Database Schema Updates
We need to update `prisma/schema.prisma` to include tables for keys and message deliveries.

### Required Tables:
- `UserKey`: Stores user public keys and fingerprints.
- `ServerKey`: (Optional/Env) Stores server RSA keys.
- `Message`: Already exists, but may need adjustments for plaintext storage if not already there.
- `MessageDelivery`: Stores encrypted payloads for each recipient.

## Step 2: Server-Side Crypto Utilities
- Implemented `lib/crypto/server.ts` using Node.js `crypto` module.
- Added `decryptFromClient`, `encryptForRecipient`, and `generateServerKeypair`.
- Handles RSA-OAEP wrapping and AES-256-GCM message encryption.

## Step 3: Client-Side Crypto Utilities
- Implemented `lib/crypto/client.ts` using WebCrypto API.
- Added `getOrCreateUserKeypair`, `encryptForServer`, and `decryptFromServer`.
- Includes basic IndexedDB wrapper for storing user private key locally.
- Handles SPKI/PKCS8 to PEM conversion for interop with server.

## Step 4: API Endpoints
- Implemented `GET /api/crypto/server-public-key`: Returns the server's RSA public key from environment variables.
- Implemented `POST /api/crypto/user-public-key`: Stores a user's RSA public key after verifying the PEM and fingerprint.
- Implemented `POST /api/messages/send`: Handles hybrid decryption from client, plaintext storage in DB, and re-encryption for recipients using their active RSA keys.
- Implemented `GET /api/messages/inbox`: Returns the list of encrypted message payloads (`EncryptedMessageToRecipient`) for the authenticated user.

## Step 5: Frontend Integration
- Created `components/CryptoProvider.tsx`: Handles automatic generation of user RSA keypairs and registration with the server.
- Added `CryptoProvider` to `app/layout.tsx` to ensure all authenticated users have their cryptographic environment initialized.
- Updated `components/ChatInterface.tsx` to use `encryptForServer` when sending messages via `/api/messages/send`.
- Setup script `scripts/generate_server_key.ts` created and verified (fixed syntax error with unterminated strings).

## Next Steps:
- Update message loading to use `decryptFromServer` when rendering messages from the inbox.
- Final end-to-end testing once server environment variables are configured.
- Configure `SERVER_RSA_PRIVATE_KEY_PEM` and `SERVER_RSA_PUBLIC_KEY_PEM` in the server environment.

## Progress Log

### 2026-02-23: Database Schema
- Updated `prisma/schema.prisma` with `UserKey` and `MessageDelivery` models.
- Encountered migration drift: Database has `KeyInbox` table and `User.publicKey` column that are not in the migration history.
- Pulled schema from DB to sync, then added the new models.
- Attempting to reconcile migrations.
