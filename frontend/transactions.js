document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return (window.location.href = "index.html");

  const transactionList = document.getElementById("transactionList");

  async function fetchTransactions() {
    try {
      const res = await fetch(`http://localhost:5000/api/transactions/${user.publicKey}`);
      const data = await res.json();

      if (res.ok) {
        if (data.length === 0) {
          transactionList.innerHTML = "<p class='text-gray-600 text-sm'>No transactions found.</p>";
          return;
        }

        transactionList.innerHTML = "";
        data.forEach(tx => {
          const item = document.createElement("div");
          item.className = "bg-white p-4 rounded-lg shadow-md";

          item.innerHTML = `
            <p class="text-sm font-semibold text-[#140547]">Type:</p>
            <p class="mb-2">${tx.type === 'sent' ? '🔻 Sent' : '🔺 Received'}</p>

            <p class="text-sm font-semibold text-[#140547]">From:</p>
            <p class="truncate overflow-hidden whitespace-nowrap text-ellipsis text-sm font-mono bg-gray-100 text-[#140547] px-2 py-1 rounded"
               title="${tx.fromName} (${tx.from})">
              ${tx.fromName} (${tx.from})
            </p>

            <p class="text-sm font-semibold text-[#140547] mt-2">To:</p>
            <p class="truncate overflow-hidden whitespace-nowrap text-ellipsis text-sm font-mono bg-gray-100 text-[#140547] px-2 py-1 rounded"
               title="${tx.toName} (${tx.to})">
              ${tx.toName} (${tx.to})
            </p>

            <p class="mt-2 text-sm text-gray-700">💸 Amount: ${tx.amount} XLM</p>
            <p class="text-xs text-gray-500">🕒 ${new Date(tx.created_at).toLocaleString()}</p>
            <a href="${tx.link}" target="_blank" class="text-blue-500 text-sm underline block mt-2">🔗 View Transaction</a>
          `;

          transactionList.appendChild(item);
        });
      } else {
        transactionList.innerText = "Error loading transactions.";
      }
    } catch (err) {
      console.error("Transaction history fetch failed:", err);
      transactionList.innerText = "Error loading transactions.";
    }
  }

  await fetchTransactions();

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "index.html";
  });
});
