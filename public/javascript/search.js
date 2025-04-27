const searchInput = document.getElementById("searchQuery");
const searchResults = document.getElementById("searchResults");

let timeout; // Variable to track debounce timer

searchInput.addEventListener("input", () => {
  clearTimeout(timeout); // Clear the previous timeout
  timeout = setTimeout(async () => {
    const query = searchInput.value.trim(); // Trim whitespace for cleaner queries

    if (!query) {
      searchResults.innerHTML = ""; // Clear results for empty input
      searchResults.style.display = "none"; // Hide dropdown
      return;
    }

    try {
      const res = await fetch(`/search?query=${encodeURIComponent(query)}`); // Encode query for special characters
      const listings = await res.json();

      if (!listings.length) {
        searchResults.innerHTML = "<p class='text-muted'>No results found.</p>";
        searchResults.style.display = "block";
        return;
      }

      const resultsHTML = listings
        .map(
          (listing) => `
          <a href="/listings/${listing._id}" class="dropdown-item">
            ${listing.title} (${listing.location})
          </a>`
        )
        .join("");

      searchResults.innerHTML = resultsHTML;
      searchResults.style.display = "block"; // Display results
    } catch (err) {
      console.error("Error fetching search results:", err);
      searchResults.innerHTML =
        "<p class='text-danger'>Error fetching search results. Please try again later.</p>";
      searchResults.style.display = "block";
    }
  }, 300); // Debounce with a delay of 300ms
});
