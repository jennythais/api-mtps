const express = require("express");
const router = express.Router();
const authController = require("../Controllers/authController");
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
module.exports = router;
