const joi = require("joi");
//schema for listings
const listingSchema = joi.object({
  listing: joi
    .object({
      title: joi.string().required(),
      description: joi.string().required(),
      location: joi.string().required(),
      country: joi.string().required(),
      category: joi
        .string()
        .valid(
          "mountain",
          "arctic",
          "castle",
          "camp",
          "beach",
          "iconic-cities",
          "rooms",
          "trending"
        )
        .required(),
      price: joi.number().required().min(0).messages({
        "number.base": "Price must be a number.",
        "number.empty": "Price is required.",
        "number.min": "Price cannot be negative. Please enter a valid amount.",
      }),
      imageUrl: joi.string().allow(null, ""), // allow null or empty string
    })
    .required(),
});
module.exports = { listingSchema };

//schema for reviews
module.exports.reviewSchema = joi.object({
  review: joi
    .object({
      rating: joi.number().required().min(1).max(5),
      comment: joi.string().required(),
    })
    .required(),
});



// Schema for booking requests
module.exports.bookingSchema = joi.object({
  booking: joi
    .object({
      listingId: joi.string().required(), // ID of the listing being booked
      status: joi
        .string()
        .valid("pending", "approved", "rejected")
        .default("pending"), // Ensure the status is valid
    })
    .required(),
});



