const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const userController = require('../controllers/userController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Đảm bảo thư mục uploads tồn tại
const uploadsDir = path.join(__dirname, '../uploads');
console.log('Uploads directory path:', uploadsDir);
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory:', uploadsDir);
  } catch (error) {
    console.error('Error creating uploads directory:', error);
  }
} else {
  console.log('Uploads directory already exists:', uploadsDir);
}

// Cấu hình multer để upload file Excel
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir); // Thư mục lưu file tạm
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'excel-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Chỉ chấp nhận file Excel
  const allowedTypes = ['.xlsx', '.xls'];
  const allowedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/excel',
    'application/x-excel',
    'application/x-msexcel'
  ];
  
  const ext = path.extname(file.originalname).toLowerCase();
  const isValidExt = allowedTypes.includes(ext);
  const isValidMime = allowedMimeTypes.includes(file.mimetype);
  
  if (isValidExt || isValidMime) {
    cb(null, true);
  } else {
    cb(new Error(`Chỉ chấp nhận file Excel (.xlsx, .xls). File của bạn: ${file.mimetype} ${ext}`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Routes cho schedule
router.get('/pending', scheduleController.getPendingSchedules);
router.patch('/:id/approve', scheduleController.approveSchedule);
router.patch('/:id/reject', scheduleController.rejectSchedule);

// Routes cho bulk user upload
router.post('/bulk-users/upload', (req, res, next) => {
  upload.single('excelFile')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ 
        message: err.message || 'Lỗi khi upload file',
        error: err.message 
      });
    }
    next();
  });
}, userController.uploadExcel);
router.post('/bulk-users/save', userController.saveBulkUsers);

module.exports = router;

