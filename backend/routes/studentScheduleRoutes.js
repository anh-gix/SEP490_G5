const express = require("express");
const router = express.Router();
const classScheduleController = require("../controllers/classScheduleController");
const { verifyToken } = require("../middlewares/verifyToken");

//  Lấy lịch học của học sinh (bao gồm startTime, endTime, tên lớp, giáo viên, phòng học)
router.get(
  "/student/:studentId/schedule",
  verifyToken,
  classScheduleController.getStudentSchedule
);

//  Lấy StudentSchedule theo classSchedule IDs (cho test page)
router.post(
  "/by-class-schedules",
  verifyToken,
  classScheduleController.getStudentSchedulesByClassSchedules
);

//  Tạo StudentSchedule entry mới
router.post("/", verifyToken, classScheduleController.createStudentSchedule);

//  Lấy ClassSchedule từ StudentScheduleId
router.get(
  "/:studentScheduleId/class-schedule",
  verifyToken,
  classScheduleController.getClassScheduleByStudentScheduleId
);

//  Cập nhật StudentSchedule entry
router.patch(
  "/:studentScheduleId",
  verifyToken,
  classScheduleController.updateStudentSchedule
);

module.exports = router;
