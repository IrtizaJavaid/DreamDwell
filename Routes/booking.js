const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware");
const wrapAsync = require("../utils/wrapAsync");
const BookingController = require("../controllers/booking");
const { validateBooking } = require("../middleware");

// Route for creating a booking
router.post(
  "/",
  isLoggedIn,
  validateBooking,
  wrapAsync(BookingController.createBooking)
);
// Route for the owner's booking dashboard
router.get(
  "/owners",
  isLoggedIn, // Ensure the owner is logged in
  wrapAsync(BookingController.getOwnerBookings)
);
router.post(
  "/:id/approve",
  isLoggedIn,
  wrapAsync(BookingController.approveBooking)
);
router.post(
  "/:id/reject",
  isLoggedIn,
  wrapAsync(BookingController.rejectBooking)
);

module.exports = router;
