// Recent Activity - Dynamic Updates
document.addEventListener("DOMContentLoaded", () => {
  const activityList = document.getElementById("activityList");
  const logout = document.getElementById("logout");
 

  const token = sessionStorage.getItem("accessToken");
  if (!token) {
    alert("You must be logged in to view activities.");
    window.location.href = "login.html";
    return;
  }

  // Example data (can be fetched from a database later)
  const activities = [
    { user: "Sarah", action: "reported a Lost Laptop", time: "10 mins ago · Library", img: "assets/laptop-computer.jpg" },
    { user: "John", action: "found a Wallet", time: "30 mins ago · Cafeteria", img: "assets/black-wallet.jpg" },
    { user: "Amina", action: "reported a Lost Dog", time: "1 hour ago · Campus Gate", img: "assets/white-dog.jpg" },
  ];

  // Render activities dynamically
  activities.forEach(act => {
    const card = document.createElement("div");
    card.classList.add("activity-card");

    card.innerHTML = `
      <img src="${act.img}" alt="activity image">
      <div class="activity-info">
        <h4><strong>${act.user}</strong> ${act.action}</h4>
        <p>${act.time}</p>
      </div>
    `;

    activityList.appendChild(card);
  });

  // user logout 
  logout.addEventListener("click", () => {
    sessionStorage.removeItem("accessToken");
    window.location.href = "login.html";  
  });
});


