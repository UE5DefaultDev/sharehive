/**
 * SERVER-SIDE CRYPTOGRAPHY SERVICE
 * 
 * ROLE:
 * This file handles all cryptographic operations on the backend using Node.js's native `crypto` module. 
 * It acts as the "Secure Gateway" between the client's encrypted submissions and the database's plaintext storage.
 * 
 * CORE RESPONSIBILITIES:
 * 1. Server Decryption: Uses the Server's Private Key (from .env) to decrypt inbound messages from users.
 * 2. Fan-Out Encryption: Takes a decrypted message and re-encrypts it specifically for EVERY recipient in a chat.
 * 3. Key Wrapping: Performs RSA-OAEP encryption to safely "wrap" temporary AES keys.
 * 4. AAD Verification: Ensures the integrity of the message context (Conversation + User) during decryption.
 */

import crypto from "node:crypto";

/**
 * Server-side crypto utilities for RSA-OAEP and AES-256-GCM hybrid encryption.
 */

const RSA_ALGORITHM = "RSA-OAEP";
const AES_ALGORITHM = "aes-256-gcm";
const HASH_ALGORITHM = "sha256";

/**
 * Decrypts a payload from the client.
 * 
 * Payload structure (EncryptedMessageToServer):
 * {
 *   version: 1,
 *   senderUserId: string,
 *   conversationId: string,
 *   cipher: { alg: "AES-256-GCM", iv_b64: string, ciphertext_b64: string },
 *   key_wrap: { alg: "RSA-OAEP-256", wrapped_key_b64: string },
 *   aad: { conversationId: string, senderUserId: string }
 * }
 */
export async function decryptFromClient(payload: any, serverPrivateKeyPem: string): Promise<string> {
  if (payload.version !== 1) throw new Error("Unsupported payload version");

  // 1. RSA-OAEP decrypt the wrapped AES key
  const wrappedKeyBuffer = Buffer.from(payload.key_wrap.wrapped_key_b64, "base64");
  const aesKey = crypto.privateDecrypt(
    {
      key: serverPrivateKeyPem,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: HASH_ALGORITHM,
    },
    wrappedKeyBuffer
  );

  // 2. Rebuild AAD string with exact key order: conversationId, senderUserId
  // AAD object: { conversationId, senderUserId }
  const aadObj = {
    conversationId: payload.aad.conversationId,
    senderUserId: payload.aad.senderUserId,
  };
  const aadString = JSON.stringify(aadObj);
  const aadBuffer = Buffer.from(aadString);

  // 3. AES-GCM decrypt ciphertext
  const iv = Buffer.from(payload.cipher.iv_b64, "base64");
  const fullCiphertext = Buffer.from(payload.cipher.ciphertext_b64, "base64");
  
  // In Node.js, auth tag is separate. We assume it's appended to ciphertext (default in some libs)
  // or provided separately. The WebCrypto API appends it by default.
  // AES-GCM tag is 128 bits (16 bytes).
  const tagLength = 16;
  const ciphertext = fullCiphertext.subarray(0, fullCiphertext.length - tagLength);
  const tag = fullCiphertext.subarray(fullCiphertext.length - tagLength);

  const decipher = crypto.createDecipheriv(AES_ALGORITHM, aesKey, iv);
  decipher.setAAD(aadBuffer);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(ciphertext);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString("utf8");
}

/**
 * Encrypts a message for a recipient.
 * 
 * Returns EncryptedMessageToRecipient structure:
 * {
 *   version: 1,
 *   messageId: string,
 *   senderUserId: string,
 *   recipientUserId: string,
 *   conversationId: string,
 *   sentAt: string,
 *   cipher: { alg: "AES-256-GCM", iv_b64: string, ciphertext_b64: string },
 *   key_wrap: { alg: "RSA-OAEP-256", wrapped_key_b64: string },
 *   aad: { conversationId, senderUserId, recipientUserId, messageId }
 * }
 */
export async function encryptForRecipient(
  plaintext: string,
  meta: {
    messageId: string;
    senderUserId: string;
    recipientUserId: string;
    conversationId: string;
    sentAt: string;
  },
  recipientPublicKeyPem: string
): Promise<any> {
  // 1. Generate random AES key (256-bit) and IV (12 bytes)
  const aesKey = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);

  // 2. Build AAD object: { conversationId, senderUserId, recipientUserId, messageId }
  const aadObj = {
    conversationId: meta.conversationId,
    senderUserId: meta.senderUserId,
    recipientUserId: meta.recipientUserId,
    messageId: meta.messageId,
  };
  const aadString = JSON.stringify(aadObj);
  const aadBuffer = Buffer.from(aadString);

  // 3. AES-GCM encrypt
  const cipher = crypto.createCipheriv(AES_ALGORITHM, aesKey, iv);
  cipher.setAAD(aadBuffer);

  let ciphertext = cipher.update(plaintext, "utf8");
  ciphertext = Buffer.concat([ciphertext, cipher.final()]);
  const tag = cipher.getAuthTag();

  // Combine ciphertext and tag as WebCrypto expects
  const fullCiphertext = Buffer.concat([ciphertext, tag]);

  // 4. RSA-OAEP wrap AES key with recipient public key
  const wrappedKey = crypto.publicEncrypt(
    {
      key: recipientPublicKeyPem,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: HASH_ALGORITHM,
    },
    aesKey
  );

  return {
    version: 1,
    messageId: meta.messageId,
    senderUserId: meta.senderUserId,
    recipientUserId: meta.recipientUserId,
    conversationId: meta.conversationId,
    sentAt: meta.sentAt,
    cipher: {
      alg: "AES-256-GCM",
      iv_b64: iv.toString("base64"),
      ciphertext_b64: fullCiphertext.toString("base64"),
    },
    key_wrap: {
      alg: "RSA-OAEP-256",
      wrapped_key_b64: wrappedKey.toString("base64"),
    },
    aad: aadObj,
  };
}

/**
 * Utility to generate a server keypair (for setup).
 */
export function generateServerKeypair(): { publicKeyPem: string; privateKeyPem: string } {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  return { publicKeyPem: publicKey, privateKeyPem: privateKey };
}
