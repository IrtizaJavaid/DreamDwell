const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/user.js");

router
  .route("/signup")
  //render the signup form
  .get(userController.renderSignup)
  //create a new user account
  .post(wrapAsync(userController.Signup));

router
  .route("/login")
  //render the login form
  .get(userController.renderLogin)

  //login route for user to login to their account using passport local strategy and flash messages for error handling
  .post(
    saveRedirectUrl,
    //middleware to authenticate user using passport local strategy and flash messages
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    //if user is not authenticated then redirect to login page
    //if user is authenticated then redirect to listings page
    userController.Login
  );

//logout route for user to logout of their account using passport local strategy and flash messages for error handling
router.get("/logout", userController.Logout);

module.exports = router;
