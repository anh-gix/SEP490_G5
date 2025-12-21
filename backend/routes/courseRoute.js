const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const courseController = require('../controllers/courseController');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/course-materials');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for material file uploads
const materialStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'material-' + uniqueSuffix + ext);
    }
});

const materialUpload = multer({
    storage: materialStorage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = [
            '.pdf', '.doc', '.docx', '.xls', '.xlsx',
            '.ppt', '.pptx', '.txt', '.zip', '.rar'
        ];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Định dạng file không được hỗ trợ. Chỉ chấp nhận: PDF, Word, Excel, PowerPoint, TXT, ZIP, RAR'));
        }
    }
});



// Lấy tất cả courses
router.get('/', courseController.getAllCourses);

// Course không có workflow phê duyệt riêng
// Workflow phê duyệt chỉ áp dụng ở Program level

// Lấy danh sách tất cả types - PHẢI ĐẶT TRƯỚC route /:id để tránh conflict
router.get('/all-types', courseController.getAllTypes);

// Lấy danh sách tất cả levels - PHẢI ĐẶT TRƯỚC route /:id để tránh conflict
router.get('/all-levels', courseController.getAllLevels);

// Lấy danh sách levels theo type - PHẢI ĐẶT TRƯỚC route /:id để tránh conflict
router.get('/levels', courseController.getLevelsByType);

// Lấy danh sách courses theo program name và level - PHẢI ĐẶT TRƯỚC route /:id để tránh conflict
router.get('/by-program', courseController.getCoursesByProgram);

// Lấy band từ type và level - PHẢI ĐẶT TRƯỚC route /:id để tránh conflict
router.get('/band', courseController.getBandByTypeAndLevel);

// Lấy tất cả mappings (type, level, band) - PHẢI ĐẶT TRƯỚC route /:id để tránh conflict
router.get('/mappings', courseController.getCourseMappings);

// Lấy types theo level - PHẢI ĐẶT TRƯỚC route /:id để tránh conflict
router.get('/types-by-level', courseController.getTypesByLevel);

// PLO MAPPING ROUTES - PHẢI ĐẶT TRƯỚC route /:id để tránh conflict
router.get('/:id/program-plos', courseController.getProgramPLOs);
router.put('/:id/map-plos', courseController.updateCoursePLOMapping);

// MATERIALS ROUTES - PHẢI ĐẶT TRƯỚC route /:id để tránh conflict
router.post('/upload-material', materialUpload.single('material'), courseController.uploadMaterialFile);
router.get('/:courseId/materials', courseController.getCourseMaterials);

// ACTIVATION/DEACTIVATION ROUTES - PHẢI ĐẶT TRƯỚC route /:id để tránh conflict
router.get('/:id/can-deactivate', courseController.canDeactivateCourse);
router.patch('/:id/deactivate', courseController.deactivateCourse);
router.patch('/:id/activate', courseController.activateCourse);

//lấy chi tiết giáo trình
router.get('/:id/details', courseController.getCourseById);

// COURSE CRUD ROUTES (dynamic routes come after)
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);
router.post('/', courseController.createCourse);
router.put('/:id', courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);

module.exports = router;

