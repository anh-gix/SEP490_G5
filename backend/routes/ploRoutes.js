const express = require('express');
const router = express.Router();
const ploController = require('../controllers/ploController');

// PLO CRUD ROUTES
router.get('/', ploController.getAllPLOs);
router.get('/:id', ploController.getPLOById);
router.post('/', ploController.createPLO);
router.post('/bulk', ploController.createBulkPLOs);
router.put('/:id', ploController.updatePLO);
router.delete('/:id', ploController.deletePLO);

module.exports = router;