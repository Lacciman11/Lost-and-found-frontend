// Browse Page - Dynamic Items + Search/Filters/Sorting
document.addEventListener("DOMContentLoaded", () => {
  const searchBox = document.querySelector(".search-box");
  const categorySelect = document.querySelector(".filter-select");
  const locationSelect = document.querySelector(".location-select");
  const sortSelect = document.querySelector(".sort-select");
  const itemGrid = document.getElementById("itemGrid");

  const token = sessionStorage.getItem("accessToken");
  if (!token) {
    alert("You must be logged in to view activities.");
    window.location.href = "login.html";
    return;
  }

  // Load items from localStorage
  const lostItems = JSON.parse(localStorage.getItem("lostItems")) || [];
  const foundItems = JSON.parse(localStorage.getItem("foundItems")) || [];

  // Merge both arrays
  let allItems = [...lostItems, ...foundItems];

  // Render items
  function renderItems(items) {
    itemGrid.innerHTML = ""; // clear before rendering
    if (items.length === 0) {
      itemGrid.innerHTML = "<p>No items found.</p>";
      return;
    }

    items.forEach(item => {
      const card = document.createElement("div");
      card.classList.add("item-card");
      card.setAttribute("data-category", item.type); // lost or found
      card.setAttribute("data-location", item.location.toLowerCase());

      card.innerHTML = `
        <img src="${item.imageUrl}" alt="${item.itemName}">
        <div class="item-info">
          <h3>${item.itemName}</h3>
          <p>${item.description}</p>
          <span class="badge ${item.type}">${item.type.toUpperCase()}</span>
          <p><small>${item.location} · ${item.date}</small></p>
        </div>
      `;
      itemGrid.appendChild(card);
    });
  }

  // Filter + Sort items
  function filterItems() {
    const searchText = searchBox.value.toLowerCase();
    const selectedCategory = categorySelect.value;
    const selectedLocation = locationSelect.value.toLowerCase();
    const sortOption = sortSelect.value;

    let filtered = allItems.filter(item => {
      const matchesSearch =
        item.itemName.toLowerCase().includes(searchText) ||
        item.description.toLowerCase().includes(searchText);

      const matchesCategory =
        selectedCategory === "" || item.type === selectedCategory;

      const matchesLocation =
        selectedLocation === "" || item.location.toLowerCase().includes(selectedLocation);

      return matchesSearch && matchesCategory && matchesLocation;
    });

    // Sorting
    if (sortOption === "newest") {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortOption === "oldest") {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortOption === "az") {
      filtered.sort((a, b) => a.itemName.localeCompare(b.itemName));
    } else if (sortOption === "za") {
      filtered.sort((a, b) => b.itemName.localeCompare(a.itemName));
    }

    renderItems(filtered);
  }

  // Initial render
  renderItems(allItems);

  // Event listeners
  searchBox.addEventListener("input", filterItems);
  categorySelect.addEventListener("change", filterItems);
  locationSelect.addEventListener("change", filterItems);
  sortSelect.addEventListener("change", filterItems);
});
