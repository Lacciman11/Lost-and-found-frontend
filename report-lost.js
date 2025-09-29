document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("lostForm");
  const logout = document.getElementById("logout");
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.querySelector(".nav-links");

  const token = sessionStorage.getItem("accessToken");
  if (!token) {
    alert("You must be logged in to report items.");
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

    // ✅ Use FormData
    const formData = new FormData();
    formData.append("type", "lost");
    formData.append("itemName", itemName);
    formData.append("location", location);
    formData.append("description", description);
    formData.append("contact", contact);
    formData.append("date", new Date().toISOString());

    if (imageInput.files && imageInput.files[0]) {
      formData.append("image", imageInput.files[0]); // actual file
    }

    try {
      const res = await fetch("https://lost-and-found-epjk.onrender.com/api/lost-items/report-lost", {
        method: "POST",
        body: formData // ✅ send as FormData (no headers for multipart!)
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      console.log("Saved to backend:", data);
      alert("Lost item reported successfully!");

      form.reset();
      window.location.href = "Browse.html"; // redirect
    } catch (err) {
      console.error("Error sending to backend:", err);
      alert("Could not send to server.");
    }
  });

  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");

    // Switch icon between bars & close
    const icon = menuToggle.querySelector("i");
    icon.classList.toggle("fa-bars");
    icon.classList.toggle("fa-times");
  });

  if (logout) {
    logout.addEventListener("click", () => {
      sessionStorage.removeItem("accessToken");
      window.location.href = "login.html";
    });
  }
});
