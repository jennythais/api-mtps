const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Assistant = require("../Models/assistant");
const Student = require("../Models/student");

const secret_key = process.env.SECRECT_KEY;
const refresh_key = process.env.REFRESH_SECRET_KEY;
const login = async (req, res) => {
  try {
    req.session.user = req.account;
    const user = req.account;
    const accessToken = jwt.sign(
      { emailInput: user.email, passwordInput: user.password },
      secret_key,
      {
        expiresIn: "2d",
      }
    );
    const refreshToken = jwt.sign(
      { emailInput: user.email, passwordInput: user.password },
      refresh_key,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });
    res.json({
      token: { accessToken },
      message: "Login successful",
      role: req.account.role,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const getProfile = async (req, res) => {
  try {
    const emailToCheck = req.account.emailInput;
    const passToCheck = req.account.passwordInput;


    const assistanUser = await Assistant.findOne({
      email: emailToCheck,
      password: passToCheck,
    });
    if (assistanUser) {
      const userProfile = {
        id: assistanUser.id,
        name: assistanUser.name,
        email: assistanUser.email,
        role: assistanUser.role,
        facultyName: assistanUser.facultyName,
      };
      return res.json(userProfile);
    }

    const studentUser = await Student.findOne({
      email: emailToCheck,
      password: passToCheck,
    });
    if (studentUser) {
      const userProfile = {
        id: studentUser.id,
        name: studentUser.name,
        email: studentUser.email,
        facultyName: studentUser.facultyName,
        trainingPoint: studentUser.trainingPoint,
        activities: studentUser.activities,
        role: studentUser.role,
      };
      return res.json(userProfile);
    }

    res.status(404).json({ message: "User not found" });
  } catch (error) {
    console.error("Error while fetching user profile:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
module.exports = { login: login, getProfile: getProfile };
