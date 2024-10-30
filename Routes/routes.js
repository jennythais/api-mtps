const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const authForProfile = require("../Middleware/authForProfile");
const login = require("./login");
const post = require("./post");
const profile = require("./profile");
const test = require("./test");
const assistant = require("./assistant");
const auth = require("./auth");
//! parse dữ liệu từ request body
router.use("/", login);
router.use("/", post);
router.use("/", profile);
router.use("/", test);
router.use("/", assistant);
router.use("/", auth);

// router.use("/", test);
router.post("/refresh_token", authForProfile.verifyRefreshToken, (req, res) => {
  const newAccessToken = jwt.sign(
    { userId: req.user.staffID },
    "your-secret-key",
    {
      expiresIn: "15m",
    }
  );
  res.json({
    token: {
      accessToken: newAccessToken,
    },
  });
});

// Log out
router.post("/logout", (req, res) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    req.session.destroy();
    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
