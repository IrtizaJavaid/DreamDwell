const Listing = require("../models/listing");
const fetch = require("node-fetch");
const Booking = require("../models/booking");
// Set your MapTiler API key
const apiKey = process.env.MAP_TOKEN;

module.exports.index = async (req, res) => {
  const allList = await Listing.find({});
  res.render("listings/allList.ejs", { allList });
};
module.exports.renderNewForm = async (req, res) => {
  res.render("listings/newList.ejs");
};

module.exports.showListing = async (req, res) => {
  const mongoose = require("mongoose");

  // Validate listing ID format
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    req.flash("error", "Invalid listing ID.");
    return res.redirect("/listings");
  }

  try {
    // Fetch the listing from the database
    const listing = await Listing.findById(req.params.id)
      .populate({ path: "reviews", populate: { path: "author" } }) // Populate reviews and authors
      .populate("owner"); // Populate owner details

    // **Add Null Check Here**
    if (!listing) {
      req.flash("error", "Cannot find that listing or owner details!");
      return res.redirect("/listings");
    }
    let booking = null;
    if (req.user) {
      booking = await Booking.findOne({
        user: req.user._id,
        listing: listing._id,
      });
    }

    console.log("Listing:", listing);
    console.log("Booking for current user:", booking);

    res.render("listings/showList.ejs", { listing, booking });
  } catch (err) {
    console.error("Error fetching listing or booking:", err);
    req.flash("error", "Something went wrong. Please try again later.");
    res.redirect("/listings");
  }
};

async function forwardGeocode(location) {
  try {
    console.log("Location passed to forwardGeocode:", location); // Log the location

    const apiUrl = `https://api.maptiler.com/geocoding/${encodeURIComponent(
      location
    )}.json?key=${process.env.MAP_TOKEN}`;
    console.log("API URL:", apiUrl); // Log the API URL

    const response = await fetch(apiUrl);
    if (!response.ok) {
      console.error("Geocoding API Error:", response.statusText);
      return null;
    }

    const data = await response.json();
    console.log("Geocoding Response:", data); // Log the full API response

    if (data.features && data.features.length > 0) {
      const coordinates = data.features[0].geometry.coordinates;
      console.log("Extracted Coordinates:", coordinates); // Log the valid coordinates
      return coordinates;
    } else {
      console.warn("No coordinates found for location:", location);
      return null;
    }
  } catch (error) {
    console.error("Error in forwardGeocode:", error.message);
    return null;
  }
}

module.exports.createListing = async (req, res, next) => {
  try {
    const location = req.body.listing.location;
    console.log("Location Received in createListing:", location); // Log location

    // Fetch coordinates using forwardGeocode
    const coordinates = await forwardGeocode(location);
    console.log("Coordinates Fetched:", coordinates); // Debug coordinates

    // Use default coordinates (e.g., Srinagar) if geocoding fails
    const finalCoordinates = coordinates || [74.8021, 34.0837];
    console.log("Final Coordinates to Save:", finalCoordinates);

    // Extract image URL and filename
    const url = req.file?.path;
    const filename = req.file?.filename;

    // Create a new listing
    const newListing = new Listing({
      title: req.body.listing.title,
      description: req.body.listing.description,
      image: { url: req.body.listing.imageUrl || url, filename },
      price: req.body.listing.price,
      location: req.body.listing.location,
      country: req.body.listing.country,
      category: req.body.listing.category,
      geometry: {
        type: "Point",
        coordinates: finalCoordinates, // Use final resolved coordinates
      },
      owner: req.user._id,
    });

    console.log("Data Being Saved to Listing:", newListing); // Log data before saving
    await newListing.save();
    console.log("New Listing Created:", newListing); // Confirm successful save

    req.flash("success", "Successfully made a new listing!");
    res.redirect("/listings");
  } catch (error) {
    console.error("Error creating listing:", error.message); // Log errors
    req.flash("error", "Failed to create listing. Please try again.");
    res.redirect("/listings/new");
  }
};
module.exports.filterListings = async (req, res) => {
  try {
    const { category } = req.query; // Extract category from the query params
    const filteredListings = await Listing.find({ category }); // Find listings matching the category
    if (filteredListings.length === 0) {
      req.flash("info", `No listings found for category: ${category}`);
    }
    res.render("listings/allList.ejs", { allList: filteredListings }); // Render the filtered listings
  } catch (error) {
    console.error("Error fetching filtered listings:", error.message);
    req.flash("error", "Failed to filter listings. Please try again.");
    res.redirect("/listings");
  }
};

module.exports.renderEditForm = async (req, res) => {
  const newUpdatedList = await Listing.findById(req.params.id); //   console.log(newUpdatedList.image.url);
  if (!newUpdatedList) {
    req.flash("error", "Cannot find that listing!");
    return res.redirect("/listings");
  }
  let orignalImage = newUpdatedList.image.url;
  orignalImage = orignalImage.replace("/upload", "/upload/h_200,w_200");
  res.render("listings/edit.ejs", { newUpdatedList, orignalImage });
};
module.exports.updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const location = req.body.listing.location;

    // Fetch updated coordinates for the new location
    const coordinates = await forwardGeocode(location);
    console.log("Coordinates for Updated Location:", coordinates); // Debug log

    // Update the listing
    const updatedList = await Listing.findByIdAndUpdate(
      id,
      {
        title: req.body.listing.title,
        description: req.body.listing.description,
        image: { url: req.body.listing.imageUrl },
        price: req.body.listing.price,
        location,
        country: req.body.listing.country,
        geometry: {
          type: "Point",
          coordinates, // Fetched coordinates [longitude, latitude]
        },
      },
      { new: true }
    );

    // Handle file upload if a new image is provided
    if (req.file) {
      const url = req.file.path;
      const filename = req.file.filename;
      updatedList.image = { url, filename };
      await updatedList.save();
    }

    if (!updatedList) {
      return res.status(404).send("Listing not found");
    }

    req.flash("success", "Listing Updated Successfully!");
    res.redirect(`/listings/${id}`);
  } catch (error) {
    console.error("Error updating listing:", error.message);
    req.flash("error", "Failed to update listing. Please try again.");
    res.redirect(`/listings/${id}/edit`);
  }
};

module.exports.deleteListing = async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id); // Correctly reference req.params.id
  req.flash("success", "Listing Deleted Successfully!");
  res.redirect("/listings");
};
