import StellarSdkPkg from "@stellar/stellar-sdk"; // Import as default
import fetch from "node-fetch"; // Required in Node.js for friendbot

const server = new StellarSdkPkg.Horizon.Server("https://horizon-testnet.stellar.org");

const generateKeypair = () => {
  return StellarSdkPkg.Keypair.random();
};

const fundWallet = async (publicKey) => {
  const url = `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`;
  try {
    const response = await fetch(url);
    const result = await response.json();

    if (!response.ok) {
      throw new Error("❌ Friendbot failed to fund the wallet.");
    }

    console.log("✅ Wallet funded:", result);
    return result;
  } catch (error) {
    console.error("🔥 Friendbot error:", error);
    throw error;
  }
};

const getTransactionHistory = async (publicKey) => {
  try {
    const response = await fetch(`https://horizon-testnet.stellar.org/accounts/${publicKey}/payments?order=desc&limit=50`);
    const data = await response.json();

    // Filter only successful payment operations
    const transactions = data._embedded.records
      .filter(tx => tx.type === 'payment' && tx.successful !== false)
      .map(tx => ({
        id: tx.id,
        from: tx.from,
        to: tx.to,
        amount: tx.amount,
        asset_type: tx.asset_type,
        type: tx.from === publicKey ? 'sent' : 'received',
        created_at: tx.created_at,
        hash: tx.transaction_hash,
        link: `https://stellar.expert/explorer/testnet/tx/${tx.transaction_hash}`
      }));

    return transactions;
  } catch (error) {
    console.error("🔥 Error fetching transactions:", error);
    throw error;
  }
};

export {
  generateKeypair,
  fundWallet,
  server,
  StellarSdkPkg as StellarSdk, // Export entire SDK as StellarSdk
  getTransactionHistory, // Export the new function
};
