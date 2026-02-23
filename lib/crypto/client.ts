/**
 * CLIENT-SIDE CRYPTOGRAPHY SERVICE
 * 
 * ROLE: 
 * This file is the "Heart" of the end-to-end encryption (E2EE) on the frontend. It uses 
 * the browser's native WebCrypto API to perform all sensitive operations.
 * 
 * CORE RESPONSIBILITIES:
 * 1. RSA Key Generation: Creates the unique 2048-bit RSA-OAEP keypair for the user.
 * 2. Key Persistence: Manages the storage of the Private Key in IndexedDB (it never leaves the browser).
 * 3. Inbound Encryption: Encrypts messages using the Server's Public Key before they are sent.
 * 4. Outbound Decryption: Decrypts messages received from the server using the User's Private Key.
 * 5. Data Formatting: Handles conversion between binary buffers, Base64 strings, and PEM formats.
 */

/**
 * Client-side crypto utilities for RSA-OAEP and AES-256-GCM hybrid encryption.
 * Uses the WebCrypto API.
 */

const RSA_ALGORITHM = {
  name: "RSA-OAEP",
  hash: "SHA-256",
};

const AES_ALGORITHM = {
  name: "AES-GCM",
  length: 256,
};

const DB_NAME = "SharehiveCrypto";
const STORE_NAME = "user_keys";
const PRIVATE_KEY_ID = "user_private_key";

/**
 * Simple IndexedDB wrapper for storing user private key.
 */
async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function storePrivateKey(pem: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(pem, PRIVATE_KEY_ID);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

const PUBLIC_KEY_ID = "user_public_key";
const FINGERPRINT_ID = "user_fingerprint";

async function storeKeys(privatePem: string, publicPem: string, fingerprint: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(privatePem, PRIVATE_KEY_ID);
    store.put(publicPem, PUBLIC_KEY_ID);
    store.put(fingerprint, FINGERPRINT_ID);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getStoredKeys(): Promise<{ privateKeyPem: string; publicKeyPem: string; fingerprint: string } | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    
    const privReq = store.get(PRIVATE_KEY_ID);
    const pubReq = store.get(PUBLIC_KEY_ID);
    const fingerReq = store.get(FINGERPRINT_ID);

    tx.oncomplete = () => {
      if (privReq.result && pubReq.result && fingerReq.result) {
        resolve({
          privateKeyPem: privReq.result as string,
          publicKeyPem: pubReq.result as string,
          fingerprint: fingerReq.result as string,
        });
      } else {
        resolve(null);
      }
    };
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Helper to convert ArrayBuffer or Uint8Array to Base64.
 */
function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return btoa(String.fromCharCode(...Array.from(bytes)));
}

/**
 * Helper to convert Base64 to ArrayBuffer.
 */
function base64ToBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Helper to wrap SPKI/PKCS8 as PEM.
 */
function wrapPEM(base64: string, type: "PUBLIC" | "PRIVATE"): string {
  const header = `-----BEGIN ${type} KEY-----\n`;
  const footer = `\n-----END ${type} KEY-----`;
  // Wrap at 64 chars
  const regex = /.{1,64}/g;
  const wrapped = base64.match(regex)?.join("\n");
  return header + wrapped + footer;
}

/**
 * Gets or creates a user's RSA keypair.
 */
export async function getOrCreateUserKeypair(): Promise<{ publicKeyPem: string; fingerprint: string }> {
  const existing = await getStoredKeys();
  if (existing) {
    return { publicKeyPem: existing.publicKeyPem, fingerprint: existing.fingerprint };
  }

  // Generate new keypair
  const keyPair = await window.crypto.subtle.generateKey(
    {
      ...RSA_ALGORITHM,
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
    } as RsaHashedKeyGenParams,
    true,
    ["encrypt", "decrypt"]
  );

  const spki = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
  const publicKeyPem = wrapPEM(bufferToBase64(spki), "PUBLIC");

  const pkcs8 = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
  const privateKeyPem = wrapPEM(bufferToBase64(pkcs8), "PRIVATE");

  const fingerprintBuffer = await window.crypto.subtle.digest("SHA-256", spki);
  const fingerprint = Array.from(new Uint8Array(fingerprintBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  await storeKeys(privateKeyPem, publicKeyPem, fingerprint);

  return { publicKeyPem, fingerprint };
}

/**
 * Encrypts a message for the server.
 */
export async function encryptForServer(
  plaintext: string,
  senderUserId: string,
  conversationId: string,
  serverPublicKeyPem: string
): Promise<any> {
  // 1. Import server public key
  const pemHeader = "-----BEGIN PUBLIC KEY-----";
  const pemFooter = "-----END PUBLIC KEY-----";
  const pemContents = serverPublicKeyPem
    .replace(pemHeader, "")
    .replace(pemFooter, "")
    .replace(/\s/g, "");
  const binaryDer = base64ToBuffer(pemContents);
  
  const serverPubKey = await window.crypto.subtle.importKey(
    "spki",
    binaryDer,
    RSA_ALGORITHM,
    false,
    ["encrypt"]
  );

  // 2. Generate AES key (256-bit) and IV (12 bytes)
  const aesKey = await window.crypto.subtle.generateKey(
    AES_ALGORITHM,
    true,
    ["encrypt", "decrypt"]
  );
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  // 3. Build AAD object: { conversationId, senderUserId }
  const aadObj = { conversationId, senderUserId };
  const aadString = JSON.stringify(aadObj);
  const aadBytes = new TextEncoder().encode(aadString);

  // 4. AES-GCM encrypt plaintext
  const plaintextBytes = new TextEncoder().encode(plaintext);
  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
      additionalData: aadBytes,
    },
    aesKey,
    plaintextBytes
  );

  // 5. RSA-OAEP wrap AES key with server public key
  const rawAesKey = await window.crypto.subtle.exportKey("raw", aesKey);
  const wrappedKey = await window.crypto.subtle.encrypt(
    RSA_ALGORITHM,
    serverPubKey,
    rawAesKey
  );

  return {
    version: 1,
    senderUserId,
    conversationId,
    cipher: {
      alg: "AES-256-GCM",
      iv_b64: bufferToBase64(iv),
      ciphertext_b64: bufferToBase64(ciphertext),
    },
    key_wrap: {
      alg: "RSA-OAEP-256",
      wrapped_key_b64: bufferToBase64(wrappedKey),
    },
    aad: aadObj,
  };
}

/**
 * Decrypts a message from the server locally.
 */
export async function decryptFromServer(
  payload: any
): Promise<string> {
  // 1. Load keys from IndexedDB
  const keys = await getStoredKeys();
  if (!keys || !keys.privateKeyPem) throw new Error("Private key not found");

  const privateKeyPem = keys.privateKeyPem;
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = privateKeyPem
    .replace(pemHeader, "")
    .replace(pemFooter, "")
    .replace(/\s/g, "");
  const binaryDer = base64ToBuffer(pemContents);

  const privateKey = await window.crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    RSA_ALGORITHM,
    false,
    ["decrypt"]
  );

  // 2. RSA-OAEP decrypt wrapped AES key
  const wrappedKey = base64ToBuffer(payload.key_wrap.wrapped_key_b64);
  const rawAesKey = await window.crypto.subtle.decrypt(
    RSA_ALGORITHM,
    privateKey,
    wrappedKey
  );

  // 3. Import AES key
  const aesKey = await window.crypto.subtle.importKey(
    "raw",
    rawAesKey,
    AES_ALGORITHM,
    false,
    ["decrypt"]
  );

  // 4. Rebuild AAD string with exact order
  const aadObj = {
    conversationId: payload.aad.conversationId,
    senderUserId: payload.aad.senderUserId,
    recipientUserId: payload.aad.recipientUserId,
    messageId: payload.aad.messageId,
  };
  const aadString = JSON.stringify(aadObj);
  const aadBytes = new TextEncoder().encode(aadString);

  // 5. AES-GCM decrypt ciphertext
  const iv = base64ToBuffer(payload.cipher.iv_b64);
  const ciphertext = base64ToBuffer(payload.cipher.ciphertext_b64);

  const decryptedBytes = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
      additionalData: aadBytes,
    },
    aesKey,
    ciphertext
  );

  return new TextDecoder().decode(decryptedBytes);
}
