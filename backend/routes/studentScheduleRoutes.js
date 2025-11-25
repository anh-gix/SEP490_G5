const express = require("express");
const router = express.Router();
const classScheduleController = require("../controllers/classScheduleController");

// ✅ Lấy lịch học của học sinh (bao gồm startTime, endTime, tên lớp, giáo viên, phòng học)
router.get("/student/:studentId/schedule", classScheduleController.getStudentSchedule);

module.exports = router;

