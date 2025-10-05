// register.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const registerBtn = document.getElementById("registerBtn");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    // Client-side Validation
    if (fullName === "") {
      alert("Full name is required");
      return;
    }

    if (!validateEmail(email)) {
      alert("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // Toggle button loading state
    function toggleButtonLoading(isLoading) {
      if (isLoading) {
        registerBtn.disabled = true;
        registerBtn.classList.add("loading");
        registerBtn.textContent = registerBtn.dataset.loadingText;
      } else {
        registerBtn.disabled = false;
        registerBtn.classList.remove("loading");
        registerBtn.textContent = "Register";
      }
    }

    // Send to Backend
    try {
      toggleButtonLoading(true);

      const res = await fetch("https://lost-and-found-epjk.onrender.com/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, password, confirmPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || "Registration successful!");
        window.location.href = "login.html";
      } else {
        alert(data.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      toggleButtonLoading(false);
    }
  });

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
});