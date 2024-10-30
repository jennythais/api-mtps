const Student = require("../Models/student");
const Assistant = require("../Models/assistant");
const bcrypt = require("bcryptjs");

const secret_key = process.env.SECRECT_KEY;
async function authentication(req, res, next) {
  const { email, password } = req.body;
  try {
    let user = await Assistant.findOne({ email, password });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        req.account = user;
        next();
      }
    } else {
      return res.status(404).json({ message: "User not found" });
    }
    user = await Student.findOne({ email, password });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        req.account = user;
        next();
      } else {
        return res.status(400).json({ message: "Invalid user!" });
      }
    }
  } catch (error) {
    console.error("Error during authentication:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
const isAuthenticated = (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  console.log("accessToken", accessToken);
  if (!accessToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  jwt.verify(accessToken, secret_key, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid access token" });
    }
    req.account = decoded;
    next();
  });
};
const verifyRefreshToken = (req, res, next) => {
  const refreshToken =
    req.body.refreshToken ||
    req.query.refreshToken ||
    req.headers["x-refresh-token"];

  if (!refreshToken) {
    return res.status(403).json({ message: "Refresh token not provided" });
  }
  jwt.verify(refreshToken, refreshSecretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }
    req.user = decoded;
    next();
  });
};
// Middleware kiểm tra và xác định quyền truy cập
function checkAuthorization(req, res, next) {
  const user = req.session.user;
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (user.role !== "assistant" && user.role !== "student") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}

module.exports = {
  authentication: authentication,
  isAuthenticated: isAuthenticated,
  verifyRefreshToken: verifyRefreshToken,
  checkAuthorization: checkAuthorization,
};
