const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  name: { type: String, },
  email: { type: String, unique: true },
  password: { type: String, required: false },
  googleId: { type: String }, // Add Google ID
  phone: { type: String },
  address1: { type: String },
  address2: { type: String },
  image: { type: String }, // Added field for image upload
  role: { type: String, enum: ["user", "admin"], default: "user" }, // Role field with default "user"
});

UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", UserSchema);
