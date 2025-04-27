const express = require("express");
//creating router object
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const Listing = require("../models/listing.js"); // Only require Listing model once
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const Listingcontroller = require("../controllers/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

//as we have two routes which are having same path i.e "/" so we can use router.route() method it will reduce the redundancy and make the code more readable and clean will will combine the two routes in one like // Index route -->router.get("/", wrapAsync(Listingcontroller.index)); and Create route -->router.post("/",isLoggedIn, validateListing, wrapAsync(Listingcontroller.createListing)); and will use router.route() method to combine them in one route
router
  .route("/")
  //Index route
  .get(wrapAsync(Listingcontroller.index))
  //Create route
  .post(
    isLoggedIn,

    upload.single("listing[imageUrl]"),
    validateListing,
    wrapAsync(Listingcontroller.createListing)
  );

//newList add route
router.get("/new", isLoggedIn, wrapAsync(Listingcontroller.renderNewForm));
//filter
router.get("/filter", wrapAsync(Listingcontroller.filterListings));

router
  .route("/:id")
  //show ids
  .get(wrapAsync(Listingcontroller.showListing))
  //to update route
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[imageUrl]"),
    validateListing,
    wrapAsync(Listingcontroller.updateListing)
  )
  //to delete route
  .delete(isLoggedIn, isOwner, wrapAsync(Listingcontroller.deleteListing));

//To Edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(Listingcontroller.renderEditForm)
);

module.exports = router;
