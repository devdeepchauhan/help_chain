document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return (window.location.href = "login.html"); // Redirect to login if no user

  // Display user info
  document.getElementById("userName").innerText = user.name;
  document.getElementById("userRole").innerText = user.role;
  document.getElementById("publicKey").innerText = user.publicKey;

  const server = new StellarSdk.Server("https://horizon-testnet.stellar.org");

  async function updateBalance() {
    try {
      const account = await server.loadAccount(user.publicKey);
      const balance = account.balances.find(b => b.asset_type === "native").balance;
      document.getElementById("walletBalance").innerText = balance;
    } catch (err) {
      document.getElementById("walletBalance").innerText = "Error";
      console.error("Balance fetch error:", err);
    }
  }

  // Copy Public Key
  document.getElementById("copyBtn").addEventListener("click", () => {
    navigator.clipboard.writeText(user.publicKey).then(() => {
      showToast("✅ Public key copied to clipboard!", "success");
    }).catch(() => {
      showToast("❌ Failed to copy public key.", "error");
    });
  });

  await updateBalance();

  // Logout button logic
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";  // Redirect to login page after logout
  });

  document.getElementById("sendForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const recipientInput = document.getElementById("recipient");
    const amountInput = document.getElementById("amount");

    const recipient = recipientInput.value.trim();
    const amount = amountInput.value.trim();

    if (!recipient || !amount) {
      showToast("❌ Please enter recipient and amount.", "error");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/send-funds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderEmail: user.email,
          senderSecret: user.secretKey,
          recipientPublicKey: recipient,
          amount: amount
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(`${data.message}`, "success");

        recipientInput.value = "";
        amountInput.value = "";

        await updateBalance();
      } else {
        showToast(`❌ ${data.error}`, "error");
      }
    } catch (err) {
      console.error("❌ Transaction failed:", err);
      showToast("❌ Something went wrong. Try again.", "error");
    }
  });

  // Toast function
  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.innerText = message;
    toast.className = `fixed top-5 right-5 px-4 py-2 rounded shadow-lg text-white text-sm z-50 transition-opacity duration-300 ${
      type === "success" ? "bg-green-600" : "bg-red-600"
    }`;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("opacity-0");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
});
