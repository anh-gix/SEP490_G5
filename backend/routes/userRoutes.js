const express = require('express');
const { getAllUsers, getUserById, createUser, updateUser, deleteUser, getUsersByRoles } = require('../controllers/userController');
const { verifyToken } = require('../middlewares/verifyToken');

const router = express.Router();

// All routes are protected
router.use(verifyToken);

// Get users by roles (must be before /:id route)
router.get('/by-roles', getUsersByRoles);

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
