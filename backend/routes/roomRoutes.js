const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const { verifyToken } = require("../middlewares/verifyToken");

// Room CRUD
router.get("/", verifyToken, roomController.getAllRooms);
router.get("/stats", verifyToken, roomController.getRoomStats);
router.get("/today-usage", verifyToken, roomController.getTodayRoomUsage);
router.get("/:id", verifyToken, roomController.getRoomById);
router.get("/:id/schedule", verifyToken, roomController.getRoomSchedule);
router.post("/", verifyToken, roomController.createRoom);
router.put("/:id", verifyToken, roomController.updateRoom);
router.delete("/:id", verifyToken, roomController.deleteRoom);

module.exports = router;
