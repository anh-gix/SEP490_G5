const express = require('express');
const { getAllRoles, getRoleById, createRole, updateRole, deleteRole } = require('../controllers/roleController');
// const { verifyToken } = require('../middlewares/verifyToken');

const router = express.Router();

// TEMPORARY: Authentication disabled for testing
// All routes are protected
// router.use(verifyToken);

router.get('/', getAllRoles);
router.get('/:id', getRoleById);
router.post('/', createRole);
router.put('/:id', updateRole);
router.delete('/:id', deleteRole);

module.exports = router;
