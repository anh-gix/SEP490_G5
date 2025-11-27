const express = require('express');
const router = express.Router();
const cloController = require('../controllers/cloController');

// CLO CRUD ROUTES
router.get('/', cloController.getAllCLOs);
router.get('/:id', cloController.getCLOById);
router.post('/', cloController.createCLO);
router.post('/bulk', cloController.createBulkCLOs);
router.put('/:id', cloController.updateCLO);
router.delete('/:id', cloController.deleteCLO);

// CLO-PLO MAPPING
router.post('/:id/map-plos', cloController.mapCLOtoPLOs);

module.exports = router;