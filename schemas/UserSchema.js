const mongoose = require("mongoose");
const crypto = require("crypto");

const { ObjectId } = mongoose.Schema;

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, trim: true, required: true, maxlength: 32 },
    lastName: { type: String, trim: true, required: true, unique: true },
    username: { type: String, trim: true, required: true, unique: true },
    email: { type: String, trim: true, required: true, unique: true },
    password: { type: String, trim: true, required: true, unique: true },
    profilePic: { type: String, default: "/images/profilePic.png" },
    coverPhoto: { type: String },
    likes: [{ type: ObjectId, ref: "Post" }],
    retweets: [{ type: ObjectId, ref: "User" }],
    following: [{ type: ObjectId, ref: "User" }],
    followers: [{ type: ObjectId, ref: "User" }],
    isOnline: { type: Boolean, default: false },
  },
  { timestamps: true }
);

var User = mongoose.model("User", userSchema);

module.exports = User;
