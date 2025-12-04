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
const homeworkUploadsDir = path.join(__dirname, '../uploads/homeworks');
if (!fs.existsSync(homeworkUploadsDir)) {
  fs.mkdirSync(homeworkUploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, homeworkUploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `submission-${uniqueSuffix}${ext}`);
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

// ==========================================
// STUDENT AUTHENTICATED ROUTES (must be before /:id)
// ==========================================

// Student current user routes (require authentication)
router.get('/me', verifyToken, isStudent, studentController.getCurrentStudent);
router.get('/me/dashboard', verifyToken, isStudent, studentController.getDashboardData);
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
  upload.array('submissionFile', 5), // Allow up to 5 files
  studentController.submitHomework
);

// Get student's own submission for a homework
router.get('/me/classes/:classId/schedules/:scheduleId/homework/:homeworkId/submission',
  verifyToken,
  isStudent,
  studentController.getMySubmission
);

// Create change request (for absence request)
const changeRequestController = require('../controllers/changeRequestController');
router.post('/me/change-requests', 
  verifyToken, 
  isStudent, 
  changeRequestController.createChangeRequest
);

// ==========================================
// ADMIN/ACADEMIC STAFF ROUTES (for student management)
// ==========================================

// Get all students (for Academic Staff/Admin - no role restriction for now)
router.get('/', studentController.getAllStudents);

// Get student statistics
router.get('/stats', studentController.getStudentStats);

// Get student by ID
router.get('/:id', studentController.getStudentById);

// Update student course enrollments (must be before /:id routes to avoid conflict)
router.patch('/:id/courses', studentController.updateStudentCourseEnrollments);

// Create student
router.post('/', studentController.createStudent);

// Update student
router.put('/:id', studentController.updateStudent);

// Delete student
router.delete('/:id', studentController.deleteStudent);

// Import students (bulk)
router.post('/import', studentController.importStudents);

module.exports = router;
