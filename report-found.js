// report-found.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("foundForm");
  const submitBtn = document.getElementById("submitBtn");
  const logout = document.getElementById("logout");
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.querySelector(".nav-links");

  // Base URL of your backend API
  const API_BASE = "https://lost-and-found-epjk.onrender.com/api";

  // Check if user is logged in
  const token = sessionStorage.getItem("accessToken");
  if (!token) {
    alert("You must be logged in to report items.");
    window.location.href = "login.html";
    return;
  }

  // Helper: Toggle button loading state
  function toggleButtonLoading(isLoading) {
    if (isLoading) {
      submitBtn.disabled = true;
      submitBtn.classList.add("loading");
      submitBtn.textContent = submitBtn.dataset.loadingText;
    } else {
      submitBtn.disabled = false;
      submitBtn.classList.remove("loading");
      submitBtn.textContent = "Submit Report";
    }
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const itemName = document.getElementById("itemName").value.trim();
    const location = document.getElementById("location").value.trim();
    const description = document.getElementById("description").value.trim();
    const contact = document.getElementById("contact").value.trim();
    const imageInput = document.getElementById("image");

    if (!itemName || !location || !description || !contact) {
      alert("Please fill in all required fields.");
      return;
    }

    // Build FormData to send file + text
    const formData = new FormData();
    formData.append("itemName", itemName);
    formData.append("location", location);
    formData.append("description", description);
    formData.append("contact", contact);
    formData.append("type", "found"); // Add type field for consistency with backend

    if (imageInput.files && imageInput.files[0]) {
      formData.append("image", imageInput.files[0]);
    }

    try {
      // Set button to loading state
      toggleButtonLoading(true);

      const res = await fetch(`${API_BASE}/found-items/report-found`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `Server error: ${res.status}`);
      }

      alert("✅ Found item reported successfully!");
      form.reset();
      window.location.href = "Browse.html";
    } catch (err) {
      console.error("Error:", err);
      alert("❌ Could not connect to the server. Please try again.");
    } finally {
      // Reset button state regardless of success or failure
      toggleButtonLoading(false);
    }
  });

  // Toggle mobile menu
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    const icon = menuToggle.querySelector("i");
    icon.classList.toggle("fa-bars");
    icon.classList.toggle("fa-times");
  });

  // User logout
  if (logout) {
    logout.addEventListener("click", () => {
      sessionStorage.removeItem("accessToken");
      window.location.href = "login.html";
    });
  }
});