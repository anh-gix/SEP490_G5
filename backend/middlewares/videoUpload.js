const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Upload directory for tips videos
const uploadsDir = path.join(__dirname, '../uploads/tips');

// Create directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Tips uploads directory created:', uploadsDir);
} else {
  console.log('Tips uploads directory already exists:', uploadsDir);
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `tip-video-${uniqueSuffix}${ext}`);
  }
});

// File filter to accept only video files
const fileFilter = (req, file, cb) => {
  // Accept video files and YouTube URLs (when no file uploaded)
  const allowedVideoTypes = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm', '.m4v'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedVideoTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Chỉ chấp nhận file video: ${allowedVideoTypes.join(', ')}`), false);
  }
};

// Multer upload configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

module.exports = upload;
