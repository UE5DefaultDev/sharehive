[Back to Index](index.md)

# Visual Flow: RSA & AES Hybrid Encryption

This diagram illustrates how Sharehive uses a combination of **RSA (Asymmetric)** and **AES (Symmetric)** encryption to secure messages while allowing the server to perform necessary distribution (fan-out) tasks.

## The Encryption Lifecycle

```mermaid
sequenceDiagram
    autonumber
    participant A as Client A (Sender)
    participant S as Server (Gateway)
    participant B as Client B (Recipient)

    Note over A,B: Initial State: Server & Users have RSA Keypairs. Public keys are shared.

    rect rgb(240, 240, 240)
    Note right of A: 1. Preparation (Sender)
    A->>A: Generate random AES-256 Key (Session Key)
    A->>A: Encrypt Message with AES Key (Fast)
    A->>A: Wrap (Encrypt) AES Key with Server's RSA Public Key
    end

    A->>S: Send Encrypted Payload (Ciphertext + Wrapped Key + AAD)

    rect rgb(220, 240, 220)
    Note right of S: 2. Processing (Server Gateway)
    S->>S: Unwrap (Decrypt) AES Key with Server's RSA Private Key
    S->>S: Decrypt Message with AES Key
    S->>S: [Store Plaintext / Perform Fan-out]
    end

    rect rgb(240, 240, 240)
    Note right of S: 3. Preparation for Recipient
    S->>S: Generate NEW random AES-256 Key for Recipient B
    S->>S: Encrypt Message with NEW AES Key
    S->>S: Wrap (Encrypt) NEW AES Key with Client B's RSA Public Key
    end

    S->>B: Send Encrypted Payload (Ciphertext + Wrapped Key + AAD)

    rect rgb(220, 220, 240)
    Note right of B: 4. Final Decryption (Recipient)
    B->>B: Unwrap (Decrypt) AES Key with Client B's RSA Private Key
    B->>B: Decrypt Message with AES Key
    end

    Note over B: Message is now Plaintext for User B
```

---

## Key Components Explained

### 1. The AES "Session" Key
*   **Type**: Symmetric (Same key for lock/unlock).
*   **Role**: Handles the "heavy lifting." It encrypts the actual message content because AES is extremely fast and can handle large amounts of data.
*   **Lifecycle**: A fresh key is generated for every transmission. It is never stored permanently.

### 2. The RSA "Wrapping" Key
*   **Type**: Asymmetric (Public Key locks, Private Key unlocks).
*   **Role**: Handles the "key exchange." It encrypts the small AES key so it can be sent over the internet safely.
*   **Lifecycle**:
    *   **Public Keys**: Distributed freely (Client gets Server's, Server gets Client's).
    *   **Private Keys**: Stay strictly on the device that created them (Client's in IndexedDB, Server's in `.env`).

### 3. AAD (Additional Authenticated Data)
*   **Role**: Prevents "Context Spoofing."
*   **Detail**: We include the `conversationId` and `userId` in the AES-GCM authentication tag. If an attacker tries to move an encrypted message from one conversation to another, the decryption will fail because the AAD won't match.

[Back to Index](index.md)
