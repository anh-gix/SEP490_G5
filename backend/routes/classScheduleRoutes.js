const express = require("express");
const router = express.Router();
const classScheduleController = require("../controllers/classScheduleController");

// ✅ Tạo buổi học mới (và generate StudentSchedule)
// ✅ Lấy danh sách lớp của giáo viên
router.get("/teacher/:teacherId/classes", classScheduleController.getClassesByTeacher);

// ✅ Lấy lịch học theo lớp
router.get("/class/:classId/schedules", classScheduleController.getSchedulesByClass);
router.post("/", classScheduleController.createClassSchedule);

// ✅ Điểm danh sinh viên
router.patch("/:studentScheduleId/attendance", classScheduleController.markAttendance);

// ✅ Xem danh sách điểm danh của một buổi học
router.get("/:classScheduleId/attendance", classScheduleController.getAttendanceByClassSchedule);

module.exports = router;
