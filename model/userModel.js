const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  isblock: {
    type: Boolean,
    default: false   // ✅ NOT BLOCKED
  }
});

const User = mongoose.model("User", userSchema);
module.exports = { User };
