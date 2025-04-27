const Listing = require("../models/listing");

module.exports.searchListings = async (req, res) => {
  const query = req.query.query?.trim(); // Trim query to avoid leading/trailing spaces

  // Check if query is empty or undefined
  if (!query) {
    return res.status(400).json({ error: "Search query cannot be empty." });
  }

  try {
    // Perform text search with MongoDB's $text operator
    const listings = await Listing.find({
      $text: { $search: query },
    })
      .limit(10) // Limit the number of results to 10 for performance
      .exec(); // Execute the query

    // Check if any results were found
    if (!listings.length) {
      return res.status(404).json({ message: "No results found." });
    }

    // Return matching results as JSON
    res.json(listings);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "An unexpected server error occurred." });
  }
};
