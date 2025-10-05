// forgot-password.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("forgotPasswordForm");
  const resetBtn = document.getElementById("resetBtn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();

    // Client-side validation
    if (!validateEmail(email)) {
      alert("Please enter a valid email address");
      return;
    }

    // Toggle button loading state
    function toggleButtonLoading(isLoading) {
      if (isLoading) {
        resetBtn.disabled = true;
        resetBtn.classList.add("loading");
        resetBtn.textContent = resetBtn.dataset.loadingText;
      } else {
        resetBtn.disabled = false;
        resetBtn.classList.remove("loading");
        resetBtn.textContent = "Send Reset Link";
      }
    }

    try {
      toggleButtonLoading(true);

      const response = await fetch("https://lost-and-found-epjk.onrender.com/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || "Password reset link sent to your email.");
        form.reset(); // Clear the form
      } else {
        alert(data.error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Forgot password request failed:", error);
      alert("Network error. Please try again later.");
    } finally {
      toggleButtonLoading(false);
    }
  });

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
});