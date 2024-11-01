const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  // const token = req.headers["authorization"];
  const token = req.cookies.accessToken;
  // console.log(token);

  const secret_key = process.env.SECRET_KEY;
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
