const express = require("express");
const router = express.Router();
const assistantController = require("../Controllers/assistantController");

router.get("/assistant_student", assistantController.getAllStudent);

module.exports = router;