const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

// Define the user schema
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
});

// Add passport-local-mongoose to the user schema
// This will add a username, hash and salt field to store the username, the hashed password and the salt value
// The plugin will also add some methods to the schema for authentication
//plugin is a way to add additional functionality to a schema  in mongoose like a middleware or a method or a virtual field etc.

userSchema.plugin(passportLocalMongoose);

// Export the user model
module.exports = mongoose.model("User", userSchema);
