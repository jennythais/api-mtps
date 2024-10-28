// Import necessary modules
const Student = require("../Models/student"); // Assuming you have a Student model

const getAllStudent = async (req, res) => {
  try {
    const students = await Student.find();
    const formattedStudents = students.map((student) => ({
      id: student.id,
      name: student.name,
      email: student.email,
      trainingPoint: student.trainingPoint,
      facultyName: student.facultyName,
    }));
    res.json({ formattedStudents });
  } catch (error) {
    console.error("Error fetching students:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllStudent,
};
