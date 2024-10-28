const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
});

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  correctOption: { type: String, required: true },
  options: [optionSchema],
});

const testSchema = new mongoose.Schema({
  testId: { type: String, required: true, unique: true },
  questions: [questionSchema], // Array of questions
  target: { type: Number, required: true }, // The 'target' field
});

const Test = mongoose.model("Test", testSchema);

module.exports = Test;
