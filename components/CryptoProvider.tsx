"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getOrCreateUserKeypair } from "@/lib/crypto/client";
import { useAuth } from "@clerk/nextjs";

type CryptoContextType = {
  serverPublicKeyPem: string | null;
  isReady: boolean;
};

const CryptoContext = createContext<CryptoContextType>({
  serverPublicKeyPem: null,
  isReady: false,
});

export function CryptoProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const [serverPublicKeyPem, setServerPublicKeyPem] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function initCrypto() {
      if (!isLoaded || !isSignedIn) return;

      try {
        // 1. Fetch server public key
        const res = await fetch("/api/crypto/server-public-key");
        if (!res.ok) throw new Error("Failed to fetch server public key");
        const { serverPublicKeyPem } = await res.json();
        setServerPublicKeyPem(serverPublicKeyPem);

        // 2. Ensure user has a keypair
        // We'll call getOrCreateUserKeypair which will generate one if it's missing from IndexedDB.
        // It will return the public key and fingerprint.
        const { publicKeyPem, fingerprint } = await getOrCreateUserKeypair();

        // 3. Register user's public key with server
        // The API route handles "if it already exists, update/skip"
        await fetch("/api/crypto/user-public-key", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicKeyPem, fingerprint }),
        });

        setIsReady(true);
      } catch (err) {
        console.error("Crypto init error:", err);
      }
    }

    initCrypto();
  }, [isLoaded, isSignedIn]);

  return (
    <CryptoContext.Provider value={{ serverPublicKeyPem, isReady }}>
      {children}
    </CryptoContext.Provider>
  );
}

export const useCrypto = () => useContext(CryptoContext);
