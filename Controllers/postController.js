const connectToDatabase = require("../Configs/db");
const Student = require("../Models/student");
const postCate = require("../Models/pointCategory");
const Test = require("../Models/test");
const Post = require("../Models/post");
const Attendees = require("../Models/attendees");
const ExpiredPost = require("../Models/expiredPost");

const moment = require("moment-timezone");
const { v4: uuidv4 } = require("uuid");

const processExpiredPosts = async () => {
  try {
    const posts = await Post.find();

    for (const post of posts) {
      if (post && post.endDate && post.endTime) {
        const endDateTime = moment.tz(
          `${post.endDate}T${post.endTime}`,
          "YYYY-MM-DDTHH:mm",
          "Asia/Ho_Chi_Minh"
        );
        const copyPost = post;
        const currentDate = moment.tz("Asia/Ho_Chi_Minh");

        if (endDateTime < currentDate) {
          const expiredPost = new ExpiredPost({
            postFields: copyPost,
            expiredAt: endDateTime,
          });

          await expiredPost.save();

          await Post.findOneAndDelete({ id: post.id });
        }
      }
    }
  } catch (error) {
    console.error("Error processing expired posts:", error);
  }
};
/**
 * @swagger
 * tags:
 *   - name: Posts
 *     description: API for managing posts
 * /api/posts:
 *   get:
 *     summary: Get all posts
 *     description: Get all posts from the database
 *     tags:
 *       - Posts
 *     responses:
 *       200:
 *         description: A list of posts
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
 *                       desc:
 *                         type: string
 *                       facultyName:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: ["Public", "Private"]
 *                         default: "Public"
 *                       startDate:
 *                         type: string
 *                       startTime:
 *                         type: string
 *                       endDate:
 *                         type: string
 *                       endTime:
 *                         type: string
 *                       point:
 *                         type: number
 *                       location:
 *                         type: string
 *                       numberParticipants:
 *                         type: number
 *                       stdJoin:
 *                         type: array
 *                         items:
 *                           type: string
 *                       testId:
 *                         type: string
 *                       category:
 *                         type: string
 *                     required:
 *                       - id
 *                       - name
 *                       - desc
 *                       - facultyName
 *                       - status
 *                       - startDate
 *                       - startTime
 *                       - endDate
 *                       - endTime
 *                       - point
 *                       - location
 *                       - numberParticipants
 *                       - stdJoin
 *                       - testId
 *                       - category
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               required:
 *                 - message
 */
const getAllPost = async (req, res) => {
  try {
    const userEmail = req.account.emailInput;
    const user = await Student.findOne({ email: userEmail });
    await processExpiredPosts();
    const db = await connectToDatabase();
    const postCollection = db.collection("posts");
    const query = {
      $or: [
        { status: "Public" },
        { status: "Private", facultyName: user.facultyName },
      ],
    };
    const post = await postCollection.find(query).toArray();

    res.json({
      data: post,
      message: "Posts fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * @swagger
 * tags:
 *   - name: Posts
 *     description: API for managing posts
 * /api/posts-assistant:
 *   get:
 *     summary: Get all posts for assistant
 *     description: Get all posts from the database
 *     tags:
 *       - Posts
 *     responses:
 *       200:
 *         description: A list of posts
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
 *                       desc:
 *                         type: string
 *                       facultyName:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: ["Public", "Private"]
 *                         default: "Public"
 *                       startDate:
 *                         type: string
 *                       startTime:
 *                         type: string
 *                       endDate:
 *                         type: string
 *                       endTime:
 *                         type: string
 *                       point:
 *                         type: number
 *                       location:
 *                         type: string
 *                       numberParticipants:
 *                         type: number
 *                       stdJoin:
 *                         type: array
 *                         items:
 *                           type: string
 *                       testId:
 *                         type: string
 *                       category:
 *                         type: string
 *                     required:
 *                       - id
 *                       - name
 *                       - desc
 *                       - facultyName
 *                       - status
 *                       - startDate
 *                       - startTime
 *                       - endDate
 *                       - endTime
 *                       - point
 *                       - location
 *                       - numberParticipants
 *                       - stdJoin
 *                       - testId
 *                       - category
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               required:
 *                 - message
 */
const getAllPostAssistant = async (req, res) => {
  try {
    await processExpiredPosts();
    const db = await connectToDatabase();
    const postCollection = db.collection("posts");
    const post = await postCollection.find({}).toArray();

    res.json({
      data: post,
      message: "Posts fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
/**
 * @swagger
 * tags:
 *   - name: Posts
 *     description: API for managing posts
 * /api/post_by_id:
 *   get:
 *     summary: Get post by ID
 *     description: Get post by ID from the database
 *     tags:
 *       - Posts
 *     parameters:
 *       - name: postID
 *         in: query
 *         description: ID of the post to get
 *         required: true
 *         schema:
 *          type: string
 *     responses:
 *       200:
 *         description: Post by ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                data:
 *                 type: object
 *                 properties:
 *                  id:
 *                    type: string
 *                  name:
 *                    type: string
 *                  desc:
 *                    type: string
 *                  facultyName:
 *                    type: string
 *                  status:
 *                    type: string
 *                    enum: ["Public", "Private"]
 *                    default: "Public"
 *                  startDate:
 *                    type: string
 *                  startTime:
 *                    type: string
 *                  endDate:
 *                    type: string
 *                  endTime:
 *                    type: string
 *                  point:
 *                    type: number
 *                  location:
 *                    type: string
 *                  numberParticipants:
 *                    type: number
 *                  stdJoin:
 *                    type: array
 *                    items:
 *                     type: string
 *                  testId:
 *                    type: string
 *                  category:
 *                    type: string
 *                required:
 *                 - id
 *                 - name
 *                 - desc
 *                 - facultyName
 *                 - status
 *                 - startDate
 *                 - startTime
 *                 - endDate
 *                 - endTime
 *                 - point
 *                 - location
 *                 - numberParticipants
 *                 - stdJoin
 *                 - testId
 *                 - category
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 required:
 *                   - error
 */
const getPostById = async (req, res) => {
  try {
    const { postID } = req.query;
    if (!postID) {
      return res
        .status(400)
        .json({ message: "Post ID is missing in the request body." });
    }

    let post = await Post.findOne({ id: postID });
    if (!post) {
      post = await ExpiredPost.findOne({ "postFields.id": postID });
      if (!post) {
        return res.status(404).json({
          error: `Post with ID ${postID} not found in both sources.`,
        });
      }
      res.status(200).json({ data: post });
    } else {
      res.status(200).json({ data: post });
    }
  } catch (error) {
    console.error(`Error fetching post specific data: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @swagger
 * tags:
 *   - name: Posts
 *     description: API for managing posts
 * /api/expired_post:
 *   get:
 *     summary: Get all expired posts
 *     description: Get all expired posts from the database
 *     tags:
 *       - Posts
 *     responses:
 *       200:
 *         description: Expired posts
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
 *                       postFields:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           desc:
 *                             type: string
 *                           facultyName:
 *                             type: string
 *                           status:
 *                             type: string
 *                             enum: ["Public", "Private"]
 *                             default: "Public"
 *                           startDate:
 *                             type: string
 *                           startTime:
 *                             type: string
 *                           endDate:
 *                             type: string
 *                           endTime:
 *                             type: string
 *                           point:
 *                             type: number
 *                           location:
 *                             type: string
 *                           numberParticipants:
 *                             type: number
 *                           stdJoin:
 *                             type: array
 *                             items:
 *                               type: string
 *                           testId:
 *                             type: string
 *                           category:
 *                             type: string
 *                       expiredAt:
 *                         type: string
 *                         format: date-time
 *                     required:
 *                       - postFields
 *                       - expiredAt
 *       404:
 *         description: Expired post not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 required:
 *                   - error
 */
const getAllExpired = async (req, res) => {
  try {
    const expiredpost = await ExpiredPost.find();
    res.json({
      data: expiredpost,
      message: "Expired posts fetched successfully",
      status: 200,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching expired posts:", error);
    res.status(500).json({
      data: null,
      message: "Internal Server Error",
      status: 500,
      success: false,
    });
  }
};

/**
 * @swagger
 * tags:
 *   - name: Posts
 *     description: API for managing posts
 * /api/post_by_cate:
 *   get:
 *     summary: Get post by category
 *     description: Get post by category from the database
 *     tags:
 *       - Posts
 *     parameters:
 *       - name: categories
 *         in: query
 *         description: Categories of the posts to retrieve (comma-separated if multiple)
 *         required: true
 *         schema:
 *          type: string
 *     responses:
 *       200:
 *         description: Post by ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                data:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                        id:
 *                          type: string
 *                        name:
 *                          type: string
 *                        desc:
 *                          type: string
 *                        facultyName:
 *                          type: string
 *                        status:
 *                          type: string
 *                          enum: ["Public", "Private"]
 *                          default: "Public"
 *                        startDate:
 *                          type: string
 *                        startTime:
 *                          type: string
 *                        endDate:
 *                          type: string
 *                        endTime:
 *                          type: string
 *                        point:
 *                          type: number
 *                        location:
 *                          type: string
 *                        numberParticipants:
 *                          type: number
 *                        stdJoin:
 *                          type: array
 *                        items:
 *                          type: string
 *                        testId:
 *                          type: string
 *                        category:
 *                          type: string
 *                    required:
 *                      - id
 *                      - name
 *                      - desc
 *                      - facultyName
 *                      - status
 *                      - startDate
 *                      - startTime
 *                      - endDate
 *                      - endTime
 *                      - point
 *                      - location
 *                      - numberParticipants
 *                      - stdJoin
 *                      - testId
 *                      - category
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 required:
 *                   - error
 */
const getPostByCategory = async (req, res) => {
  try {
    const { categories } = req.query;

    if (!categories) {
      return res.status(400).json({ message: "Category is required" });
    }

    let categoriesArray;
    if (typeof categories === "string") {
      categoriesArray = categories.split(",");
    } else {
      categoriesArray = categories;
    }

    const posts = await Post.find({ category: { $in: categoriesArray } });

    res.status(200).json({
      data: posts,
    });
  } catch (error) {
    console.error("Error in getPostByCategory:", error);
    res.status(500).json({ message: "Error fetching posts by category" });
  }
};

/**
 * @swagger
 * tags:
 *   - name: Posts
 *     description: API for managing posts
 * /api/list_attendees/{id}:
 *   get:
 *      summary: Get all attendees
 *      description: Get all attendees from the database
 *      tags:
 *        - Posts
 *      parameters:
 *        - name: id
 *          in: path
 *          description: ID of the post to get attendees
 *          required: true
 *          schema:
 *             type: string
 *      responses:
 *         200:
 *            description: A list of attendees
 *            content:
 *              application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                      data:
 *                        type: array
 *                        items:
 *                          type: object
 *                          properties:
 *                            filteredAttendees:
 *                              type: array
 *                              items:
 *                                type: object
 *                                properties:
 *                                  name:
 *                                    type: string
 *                                  email:
 *                                    type: string
 *                                  postResult:
 *                                    type: string
 *         500:
 *            description: Internal Server Error
 *            content:
 *              application/json:
 *                schema:
 *                type: object
 *              properties:
 *                message:
 *                  type: string
 */
const getAllAttendees = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const AttendeesCollection = db.collection("attendees");
    const attendees = await AttendeesCollection.find({}).toArray();

    const { id } = req.params;

    const filteredAttendees = attendees.filter(
      (attendee) => attendee.postId === id
    );

    res.json({
      data: filteredAttendees,
      message: "Attendees fetched successfully",
      status: 200,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching tables:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * @swagger
 * tags:
 *   - name: Posts
 *     description: API for managing posts
 * /api/create_post:
 *   post:
 *     summary: Create a new post
 *     description: Create a new post in the database
 *     tags:
 *       - Posts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the post
 *               desc:
 *                 type: string
 *                 description: Description of the post
 *               facultyName:
 *                 type: string
 *                 description: Name of the faculty
 *               status:
 *                 type: string
 *                 description: Status of the post
 *                 enum: ["Private", "Public"]
 *                 default: "Public"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Start date of the post
 *               startTime:
 *                 type: string
 *                 format: time
 *                 description: Start time of the post
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: End date of the post
 *               endTime:
 *                 type: string
 *                 format: time
 *                 description: End time of the post
 *               point:
 *                 type: number
 *                 enum: [3, 5, 7, 10]
 *                 description: Points assigned to the post
 *               location:
 *                 type: string
 *                 description: Location of the event
 *               numberParticipants:
 *                 type: number
 *                 description: Number of participants
 *                 default: 0
 *               stdJoin:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: List of student IDs joining the post
 *               testId:
 *                 type: string
 *                 description: ID of the test associated with the post
 *               category:
 *                 type: string
 *                 description: Category of the post
 *               semester:
 *                 type: string
 *                 enum: ["HK1", "HK2", "HK3"]
 *                 description: Semester associated with the post
 *               yearStart:
 *                 type: number
 *                 description: Start year of the semester
 *               yearEnd:
 *                 type: number
 *                 description: End year of the semester
 *             required:
 *               - name
 *               - desc
 *               - facultyName
 *               - startDate
 *               - startTime
 *               - endDate
 *               - endTime
 *               - point
 *               - location
 *               - numberParticipants
 *               - category
 *               - semester
 *               - yearStart
 *               - yearEnd
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 postId:
 *                   type: string
 *       400:
 *         description: Missing required fields
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
const createPost = async (req, res) => {
  try {
    const {
      name,
      desc,
      facultyName,
      status,
      startDate,
      startTime,
      endDate,
      endTime,
      point,
      location,
      numberParticipants,
      stdJoin,
      testId,
      category,
      semester,
      yearStart,
      yearEnd,
    } = req.body;

    // Check for missing required fields
    if (
      !name ||
      !desc ||
      !facultyName ||
      !startDate ||
      !startTime ||
      !endDate ||
      !endTime ||
      !point ||
      !location ||
      !category ||
      !numberParticipants ||
      !semester ||
      !yearStart ||
      !yearEnd
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Generate a unique UUID for the post ID
    const postId = uuidv4();

    // Create the post
    const result = await Post.create({
      id: postId,
      name,
      desc,
      facultyName,
      status,
      startDate,
      startTime,
      endDate,
      endTime,
      point,
      location,
      numberParticipants,
      stdJoin,
      testId,
      category,
      semester,
      yearStart,
      yearEnd,
    });

    res.status(201).json({
      message: "Post created successfully",
      postId: result.insertedId,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * @swagger
 * tags:
 *  - name: Posts
 *    description: API for managing posts
 * /api/update_post:
 *  put:
 *   summary: Update a post
 *   description: Update a post in the database
 *   tags:
 *     - Posts
 *   requestBody:
 *     required: true
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             postId:
 *               type: string
 *               description: ID of the post to be updated
 *             updatedPostData:
 *               type: object
 *               description: Data to update in the post
 *             updatedTestData:
 *               type: object
 *               description: Data to update in the related test (only if location is online)
 *             location:
 *               type: string
 *               description: Location of the post, can be "online" or other values
 *   responses:
 *     200:
 *       description: Post updated successfully
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *     404:
 *       description: Post or test not found
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *     500:
 *       description: Internal server error
 */
const updatePosts = async (req, res) => {
  try {
    const { postId, updatedPostData, updatedTestData, location } = req.body;
    const db = await connectToDatabase();
    const postCollection = db.collection("posts");
    const post = await postCollection.findOne({ id: postId });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (location === "Online") {
      const test = await Test.findOne({ testId: post.testId });
      if (!test) {
        return res.status(404).json({ message: "Test not found" });
      }
      if (updatedTestData) {
        await Test.updateOne(
          { testId: post.testId },
          { $set: updatedTestData }
        );
      }
      await postCollection.updateOne({ id: postId }, { $set: updatedPostData });
      return res
        .status(200)
        .json({ message: "Post and test updated successfully" });
    } else {
      await postCollection.updateOne({ id: postId }, { $set: updatedPostData });
      return res.status(200).json({ message: "Post updated successfully" });
    }
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * @swagger
 * tags:
 *   - name: Posts
 *     description: API for managing posts
 *
 * /api/join_post:
 *   post:
 *     summary: Join a student to a post
 *     description: Allows a student to join an activity post.
 *     tags:
 *       - Posts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: The ID of the student joining the post
 *                 example: "12345"
 *               postId:
 *                 type: string
 *                 description: The ID of the post to join
 *                 example: "98765"
 *     responses:
 *       200:
 *         description: Successfully joined the post
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Student joined post successfully"
 *       400:
 *         description: Student has already joined the post
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Student already joined this post"
 *       404:
 *         description: Student not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Student not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
const joinPost = async (req, res) => {
  const { studentId, postId } = req.body;
  try {
    const student = await Student.findOne({ id: studentId });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    const post = await Post.findOne({ id: postId });
    if (post.stdJoin.includes(studentId)) {
      return res
        .status(400)
        .json({ message: "Student already joined this post" });
    }
    post.stdJoin.push(studentId);
    post.numberParticipants -= 1;
    await post.save();
    return res
      .status(200)
      .json({ message: "Student joined post successfully" });
  } catch (error) {
    console.error("Error joining post:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
/**
 * @swagger
 * tags:
 *   - name: Posts
 *     description: API for managing posts
 * /api/check_attendance:
 *  put:
 *   summary: Check attendance
 *   description: Check attendance for a post
 *   tags:
 *      - Posts
 *   requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              postId:
 *                type: string
 *                description: ID of the post
 *              studentId:
 *                type: string
 *                description: ID of the student
 *   responses:
 *      200:
 *        description: Attendance checked successfully
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *      400:
 *        description: Post already added in category
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *      404:
 *        description: Post not found
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *      500:
 *        description: Internal server error
 *        content:
 *           application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 */
const checkAttendance = async (req, res) => {
  try {
    const { postId, studentId } = req.body;

    const post = await Post.findOne({ id: postId });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.stdJoin.includes(studentId)) {
      const postAlreadyAdded = (category, array) => {
        if (array.includes(postId)) {
          return res
            .status(400)
            .json({ message: `Post already added in ${category}` });
        }
        return false;
      };

      const student = await postCate.findOne({ studentId: studentId });
      const stu = await Student.findOne({ id: studentId });

      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      switch (post.category) {
        case "academic":
          if (postAlreadyAdded("academic", student.academic)) return;
          student.academic.push({ name: postId, point: post.point });
          break;
        case "volunteer":
          if (postAlreadyAdded("volunteer", student.volunteer)) return;
          student.volunteer.push({ name: postId, point: post.point });
          break;
        case "mentalPhysical":
          if (postAlreadyAdded("mentalPhysical", student.mentalPhysical))
            return;
          student.mentalPhysical.push({ name: postId, point: post.point });
          break;
        default:
          return res.status(400).json({ message: "Invalid post category" });
      }

      if (postAlreadyAdded("activities", stu.activities)) return;
      stu.activities.push(postId);

      // Save the updated student document
      await student.save();
      await stu.save();

      const attendeesFind = await Attendees.findOne({ postId: postId });
      if (attendeesFind) {
        attendeesFind.attendees.push({
          name: stu.name,
          email: stu.email,
          postResult: "Joined",
        });
        await attendeesFind.save();
      } else {
        // If Attendees does not exist, create a new one
        const newAttendees = new Attendees({
          postId: postId,
          attendees: [
            {
              name: stu.name,
              email: stu.email,
              postResult: "Joined",
            },
          ],
        });
        await newAttendees.save();
      }

      return res
        .status(200)
        .json({ message: "Attendance checked successfully" });
    }
  } catch (error) {
    console.error("Error checking attendance:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getAllPost,
  getAllPostAssistant,
  getPostById,
  getPostByCategory,
  createPost,
  updatePosts,
  getAllAttendees,
  checkAttendance,
  getAllExpired,
  joinPost,
};
