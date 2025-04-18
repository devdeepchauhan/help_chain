import stellar from "@stellar/stellar-sdk";
import fetch from "node-fetch";
import { db, ref, set } from "../backend/config.js";

// Stellar setup
const { Keypair } = stellar;
const server = new stellar.Horizon.Server("https://horizon-testnet.stellar.org");

// Function to create wallet and save user info
const createWalletWithUser = async (name, email, role) => {
  const pair = Keypair.random();
  const publicKey = pair.publicKey();
  const secretKey = pair.secret();

  try {
    const response = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
    const result = await response.json();

    console.log("✅ Wallet funded successfully on Testnet!");
    console.log("🔑 Public Key:", publicKey);
    console.log("🗝️ Secret Key:", secretKey);

    // Save full user info in Firebase
    await set(ref(db, "wallets/" + publicKey), {
      name,
      email,
      role,
      publicKey,
      secretKey
    });

    console.log("📦 User & wallet info saved to Firebase!");
  } catch (error) {
    console.error("❌ Error funding wallet or saving to Firebase:", error);
  }
};

// Example call (test this for now — frontend will replace this input)
createWalletWithUser("Test User", "test@example.com", "donor"); // change to "ngo" to test both