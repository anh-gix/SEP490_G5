const express = require('express');
const router = express.Router();

const courseRoute = require('./courseRoute');
const scheduleRoute = require('./scheduleRoute');
const homeworkRoutes = require('./homeworkRoutes');

router.use('/courses', courseRoute);
router.use('/schedules', scheduleRoute);
router.use('/homework', homeworkRoutes);

module.exports = router;