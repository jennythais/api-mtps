const mongoose = require("mongoose");
const activity = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  point: { type: Number, required: true },
});
const studentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  activities: [{ type: String, required: true }],
  password: { type: String, required: true },
  activities: { type: [activity] },
  facultyName: { type: String, required: true },
  role: { type: String, require: true },
  position: { type: String, require: true },
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
