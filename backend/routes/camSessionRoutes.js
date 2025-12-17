const express = require('express');
const router = express.Router();
const camSessionController = require('../controllers/camSessionController');
const { uploadVideo, uploadImage } = require('../middlewares/onlineLearningUpload');

// FILE UPLOAD ROUTES (must be before /:id routes)
router.post('/upload/video', uploadVideo.single('video'), camSessionController.uploadVideoFile);
router.post('/upload/image', uploadImage.single('image'), camSessionController.uploadImageFile);

// CAM SESSION CRUD ROUTES
router.get('/', camSessionController.getAllCamSessions);
router.get('/:id', camSessionController.getCamSessionById);
router.post('/', camSessionController.createCamSession);
router.put('/:id', camSessionController.updateCamSession);
router.delete('/:id', camSessionController.deleteCamSession);

// Get cam sessions by course ID
router.get('/course/:courseId', camSessionController.getCamSessionsByCourseId);

module.exports = router;

