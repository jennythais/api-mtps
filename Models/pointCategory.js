const mongoose = require("mongoose");
const pointDetailSchema = new mongoose.Schema({
  name: { type: String, required: true },
  point: { type: Number, required: true },
});
const pointCategorySchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true, ref: 'Student', index: true },
  academic: [{ type: String, required: true }],
  volunteer: [{ type: String, required: true }],
  mentalPhysical: [{ type: String, required: true }],
  discipline: {
    type: [pointDetailSchema],
    default: [
      {
        name: "Không vi phạm",
        point: 20,
      },
    ],
  },
  reward: [pointDetailSchema],
  pioneering: [pointDetailSchema],
  totalPoints: { type: Number, default: 0, max: 100 },
});

pointCategorySchema.virtual('student', {
  ref: 'Student',
  localField: 'studentId',
  foreignField: 'id',
  justOne: true
});

const pointCategory = mongoose.model("pointCategory", pointCategorySchema);

module.exports = pointCategory;
