// Recent Activity - Dynamic Updates
document.addEventListener("DOMContentLoaded", () => {
  const activityList = document.getElementById("activityList");
  const logout = document.getElementById("logout");
  // Modal DOM elements
const itemModal = document.getElementById("itemModal");
const closeModalBtn = document.getElementById("closeModal");
const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalLocation = document.getElementById("modalLocation");
const modalDescription = document.getElementById("modalDescription");
const modalContact = document.getElementById("modalContact");
const modalDate = document.getElementById("modalDate");
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.querySelector(".nav-links");

  const token = sessionStorage.getItem("accessToken");
  if (!token) {
    alert("You must be logged in to view activities.");
    window.location.href = "login.html";
    return;
  }

  // activity.js

// Base URL of your backend API
const API_BASE = "https://lost-and-found-epjk.onrender.com/api"; // change when deployed

// DOM elements
const itemsGrid = document.querySelector(".items .grid");
const searchForm = document.querySelector(".search form");
const searchInput = searchForm.querySelector("input");

// ---------------- FETCH RECENT ITEMS ----------------
async function loadRecentItems() {
  try {
    const res = await fetch(`${API_BASE}/items/recent`);
    const data = await res.json();

    // Clear existing
    itemsGrid.innerHTML = "";

    // Render Lost + Found separately
    if (data.lost && data.lost.length) {
      data.lost.forEach(item => renderCard(item, "lost"));
    }
    if (data.found && data.found.length) {
      data.found.forEach(item => renderCard(item, "found"));
    }
  } catch (err) {
    console.error("Error fetching recent items:", err);
  }
}

// Helper: Render one item card
function renderCard(item, type) {
  const card = document.createElement("div");
  card.classList.add("card");

  card.innerHTML = `
    <img src="${item.imageUrl || "assets/placeholder.png"}" alt="${item.itemName || item.title}">
    <div class="card-body">
      <h4>${item.itemName || item.title}</h4>
      <p><span class="badge ${type}">${type.toUpperCase()}</span> ${item.location}</p><br>
      <button class="btn-secondary">View Details</button>
    </div>
  `;
  // Attach click listener to the button
  card.querySelector(".btn-secondary").addEventListener("click", () => {
    openModal(item, type);
  });

  itemsGrid.appendChild(card);
}


// ---------------- FETCH RECENT ACTIVITY ----------------
async function loadRecentActivity() {
  try {
    const res = await fetch(`${API_BASE}/items/activity/recent`);
    const data = await res.json();

    // Clear
    activityList.innerHTML = "";

    data.forEach(act => {
      const div = document.createElement("div");
      div.classList.add("activity-item");
      div.innerHTML = `
        <p>${act.message}</p>
        <small>${new Date(act.time).toLocaleString()}</small>
      `;
      activityList.appendChild(div);
    });
  } catch (err) {
    console.error("Error fetching activity:", err);
  }
}

menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("active");

  // Switch icon between bars & close
  const icon = menuToggle.querySelector("i");
  icon.classList.toggle("fa-bars");
  icon.classList.toggle("fa-times");
});

function openModal(item, type) {
  modalImage.src = item.imageUrl || "assets/placeholder.png";
  modalTitle.textContent = item.itemName || item.title;
  modalLocation.textContent = `📍 Location: ${item.location}`;
  modalDescription.textContent = item.description || "No description provided.";
  modalContact.textContent = item.contact || "Not provided";
  modalDate.textContent = `📅 Reported: ${new Date(item.date || item.createdAt).toLocaleString()}`;

  itemModal.classList.remove("hidden");
}

// Close modal when clicking X
closeModalBtn.addEventListener("click", () => {
  itemModal.classList.add("hidden");
});

// Close modal when clicking outside content
itemModal.addEventListener("click", (e) => {
  if (e.target === itemModal) {
    itemModal.classList.add("hidden");
  }
});

// ---------------- SEARCH LOGIC ----------------
searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (!query) return;

  try {
    const res = await fetch(`${API_BASE}/items/search?query=${encodeURIComponent(query)}`);
    const results = await res.json();

    // Show results in the items grid
    itemsGrid.innerHTML = "";

    if (!results.length) {
      itemsGrid.innerHTML = `<p>No results found for "${query}".</p>`;
      return;
    }

    results.forEach(item => renderCard(item, item.type));
  } catch (err) {
    console.error("Error searching items:", err);
  }
});

// ---------------- INIT ----------------
loadRecentItems();
loadRecentActivity();


  // user logout 
  logout.addEventListener("click", () => {
    sessionStorage.removeItem("accessToken");
    window.location.href = "login.html";  
  });
});


