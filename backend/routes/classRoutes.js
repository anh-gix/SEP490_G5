const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');

// Class routes
router.get('/stats', classController.getClassStats);
router.get('/', classController.getAllClasses);
router.post('/validate-conflicts', classController.validateClassConflicts);
router.get('/:id', classController.getClassById);
router.post('/', classController.createClass);
router.put('/:id', classController.updateClass);
router.delete('/:id', classController.deleteClass);

module.exports = router;
