const express = require("express");
const router = express.Router();
const postController = require("../Controllers/postController");
const authenticateToken = require("../Middleware/authJwt");

router.get("/posts", authenticateToken, postController.getAllPost);
router.get("/post_by_id/:postID", postController.getPostById);
router.get("/post_by_category", postController.getPostByCategory);
router.get("/list_attendees/:id", postController.getAllAttendees);
router.post("/create_post", postController.createPost);
router.put("/update_post", authenticateToken, postController.updatePosts);
router.put("/check_attendance", postController.checkAttendance);
router.get("/expired_post", postController.getAllExpired);

module.exports = router;
