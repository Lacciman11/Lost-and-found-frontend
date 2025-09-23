// Report Lost Item - Validation + Save + API Call
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("lostForm");

  const logout = document.getElementById("logout");

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
    let imageUrl = "assets/default.png"; // fallback

    if (imageInput.files && imageInput.files[0]) {
      imageUrl = URL.createObjectURL(imageInput.files[0]);
    }

    if (!itemName || !location || !description || !contact) {
      alert("Please fill in all required fields.");
      return;
    }

    // Build item object
    const newItem = {
      type: "lost",
      itemName,
      location,
      description,
      contact,
      imageInput,
      date: new Date().toISOString()
    };

    // 2. Send to backend
    try {
      const res = await fetch("https://lost-and-found-epjk.onrender.com/api/lost-items/report-lost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newItem)
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      console.log("Saved to backend:", data);
      alert("Lost item reported successfully!");
    } catch (err) {
      console.error("Error sending to backend:", err);
      alert("Could not send to server, but item was saved locally.");
    }

    form.reset();

    // Redirect to browse page
    window.location.href = "Browse.html";
  });


  if(logout) {
    logout.addEventListener("click", () => {
      sessionStorage.removeItem("accessToken");
      window.location.href = "login.html";
    });
  }
});
