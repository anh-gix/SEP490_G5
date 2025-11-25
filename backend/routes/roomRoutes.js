const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

// Room CRUD
router.get('/', roomController.getAllRooms);
router.get('/stats', roomController.getRoomStats);
router.get('/:id', roomController.getRoomById);
router.get('/:id/schedule', roomController.getRoomSchedule);
router.post('/', roomController.createRoom);
router.put('/:id', roomController.updateRoom);
router.delete('/:id', roomController.deleteRoom);

module.exports = router;
