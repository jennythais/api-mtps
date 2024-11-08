const mongoose = require("mongoose");
const pointDetailSchema = new mongoose.Schema({
  name: { type: String, required: true },
  point: { type: Number, required: true },
});
const pointCategorySchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true,
    ref: "Student",
    index: true,
  },
  academic: { type: [pointDetailSchema] },
  totalAcademic: { type: Number, default: 0, max: 20 },
  volunteer: { type: [pointDetailSchema] },
  totalVolunteer: { type: Number, default: 0, max: 20 },
  mentalPhysical: { type: [pointDetailSchema] },
  totalMentalPhysical: { type: Number, default: 0, max: 20 },
  discipline: {
    type: [pointDetailSchema],
    default: [
      {
        name: "Không vi phạm",
        point: 20,
      },
    ],
  },
  reward: { type: [pointDetailSchema] },
  totalReward: { type: Number, default: 0, max: 20 },
  pioneering: { type: [pointDetailSchema] },
  totalPioneering: { type: Number, default: 0, max: 20 },
  totalPoints: { type: Number, default: 0, max: 100 },
});

pointCategorySchema.virtual("student", {
  ref: "Student",
  localField: "studentId",
  foreignField: "id",
  justOne: true,
});

const pointCategory = mongoose.model("pointCategory", pointCategorySchema);

module.exports = pointCategory;
