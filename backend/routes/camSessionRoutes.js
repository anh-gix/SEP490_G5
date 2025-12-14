const express = require('express');
const router = express.Router();
const camSessionController = require('../controllers/camSessionController');

// CAM SESSION CRUD ROUTES
router.get('/', camSessionController.getAllCamSessions);
router.get('/:id', camSessionController.getCamSessionById);
router.post('/', camSessionController.createCamSession);
router.put('/:id', camSessionController.updateCamSession);
router.delete('/:id', camSessionController.deleteCamSession);

// Get cam sessions by course ID
router.get('/course/:courseId', camSessionController.getCamSessionsByCourseId);

module.exports = router;

