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
      expiresIn: "5m",
    }
  );
  res.json({
    token: {
      accessToken: newAccessToken,
    },
  });
});


module.exports = router;
