const express = require("express");
const router = express.Router();
const sessionController = require("../controllers/sessionController");
const { verifyToken } = require("../middlewares/verifyToken");

// SESSION CRUD ROUTES
router.get("/", verifyToken, sessionController.getAllSessions);
router.get("/:id", verifyToken, sessionController.getSessionById);
router.post("/", verifyToken, sessionController.createSession);
router.put("/:id", verifyToken, sessionController.updateSession);
router.delete("/:id", verifyToken, sessionController.deleteSession);

// Get sessions by course ID
router.get(
  "/course/:courseId",
  verifyToken,
  sessionController.getSessionsByCourseId
);

module.exports = router;
