const mongoose = require("mongoose");
const Post = require("./post");

const expiredPostSchema = new mongoose.Schema({
  postFields: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  expiredAt: { type: Date, default: Date.now },
});

const ExpiredPost = mongoose.model("ExpiredPost", expiredPostSchema);

module.exports = ExpiredPost;
