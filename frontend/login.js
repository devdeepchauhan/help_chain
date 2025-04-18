document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const messageDiv = document.getElementById("loginMessage");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      showMessage("❌ Please fill in both email and password.", "red");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        showMessage("Login successful! Redirecting...", "green");
        localStorage.setItem("user", JSON.stringify(data.user));
        setTimeout(() => window.location.href = "landing.html", 1500);
      } else {
        showMessage(`❌ ${data.error}`, "red");
      }
    } catch (err) {
      showMessage(`❌ Network error: ${err.message}`, "red");
    }
  });

  function showMessage(text, color) {
    messageDiv.innerText = text;
    messageDiv.style.color = color;
  }
});