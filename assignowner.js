require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("./models/listing"); // Adjust the path as needed
const ObjectId = mongoose.Types.ObjectId;

const dbUrl = process.env.ATLASDB_URL;
// Connect to your database
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const assignOwners = async () => {
  try {
    const ownerId = new ObjectId("67bc09dd845150bbfc21a965"); // Use 'new' to create ObjectId

    const titles = [
      "Cozy Beachfront Cottage",
      "Modern Loft in Downtown",
      "Mountain Retreat",
      "Historic Villa in Tuscany",
      "Secluded Treehouse Getaway",
      "Beachfront Paradise",
      "Rustic Cabin by the Lake",
      "Luxury Penthouse with City Views",
      "Ski-In/Ski-Out Chalet",
      "Safari Lodge in the Serengeti",
      "Historic Canal House",
      "Private Island Retreat",
      "Charming Cottage in the Cotswolds",
      "Historic Brownstone in Boston",
      "Beachfront Bungalow in Bali",
      "Mountain View Cabin in Banff",
      "Art Deco Apartment in Miami",
      "Tropical Villa in Phuket",
      "Historic Castle in Scotland",
      "Desert Oasis in Dubai",
      "Rustic Log Cabin in Montana",
      "Beachfront Villa in Greece",
      "Eco-Friendly Treehouse Retreat",
      "Historic Cottage in Charleston",
      "Modern Apartment in Tokyo",
      "Lakefront Cabin in New Hampshire",
      "Luxury Villa in the Maldives",
      "Ski Chalet in Aspen",
      "Secluded Beach House in Costa Rica",
    ];

    // Update all listings with matching titles
    const result = await Listing.updateMany(
      { title: { $in: titles } }, // Match titles in the list
      { $set: { owner: ownerId } } // Assign the owner
    );

    console.log(`${result.modifiedCount} listings updated with the new owner.`);
    mongoose.connection.close();
  } catch (error) {
    console.error("Error updating listings:", error.message);
    mongoose.connection.close();
  }
};

assignOwners();
