const express = require("express");
const router = express.Router();
const controller = require("../controllers/StatsController");

router.get("/teachers", controller.byTeacher);
router.get("/topics", controller.byTopic);
router.get("/by-month", controller.countByMonth);
router.get("/by-week", controller.countByWeek);

module.exports = router;
