const mongoose = require("mongoose");

const assistantSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  facultyName: {type: String, required: true}
});

const Assistant = mongoose.model("Assistant", assistantSchema);

module.exports = Assistant;
