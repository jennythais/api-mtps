const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const secret_key = process.env.SECRECT_KEY;
  if (!token) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, secret_key, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Forbidden
    }
    req.account = user;
    next();
  });
}
module.exports = authenticateToken;
