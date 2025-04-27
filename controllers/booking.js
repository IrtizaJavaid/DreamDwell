require("dotenv").config();
const nodemailer = require("nodemailer");
const Booking = require("../models/booking");
const Listing = require("../models/listing");

// module.exports.createBooking = async (req, res) => {
//   // const { listingId } = req.body;
//   const { listingId } = req.body.booking;
//   const mongoose = require("mongoose");

//   // Validate listingId format
//   if (!mongoose.Types.ObjectId.isValid(listingId)) {
//     req.flash("error", "Invalid listing ID.");
//     return res.redirect("/listings");
//   }
//   const userId = req.user._id; // Logged-in user making the booking
//   // const listing = await Listing.findById(listingId);
//   const listing = await Listing.findById(listingId).populate("owner");

//   console.log("Request body received:", req.body);
//   console.log("Listing ID received:", req.body.booking.listingId);

//   if (!listing) {
//     req.flash("error", "Listing not found!");
//     return res.redirect("/listings");
//   }

//   // Create a new booking
//   const newBooking = new Booking({
//     user: userId,
//     listing: listingId,
//     owner: listing.owner, // Owner of the listing
//   });

//   await newBooking.save();

//   // Set up code for nodemailer
//   if (
//     !listing ||
//     !listing.owner ||
//     !listing.owner.email ||
//     !listing.owner.username
//   ) {
//     console.error("Missing listing or owner details.");
//     req.flash(
//       "error",
//       "Listing owner details are incomplete. Cannot send email."
//     );
//     return res.redirect(`/listings/${listingId}`);
//   }

//   if (!process.env.EMAIL || !process.env.EMAIL_PASSWORD) {
//     console.error("Missing email credentials in environment variables.");
//     req.flash("error", "Email configuration error. Please contact support.");
//     return res.redirect(`/listings/${listingId}`);
//   }

//   // Set up Nodemailer transporter
//   const transporter = nodemailer.createTransport({
//     service: process.env.EMAIL_SERVICE || "Gmail", // Configurable service
//     auth: {
//       user: process.env.EMAIL,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });

//   // Define the email options
//   const emailText = `
//     Dear ${listing.owner.username || "Owner"},

//     You have received a new booking request for your listing titled "${
//       listing.title || "your listing"
//     }".
//     Please log in to your dashboard to review and manage the request.

//     Best regards,
//     The DreamDwell Team
//     `;

//   const mailOptions = {
//     from: '"DreamDwell" <dreamdwell0125@gmail.com>', // Sender address
//     to: listing.owner.email, // Owner's email
//     subject: "New Booking Request",
//     text: emailText,
//   };

//   // Send the email
//   transporter.sendMail(mailOptions, (err, info) => {
//     if (err) {
//       console.error("Error sending email:", err);
//       req.flash(
//         "error",
//         "Failed to send booking notification email. Please try again later."
//       );
//     } else {
//       console.log("Email sent successfully:", info.response);
//       req.flash("success", "Booking request sent successfully!");
//     }
//     res.redirect(`/listings/${listingId}`);
//   });
// };

module.exports.createBooking = async (req, res) => {
  // Extract `listingId` from the request
  const { listingId } = req.body.booking;
  const mongoose = require("mongoose");

  // Step 1: Validate `listingId` format
  if (!mongoose.Types.ObjectId.isValid(listingId)) {
    req.flash("error", "Invalid listing ID.");
    return res.redirect("/listings"); // Redirect if invalid ID is provided
  }

  // Step 2: Get the logged-in user's ID
  const userId = req.user._id; // The user making the booking

  // Step 3: Check if the listing exists and populate its owner
  const listing = await Listing.findById(listingId).populate("owner");

  console.log("Request body received:", req.body);
  console.log("Listing ID received:", req.body.booking.listingId);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings"); // Redirect if the listing does not exist
  }

  // Step 4: Create the booking object
  const newBooking = new Booking({
    user: userId,
    listing: listingId,
    owner: listing.owner, // Assign the listing's owner to the booking
  });

  // Save the booking to the database
  await newBooking.save();

  // Step 5: Email logic to notify the listing owner
  if (
    !listing ||
    !listing.owner ||
    !listing.owner.email ||
    !listing.owner.username
  ) {
    console.error("Missing listing or owner details.");
    req.flash(
      "error",
      "Listing owner details are incomplete. Cannot send email."
    );
    return res.redirect(`/listings/${listingId}`);
  }

  if (!process.env.EMAIL || !process.env.EMAIL_PASSWORD) {
    console.error("Missing email credentials in environment variables.");
    req.flash("error", "Email configuration error. Please contact support.");
    return res.redirect(`/listings/${listingId}`);
  }

  // Set up Nodemailer to send notification email
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "Gmail", // Configurable email service
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const emailText = `
    Dear ${listing.owner.username || "Owner"},

    You have received a new booking request for your listing titled "${
      listing.title || "your listing"
    }".
    Please log in to your dashboard to review and manage the request.

    Best regards,
    The DreamDwell Team
    `;

  const mailOptions = {
    from: '"DreamDwell" <dreamdwell0125@gmail.com>',
    to: listing.owner.email, // Send to listing owner's email
    subject: "New Booking Request",
    text: emailText,
  };

  // Step 6: Send the email notification
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error("Error sending email:", err);
      req.flash(
        "error",
        "Failed to send booking notification email. Please try again later."
      );
    } else {
      console.log("Email sent successfully:", info.response);
      req.flash("success", "Booking request sent successfully!");
    }

    // Step 7: Redirect to the listing page after success or failure
    res.redirect(`/listings/${listingId}`);
  });
};

// Fetch bookings for the owner
module.exports.getOwnerBookings = async (req, res) => {
  try {
    console.log("Fetching bookings for owner:", req.user._id);
    const bookings = await Booking.find({ owner: req.user._id })
      .populate("listing", "title")
      .populate("user", "email");

    res.render("owners/booking", { bookings });
  } catch (err) {
    console.error("Error fetching bookings:", err);
    req.flash("error", "Something went wrong. Please try again.");
    res.redirect("/listings");
  }
};

module.exports.approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "email username")
      .populate("listing", "title");

    if (!booking) {
      req.flash("error", "Booking not found.");
      return res.redirect("/bookings/owners");
    }

    // Check if the logged-in user is the owner
    if (!booking.owner.equals(req.user._id)) {
      req.flash("error", "You do not have permission to approve this booking.");
      return res.redirect("/bookings/owners");
    }

    // Update booking status to approved
    booking.status = "approved";
    await booking.save();

    // Send email to the user
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const emailText = `
      Dear ${booking.user.username || "User"},

      Your booking request for the listing "${
        booking.listing.title || "a listing"
      }" has been approved.

      Thank you for choosing DreamDwell!

      Best regards,
      The DreamDwell Team
    `;

    const mailOptions = {
      from: '"DreamDwell" <dreamdwell0125@gmail.com>',
      to: booking.user.email,
      subject: "Booking Request Approved",
      text: emailText,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error sending approval email:", err);
        req.flash("error", "Failed to send approval notification email.");
      } else {
        console.log("Approval email sent successfully:", info.response);
      }
    });

    req.flash(
      "success",
      "Booking approved successfully, and the user has been notified!"
    );
    res.redirect("/bookings/owners");
  } catch (err) {
    console.error("Error approving booking:", err);
    req.flash("error", "Something went wrong. Please try again.");
    res.redirect("/bookings/owners");
  }
};

module.exports.rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "email username")
      .populate("listing", "title");

    if (!booking) {
      req.flash("error", "Booking not found.");
      return res.redirect("/bookings/owners");
    }

    // Check if the logged-in user is the owner
    if (!booking.owner.equals(req.user._id)) {
      req.flash("error", "You do not have permission to reject this booking.");
      return res.redirect("/bookings/owners");
    }

    // Update booking status to rejected
    booking.status = "rejected";
    await booking.save();

    // Send email to the user
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const emailText = `
      Dear ${booking.user.username || "User"},

      Unfortunately, your booking request for the listing "${
        booking.listing.title || "a listing"
      }" has been rejected. Please feel free to explore other listings that might suit your needs.

      Best regards,
      The DreamDwell Team
    `;

    const mailOptions = {
      from: '"DreamDwell" <dreamdwell0125@gmail.com>',
      to: booking.user.email,
      subject: "Booking Request Rejected",
      text: emailText,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error sending rejection email:", err);
        req.flash("error", "Failed to send rejection notification email.");
      } else {
        console.log("Rejection email sent successfully:", info.response);
      }
    });

    req.flash(
      "success",
      "Booking rejected successfully, and the user has been notified!"
    );
    res.redirect("/bookings/owners");
  } catch (err) {
    console.error("Error rejecting booking:", err);
    req.flash("error", "Something went wrong. Please try again.");
    res.redirect("/bookings/owners");
  }
};
