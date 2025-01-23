const express = require("express");
const router = express.Router();
const assistantController = require("../Controllers/assistantController");

router.get("/students", assistantController.getAllStudent);
router.get("/student-by-faculty/:faculty", assistantController.getStudentByF);
router.put("/update-discipline", assistantController.updateDiscipline);
module.exports = router;
