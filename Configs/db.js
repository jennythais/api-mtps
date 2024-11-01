const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { config } = require("./config");
dotenv.config();
const connectDB = async () => {
  try {
    const connect = await mongoose.connect(config.mongoose);
    console.log("Kết nối thành công đến cơ sở dữ liệu");
    return connect.connection;
  } catch (error) {
    console.error("Lỗi kết nối cơ sở dữ liệu:", error);
  }
};

module.exports = connectDB;
