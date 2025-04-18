import { db, ref, set } from "./config.js";
import { sendOTPEmail } from "./emailService.js";

// Utility function to generate random 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const sendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const otp = generateOTP();
  const success = await sendOTPEmail(email, otp);

  if (success) {
    // Save OTP to Firebase under otps/email path
    await set(ref(db, `otps/${email.replace(".", "_")}`), {
      otp,
      createdAt: Date.now(),
    });

    res.status(200).json({ message: "✅ OTP sent to your email" });
  } else {
    res.status(500).json({ error: "❌ Failed to send OTP" });
  }
};