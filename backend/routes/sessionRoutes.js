const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

// SESSION CRUD ROUTES
router.get('/', sessionController.getAllSessions);
router.get('/:id', sessionController.getSessionById);
router.post('/', sessionController.createSession);
router.put('/:id', sessionController.updateSession);
router.delete('/:id', sessionController.deleteSession);

// Get sessions by course ID
router.get('/course/:courseId', sessionController.getSessionsByCourseId);

module.exports = router;
