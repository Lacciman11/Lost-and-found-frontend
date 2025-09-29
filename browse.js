// Browse Page - Dynamic Items + Search/Filters/Sorting
document.addEventListener("DOMContentLoaded", () => {
  const searchBox = document.querySelector(".search-box");
  const itemGrid = document.getElementById("itemGrid");
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.querySelector(".nav-links");

  // optional selects — may be missing in HTML; provide safe fallback objects
  const categorySelect = document.getElementById("categorySelect") || { value: "" };
  const locationSelect = document.getElementById("locationSelect") || { value: "" };
  const sortSelect = document.getElementById("sortSelect") || { value: "newest" };

  const token = sessionStorage.getItem("accessToken");
  if (!token) {
    alert("You must be logged in to view activities.");
    window.location.href = "login.html";
    return;
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

  // API base
  const API_BASE = "https://lost-and-found-epjk.onrender.com"; // change to your deployed URL when ready

  // state
  let allItems = [];

  // ---------- Fetch all items (Lost + Found) ----------
  async function fetchAllItems() {
    try {
      const res = await fetch(`${API_BASE}/items/getAllItems`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to fetch items (status ${res.status})`);
      const data = await res.json();

      // expected format: [ { lost: [...] }, { found: [...] } ]
      const lostWrapper = Array.isArray(data) ? data.find(d => d.lost) : null;
      const foundWrapper = Array.isArray(data) ? data.find(d => d.found) : null;

      const lostItems = (lostWrapper && Array.isArray(lostWrapper.lost)) ? lostWrapper.lost : [];
      const foundItems = (foundWrapper && Array.isArray(foundWrapper.found)) ? foundWrapper.found : [];

      // add a transient "type" in-memory so UI can show badges (not persisted)
      const lostWithType = lostItems.map(i => ({ ...i, type: "lost" }));
      const foundWithType = foundItems.map(i => ({ ...i, type: "found" }));

      allItems = [...lostWithType, ...foundWithType].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

    // update stats bar
    document.querySelector(".stats-bar .stat-box:nth-child(1) h3").textContent = `📦 ${lostItems.length}`;
    document.querySelector(".stats-bar .stat-box:nth-child(2) h3").textContent = `✅ ${foundItems.length}`;
      renderItems(allItems);
    } catch (err) {
      console.error("Error fetching items from server:", err);

      // fallback: try localStorage (keeps old behavior)
      const lostItems = JSON.parse(localStorage.getItem("lostItems")) || [];
      const foundItems = JSON.parse(localStorage.getItem("foundItems")) || [];
      allItems = [
        ...lostItems.map(i => ({ ...i, type: "lost" })),
        ...foundItems.map(i => ({ ...i, type: "found" }))
      ];
      renderItems(allItems);
    }
  }

  // ---------- Search (calls backend) ----------
  let searchAbortController = null;
  async function performSearch(query) {
    // if query is empty, show allItems (no backend call)
    if (!query || !query.trim()) {
      renderItems(allItems);
      return;
    }

    // abort previous request if typing fast
    if (searchAbortController) searchAbortController.abort();
    searchAbortController = new AbortController();

    try {
      const res = await fetch(`${API_BASE}/items/search?query=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: searchAbortController.signal
      });
      if (!res.ok) throw new Error(`Search failed (status ${res.status})`);
      const results = await res.json();

      // backend search returns combined array where items already contain a .type
      // but if they don't, set a sensible fallback
      const normalized = (Array.isArray(results) ? results : []).map(it => {
        return {
          ...it,
          type: it.type || (it.itemName && it.createdAt ? "lost" : "found") // best-effort fallback
        };
      });

      renderItems(normalized);
    } catch (err) {
      if (err.name === "AbortError") return; // expected
      console.error("Search error:", err);
      // fallback to client-side filtering if backend fails
      const filtered = allItems.filter(item =>
        (item.itemName || "").toLowerCase().includes(query.toLowerCase()) ||
        (item.description || "").toLowerCase().includes(query.toLowerCase())
      );
      renderItems(filtered);
    }
  }

  // ---------- Fetch recent activities ----------
  async function fetchRecentActivities() {
    try {
      const res = await fetch(`${API_BASE}/items/activity/recent`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to fetch activities (status ${res.status})`);
      const activities = await res.json();

      const activityGrid = document.querySelector(".activity-grid");
      if (!activityGrid) return;

      activityGrid.innerHTML = "";
      if (!Array.isArray(activities) || activities.length === 0) {
        activityGrid.innerHTML = `<p>No recent activity.</p>`;
        return;
      }

      activities.forEach(act => {
        // act expected shape: { message, time, location?, imageUrl? }
        const card = document.createElement("div");
        card.classList.add("activity-card");

        const imgSrc = act.imageUrl || "assets/placeholder.png";
        const timeText = act.time ? new Date(act.time).toLocaleString() : "";

        card.innerHTML = `
          <div class="activity-info">
            <h4>${act.message}</h4>
            <p>${timeText}${act.location ? ` · ${act.location}` : ""}</p>
          </div>
        `;
        activityGrid.appendChild(card);
      });
    } catch (err) {
      console.error("Error fetching recent activities:", err);
      // don't crash; keep existing static content (if any)
    }
  }

  // ---------- Render items ----------
  function renderItems(items) {
    itemGrid.innerHTML = ""; // clear before rendering
    if (!items || items.length === 0) {
      itemGrid.innerHTML = "<p>No items found.</p>";
      return;
    }

    items.forEach((item) => {
      const card = document.createElement("div");
      card.classList.add("item-card");
      const type = item.type || ""; // either provided by backend or set in-memory
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

  // ---------- Filter & Sort (client-side) ----------
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

    // Sorting
    if (sortOption === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
    } else if (sortOption === "oldest") {
      filtered.sort((a, b) => new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date));
    } else if (sortOption === "az") {
      filtered.sort((a, b) => (a.itemName || "").localeCompare(b.itemName || ""));
    } else if (sortOption === "za") {
      filtered.sort((a, b) => (b.itemName || "").localeCompare(a.itemName || ""));
    }

    renderItems(filtered);
  }

  // ---------- Utilities ----------
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // ---------- Event wiring ----------
  if (searchBox) {
    // prefer backend search; if backend fails, fallback handled inside performSearch
    searchBox.addEventListener("change", (e) => {
      const q = e.target.value;
      // if q is empty we show client-side filtered allItems
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

  // ---------- Init ----------
  fetchAllItems();
  fetchRecentActivities();
});
