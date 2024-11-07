const connectToDatabase = require("../Configs/db");
const Assistant = require("../Models/assistant");
const Student = require("../Models/student");
const Point = require("../Models/pointCategory");
const PointCategory = require("../Models/pointCategory");
const cron = require("node-cron");
const Post = require("../Models/post");
const bcrypt = require("bcryptjs");

/**
 * @swagger
 * tags:
 *   - name: Profile
 *     description: Profile management
 * /api/get-points-category:
 *   post:
 *     summary: Get student points
 *     description: Retrieve points for a specific student by their ID
 *     tags:
 *       - Profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: ID of the student
 *     responses:
 *       200:
 *         description: Points retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 studentId:
 *                   type: string
 *                 points:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category:
 *                         type: string
 *                       score:
 *                         type: number
 *       400:
 *         description: Student ID is missing in the request body
 *       404:
 *         description: Student not found
 *       500:
 *         description: Internal server error
 */
const getPoint = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ message: "Student ID is missing in the request body" });
    }
    const points = await Point.findOne({ studentId: id });

    if (!points) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Trả về dữ liệu nếu tìm thấy
    res.json(points);
  } catch (error) {
    console.error("Error retrieving points:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * @swagger
 * tags:
 *   - name: Profile
 *     description: Profile management
 * /api/change-password:
 *   put:
 *     summary: Change user password
 *     description: Allows a user to change their password
 *     tags:
 *       - Profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: The ID of the user
 *               currentPassword:
 *                 type: string
 *                 description: The current password of the user
 *               newPassword:
 *                 type: string
 *                 description: The new password to set
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid current password
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
const changePassword = async (req, res) => {
  const { id, currentPassword, newPassword } = req.body;
  try {
    let user;
    user = await Assistant.findOne({ id: id });
    if (!user) {
      user = await Student.findOne({ id: id });
    }
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const hashCurrentPassword = await bcrypt.hash(currentPassword, 10);
    const hashNewPassword = await bcrypt.hash(newPassword, 10);
    const isMatch = await bcrypt.compare(hashCurrentPassword, user.password);
    if (isMatch) {
      user.password = hashNewPassword;
      await user.save();
      return res.json({ message: "Password changed successfully" });
    } else {
      return res.status(400).json({ error: "Invalid current password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @swagger
 * tags:
 *   - name: Profile
 *     description: Profile management
 * /api/update-training-point:
 *   put:
 *     summary: Update student training points
 *     description: Calculate and update the total training points for a specific student based on their activities and categorized points.
 *     tags:
 *       - Profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: The ID of the student
 *     responses:
 *       200:
 *         description: Training point updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       404:
 *         description: Student or post not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
const updateTrainingPoint = async (req, res) => {
  const { id } = req.body;
  try {
    const student = await Student.findOne({ id: id });
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    let pointPost = 0;

    for (const postId of student.activities) {
      const post = await Post.findOne({ id: postId });
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      pointPost += post.point;
    }
    const pointCategory = await PointCategory.findOne({ studentId: id });
    if (!pointCategory) {
      pointCategory = new PointCategory({
        studentId: id,
        pioneering: [],
        academic: [],
        volunteer: [],
        mentalPhysical: [],
        reward: [],
        pioneering: [],
        totalPoints: pointPost,
      });
      await pointCategory.save();
    }
    pointCategory.totalPoints = pointPost;
    return res.json({ message: "Training point updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @swagger
 * tags:
 *   - name: Profile
 *     description: Profile management
 * /api/update-profile:
 *   put:
 *     summary: Update a student's profile
 *     description: Update profile information for a specific student by their profile ID
 *     tags:
 *       - Profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profileId:
 *                 type: string
 *                 description: The ID of the profile to update
 *               updatedProfileData:
 *                 type: object
 *                 description: The updated profile data
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Profile updated successfully
 *       400:
 *         description: Missing profileId or updatedProfileData in the request
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Internal server error
 */
const updateProfile = async (req, res) => {
  try {
    const { profileId, updatedProfileData } = req.body;
    const db = await connectToDatabase();
    const profileCollection = db.collection("students");

    await profileCollection.updateOne(
      { id: profileId },
      { $set: updatedProfileData }
    );

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateRewards = async () => {
  try {
    const categories = await PointCategory.find();
    const updatePromises = categories.map(async (cate) => {
      const totalActivities =
        cate.academic.length +
        cate.volunteer.length +
        cate.mentalPhysical.length;

      if (totalActivities > 7 && totalActivities <= 10) {
        if (cate.reward.some((r) => r.name !== "Tham gia tren 7 hoat dong")) {
          cate.reward.push({ name: "Tham gia tren 7 hoat dong", point: 3 });
        }
      } else if (totalActivities > 10 && totalActivities <= 15) {
        if (cate.reward.some((r) => r.name !== "Tham gia tren 10 hoat dong")) {
          cate.reward.push({ name: "Tham gia tren 10 hoat dong", point: 7 });
        }
      } else if (totalActivities > 15) {
        if (cate.reward.some((r) => r.name !== "Tham gia tren 15 hoat dong")) {
          cate.reward.push({ name: "Tham gia tren 15 hoat dong", point: 10 });
        }
      }

      await cate.save();
    });

    await Promise.all(updatePromises);
    console.log("Rewards updated successfully for all students");
  } catch (error) {
    console.error("Error updating rewards:", error);
  }
};

const updatePioneering = async () => {
  try {
    const students = await Student.find();
    const updatePromises = students.map(async (st) => {
      let point = 0;
      if (st.position === "monitor") {
        point = 20;
      } else if (st.position === "leader") {
        point = 10;
      }

      if (point > 0) {
        const category = await PointCategory.findOne({ studentId: st.id });

        if (
          category &&
          category.pioneering.every((p) => p.name !== st.position)
        ) {
          category.pioneering.push({ name: st.position, point });
          await category.save();
        }
      }
    });

    await Promise.all(updatePromises); // Ensure all updates are completed
    console.log("Pioneering updated successfully for monitors and leaders");
  } catch (error) {
    console.error("Error updating pioneering:", error);
  }
};

cron.schedule("*/5 * * * *", () => {
  console.log("Running scheduled tasks to update rewards and pioneering...");
  updateRewards();
  updatePioneering();
});
module.exports = {
  changePassword,
  updateTrainingPoint,
  updateProfile,
  getPoint,
};
