// Report Found Item - Validation + API Call
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("foundForm");
  const logout = document.getElementById("logout");
  const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.querySelector(".nav-links");

  const token = sessionStorage.getItem("accessToken");
  if (!token) {
    alert("You must be logged in to view activities.");
    window.location.href = "login.html";
    return;
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

    if (imageInput.files && imageInput.files[0]) {
      formData.append("image", imageInput.files[0]); // file
    }

    try {
      const res = await fetch("https://lost-and-found-epjk.onrender.com/api/found-items/report-found", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // ✅ send token
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Something went wrong while reporting the item.");
        return;
      }

      alert("✅ Found item reported successfully!");
      form.reset();
      window.location.href = "Browse.html";
    } catch (err) {
      console.error("Error:", err);
      alert("❌ Could not connect to the server. Try again.");
    }
  });

  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");

    // Switch icon between bars & close
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
