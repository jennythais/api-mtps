const express = require("express");
const router = express.Router();
const profileController = require("../Controllers/profileController");
const authenticateToken = require("../Middleware/authJwt");

router.put(
  "/change_password",
  authenticateToken,
  profileController.changePassword
);

router.put(
  "/update_training_point",
  authenticateToken,
  profileController.updateTrainingPoint
);

router.post("/point_category", profileController.getPoint);
router.post("/searchStudentWithPoint", profileController.searchStudent);
router.post("/studentByF", profileController.getStudentByF);
router.post("/update-discipline", profileController.updateDiscipline);

module.exports = router;
