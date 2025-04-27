const express = require("express");
const router = express.Router();

// About Us Page
router.get("/about-us", (req, res) => {
  res.render("footerLinks/aboutUs");
  // Path is relative to the "views" folder
});

// Contact Us Page
router.get("/contact-us", (req, res) => {
  res.render("footerLinks/contactUs"); // Path is relative to the "views" folder
});

// Terms of Use Page
router.get("/terms-of-use", (req, res) => {
  res.render("footerLinks/termsOfuse");
});

// Privacy Policy Page
router.get("/privacy-policy", (req, res) => {
  res.render("footerLinks/privacyPolicy");
});

module.exports = router;
