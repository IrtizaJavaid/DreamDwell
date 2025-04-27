const path = require("path"); // Import the 'path' module

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

// If variables are undefined, throw an error
if (!process.env.MAP_TOKEN || !process.env.ATLASDB_URL) {
  console.error(".env file not loaded properly or keys are missing!");
  process.exit(1);
}

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const fetch = require("node-fetch");

// Set your MapTiler API key
const apiKey = process.env.MAP_TOKEN;

// Verify if the API key is loaded properly
if (!apiKey) {
  throw new Error(
    "MapTiler API Key is missing. Ensure it is defined in your .env file as MAP_TOKEN."
  );
}

// Main function to connect to the database and initialize it
const main = async () => {
  try {
    const mongoUri = process.env.ATLASDB_URL;
    //  "mongodb://127.0.0.1:27017/DreamDwell"; // MongoDB connection URI
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB database");

    console.log("Initializing the database...");
    await initDb();
    console.log("Database initialization complete.");
  } catch (error) {
    console.error(
      "Error during database connection or initialization:",
      error.message
    );
  } finally {
    await mongoose.connection.close(); // Ensure connection is closed properly
    console.log("Database connection closed.");
  }
};

// Geocode a location using MapTiler API
const forwardGeocode = async (location) => {
  try {
    if (!location) {
      console.warn("Location is missing.");
      return null;
    }

    const apiUrl = `https://api.maptiler.com/geocoding/${encodeURIComponent(
      location
    )}.json?key=${apiKey}`;
    console.log("Geocoding API URL:", apiUrl);

    const response = await fetch(apiUrl);
    if (!response.ok) {
      console.error(
        `Geocoding API Error: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("Invalid response format. Expected JSON.");
      return null;
    }

    const data = await response.json();
    console.log("Geocoding API Response:", data);

    if (data.features && data.features.length > 0) {
      return data.features[0].geometry.coordinates; // Return the first set of coordinates
    }

    console.warn(`No geocoding result for "${location}".`);
    return null;
  } catch (error) {
    console.error("Geocoding error:", error.message);
    return null; // Return null on any error
  }
};

// Initialize database with geocoded data
const initDb = async () => {
  try {
    // Clear existing data in the database
    await Listing.deleteMany({});
    console.log("Existing listings cleared.");

    // Ensure that initData.data is an array
    if (!Array.isArray(initData.data)) {
      console.error(
        "Invalid data structure: initData.data should be an array."
      );
      return;
    }

    console.log("Processing listings...");

    const updatedData = await Promise.all(
      initData.data.map(async (obj) => {
        const coordinates = await forwardGeocode(obj.location); // Fetch geocoded coordinates
        return {
          ...obj,
          geometry: coordinates ? { type: "Point", coordinates } : null, // Add geometry if valid, otherwise null
          owner: obj.owner || "67f8fc8f0e5eac0cf5107fe8", // Use default owner if none is set
        };
      })
    );

    // Filter out entries with null geometry
    const filteredData = updatedData.filter((obj) => obj.geometry !== null);
    console.log(
      "Filtered Data to Insert:",
      JSON.stringify(filteredData, null, 2)
    );

    if (filteredData.length > 0) {
      // Insert filtered and processed data into the database
      await Listing.insertMany(filteredData);
      console.log("Data initialized with geocoded coordinates.");
    } else {
      console.warn("No valid data to insert!");
    }
  } catch (error) {
    console.error("Error during database initialization:", error.message);
  }
};

// Execute the main function
main();
