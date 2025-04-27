if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const Listing = require("./models/listing.js"); // Only require Listing model once
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate"); //
const ExpressError = require("./utils/expressErr.js"); //for error handling

const bodyParser = require("body-parser"); //
const listingsRouter = require("./Routes/listing.js");
const reviewsRouter = require("./Routes/review.js");
const session = require("express-session"); //for session
const MongoStore = require("connect-mongo"); //for session store in atlas db
const flash = require("connect-flash"); //for flash messages
const cookieParser = require("cookie-parser");
const passport = require("passport"); //for authentication
const LocalStrategy = require("passport-local"); //for authentication
const User = require("./models/user.js");
const userRouter = require("./Routes/user.js"); //require route for user
const bookingRoutes = require("./Routes/booking.js");
const footerLinks = require("./Routes/footerLinks.js"); //require route for footer links
const searchRoutes = require("./Routes/search.js"); //require route for search
const dbUrl = process.env.ATLASDB_URL;

// Calling this main function
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

// Connecting to database
async function main() {
  await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static(path.join(__dirname, "/views")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

//defining store for session
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
}); //creating a new store for session
store.on("error", (e) => {
  console.log("Session Store Error", e);
}); //if any error occurs in store
//defining session options
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

// app.get("/", (req, res) => {
//   console.log("GET / route accessed");
//   res.send("working");
// });

//using session
app.use(session(sessionOptions));
app.use(flash());

//these middleware are used to initialize passport and session and to store user in session and to get user from session
app.use(passport.initialize());
app.use(passport.session());
//combined middleware for session and passport
//created middleware for flash messages and session to be used in all routes and views files to show flash messages and session
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user || null;
  next();
});
//creates a new local strategy using the User.authenticate() method that comes from passport-local-mongoose and then we use passport.use to use this strategy and then we serialize and deserialize the user
passport.use(new LocalStrategy(User.authenticate()));

//serilazUser means to store user info in session and deserializeUser means to get user info from session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//using routes for listings and reviews and user by using middleware app.use and passing the route file
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);
// Use the booking routes for `/bookings`
app.use("/bookings", bookingRoutes);
app.use("/", footerLinks); // Use the routes for the footer links
app.use("/", searchRoutes); // Use the routes for search

//to check all routes are working and if one not found means user enter wrong route
//this error should be shown
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

//Error handler
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  if (!err.message) err.message = "Something went wrong";
  res.status(statusCode).render("error.ejs", { err });
  //res.status(statusCode).render("error.ejs", { message });
  // res.status(statusCode).send(message);
});

app.listen(3000, (req, res) => {
  console.log("listening at port 3000");
});
