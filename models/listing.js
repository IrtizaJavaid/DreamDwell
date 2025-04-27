const { types, ref } = require("joi");
const mongoose = require("mongoose");
const Review = require("./review.js");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: {
    url: String,
    filename: String,
  },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  country: { type: String, required: true },
  geometry: {
    type: {
      type: String, // GeoJSON type, e.g., "Point"
      enum: ["Point"], // Only "Point" is allowed
      required: true,
    },
    coordinates: {
      type: [Number], // Array of numbers: [longitude, latitude]
      required: true,
    },
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  category: {
    type: String,
    enum: [
      "beach",
      "iconic-cities",
      "mountain",
      "trending",
      "camp",
      "lakefront",
      "wildlife",
      "historic",
      "private-island",
      "countryside",
      "tropical",
      "castle",
      "luxury",
      "desert",
      "city",
      "arctic",
    ],
    required: true, // Ensure category is mandatory
  },
});

// Add a text index for title and location
listingSchema.index({ title: "text", location: "text" });

// Middleware to clean up reviews when a listing is deleted
listingSchema.post("findOneAndDelete", async function (listing) {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

//model created  and export the model
const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;








