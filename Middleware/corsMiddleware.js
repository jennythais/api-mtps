function corsMiddleware(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*", "http://localhost:3000");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(200); // Trả về trạng thái OK cho preflight request
  }
  next();
}

module.exports = corsMiddleware;
