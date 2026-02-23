import { NextResponse } from "next/server";

export async function GET() {
  const publicKeyPem = process.env.SERVER_RSA_PUBLIC_KEY_PEM;

  if (!publicKeyPem) {
    return NextResponse.json(
      { error: "Server public key not configured" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    version: 1,
    alg: "RSA-OAEP-256",
    serverPublicKeyPem: publicKeyPem,
  });
}
