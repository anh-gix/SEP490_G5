const express = require('express');
const router = express.Router();
const homeworkController = require('../controllers/homeworkController');
const { verifyToken } = require('../middlewares/verifyToken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Đảm bảo thư mục uploads/homeworks tồn tại
const uploadsDir = path.join(__dirname, '../uploads/homeworks');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Cấu hình multer cho homework files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const prefix = file.fieldname === 'answerFile' ? 'answer' : 'assignment';
    cb(null, `${prefix}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
  const allowedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Chỉ chấp nhận file: ${allowedTypes.join(', ')}`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

// Middleware for multiple files
const uploadHomeworkFiles = upload.fields([
  { name: 'assignmentFile', maxCount: 5 },
  { name: 'answerFile', maxCount: 5 }
]);

// Routes
// Lấy danh sách assignments của teacher
router.get('/teacher/assignments', verifyToken, homeworkController.getTeacherAssignments);

// Lấy danh sách schedules của class (để giao bài tập)
router.get('/class/:classId/schedules', verifyToken, homeworkController.getClassSchedules);

// Thêm homework vào ClassSchedule
router.post('/classSchedule/:scheduleId', verifyToken, uploadHomeworkFiles, homeworkController.addHomeworkToSchedule);

// Cập nhật homework
router.put('/classSchedule/:scheduleId/homework/:homeworkId', verifyToken, uploadHomeworkFiles, homeworkController.updateHomework);

// Xóa homework
router.delete('/classSchedule/:scheduleId/homework/:homeworkId', verifyToken, homeworkController.deleteHomework);

// Lấy danh sách submissions
router.get('/:homeworkId/submissions', verifyToken, homeworkController.getHomeworkSubmissions);

module.exports = router;
