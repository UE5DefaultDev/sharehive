import { generateServerKeypair } from "../lib/crypto/server";

const { publicKeyPem, privateKeyPem } = generateServerKeypair();

console.log("--- SERVER PUBLIC KEY PEM ---");
console.log(publicKeyPem);
console.log("\n--- SERVER PRIVATE KEY PEM ---");
console.log(privateKeyPem);

console.log("\nTo use these in your environment, add them to your .env file (make sure to replace newlines with \\n for PEM storage in one line if needed, or use literal PEM blocks if your provider supports it).");
