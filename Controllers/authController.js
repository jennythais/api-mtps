const nodemailer = require("nodemailer");
const Assistant = require("../Models/assistant");
const Student = require("../Models/student");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, EMAIL_USER, EMAIL_PASS } = process.env;
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});
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
      from: EMAIL_USER,
      to: email,
      subject: "Reset Password",
      html: `<h1>Click <a href="${resetLink}">here</a> to reset your password</h1>`,
    });
    res.json({ message: "Reset link sent to your email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
module.exports = { forgotPassword };
