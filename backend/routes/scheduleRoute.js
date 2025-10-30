const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');


router.get('/pending', scheduleController.getPendingSchedules);


router.patch('/:id/approve', scheduleController.approveSchedule);


router.patch('/:id/reject', scheduleController.rejectSchedule);

module.exports = router;

