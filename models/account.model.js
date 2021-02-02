const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: { type: String },
  name: { type: String, required: true },
  avatar: {type: String},
  phone: { type: String },
  dateOfBirth: { type: Date },
  createdDate: { type: Date, default: Date.now, required: true },
  role: { type: String, required: true },
  isVerify: { type: Boolean, default: false, required: true },
});

module.exports = mongoose.model("Account", accountSchema);
