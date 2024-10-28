const express = require("express");
const router = express.Router();
const testController = require("../Controllers/testController");

router.get("/tests", testController.getTest);
router.post("/do-test", testController.doTest);
router.post("/create-test", testController.createTest);
router.post("/test-by-id", testController.getTestById);
module.exports = router;
