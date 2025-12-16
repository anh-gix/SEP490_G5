const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const teacherDashboardController = require('../controllers/teacherDashboardController');
const { verifyToken, isTeacher, isTeacherOrSubjectLeader } = require('../middlewares/verifyToken');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/materials/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, ZIP, RAR'));
    }
  }
});

// Teacher current user routes (require authentication)
router.get('/me', verifyToken, isTeacherOrSubjectLeader, teacherController.getCurrentTeacher);
router.get('/me/dashboard', verifyToken, isTeacherOrSubjectLeader, teacherDashboardController.getTeacherDashboard);
router.get('/me/schedule', verifyToken, isTeacherOrSubjectLeader, teacherController.getCurrentTeacherSchedule);
router.get('/me/classes', verifyToken, isTeacherOrSubjectLeader, teacherController.getMyClasses);
router.get('/me/classes/:classId', verifyToken, isTeacherOrSubjectLeader, teacherController.getMyClassDetail);
router.get('/me/lessons/:scheduleId', verifyToken, isTeacherOrSubjectLeader, teacherController.getLessonDetail);
router.put('/me/mocktest/:scheduleId/student/:studentId', verifyToken, isTeacherOrSubjectLeader, teacherController.updateMocktestScore);
router.post('/me/classes/:classId/mocktest/import-scores', verifyToken, isTeacherOrSubjectLeader, teacherController.importMocktestScores);
router.post('/me/attendance/:scheduleId', verifyToken, isTeacherOrSubjectLeader, teacherController.saveAttendance);

// Material management routes
router.get('/me/classes/:classId/materials', verifyToken, isTeacherOrSubjectLeader, teacherController.getClassMaterials);
router.post('/me/schedules/:scheduleId/materials', verifyToken, isTeacherOrSubjectLeader, upload.array('materials', 10), teacherController.addMaterialToSchedule);
router.delete('/me/schedules/:scheduleId/materials', verifyToken, isTeacherOrSubjectLeader, teacherController.deleteMaterialFromSchedule);

// Teacher CRUD (admin routes)
router.get('/', teacherController.getAllTeachers);
router.get('/stats', teacherController.getTeacherStats);
router.get('/:id', teacherController.getTeacherById);
router.get('/:id/schedule', teacherController.getTeacherSchedule);
router.post('/', teacherController.createTeacher);
router.put('/:id', teacherController.updateTeacher);
router.delete('/:id', teacherController.deleteTeacher);
router.post('/import', teacherController.importTeachers);

module.exports = router;
