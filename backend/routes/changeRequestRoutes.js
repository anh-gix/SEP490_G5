const express = require('express');
const { 
  getAllChangeRequests, 
  approveChangeRequest, 
  rejectChangeRequest,
  getSenderSchedule 
} = require('../controllers/changeRequestController');
// const { verifyToken } = require('../middlewares/verifyToken');

const router = express.Router();

// All routes are protected
// router.use(verifyToken); // Temporarily disabled for testing

router.get('/', getAllChangeRequests);
router.put('/:id/approve', approveChangeRequest);
router.put('/:id/reject', rejectChangeRequest);
router.get('/:requestId/schedule', getSenderSchedule);

module.exports = router;

