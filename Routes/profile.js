const express = require("express");
const router = express.Router();
const profileController = require("../Controllers/profileController");
const authenticateToken = require("../Middleware/authJwt");

router.put(
  "/change-password",
  authenticateToken,
  profileController.changePassword
);

router.put(
  "/update-training-point",
  authenticateToken,
  profileController.updateTrainingPoint
);

router.post("/get-points-category", profileController.getPoint);


module.exports = router;
