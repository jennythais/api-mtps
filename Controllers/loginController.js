const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Assistant = require("../Models/assistant");
const Student = require("../Models/student");

const secret_key = process.env.SECRECT_KEY;
const refresh_key = process.env.REFRESH_SECRET_KEY;

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication and Authorization
 * /api/login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user, creates session, and returns JWT tokens.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                 message:
 *                   type: string
 *                 role:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * tags:
 *   - name: Profile
 *     description: Profile management
 * /api/profile:
 *   get:
 *     summary: Retrieve user profile
 *     description: Fetches profile data for the logged-in user based on their role.
 *     tags:
 *       - Profile
 *     responses:
 *       200:
 *         description: Profile data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *                 facultyName:
 *                   type: string
 *                 trainingPoint:
 *                   type: number
 *                 activities:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
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
