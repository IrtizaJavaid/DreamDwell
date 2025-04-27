const User = require("../models/user");
module.exports.renderSignup = (req, res) => {
  res.render("./users/signup.ejs");
};
module.exports.Signup = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    //login user after registration
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to DreamDwell!");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};
module.exports.renderLogin = (req, res) => {
  res.render("./users/login.ejs");
};
module.exports.Login = async (req, res) => {
  req.flash("success", "Welcome back!");
  res.redirect(res.locals.redirectTo || "/listings");
};

module.exports.Logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logged out!");
    res.redirect("/listings");
  });
};
