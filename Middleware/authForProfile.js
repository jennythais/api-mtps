const jwt = require("jsonwebtoken");

const refreshSecretKey =
  process.env.REFRESH_SECRET_KEY || "your-default-secret-key";
const secret_key = process.env.SECRET_KEY;
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

module.exports = {
  verifyRefreshToken: verifyRefreshToken,
  isAuthenticated: isAuthenticated,
};
