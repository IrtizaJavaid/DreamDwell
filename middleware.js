const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressErr.js");
const { listingSchema, reviewSchema, bookingSchema } = require("./schema.js");

//validation listingschema to covert joi_code to function
module.exports.validateListing = (req, res, next) => {
  console.log("Request Body:", req.body);
  console.log("Schema:", listingSchema);
  if (!req.body || !req.body.listing) {
    return next(new ExpressError("Invalid data", 400));
  }

  const { error } = listingSchema.validate(req.body);

  if (error) {
    // If there is a validation error, pass it to the error handling middleware
    return next(new ExpressError(error.details[0].message, 400));
  }

  next();
};

//validating review schema(creating method so that it can be used as middleware)
module.exports.validateReview = (req, res, next) => {
  console.log("Request Body:", req.body);
  console.log("Schema:", reviewSchema);

  if (!req.body || !req.body.review) {
    console.error("Invalid data: Missing review data");
    return next(new ExpressError("Invalid data", 400));
  }

  const { error } = reviewSchema.validate(req.body);

  if (error) {
    // If there is a validation error, pass it to the error handling middleware
    console.error("Validation error:", error.details[0].message);
    return next(new ExpressError(error.details[0].message, 400));
  }
  console.log("Review validation passed");
  next();
};

//This code is to check if the user is logged in or not to add a new listing.
module.exports.isLoggedIn = (req, res, next) => {
  //this code checks if the user is logged in or not to add a new listing.
  if (!req.isAuthenticated()) {
    //as user successfully logs in then redirect to the page they were trying to access before logging in
    req.session.redirectTo = req.originalUrl;
    req.flash("error", "You must be signed in first!");
    return res.redirect("/login");
  }
  next();
};
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectTo) {
    res.locals.redirectTo = req.session.redirectTo;
  }
  next();
};

//for authorization to check if the user is the owner of the listing or not to edit or delete the listing.
//and if not then redirect to the listing page.
module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing.owner._id.equals(res.locals.currentUser._id)) {
    req.flash("error", "You are not the ower of this listing!");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

//for authorization to check if the user is the owner of the review or not to delete the review.
//and if not then redirect to the listing page.
module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!review.author.equals(res.locals.currentUser._id)) {
    req.flash("error", "You did not create this review!");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

// Middleware to validate booking data
module.exports.validateBooking = (req, res, next) => {
  console.log("Validating booking:", req.body); // Debugging log
  const { error } = bookingSchema.validate(req.body);
  if (error) {
    const message = error.details.map((el) => el.message).join(", ");
    console.error("Validation error:", message);
    throw new ExpressError(message, 400);
  }
  next();
};
