import express from "express";
import {
  sendOtp,
  verifyOtpAndCreateWallet,
  loginUser,
  sendFunds,
  getTransactionHistory, 
} from "./walletController.js";

const router = express.Router();


// ✅ Authentication Routes
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtpAndCreateWallet);
router.post("/login", loginUser);

// ✅ Stellar Wallet Operations
router.post("/send-funds", sendFunds);

// ✅ Transaction History Route
router.get("/transactions/:publicKey", getTransactionHistory); 

export default router;
