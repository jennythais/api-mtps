const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const config = {
  mongoose: process.env.MONGODB_URL,
  port: process.env.PORT || 1212,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  secretKey: process.env.SECRET_KEY || "your-secret-key",
  isProduction: process.env.NODE_ENV === "production",
};

module.exports = { config };
