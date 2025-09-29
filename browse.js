// browse.js

document.addEventListener("DOMContentLoaded", () => {
  const searchBox = document.querySelector(".search-box");
  const itemGrid = document.getElementById("itemGrid");
  const itemsLoading = document.getElementById("itemsLoading");
  const itemsError = document.getElementById("itemsError");
  const activityGrid = document.getElementById("activityGrid");
  const activityLoading = document.getElementById("activityLoading");
  const activityError = document.getElementById("activityError");
  const lostCount = document.getElementById("lostCount");
  const foundCount = document.getElementById("foundCount");
  const statsError = document.getElementById("statsError");
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.querySelector(".nav-links");
  const logout = document.getElementById("logout");

  // Optional selects — may be missing in HTML; provide safe fallback objects
  const categorySelect = document.getElementById("categorySelect") || { value: "" };
  const locationSelect = document.getElementById("locationSelect") || { value: "" };
  const sortSelect = document.getElementById("sortSelect") || { value: "newest" };

  // API base
  const API_BASE = "https://lost-and-found-epjk.onrender.com/api";

  // Check if user is logged in
  const token = sessionStorage.getItem("accessToken");
  if (!token) {
    alert("You must be logged in to view items.");
    window.location.href = "login.html";
    return;
  }

  // State
  let allItems = [];

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

  // Helper: Escape HTML to prevent XSS
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Fetch all items (Lost + Found)
  async function fetchAllItems() {
    showLoading(itemsLoading);
    hideError(itemsError);
    showLoading(lostCount.querySelector(".loading-text"));
    showLoading(foundCount.querySelector(".loading-text"));
    hideError(statsError);
    itemGrid.innerHTML = ""; // Clear grid

    try {
      const res = await fetch(`${API_BASE}/items/getAllItems`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to fetch items (status ${res.status})`);
      const data = await res.json();

      // Expected format: [ { lost: [...] }, { found: [...] } ]
      const lostWrapper = Array.isArray(data) ? data.find(d => d.lost) : null;
      const foundWrapper = Array.isArray(data) ? data.find(d => d.found) : null;

      const lostItems = (lostWrapper && Array.isArray(lostWrapper.lost)) ? lostWrapper.lost : [];
      const foundItems = (foundWrapper && Array.isArray(foundWrapper.found)) ? foundWrapper.found : [];

      // Add transient "type" for UI
      const lostWithType = lostItems.map(i => ({ ...i, type: "lost" }));
      const foundWithType = foundItems.map(i => ({ ...i, type: "found" }));

      allItems = [...lostWithType, ...foundWithType].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      // Update stats bar
      lostCount.innerHTML = `📦 ${lostItems.length}`;
      foundCount.innerHTML = `✅ ${foundItems.length}`;
      renderItems(allItems);
    } catch (err) {
      console.error("Error fetching items:", err);
      showError(itemsError, "Failed to load items. Please try again later.");
      showError(statsError, "Failed to load stats. Please try again later.");
    } finally {
      hideLoading(itemsLoading);
      hideLoading(lostCount.querySelector(".loading-text"));
      hideLoading(foundCount.querySelector(".loading-text"));
    }
  }

  // Fetch recent activities
  async function fetchRecentActivities() {
    showLoading(activityLoading);
    hideError(activityError);
    activityGrid.innerHTML = ""; // Clear activity grid

    try {
      const res = await fetch(`${API_BASE}/items/activity/recent`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to fetch activities (status ${res.status})`);
      const activities = await res.json();

      if (!Array.isArray(activities) || activities.length === 0) {
        activityGrid.innerHTML = `<p>No recent activity.</p>`;
        return;
      }

      activities.forEach(act => {
        const card = document.createElement("div");
        card.classList.add("activity-card");

        const imgSrc = act.imageUrl || "assets/placeholder.png";
        const timeText = act.time ? new Date(act.time).toLocaleString() : "";

        card.innerHTML = `
          <div class="activity-info">
            <h4>${escapeHtml(act.message)}</h4>
            <p>${timeText}${act.location ? ` · ${escapeHtml(act.location)}` : ""}</p>
          </div>
        `;
        activityGrid.appendChild(card);
      });
    } catch (err) {
      console.error("Error fetching recent activities:", err);
      showError(activityError, "Failed to load recent activity. Please try again later.");
    } finally {
      hideLoading(activityLoading);
    }
  }

  // Search (calls backend)
  let searchAbortController = null;
  async function performSearch(query) {
    if (!query || !query.trim()) {
      renderItems(allItems);
      return;
    }

    showLoading(itemsLoading);
    hideError(itemsError);
    itemGrid.innerHTML = ""; // Clear grid

    if (searchAbortController) searchAbortController.abort();
    searchAbortController = new AbortController();

    try {
      const res = await fetch(`${API_BASE}/items/search?query=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: searchAbortController.signal,
      });
      if (!res.ok) throw new Error(`Search failed (status ${res.status})`);
      const results = await res.json();

      const normalized = (Array.isArray(results) ? results : []).map(it => ({
        ...it,
        type: it.type || (it.itemName && it.createdAt ? "lost" : "found"),
      }));

      renderItems(normalized);
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("Search error:", err);
      showError(itemsError, "Failed to search items. Please try again later.");
    } finally {
      hideLoading(itemsLoading);
    }
  }

  // Render items
  function renderItems(items) {
    itemGrid.innerHTML = ""; // Clear before rendering
    if (!items || items.length === 0) {
      itemGrid.innerHTML = "<p>No items found.</p>";
      return;
    }

    items.forEach((item) => {
      const card = document.createElement("div");
      card.classList.add("item-card");
      const type = item.type || "";
      card.setAttribute("data-category", type);
      card.setAttribute("data-location", (item.location || "").toLowerCase());

      const img = item.imageUrl || item.image || "assets/placeholder.png";

      card.innerHTML = `
        <img src="${img}" alt="${escapeHtml(item.itemName || '')}">
        <div class="item-info">
          <h3>${escapeHtml(item.itemName || '(no title)')}</h3>
          <p>${escapeHtml(item.description || '')}</p>
          <span class="badge ${type}">${(type || "").toUpperCase()}</span>
          <p><small>${escapeHtml(item.location || 'Unknown')} · ${new Date(item.createdAt || item.date || Date.now()).toLocaleDateString()}</small></p>
        </div>
      `;
      itemGrid.appendChild(card);
    });
  }

  // Filter & Sort (client-side)
  function filterItems() {
    const searchText = (searchBox && searchBox.value) ? searchBox.value.toLowerCase() : "";
    const selectedCategory = categorySelect && categorySelect.value ? categorySelect.value : "";
    const selectedLocation = locationSelect && locationSelect.value ? locationSelect.value.toLowerCase() : "";
    const sortOption = sortSelect && sortSelect.value ? sortSelect.value : "newest";

    let filtered = allItems.filter((item) => {
      const matchesSearch =
        (item.itemName || "").toLowerCase().includes(searchText) ||
        (item.description || "").toLowerCase().includes(searchText);
      const matchesCategory = selectedCategory === "" || (item.type === selectedCategory);
      const matchesLocation = selectedLocation === "" || (item.location || "").toLowerCase().includes(selectedLocation);

      return matchesSearch && matchesCategory && matchesLocation;
    });

    if (sortOption === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
    } else if (sortOption === "oldest") {
      filtered.sort((a, b) => new Date(a.createdAt || a.date) - new Date(b.createdAt || a.date));
    } else if (sortOption === "az") {
      filtered.sort((a, b) => (a.itemName || "").localeCompare(b.itemName || ""));
    } else if (sortOption === "za") {
      filtered.sort((a, b) => (b.itemName || "").localeCompare(a.itemName || ""));
    }

    renderItems(filtered);
  }

  // Event wiring
  if (searchBox) {
    searchBox.addEventListener("input", (e) => {
      const q = e.target.value;
      if (!q || !q.trim()) {
        filterItems();
        return;
      }
      performSearch(q);
    });
  }

  if (categorySelect && typeof categorySelect.addEventListener === "function") {
    categorySelect.addEventListener("change", filterItems);
  }
  if (locationSelect && typeof locationSelect.addEventListener === "function") {
    locationSelect.addEventListener("change", filterItems);
  }
  if (sortSelect && typeof sortSelect.addEventListener === "function") {
    sortSelect.addEventListener("change", filterItems);
  }

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      const icon = menuToggle.querySelector("i");
      if (icon) {
        icon.classList.toggle("fa-bars");
        icon.classList.toggle("fa-times");
      }
    });
  }

  if (logout) {
    logout.addEventListener("click", () => {
      sessionStorage.removeItem("accessToken");
      window.location.href = "login.html";
    });
  }

  // Init
  fetchAllItems();
  fetchRecentActivities();
});