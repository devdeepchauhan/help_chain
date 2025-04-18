import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "jashbohare@gmail.com",
    pass: "zrwr lwnr mkqu anvf",
  },
});

// ✅ OTP Email
export const sendOTPEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: "HelpChain <jashbohare@gmail.com>",
    to: toEmail,
    subject: "HelpChain - OTP Verification",
    text: `Your OTP for verifying your email is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("📧 OTP email sent to", toEmail);
    return true;
  } catch (error) {
    console.error("❌ Failed to send OTP:", error);
    return false;
  }
};

// ✅ Transaction Email (debit/credit)
export const sendTransactionEmail = async (toEmail, subject, message) => {
  const mailOptions = {
    from: "HelpChain <jashbohare@gmail.com>",
    to: toEmail,
    subject,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📤 Transaction email sent to ${toEmail}`);
  } catch (error) {
    console.error("❌ Failed to send transaction email:", error);
  }
};

// ✅ Welcome Email after Signup
export const sendWelcomeEmail = async (toEmail, name, publicKey) => {
  const subject = "Welcome to HelpChain - Your Wallet is Ready!";
  const message = `Hello ${name},

Welcome to HelpChain!

Your Stellar Testnet wallet has been successfully created and funded with 10,000 XLM using Friendbot.

Wallet Public Key: ${publicKey}

Note:
- This is a testnet XLM, meaning it's not real currency and has no actual monetary value.
- These tokens are for testing and development only.
- You can use them to try out transactions within the HelpChain platform.

You're now ready to explore blockchain-powered donations and financial transparency with HelpChain!

Thanks,
Team HelpChain`;

  try {
    await transporter.sendMail({
      from: "HelpChain <jashbohare@gmail.com>",
      to: toEmail,
      subject,
      text: message,
    });
    console.log(`✅ Welcome email sent to ${toEmail}`);
  } catch (error) {
    console.error("❌ Failed to send welcome email:", error);
  }
};
