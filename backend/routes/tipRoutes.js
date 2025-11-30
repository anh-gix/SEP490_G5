const express = require('express');
const router = express.Router();
const tipController = require('../controllers/tipController');
const { verifyToken } = require('../middlewares/verifyToken');

// ==========================================
// PUBLIC ROUTES (không cần authentication)
// ==========================================

// Get all tips (có thể filter theo section)
router.get('/', tipController.getAllTips);

// Get tips by section (General, Toeic, Ielts)
router.get('/section/:section', tipController.getTipsBySection);

// Get tips statistics
router.get('/statistics', tipController.getTipsStatistics);

// ==========================================
// ADMIN ROUTES (cần authentication - thêm sau)
// ==========================================

// Create new tip
// router.post('/', verifyToken, tipController.createTip);

// Update tip
// router.put('/:id', verifyToken, tipController.updateTip);

// Delete tip
// router.delete('/:id', verifyToken, tipController.deleteTip);

module.exports = router;
