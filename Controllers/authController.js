const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const Assistant = require("../Models/assistant");
const Student = require("../Models/student");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, EMAIL_USER, EMAIL_PASS } = process.env;

/**
 * @swagger
 * tags:
 *  - name: Auth
 *    description: Authentication and Authorization
 * /api/forgot-password:
 *  post:
 *   summary: Forgot password
 *   description: Sends a reset link to user's email
 *   tags:
 *     - Auth
 *   requestBody:
 *    required: true
 *    content:
 *        application/json:
 *         schema:
 *          type: object
 *          properties:
 *           email:
 *            type: string
 *   responses:
 *    200:
 *     description: Reset link sent successfully
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        properties:
 *         message:
 *         type: string
 *   404:
 *    description: User not found
 *   500:
 *    description: Internal server error
 */
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    service: "gmail",
    secure: false,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
  try {
    const findUser = async (email) => {
      const assistant = await Assistant.findOne({ email: email });
      if (!assistant) {
        const student = await Student.findOne({ email: email });
        if (!student) {
          return res.status(404).json({ error: "User not found" });
        }
        return { user: student, role: "student" };
      }
      return { user: assistant, role: "assistant" };
    };
    const { user } = await findUser(email);
    const token = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: "5m",
    });
    const resetLink = `http://localhost:3000/reset-password/${token}`;
    await transporter.sendMail({
      from: {
        name: "MTPS Support",
        address: EMAIL_USER,
      },
      to: email,
      subject: "Reset Password",
      html: `<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
            <h2 style="color: #333; text-align: center;">Reset Password</h2>
            <p>We received a request to reset your password for your MTPS account. Click the button below to reset:</p>
            <p style="text-align: center;">
                <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
            </p>
            <p>If you did not request, please ignore this email.</p>
            <p>Thank you,<br>MTPS Support Team</p>
        </div>`,
    });
    res.json({ message: "Reset link sent to your email" });
  } catch (error) {
    console.log(error);
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @swagger
 * tags:
 *  - name: Auth
 *    description: Authentication and Authorization
 * /api/reset-password:
 *  post:
 *   summary: Reset password
 *   description: Resets user's password
 *   tags:
 *    - Auth
 *   requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: JWT token for resetting the password.
 *               password:
 *                 type: string
 *                 description: New password to set.
 *   responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset successfully
 *       400:
 *         description: Token has expired
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Token has expired
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */
const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const assistant = await Assistant.findOne({ id: decoded.id });
    if (!assistant) {
      const student = await Student.findOne({ id: decoded.id });
      if (!student) {
        return res.status(404).json({ error: "User not found" });
      }
      student.password = await bcrypt.hash(password, 10);
      await student.save();
      return res.json({ message: "Password reset successfully" });
    }
    assistant.password = await bcrypt.hash(password, 10);
    await assistant.save();
    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ error: "Token has expired" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};
module.exports = { forgotPassword, resetPassword };
