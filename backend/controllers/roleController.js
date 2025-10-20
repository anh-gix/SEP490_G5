const Role = require('../models/roleModel');
const Permission = require('../models/permissionModel');

// Get All Roles
const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find({}).populate('permissionId');
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Role by ID
const getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id).populate('permissionId');
    if (role) {
      res.json(role);
    } else {
      res.status(404).json({ message: 'Role not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create Role
const createRole = async (req, res) => {
  try {
    const { name, description, permissionId } = req.body;

    // Check if role already exists
    const roleExists = await Role.findOne({ name });
    if (roleExists) {
      return res.status(400).json({ message: 'Role already exists' });
    }

    // Check if permission exists
    const permission = await Permission.findById(permissionId);
    if (!permission) {
      return res.status(400).json({ message: 'Permission not found' });
    }

    const role = await Role.create({
      name,
      description,
      permissionId
    });

    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Role
const updateRole = async (req, res) => {
  try {
    const { name, description, permissionId } = req.body;
    
    const role = await Role.findById(req.params.id);
    if (role) {
      role.name = name || role.name;
      role.description = description || role.description;
      role.permissionId = permissionId || role.permissionId;

      const updatedRole = await role.save();
      res.json(updatedRole);
    } else {
      res.status(404).json({ message: 'Role not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Role
const deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (role) {
      await Role.findByIdAndDelete(req.params.id);
      res.json({ message: 'Role deleted successfully' });
    } else {
      res.status(404).json({ message: 'Role not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole
};
