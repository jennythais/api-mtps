const express = require("express");
const router = express.Router();
const loginController = require("../Controllers/loginController");
const middleware = require("../Middleware/authentication");
const authenticateToken = require("../Middleware/authJwt");

router.post("/login", middleware.authentication, loginController.login);
router.get("/profile", authenticateToken, loginController.getProfile);

module.exports = router;
