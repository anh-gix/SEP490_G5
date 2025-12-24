const express = require('express');
const router = express.Router();
const tipController = require('../controllers/tipController');
const { verifyToken} = require('../middlewares/verifyToken');
const videoUpload = require('../middlewares/videoUpload');


// Get all tips (có thể filter theo section)
router.get('/',verifyToken,  tipController.getAllTips);

// Get tips by section (General, Toeic, Ielts)
router.get('/section/:section',verifyToken, tipController.getTipsBySection);

// Get tips statistics
router.get('/statistics', verifyToken, tipController.getTipsStatistics);

// Create new tip
router.post('/', verifyToken, tipController.createTip);

// Update tip
router.put('/:id', verifyToken, tipController.updateTip);

// Delete tip
router.delete('/:id', verifyToken, tipController.deleteTip);


// Add video to category (supports both YouTube URL and file upload)
router.post(
  '/:section/videos',
  verifyToken,
  videoUpload.single('video'),
  tipController.addVideoToCategory
);

// Update video
router.put(
  '/:section/videos/:videoId',
  verifyToken,
  videoUpload.single('video'),
  tipController.updateVideo
);

// Delete video
router.delete(
  '/:section/videos/:videoId',
  verifyToken,
  tipController.deleteVideo
);

module.exports = router;
