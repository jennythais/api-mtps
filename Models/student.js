const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  activities:[{ type: String, required: true}],
  password: { type: String, required: true },
  activities: [{ type: String }],
  facultyName: { type: String, required: true },
  trainingPoint: { type: Number, required: true },
  role: { type: String, require: true },
  position: {type: String, require: true}
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
