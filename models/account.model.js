const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String },
  dateOfBirth: { type: Date },
  createdDate: { type: Date, default: Date.now, required: true },
  role: { type: String, required: true },
  activated: {type: Boolean, required: true}
});

module.exports = mongoose.model("Account", accountSchema);
