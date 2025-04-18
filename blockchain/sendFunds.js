import pkg from "@stellar/stellar-sdk";
const { Keypair, Server, TransactionBuilder, Operation, Asset, Networks } = pkg;
import fetch from "node-fetch";

// Setup Stellar testnet server
const server = new Server("https://horizon-testnet.stellar.org");

// Sender credentials (in real usage, take from login or input)
const senderSecret = "SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"; //  Replace with real key
const recipientPublic = "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"; //  Replace with real recipient

const amountToSend = "10"; // Amount of XLM to send

const sendPayment = async () => {
  try {
    const sourceKeypair = Keypair.fromSecret(senderSecret);
    const senderPublic = sourceKeypair.publicKey();

    const account = await server.loadAccount(senderPublic);

    const transaction = new TransactionBuilder(account, {
      fee: "100",
      networkPassphrase: Networks.TESTNET
    })
      .addOperation(Operation.payment({
        destination: recipientPublic,
        asset: Asset.native(),
        amount: amountToSend
      }))
      .setTimeout(30)
      .build();

    transaction.sign(sourceKeypair);

    const result = await server.submitTransaction(transaction);

    console.log("✅ Transaction successful!");
    console.log("🔗 Transaction Hash:", result.hash);
  } catch (error) {
    console.error("❌ Transaction failed:", error.response?.data || error.message);
  }
};

sendPayment();