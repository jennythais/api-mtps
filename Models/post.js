const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  desc: { type: String, required: true },
  status: { type: String, enum: ["Private", "Public"], default: "Public" },
  startTime: { type: String, required: true },
  startDate: { type: String, required: true },
  endTime: { type: String, required: true },
  endDate: { type: String, required: true },
  point: { type: Number, enum: [3, 5, 7, 10], required: true },
  location: { type: String, required: true },
  numberParticipants: { type: Number, default: 0 },
  facultyName: { type: String, required: true },
  category: { type: String, required: true },
  stdJoin: [{ type: String, ref: "Student" }],
  testId: { type: String, required: false },
  semester: { type: String, required: true },
  created: { type: Date, default: Date.now },
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
