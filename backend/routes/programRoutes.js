const express = require("express");
const router = express.Router();
const programController = require("../controllers/programController");
const { verifyToken } = require("../middlewares/verifyToken");

// PROGRAM HELPER ROUTES (must be before :id routes to avoid conflicts)
router.get(
  "/band-options/:type",
  verifyToken,
  programController.getBandOptions
);

// PROGRAM CRUD ROUTES
router.get("/", verifyToken, programController.getAllPrograms);
router.get("/my-programs", verifyToken, programController.getMyPrograms);
router.get("/:id", verifyToken, programController.getProgramById);
router.post("/", verifyToken, programController.createProgram);
router.put("/:id", verifyToken, programController.updateProgram);
router.delete("/:id", verifyToken, programController.deleteProgram);

// PROGRAM PLOs ROUTES
router.get("/:id/plos", verifyToken, programController.getProgramPLOs);
router.get(
  "/:id/submission-status",
  verifyToken,
  programController.getProgramSubmissionStatus
);

// PROGRAM MANAGEMENT ROUTES
// NOTE: Submit/Approve/Reject are now handled by /api/work-requests routes
router.patch(
  "/:id/active",
  verifyToken,
  programController.updateProgramActiveStatus
); // Set isActive (body: { isActive: boolean })
router.patch("/:id/archive", verifyToken, programController.archiveProgram);

// PROGRAM ACTIVATION/DEACTIVATION ROUTES (với check logic)
router.get(
  "/:id/can-deactivate",
  verifyToken,
  programController.canDeactivateProgram
);
router.patch(
  "/:id/deactivate",
  verifyToken,
  programController.deactivateProgram
);
router.patch("/:id/activate", verifyToken, programController.activateProgram);

module.exports = router;
