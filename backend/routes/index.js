const express = require('express');
const router = express.Router();

const courseRoute = require('./courseRoute');
const scheduleRoute = require('./scheduleRoute');

router.use('/courses', courseRoute);
router.use('/schedules', scheduleRoute);

module.exports = router;