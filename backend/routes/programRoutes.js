const express = require('express');
const router = express.Router();
const programController = require('../controllers/programController');



// PROGRAM CRUD ROUTES

router.get('/', programController.getAllPrograms);
router.get('/:id', programController.getProgramById);
router.post('/', programController.createProgram);
router.put('/:id', programController.updateProgram);
router.delete('/:id', programController.deleteProgram);


// PROGRAM PLOs ROUTES
router.get('/:id/plos', programController.getProgramPLOs);

module.exports = router;
