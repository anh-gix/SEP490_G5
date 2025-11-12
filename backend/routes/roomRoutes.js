const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');


// ROOM CRUD
router.get('/',  roomController.getAllRooms);
router.get('/:id',  roomController.getRoomById);
router.post('/',   roomController.createRoom);
router.put('/:id',  roomController.updateRoom);
router.delete('/:id',  roomController.deleteRoom);

// ROOM STATUS & USAGE ROUTES
router.put('/:id/status', roomController.updateRoomStatus);
router.get('/:id/usage', roomController.getRoomUsage);
module.exports = router;
