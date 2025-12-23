const express = require("express");
const router = express.Router();
const classScheduleController = require("../controllers/classScheduleController");
const ministryController = require("../controllers/ministryController");
const { verifyToken } = require("../middlewares/verifyToken");

//  Lấy danh sách lớp của giáo viên
router.get(
  "/teacher/:teacherId/classes",
  verifyToken,
  classScheduleController.getClassesByTeacher
);

//  Lấy lịch dạy của giáo viên
router.get(
  "/teacher/:teacherId/schedule",
  verifyToken,
  classScheduleController.getTeacherSchedule
);

//  Lấy lịch học theo lớp
router.get(
  "/class/:classId/schedules",
  verifyToken,
  classScheduleController.getSchedulesByClass
);

//  Validate: Kiểm tra conflict trước khi thêm buổi học
router.post(
  "/validate",
  verifyToken,
  classScheduleController.validateAddClassSchedule
);

//  Validate: Kiểm tra conflict đơn giản (không cần classId)
router.post(
  "/validate-simple",
  verifyToken,
  classScheduleController.validateScheduleConflictSimple
);

//  Validate học bù: Kiểm tra conflict với buổi học của học sinh
router.post(
  "/validate-makeup",
  verifyToken,
  classScheduleController.validateMakeupClassSchedule
);

//  Tạo buổi học bù mới (không cần classId)
router.post(
  "/makeup",
  verifyToken,
  classScheduleController.createMakeupClassSchedule
);

//  Preview: Xem trước khi thêm buổi học (chỉ log, không tạo)
router.post(
  "/preview",
  verifyToken,
  classScheduleController.previewAddClassSchedule
);

//  Tạo buổi học mới (và generate StudentSchedule)
router.post("/", verifyToken, classScheduleController.createClassSchedule);

//  Lấy danh sách điểm danh của một buổi học (phải đặt trước route PATCH để tránh conflict)
router.get(
  "/:id/attendance",
  verifyToken,
  classScheduleController.getAttendanceByClassSchedule
);

//  Điểm danh sinh viên (PATCH method nên không conflict với GET ở trên)
router.patch(
  "/:studentScheduleId/attendance",
  verifyToken,
  classScheduleController.markAttendance
);

//  Xếp người dạy thay cho buổi học
router.patch(
  "/:id/assign-substitute",
  verifyToken,
  classScheduleController.assignSubstituteTeacher
);

//  Xem tất cả các phòng học
router.get("/rooms", verifyToken, ministryController.getAllRooms); // 🆕 thêm dòng này

//  Lấy danh sách ClassSchedule có cùng session và sau hôm nay
router.get(
  "/by-session",
  verifyToken,
  classScheduleController.getClassSchedulesBySession
);

module.exports = router;
