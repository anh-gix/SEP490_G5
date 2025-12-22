const express = require('express');
const router = express.Router();
const programController = require('../controllers/programController');

// PROGRAM HELPER ROUTES (must be before :id routes to avoid conflicts)
router.get('/band-options/:type', programController.getBandOptions);

// PROGRAM CRUD ROUTES
router.get('/', programController.getAllPrograms);
router.get('/my-programs', programController.getMyPrograms);
router.get('/:id', programController.getProgramById);
router.post('/', programController.createProgram);
router.put('/:id', programController.updateProgram);
router.delete('/:id', programController.deleteProgram);

// PROGRAM PLOs ROUTES
router.get('/:id/plos', programController.getProgramPLOs);
router.get('/:id/submission-status', programController.getProgramSubmissionStatus);

// PROGRAM MANAGEMENT ROUTES
// NOTE: Submit/Approve/Reject are now handled by /api/work-requests routes
router.patch('/:id/active', programController.updateProgramActiveStatus); // Set isActive (body: { isActive: boolean })
router.patch('/:id/archive', programController.archiveProgram);

// PROGRAM ACTIVATION/DEACTIVATION ROUTES (với check logic)
router.get('/:id/can-deactivate', programController.canDeactivateProgram);
router.patch('/:id/deactivate', programController.deactivateProgram);
router.patch('/:id/activate', programController.activateProgram);

module.exports = router;
