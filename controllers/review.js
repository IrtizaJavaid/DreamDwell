const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
  console.log(req.params.id);
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);
  listing.reviews.push(newReview);
  newReview.author = req.user._id;
  await newReview.save();
  await listing.save();
  req.flash("success", "Review Added!");
  res.redirect(`/listings/${listing._id}`);
};
module.exports.deleteReview = async (req, res) => {
  //extract the both id's
  let { id, reviewId } = req.params;
  // First, delete the review document
  //now delete the review
  await Review.findByIdAndDelete(reviewId);
  // Then, remove the review reference from the listing's reviews array
  //and to delete also from listing array that review
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  req.flash("success", "Review Deleted!");
  res.redirect(`/listings/${id}`);
};
