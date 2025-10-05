// login.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const loginBtn = document.getElementById("loginBtn");

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

    // Toggle button loading state
    function toggleButtonLoading(isLoading) {
      if (isLoading) {
        loginBtn.disabled = true;
        loginBtn.classList.add("loading");
        loginBtn.textContent = loginBtn.dataset.loadingText;
      } else {
        loginBtn.disabled = false;
        loginBtn.classList.remove("loading");
        loginBtn.textContent = "Login";
      }
    }

    try {
      // Set button to loading state
      toggleButtonLoading(true);

      const response = await fetch("https://lost-and-found-epjk.onrender.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem("accessToken", data.token);
        alert("Login successful!");
        window.location.href = "index.html";
      } else {
        alert(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      // Reset button state
      toggleButtonLoading(false);
    }
  });

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
});