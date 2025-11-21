const express = require('express');
const router = express.Router();

const courseRoute = require('./courseRoute');
const scheduleRoute = require('./scheduleRoute');
const sessionRoutes = require('./sessionRoutes');

router.use('/courses', courseRoute);
router.use('/schedules', scheduleRoute);
router.use('/sessions', sessionRoutes);

module.exports = router;