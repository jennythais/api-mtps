const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const secretKey = process.env.SECRET_KEY;
const database = {
  host: "localhost",
  port: process.env.DB_PORT,
  databaseName: process.env.DB_NAME,
};
const emailCredentials = {
  user: "your-email@example.com",
  pass: "your-password",
};
const config = {
  mongoose: mongoose,
  database: database,
  emailCredentials: emailCredentials,
  secretKey: secretKey,
  apiKey: process.env.STRIPE_API_KEY,
  secretKey: process.env.STRIPE_SECRET_KEY,
  secret: "use-for-sign-up",
};

module.exports = { config };
