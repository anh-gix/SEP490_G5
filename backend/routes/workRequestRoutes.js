const express = require('express');
const router = express.Router();
const workRequestController = require('../controllers/workRequestController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tạo thư mục uploads/work-requests nếu chưa có
const uploadsDir = path.join(__dirname, '../uploads/work-requests');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Config multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const prefix = file.fieldname === 'inputFile' ? 'input' : 
                   file.fieldname === 'attachmentFile' ? 'attachment' : 'output';
    cb(null, `${prefix}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.xlsx', '.xls', '.csv', '.pdf', '.doc', '.docx', '.zip', '.rar'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Middleware for creating work request (multiple file fields)
const uploadWorkRequestFiles = upload.fields([
  { name: 'inputFile', maxCount: 1 },
  { name: 'attachmentFile', maxCount: 1 }
]);

router.get('/stats', workRequestController.getWorkRequestStats);

// Create top-down work request (task assignment)
router.post(
  '/create',
  uploadWorkRequestFiles,
  workRequestController.createTopDownRequest
);

// Submit program for approval
router.post(
  '/submit/program/:programId',
  workRequestController.submitProgram
);

// Submit exam for approval
router.post(
  '/submit/exam/:examId',
  workRequestController.submitExam
);

// Get all work requests with filters
router.get(
  '/',
  workRequestController.getAllRequests
);

// Get my submitted requests
router.get(
  '/my-requests',
  workRequestController.getMyRequests
);

// Get requests assigned to me
router.get(
  '/assigned-to-me',
  workRequestController.getAssignedToMe
);

// Get work request statistics
router.get(
  '/stats',
  workRequestController.getStats
);

// Get request by ID
router.get(
  '/:id',
  workRequestController.getRequestById
);

router.post(
  '/:id/approve',
  workRequestController.approveRequest
);


router.post(
  '/:id/reject',
  workRequestController.rejectRequest
);


router.post(
  '/:id/revoke',
  workRequestController.revokeApproval
);

router.delete(
  '/:id/cancel',
  workRequestController.cancelRequest
);


router.post(
  '/:id/start-processing',
  workRequestController.startProcessing
);

router.post(
  '/:id/upload-output',
  upload.single('outputFile'),
  workRequestController.uploadOutputFile
);

router.post(
  '/:id/complete',
  workRequestController.completeRequest
);

module.exports = router;