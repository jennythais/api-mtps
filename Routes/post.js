const express = require("express");
const router = express.Router();
const postController = require("../Controllers/postController");
const authenticateToken = require("../Middleware/authJwt");

router.get("/posts", authenticateToken, postController.getAllPost);
router.get(
  "/posts-assistant",
  authenticateToken,
  postController.getAllPostAssistant
);
router.get("/post_by_id", postController.getPostById);
router.get("/post_by_category", postController.getPostByCategory);
router.get("/list_attendees/:id", postController.getAllAttendees);
router.post("/create_post", postController.createPost);
router.put("/update_post", authenticateToken, postController.updatePosts);
router.post("/check_attendance", postController.checkAttendance);
router.get("/expired_post", postController.getAllExpired);
router.post("/join_post", postController.joinPost);
module.exports = router;
