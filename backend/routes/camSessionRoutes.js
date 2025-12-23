const express = require("express");
const router = express.Router();
const camSessionController = require("../controllers/camSessionController");
const {
  uploadVideo,
  uploadImage,
} = require("../middlewares/onlineLearningUpload");
const { verifyToken } = require("../middlewares/verifyToken");

// FILE UPLOAD ROUTES (must be before /:id routes)
router.post(
  "/upload/video",
  verifyToken,
  uploadVideo.single("video"),
  camSessionController.uploadVideoFile
);
router.post(
  "/upload/image",
  verifyToken,
  uploadImage.single("image"),
  camSessionController.uploadImageFile
);

// CAM SESSION CRUD ROUTES
router.get("/", verifyToken, camSessionController.getAllCamSessions);
router.get("/:id", verifyToken, camSessionController.getCamSessionById);
router.post("/", verifyToken, camSessionController.createCamSession);
router.put("/:id", verifyToken, camSessionController.updateCamSession);
router.delete("/:id", verifyToken, camSessionController.deleteCamSession);

// Get cam sessions by course ID
router.get(
  "/course/:courseId",
  verifyToken,
  camSessionController.getCamSessionsByCourseId
);

module.exports = router;
