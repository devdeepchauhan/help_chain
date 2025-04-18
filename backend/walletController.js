import {
  generateKeypair,
  fundWallet,
  server,
  StellarSdk,
} from "./stellarUtils.js";
import { saveUserToFirebase } from "./firebaseUtils.js";
import { sendTransactionEmail, sendWelcomeEmail } from "./emailService.js";
import { db, ref, get } from "./config.js";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import fetch from "node-fetch";

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const otpStore = new Map();

// ✅ Send OTP
const sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const snapshot = await get(ref(db, "wallets"));
    if (snapshot.exists()) {
      const wallets = snapshot.val();
      const exists = Object.values(wallets).some(wallet => wallet.email === email);
      if (exists) return res.status(409).json({ error: "Email already registered." });
    }

    const otp = generateOtp();
    otpStore.set(email, otp);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "jashbohare@gmail.com",
        pass: "zrwr lwnr mkqu anvf",
      },
    });

    const mailOptions = {
      from: "HelpChain <jashbohare@gmail.com>",
      to: email,
      subject: "Your HelpChain OTP",
      text: `Your OTP for HelpChain sign up is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "OTP sent to email!" });

  } catch (error) {
    console.error("❌ Send OTP error:", error);
    res.status(500).json({ error: "Failed to send OTP." });
  }
};

// ✅ Verify OTP and Create Wallet
const verifyOtpAndCreateWallet = async (req, res) => {
  const { name, email, password, role, otp } = req.body;
  const storedOtp = otpStore.get(email);

  if (!storedOtp || !otp || storedOtp !== otp) {
    return res.status(400).json({ error: "Invalid or expired OTP." });
  }

  try {
    const snapshot = await get(ref(db, "wallets"));
    if (snapshot.exists()) {
      const wallets = snapshot.val();
      const exists = Object.values(wallets).some(wallet => wallet.email === email);
      if (exists) return res.status(409).json({ error: "Email already registered." });
    }

    const keypair = generateKeypair();
    const publicKey = keypair.publicKey();
    const secretKey = keypair.secret();

    await fundWallet(publicKey);

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      name,
      email,
      password: hashedPassword,
      role,
      publicKey,
      secretKey,
    };

    const sanitizedEmail = email.replace(/\./g, "_");
    await saveUserToFirebase(sanitizedEmail, userData);
    await sendWelcomeEmail(email, name, publicKey); // ✅ Send welcome email
    otpStore.delete(email);

    res.status(200).json({
      message: "Wallet created and OTP verified!",
      publicKey,
      secretKey,
    });

  } catch (error) {
    console.error("🔥 Wallet creation error:", error);
    res.status(500).json({ error: "Failed to verify OTP and create wallet." });
  }
};

// ✅ Login
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required." });

  try {
    const snapshot = await get(ref(db, "wallets"));
    if (!snapshot.exists()) return res.status(404).json({ error: "User not found." });

    const wallets = snapshot.val();
    const user = Object.values(wallets).find(wallet => wallet.email === email);

    if (!user) return res.status(401).json({ error: "Invalid credentials." });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ error: "Invalid credentials." });

    res.status(200).json({
      message: "Login successful",
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        publicKey: user.publicKey,
        secretKey: user.secretKey,
      },
    });

  } catch (err) {
    console.error("🔥 Login error:", err);
    res.status(500).json({ error: "Server error during login." });
  }
};

// ✅ Send Funds
const sendFunds = async (req, res) => {
  const { senderEmail, senderSecret, recipientPublicKey, amount } = req.body;
  if (!senderEmail || !senderSecret || !recipientPublicKey || !amount) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const snapshot = await get(ref(db, "wallets"));
    const wallets = snapshot.val();

    const sender = Object.values(wallets).find(u => u.email === senderEmail);
    const recipient = Object.values(wallets).find(u => u.publicKey === recipientPublicKey);
    if (!sender) return res.status(404).json({ error: "Sender not found." });

    const sourceKeypair = StellarSdk.Keypair.fromSecret(senderSecret);
    const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());

    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: await server.fetchBaseFee(),
      networkPassphrase: StellarSdk.Networks.TESTNET,
    })
      .addOperation(StellarSdk.Operation.payment({
        destination: recipientPublicKey,
        asset: StellarSdk.Asset.native(),
        amount: amount.toString(),
      }))
      .setTimeout(30)
      .build();

    transaction.sign(sourceKeypair);
    const result = await server.submitTransaction(transaction);

    const txHash = result.hash;
    const txLink = `https://stellar.expert/explorer/testnet/tx/${txHash}`;
    const timestamp = new Date().toLocaleString();

    const debitMessage = `Hello ${sender.name},

You have successfully sent ${amount} XLM to ${recipient?.name || "Unknown User"}.

Transaction Details:
• Sender Name: ${sender.name}
• Sender Wallet: ${sender.publicKey}
• Recipient Name: ${recipient?.name || "Unknown"}
• Recipient Wallet: ${recipientPublicKey}
• Amount: ${amount} XLM
• Date: ${timestamp}
• Transaction Hash: ${txHash}
• View on Stellar: ${txLink}

Thanks,
Team HelpChain`;

    await sendTransactionEmail(sender.email, "HelpChain - Funds Sent", debitMessage);

    if (recipient) {
      const creditMessage = `Hello ${recipient.name},

You have received ${amount} XLM from ${sender.name}.

Transaction Details:
• Sender Name: ${sender.name}
• Sender Wallet: ${sender.publicKey}
• Recipient Name: ${recipient.name}
• Recipient Wallet: ${recipient.publicKey}
• Amount: ${amount} XLM
• Date: ${timestamp}
• Transaction Hash: ${txHash}
• View on Stellar: ${txLink}

Thanks,
Team HelpChain`;

      await sendTransactionEmail(recipient.email, "HelpChain - Funds Received", creditMessage);
    }

    res.status(200).json({ message: "Funds sent and email notifications delivered!" });

  } catch (error) {
    console.error("❌ SendFunds error:", error);
    res.status(500).json({ error: "Failed to send funds." });
  }
};

// ✅ Transaction History
const getTransactionHistory = async (req, res) => {
  const { publicKey } = req.params;

  try {
    const response = await fetch(`https://horizon-testnet.stellar.org/accounts/${publicKey}/payments?order=desc&limit=50`);
    const data = await response.json();

    if (data.status === 404 || !data._embedded?.records) {
      return res.status(404).json({ transactions: [] });
    }

    const snapshot = await get(ref(db, "wallets"));
    const wallets = snapshot.exists() ? snapshot.val() : {};
    const keyToName = {};
    Object.values(wallets).forEach(u => (keyToName[u.publicKey] = u.name));

    const transactions = data._embedded.records
      .filter(tx => tx.type === 'payment')
      .map(tx => ({
        id: tx.id,
        from: tx.from,
        fromName: keyToName[tx.from] || "Unknown",
        to: tx.to,
        toName: keyToName[tx.to] || "Unknown",
        amount: tx.amount,
        asset_type: tx.asset_type,
        type: tx.from === publicKey ? "sent" : "received",
        created_at: tx.created_at,
        hash: tx.transaction_hash,
        link: `https://stellar.expert/explorer/testnet/tx/${tx.transaction_hash}`
      }));

    res.status(200).json(transactions);
  } catch (error) {
    console.error("🔥 Error fetching transactions:", error);
    res.status(500).json({ error: "Internal server error while fetching transactions" });
  }
};

export {
  sendOtp,
  verifyOtpAndCreateWallet,
  loginUser,
  sendFunds,
  getTransactionHistory,
};
