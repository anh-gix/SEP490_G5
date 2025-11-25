const express = require("express");
const router = express.Router();
const classScheduleController = require("../controllers/classScheduleController");
const ministryController = require("../controllers/ministryController");

// ✅ Lấy danh sách lớp của giáo viên
router.get("/teacher/:teacherId/classes", classScheduleController.getClassesByTeacher);

// ✅ Lấy lịch dạy của giáo viên
router.get("/teacher/:teacherId/schedule", classScheduleController.getTeacherSchedule);

// ✅ Lấy lịch học theo lớp
router.get("/class/:classId/schedules", classScheduleController.getSchedulesByClass);

// ✅ Tạo buổi học mới (và generate StudentSchedule)
router.post("/", classScheduleController.createClassSchedule);

// ✅ Điểm danh sinh viên
router.patch("/:studentScheduleId/attendance", classScheduleController.markAttendance);

// ✅ Xem danh sách điểm danh của một buổi học
router.get("/:classScheduleId/attendance", classScheduleController.getAttendanceByClassSchedule);

// ✅ Xem tất cả các phòng học
router.get("/rooms", ministryController.getAllRooms); // 🆕 thêm dòng này

module.exports = router;
