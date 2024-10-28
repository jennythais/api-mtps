const mongoose = require("mongoose");

const attendeeChilSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  postResult: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
});

const attendeeSchema = new mongoose.Schema({
  postId: {
    type: String,
    required: true,
    unique: true,
  },
  attendees: {
    type: [attendeeChilSchema],
    required: true,
  },
});

const Attendees = mongoose.model("Attendees", attendeeSchema);

module.exports = Attendees;
