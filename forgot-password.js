const form = document.getElementById("forgotPasswordForm");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value;

      try {
        const response = await fetch("https://lost-and-found-epjk.onrender.com/api/auth/forgot-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok) {
          alert(data.message); // e.g. "Password reset link sent to email."
        } else {
          alert(data.error || "Something went wrong. Try again.");
        }
      } catch (error) {
        console.error("Forgot password request failed:", error);
        alert("Network error. Please try again later.");
      }
    });