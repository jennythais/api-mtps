const express = require("express");
const router = express.Router();
const assistantController = require("../Controllers/assistantController");

router.get("/assistant_student", assistantController.getAllStudent);
router.get("/student-by-faculty/:faculty", assistantController.getStudentByF);
router.post("/search-student", assistantController.searchStudent);
router.post("/update-discipline", assistantController.updateDiscipline);
module.exports = router;
