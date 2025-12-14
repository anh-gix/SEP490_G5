const express = require('express');
const { 
  getAllChangeRequests, 
  getSenderSchedule,
  createChangeRequest,
  getStats
} = require('../controllers/changeRequestController');
const { verifyToken } = require('../middlewares/verifyToken');

const router = express.Router();

// All routes are protected
// router.use(verifyToken); // Temporarily disabled for testing

router.get('/stats', getStats);
router.get('/', getAllChangeRequests);
router.post('/', verifyToken, createChangeRequest);
router.get('/:requestId/schedule', getSenderSchedule);

module.exports = router;

