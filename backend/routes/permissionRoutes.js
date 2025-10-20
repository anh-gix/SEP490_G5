const express = require('express');
const { getAllPermissions, getPermissionById, createPermission, updatePermission, deletePermission } = require('../controllers/permissionController');
const { verifyToken } = require('../middlewares/verifyToken');

const router = express.Router();

// All routes are protected
router.use(verifyToken);

router.get('/', getAllPermissions);
router.get('/:id', getPermissionById);
router.post('/', createPermission);
router.put('/:id', updatePermission);
router.delete('/:id', deletePermission);

module.exports = router;
