const connectToDatabase = require("../Configs/db");
const Assistant = require("../Models/assistant");
const Student = require("../Models/student");
const Point = require("../Models/pointCategory");
const PointCategory = require("../Models/pointCategory");
const cron = require("node-cron");
const changePassword = async (req, res) => {
  const { id, currentPassword, newPassword } = req.body;

  try {
    let user;

    // Check if the user is an assistant
    user = await Assistant.findOne({ id: id });

    // If the user is still not found, check if the user is a student
    if (!user) {
      user = await Student.findOne({ id: id });
    }

    // If the user is not found, return an error
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the current password matches the user's password
    if (currentPassword === user.password) {
      // Update the password
      user.password = newPassword;
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

const updateTrainingPoint = async (req, res) => {
  const { id, totalPoints } = req.body;

  try {
    const student = await Student.findOne({ id: id });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    student.trainingPoint = totalPoints;

    await student.save();

    return res.json({ message: "Training point updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

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

const searchStudent = async (req, res) => {
  try {
    const { studentId, faculty } = req.body.studentId;
    if (!studentId || !faculty) {
      return res.status(400).json({ message: "Missing studentId and faculty" });
    }
    const stds = await Student.find({
      id: studentId,
      facultyName: faculty,
    }).select("name id");
    if (stds.length === 0) {
      return res.status(404).json({ message: "Student not found " });
    }
    const studentPoint = await Promise.all(
      stds.map(async (st) => {
        const pointCate = await PointCategory.findOne({ studentId: studentId });
        return {
          st,
          point: pointCate || null,
        };
      })
    );
    res.status(200).json(studentPoint);
  } catch (error) {
    console.error("Lỗi khi tìm sinh viên:", error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};
const getStudentByF = async (req, res) => {
  try {
    const { faculty } = req.body;
    if (!faculty) {
      return res.status(400).json({ message: "Missing faculty" });
    }
    const studentData = await Student.find({ facultyName: faculty }).select(
      "name id"
    );
    if (studentData.length === 0) {
      return res.status(404).json({ message: "Student not found " });
    }
    const studentF = await Promise.all(
      studentData.map(async (st) => {
        const pointCate = await PointCategory.findOne({ studentId: st.id });
        return {
          st,
          point: pointCate || null,
        };
      })
    );
    res.status(200).json(studentF);
  } catch (error) {
    console.error("Lỗi khi tìm sinh viên:", error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

const updateDiscipline = async (req, res) => {
  const { studentId, name, point } = req.body;
  try {
    const category = await PointCategory.findOne({ studentId });
    if (!category) {
      return res.status(404).json({ message: "Student not found" });
    }
    if (name !== "Khong vi pham") {
      category.discipline.push({ name, point });
    } else {
      category.discipline = [{ name: "Khong vi pham", point: 20 }];
    }
    await category.save();
    res.json({ message: "Discipline updated successfully", category });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
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

      // Ensure the objects being pushed into the array are valid
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

        if (category && category.pioneering.every((p) => p.name !== st.position)) {
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
  searchStudent,
  getStudentByF,
  updateDiscipline,
};
