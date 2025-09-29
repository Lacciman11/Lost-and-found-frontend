// activity.js

document.addEventListener("DOMContentLoaded", () => {
  // DOM elements
  const activityList = document.getElementById("activityList");
  const itemsGrid = document.getElementById("itemsGrid");
  const itemsLoading = document.getElementById("itemsLoading");
  const itemsError = document.getElementById("itemsError");
  const activityLoading = document.getElementById("activityLoading");
  const activityError = document.getElementById("activityError");
  const logout = document.getElementById("logout");
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
  const searchForm = document.querySelector(".search form");
  const searchInput = searchForm.querySelector("input");

  // Base URL of your backend API
  const API_BASE = "https://lost-and-found-epjk.onrender.com/api";

  // Check if user is logged in
  const token = sessionStorage.getItem("accessToken");
  if (!token) {
    alert("You must be logged in to view activities.");
    window.location.href = "login.html";
    return;
  }

  // Helper: Show loading state
  function showLoading(element) {
    element.classList.remove("hidden");
  }

  // Helper: Hide loading state
  function hideLoading(element) {
    element.classList.add("hidden");
  }

  // Helper: Show error message
  function showError(element, message) {
    element.textContent = message;
    element.classList.remove("hidden");
  }

  // Helper: Hide error message
  function hideError(element) {
    element.classList.add("hidden");
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

  // Helper: Open modal with item details
  function openModal(item, type) {
    modalImage.src = item.imageUrl || "assets/placeholder.png";
    modalTitle.textContent = item.itemName || item.title;
    modalLocation.textContent = `📍 Location: ${item.location}`;
    modalDescription.textContent = item.description || "No description provided.";
    modalContact.textContent = item.contact || "Not provided";
    modalDate.textContent = `📅 Reported: ${new Date(item.date || item.createdAt).toLocaleString()}`;
    itemModal.classList.remove("hidden");
  }

  // Fetch recent items
  async function loadRecentItems() {
    showLoading(itemsLoading);
    hideError(itemsError);
    itemsGrid.innerHTML = ""; // Clear grid

    try {
      const res = await fetch(`${API_BASE}/items/recent`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch recent items.");
      const data = await res.json();

      // Render Lost + Found separately
      if (data.lost?.length) {
        data.lost.forEach(item => renderCard(item, "lost"));
      }
      if (data.found?.length) {
        data.found.forEach(item => renderCard(item, "found"));
      }
      if (!data.lost?.length && !data.found?.length) {
        itemsGrid.innerHTML = "<p>No recent items found.</p>";
      }
    } catch (err) {
      console.error("Error fetching recent items:", err);
      showError(itemsError, "Failed to load recent items. Please try again later.");
    } finally {
      hideLoading(itemsLoading);
    }
  }

  // Fetch recent activity
  async function loadRecentActivity() {
    showLoading(activityLoading);
    hideError(activityError);
    activityList.innerHTML = ""; // Clear activity list

    try {
      const res = await fetch(`${API_BASE}/items/activity/recent`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch recent activity.");
      const data = await res.json();

      if (data.length) {
        data.forEach(act => {
          const div = document.createElement("div");
          div.classList.add("activity-item");
          div.innerHTML = `
            <p>${act.message}</p>
            <small>${new Date(act.time).toLocaleString()}</small>
          `;
          activityList.appendChild(div);
        });
      } else {
        activityList.innerHTML = "<p>No recent activity found.</p>";
      }
    } catch (err) {
      console.error("Error fetching activity:", err);
      showError(activityError, "Failed to load recent activity. Please try again later.");
    } finally {
      hideLoading(activityLoading);
    }
  }

  // Search logic
  searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (!query) return;

    showLoading(itemsLoading);
    hideError(itemsError);
    itemsGrid.innerHTML = ""; // Clear grid

    try {
      const res = await fetch(`${API_BASE}/items/search?query=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to search items.");
      const results = await res.json();

      if (results.length) {
        results.forEach(item => renderCard(item, item.type));
      } else {
        itemsGrid.innerHTML = `<p>No results found for "${query}".</p>`;
      }
    } catch (err) {
      console.error("Error searching items:", err);
      showError(itemsError, "Failed to search items. Please try again later.");
    } finally {
      hideLoading(itemsLoading);
    }
  });

  // Toggle mobile menu
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    const icon = menuToggle.querySelector("i");
    icon.classList.toggle("fa-bars");
    icon.classList.toggle("fa-times");
  });

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

  // User logout
  logout.addEventListener("click", () => {
    sessionStorage.removeItem("accessToken");
    window.location.href = "login.html";
  });

  // Initialize
  loadRecentItems();
  loadRecentActivity();
});