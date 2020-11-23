const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
  email: { type: String, required: true, unique:true},
  password: { type: String, required: true },
  name: { type: String },
  phone: { type: String },
  dateOfBirth: { type: Date },
  createdDate: { type: Date, default: Date.now }
  //role: {type: mongoose.Types.ObjectId}
});

module.exports = mongoose.model("Account", accountSchema);
