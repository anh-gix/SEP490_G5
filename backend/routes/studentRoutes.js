const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { verifyToken, isStudent } = require('../middlewares/verifyToken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Đảm bảo thư mục uploads tồn tại
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Cấu hình multer cho student homework submissions
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `student-hw-${uniqueSuffix}-${safeName}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept common file types for homework
  const allowedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.zip', '.rar'];
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

// Student current user routes (require authentication)
router.get('/me', verifyToken, isStudent, studentController.getCurrentStudent);
router.get('/me/classes', verifyToken, isStudent, studentController.getMyClasses);
router.get('/me/schedule', verifyToken, isStudent, studentController.getMySchedule);
router.get('/me/lessons/:scheduleId', verifyToken, isStudent, studentController.getLessonDetail);

// Class detail routes
router.get('/me/classes/:classId/materials', verifyToken, isStudent, studentController.getClassMaterials);
router.get('/me/classes/:classId/homework', verifyToken, isStudent, studentController.getClassHomework);
router.get('/me/classes/:classId/progress', verifyToken, isStudent, studentController.getClassProgress);

// Homework submission
router.post('/me/classes/:classId/schedules/:scheduleId/homework/:homeworkId/submit', 
  verifyToken, 
  isStudent, 
  upload.array('files', 5), // Allow up to 5 files
  studentController.submitHomework
);

module.exports = router;
