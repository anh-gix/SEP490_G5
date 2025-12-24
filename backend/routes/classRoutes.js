const express = require("express");
const router = express.Router();
const classController = require("../controllers/classController");
const { verifyToken } = require("../middlewares/verifyToken");

// Class routes
router.get("/stats", verifyToken, classController.getClassStats);
router.get("/", verifyToken, classController.getAllClasses);
router.post(
  "/validate-conflicts",
  verifyToken,
  classController.validateClassConflicts
);
router.post(
  "/:id/check-teacher-room-conflicts",
  verifyToken,
  classController.checkTeacherRoomConflicts
);
router.get("/:id", verifyToken, classController.getClassById);
router.post("/", verifyToken, classController.createClass);
router.put("/:id", verifyToken, classController.updateClass);
router.delete("/:id", verifyToken, classController.deleteClass);

module.exports = router;
