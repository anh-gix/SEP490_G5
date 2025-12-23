const express = require('express');
const router = express.Router();
const programController = require('../controllers/programController');

// PROGRAM CRUD ROUTES
router.get('/', programController.getAllPrograms);
router.get('/my-programs', programController.getMyPrograms);
router.get('/:id', programController.getProgramById);
router.post('/', programController.createProgram);
router.put('/:id', programController.updateProgram);
router.delete('/:id', programController.deleteProgram);

// PROGRAM PLOs ROUTES
router.get('/:id/plos', programController.getProgramPLOs);

// PROGRAM HELPER ROUTES
router.get('/band-options/:type', programController.getBandOptions);  // Must be before /:id routes
router.get('/:id/submission-status', programController.getProgramSubmissionStatus);

// PROGRAM MANAGEMENT ROUTES
// NOTE: Submit/Approve/Reject are now handled by /api/work-requests routes
router.patch('/:id/active', programController.updateProgramActiveStatus); // Set isActive (body: { isActive: boolean })
router.patch('/:id/archive', programController.archiveProgram);

module.exports = router;
