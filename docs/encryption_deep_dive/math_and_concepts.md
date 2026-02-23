[Back to Index](index.md)

# Foundations: The Math & Concepts

To understand our code, you must first understand the two "gears" that make it turn: **RSA** (Asymmetric) and **AES** (Symmetric).

---

## 1. RSA (Asymmetric Encryption)
RSA is based on the mathematical difficulty of factoring large prime numbers.

### The Keypair
An RSA key consists of two parts:
1.  **The Public Key (e, n)**: Given to everyone. Used to *lock* a message.
2.  **The Private Key (d, n)**: Kept secret. Used to *unlock* a message.

### The Core Equation
Let $m$ be your message (converted to a number).
*   **Encrypt**: $c = m^e \pmod n$
*   **Decrypt**: $m = c^d \pmod n$

The "magic" is that $e$ and $d$ are mathematically linked through a value called $\phi(n)$. Even if someone knows $e$ and $n$, they cannot find $d$ unless they can factor $n$ into its original prime numbers—which is practically impossible for 2048-bit numbers.

**Why we use it:** It allows two people who have never met to send secret data without first sharing a password.
**The Limitation:** It is slow and can only encrypt data smaller than the key itself (~190 bytes).

---

## 2. AES-256-GCM (Symmetric Encryption)
AES is a "block cipher." It takes your message, breaks it into chunks, and runs them through multiple rounds of substitution and permutation based on a single secret key.

### Why 256-bit?
A 256-bit key has $2^{256}$ possible combinations. This is a number so large that even the most powerful supercomputer would take billions of years to crack it.

### Why GCM (Galois/Counter Mode)?
GCM provides **Authenticated Encryption**. When you encrypt, it produces two things:
1.  **Ciphertext**: The secret message.
2.  **Auth Tag**: A mathematical "fingerprint" of the message.

If even a single bit of the ciphertext is changed during transit, the Auth Tag will no longer match, and the decryption will fail. This prevents "Man-in-the-Middle" attacks where someone tries to alter your message.

---

## 3. The Hybrid Scheme: Why Combine Them?

Imagine you want to send a 1GB movie securely.
*   If you use **RSA**, it will take hours to encrypt and might not even fit.
*   If you use **AES**, you have to find a way to get the secret key to the other person without anyone else seeing it.

**Our Hybrid Solution:**
1.  Generate a fresh, random **AES Key** (the "Session Key").
2.  Encrypt the 1GB movie using **AES** (Fast and secure).
3.  Encrypt the small **AES Key** using the recipient's **RSA Public Key** (Slow, but safe for small data).
4.  Send both.

The recipient uses their **RSA Private Key** to unwrap the **AES Key**, and then uses that **AES Key** to unlock the movie.

[Back to Index](index.md)
