const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const courseController = require("../controllers/courseController");
const { verifyToken } = require("../middlewares/verifyToken");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads/course-materials");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for material file uploads
const materialStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "material-" + uniqueSuffix + ext);
  },
});

const materialUpload = multer({
  storage: materialStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = [
      ".pdf",
      ".doc",
      ".docx",
      ".xls",
      ".xlsx",
      ".ppt",
      ".pptx",
      ".txt",
      ".zip",
      ".rar",
    ];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Định dạng file không được hỗ trợ. Chỉ chấp nhận: PDF, Word, Excel, PowerPoint, TXT, ZIP, RAR"
        )
      );
    }
  },
});

// Lấy tất cả courses
router.get("/", verifyToken, courseController.getAllCourses);

// Course không có workflow phê duyệt riêng
// Workflow phê duyệt chỉ áp dụng ở Program level

// Lấy danh sách tất cả types - PHẢI ĐẶT TRƯỚC route /:id để tránh conflict
router.get("/all-types", verifyToken, courseController.getAllTypes);

// Lấy danh sách tất cả levels - PHẢI ĐẶT TRƯỚC route /:id để tránh conflict
router.get("/all-levels", verifyToken, courseController.getAllLevels);

// Lấy danh sách levels theo type - PHẢI ĐẶT TRƯỚC route /:id để tránh conflict
router.get("/levels", verifyToken, courseController.getLevelsByType);

// Lấy danh sách courses theo program name và level - PHẢI ĐẶT TRƯỚC route /:id để tránh conflict
router.get("/by-program", verifyToken, courseController.getCoursesByProgram);

// Lấy danh sách courses theo program ID(s) - PHẢI ĐẶT TRƯỚC route /:id để tránh conflict
router.get(
  "/by-program-id",
  courseController.getCoursesByProgramId
);

// Lấy band từ type và level - PHẢI ĐẶT TRƯỚC route /:id để tránh conflict
router.get("/band", verifyToken, courseController.getBandByTypeAndLevel);

// Lấy tất cả mappings (type, level, band) - PHẢI ĐẶT TRƯỚC route /:id để tránh conflict
router.get("/mappings", verifyToken, courseController.getCourseMappings);

// Lấy types theo level - PHẢI ĐẶT TRƯỚC route /:id để tránh conflict
router.get("/types-by-level", verifyToken, courseController.getTypesByLevel);

// PLO MAPPING ROUTES - PHẢI ĐẶT TRƯỚC route /:id để tránh conflict
router.get("/:id/program-plos", verifyToken, courseController.getProgramPLOs);
router.put(
  "/:id/map-plos",
  verifyToken,
  courseController.updateCoursePLOMapping
);

// MATERIALS ROUTES - PHẢI ĐẶT TRƯỚC route /:id để tránh conflict
// Upload file tài liệu
router.post('/upload-material', verifyToken, materialUpload.single('material'), courseController.uploadMaterialFile);
// CRUD materials - cho phép thao tác bất kể trạng thái course
router.get('/:courseId/materials', verifyToken, courseController.getCourseMaterials);
router.post('/:courseId/materials', verifyToken, courseController.addCourseMaterial);
router.put('/:courseId/materials/:materialId', verifyToken, courseController.updateCourseMaterial);
router.delete('/:courseId/materials/:materialId', verifyToken, courseController.deleteCourseMaterial);

// ACTIVATION/DEACTIVATION ROUTES - PHẢI ĐẶT TRƯỚC route /:id để tránh conflict
router.get(
  "/:id/can-deactivate",
  verifyToken,
  courseController.canDeactivateCourse
);
router.patch("/:id/deactivate", verifyToken, courseController.deactivateCourse);
router.patch("/:id/activate", verifyToken, courseController.activateCourse);

//lấy chi tiết giáo trình
router.get("/:id/details", verifyToken, courseController.getCourseById);

// COURSE CRUD ROUTES (dynamic routes come after)
router.get("/", verifyToken, courseController.getAllCourses);
router.get("/:id", verifyToken, courseController.getCourseById);
router.post("/", verifyToken, courseController.createCourse);
router.put("/:id", verifyToken, courseController.updateCourse);
router.delete("/:id", verifyToken, courseController.deleteCourse);

module.exports = router;
