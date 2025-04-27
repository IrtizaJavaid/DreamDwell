const express = require("express");
const { route } = require("./listing");
//creating router object
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressErr");
const Reviewcontroller = require("../controllers/review");

const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {
  validateReview,
  isLoggedIn,
  isReviewAuthor,
} = require("../middleware.js");

//Post Review Route
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(Reviewcontroller.createReview)
);

//to delete Review individually-->delete Review Route
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(Reviewcontroller.deleteReview)
);

module.exports = router;
