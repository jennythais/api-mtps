// Import necessary modules
const Student = require("../Models/student");
const PointCategory = require("../Models/pointCategory");

/**
 * @swagger
 * tags:
 *   - name: Assistant
 *     description: Assistant management
 * /api/students:
 *   get:
 *     summary: Retrieve all students
 *     description: Get a list of students based on optional search parameters (studentId and/or faculty)
 *     tags:
 *       - Assistant
 *     parameters:
 *       - name: studentId
 *         in: query
 *         description: Search for a student by their ID
 *         required: false
 *         schema:
 *           type: string
 *       - name: faculty
 *         in: query
 *         description: Search for students in a specific faculty
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of students retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     students:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           trainingPoint:
 *                             type: number
 *                           facultyName:
 *                             type: string
 *       500:
 *         description: Internal server error
 */

const getAllStudent = async (req, res) => {
  try {
    const studentId = req.query.studentId;
    const faculty = req.query.faculty;

    const filter = {};
    if (studentId) {
      filter.id = studentId;
    }

    if (faculty) {
      if (Array.isArray(faculty)) {
        filter.facultyName = { $in: faculty };
      } else {
        filter.facultyName = faculty;
      }
    }

    let pointCategory = null;
    if (filter.id) {
      pointCategory = await PointCategory.findOne({
        studentId: filter.id,
      });
    }

    const students = await Student.find(filter);

    const formattedStudents = students.map((student) => ({
      id: student.id,
      name: student.name,
      email: student.email,
      trainingPoint: student.trainingPoint,
      facultyName: student.facultyName,
      activities: student.activities,
      pointCategory,
    }));

    res.json({
      data: {
        students: {
          formattedStudents,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching students:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @swagger
 * tags:
 *   - name: Assistant
 *     description: Assistant management
 * /api/student-by-faculty/{faculty}:
 *   get:
 *     summary: Get students by faculty
 *     description: Retrieve a list of students belonging to a specified faculty
 *     tags:
 *       - Assistant
 *     parameters:
 *       - name: faculty
 *         in: path
 *         required: true
 *         description: Name of the faculty to filter students by
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of students successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       facultyName:
 *                         type: string
 *                       activities:
 *                         type: array
 *                         items:
 *                           type: string
 *                       point:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           studentId:
 *                             type: string
 *                           academic:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 name:
 *                                   type: string
 *                                 point:
 *                                   type: number
 *                           totalAcademic:
 *                             type: number
 *                           volunteer:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 name:
 *                                   type: string
 *                                 point:
 *                                   type: number
 *                           totalVolunteer:
 *                             type: number
 *                           mentalPhysical:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 name:
 *                                   type: string
 *                                 point:
 *                                   type: number
 *                           totalMentalPhysical:
 *                             type: number
 *                           discipline:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 name:
 *                                   type: string
 *                                 point:
 *                                   type: number
 *                           reward:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 name:
 *                                   type: string
 *                                 point:
 *                                   type: number
 *                           totalReward:
 *                             type: number
 *                           pioneering:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 name:
 *                                   type: string
 *                                 point:
 *                                   type: number
 *                           totalPioneering:
 *                             type: number
 *                           totalPoints:
 *                             type: number
 *                 message:
 *                   type: string
 *       400:
 *         description: Missing faculty parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: No students found for the specified faculty
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
const getStudentByF = async (req, res) => {
  try {
    const { faculty } = req.params;
    if (!faculty) {
      return res.status(400).json({ message: "Missing faculty" });
    }
    const studentData = await Student.find({ facultyName: faculty }).select(
      "name id email facultyName activities"
    );
    if (studentData.length === 0) {
      return res.status(404).json({ message: "Student not found " });
    }
    const studentF = await Promise.all(
      studentData.map(async (st) => {
        const pointCate = await PointCategory.findOne({ studentId: st.id });
        return {
          id: st.id,
          name: st.name,
          email: st.email,
          facultyName: st.facultyName,
          activities: st.activities,
          trainingPoint: pointCate || null,
        };
      })
    );
    res.status(200).json({
      data: studentF,
      message: "Student found successfully",
    });
  } catch (error) {
    console.error("Lỗi khi tìm sinh viên:", error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

/**
 * @swagger
 * tags:
 *   - name: Assistant
 *     description: Assistant management
 * /api/update-discipline:
 *   put:
 *     summary: Update a student's discipline record
 *     description: Add a discipline entry for a student or set to default if no violation
 *     tags:
 *       - Assistant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: The ID of the student
 *               name:
 *                 type: string
 *                 description: The discipline name or status
 *               point:
 *                 type: number
 *                 description: The discipline point value
 *     responses:
 *       200:
 *         description: Discipline updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Discipline updated successfully
 *                 category:
 *                   type: object
 *                   properties:
 *                     studentId:
 *                       type: string
 *                     discipline:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           point:
 *                             type: number
 *       404:
 *         description: Student not found
 *       500:
 *         description: Internal server error
 */
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
module.exports = {
  getAllStudent,
  getStudentByF,
  updateDiscipline,
};
