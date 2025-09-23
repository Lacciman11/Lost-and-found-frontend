// Login Form Validation + API Call + Redirect
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!validateEmail(email)) {
      alert("Enter a valid email address");
      return;
    }

    if (password === "") {
      alert("Password cannot be empty");
      return;
    }

    try {
      // 🔥 Send login request to backend
      const response = await fetch("https://lost-and-found-epjk.onrender.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ Save token (for later API calls)
        sessionStorage.setItem("accessToken", data.token);

        alert("Login successful!");
        window.location.href = "indexhtml"; // redirect to dashboard
      } else {
        alert(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong. Please try again.");
    }
  });

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
});
