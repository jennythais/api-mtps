const connectToDatabase = require("../Configs/db");
const Test = require("../Models/test");
const Student = require("../Models/student");
const postCate = require("../Models/pointCategory");
const Post = require("../Models/post");
const Attendees = require("../Models/attendees");

/**
 * @swagger
 * tags:
 *  - name: Tests
 *    description: All about Tests
 * /api/tests/{testId}:
 *   get:
 *     summary: Get a specific test
 *     description: Retrieve a test by its ID from the database
 *     tags:
 *       - Tests
 *     parameters:
 *       - name: testId
 *         in: path
 *         required: true
 *         description: ID of the test to retrieve
 *         schema:
 *           type: string
 *     responses:
 *        200:
 *          description: Get the test successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  testId:
 *                    type: string
 *                  questions:
 *                    type: array
 *                    items:
 *                      type: object
 *                      properties:
 *                        question:
 *                          type: string
 *                        correctOption:
 *                          type: string
 *                        options:
 *                          type: array
 *                          items:
 *                            type: object
 *                            properties:
 *                              id:
 *                                type: string
 *                              text:
 *                                type: string
 *                  target:
 *                    type: number
 *        404:
 *          description: Test not found
 *        500:
 *          description: Internal server error
 */
const getTest = async (req, res) => {
  const { testId } = req.query;
  try {
    const db = await connectToDatabase();
    const testCollection = db.collection("tests");
    const test = await testCollection.findOne({ testId: testId });
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }
    res.status(200).json(test);
  } catch (error) {
    console.error("Error fetching test data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @swagger
 * tags:
 *  - name: Tests
 *    description: All about Test
 * /api/test-by-id/{postId}:
 *   get:
 *    summary: Get test by post id
 *    description: Get test by post id
 *    tags:
 *     - Tests
 *    parameters:
 *     - in: path
 *       name: postId
 *       required: true
 *       description: ID of the post to find and get test
 *       schema:
 *        type: string
 *    responses:
 *     200:
 *      description: Get test by post id successfully
 *      content:
 *        application/json:
 *         schema:
 *           type: object
 *           properties:
 *            testId:
 *             type: string
 *            questions:
 *             type: array
 *             items:
 *              type: object
 *              properties:
 *               question:
 *                type: string
 *               correctOption:
 *                type: string
 *               options:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                   id:
 *                    type: string
 *                   text:
 *                    type: string
 *            target:
 *             type: number
 *    404:
 *     description: Post not found
 *    500:
 *     description: Internal server error
 */
const getTestById = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findOne({ id: postId });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const testId = post.testId;
    const test = await Test.findOne({ testId: testId });
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }
    res.status(200).json(test);
  } catch (error) {
    console.error("Error fetching test data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @swagger
 * tags:
 *   - name: Tests
 *     description: All about Test management
 * /api/create-test:
 *   post:
 *     summary: Create a new test
 *     description: Create a new test with a unique test ID, questions, and target score.
 *     tags:
 *       - Tests
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               questions:
 *                 type: array
 *                 description: List of questions for the test
 *                 items:
 *                   type: object
 *                   properties:
 *                     question:
 *                       type: string
 *                       description: The question text
 *                     correctOption:
 *                       type: string
 *                       description: The correct answer option for the question
 *                     options:
 *                       type: array
 *                       description: List of answer options
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             description: Identifier for the option
 *                           text:
 *                             type: string
 *                             description: Text of the option
 *               target:
 *                 type: number
 *                 description: The target score for the test
 *     responses:
 *       201:
 *         description: Test created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Test created successfully"
 *                 newTestId:
 *                   type: string
 *                   description: The unique ID of the newly created test
 *       500:
 *         description: Internal server error
 */
const createTest = async (req, res) => {
  try {
    const { questions, target } = req.body;
    const latestTest = await Test.findOne()
      .sort({ testId: -1 })
      .collation({ locale: "en_US", numericOrdering: true });
    let maxTestId = 0;
    if (latestTest) {
      maxTestId = parseInt(latestTest.testId.replace("test", ""));
    }
    const newTestId = `test${maxTestId + 1}`;
    const newTest = new Test({
      testId: newTestId,
      target,
      questions,
    });
    await newTest.save();

    res.status(201).json({ message: "Test created successfully", newTestId });
  } catch (error) {
    console.error("Error creating test:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @swagger
 * tags:
 *   - name: Tests
 *     description: Operations related to taking tests
 * /api/do_test:
 *   post:
 *     summary: Submit answers for a test
 *     description: Allows a student to submit answers for a specific test and records their results.
 *     tags:
 *       - Tests
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answers:
 *                 type: array
 *                 description: Array of answers submitted by the student
 *                 items:
 *                   type: string
 *               testId:
 *                 type: string
 *                 description: The ID of the test
 *               profileId:
 *                 type: string
 *                 description: The ID of the student's profile
 *     responses:
 *       200:
 *         description: Test submission processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Create new student training point table successfully!"
 *                 correctAnswers:
 *                   type: integer
 *                   description: Number of correct answers submitted
 *       400:
 *         description: Invalid post category
 *       404:
 *         description: Test or Post not found
 *       500:
 *         description: Internal Server Error
 */
const doTest = async (req, res) => {
  try {
    const { answers, testId, profileId } = req.body;
    const test = await Test.findOne({ testId: testId });
    const post = await Post.findOne({ testId: testId });

    if (!test || !post) {
      return res.status(404).json({ message: "Test or Post not found" });
    }

    // Check if pointCategory exists for the profileId
    let catePoint = await postCate.findOne({ studentId: profileId });

    // If pointCategory does not exist, create a new one
    if (!catePoint) {
      const catePoint = new postCate({
        studentId: profileId,
        academic: [],
        totalAcademic: 0,
        volunteer: [],
        totalVolunteer: 0,
        mentalPhysical: [],
        totalMentalPhysical: 0,
        discipline: [
          {
            name: "Không vi phạm",
            point: 20,
          },
        ],
        reward: [],
        totalReward: 0,
        pioneering: [],
        totalPioneering: 0,
        totalPoints: 0,
      });

      await catePoint.save();

      return res.status(200).json({
        message: "Create new student training point table successfully !",
      });
    }

    // Proceed with the test evaluation logic as before
    let correctAnswers = 0;
    let answerOfUser = 0;
    test.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const correctOption = question.correctOption;
      if (userAnswer === correctOption) {
        correctAnswers++;
        answerOfUser++;
      }
    });

    // Update post's stdJoin and numberParticipants
    post.stdJoin.push(profileId);
    post.numberParticipants -= 1;
    await post.save();

    // If correct answers meet the target, add post id to student's activities
    if (correctAnswers >= test.target) {
      switch (post.category) {
        case "academic":
          catePoint.academic.push({ name: post.name, point: post.point });
          break;
        case "volunteer":
          catePoint.volunteer.push({ name: post.name, point: post.point });
          break;
        case "mentalPhysical":
          catePoint.mentalPhysical.push({ name: post.name, point: post.point });
          break;
        default:
          return res.status(400).json({ message: "Invalid post category" });
      }

      // Save the updated student document
      await catePoint.save();
    }

    res.json({ correctAnswers });

    const student = await Student.findOne({ id: profileId });

    const attendeesFind = await Attendees.findOne({ postId: post.id });
    if (attendeesFind) {
      attendeesFind.attendees.push({
        name: student.name,
        email: student.email,
        postResult: correctAnswers,
      });
      await attendeesFind.save();
    } else {
      // If Attendees does not exist, create a new one
      const newAttendees = new Attendees({
        postId: post.id,
        attendees: [
          {
            name: student.name,
            email: student.email,
            postResult: correctAnswers,
          },
        ],
      });
      await newAttendees.save();
    }

    student.activities.push(post.id);
    await student.save();

    // Continue with the rest of the function
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { createTest, doTest, getTest, getTestById };
