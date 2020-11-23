const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  roleName: {type: String}
});

module.exports = mongoose.model("Role", roleSchema);
