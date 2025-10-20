const Permission = require('../models/permissionModel');

// Get All Permissions
const getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find({});
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Permission by ID
const getPermissionById = async (req, res) => {
  try {
    const permission = await Permission.findById(req.params.id);
    if (permission) {
      res.json(permission);
    } else {
      res.status(404).json({ message: 'Permission not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create Permission
const createPermission = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if permission already exists
    const permissionExists = await Permission.findOne({ name });
    if (permissionExists) {
      return res.status(400).json({ message: 'Permission already exists' });
    }

    const permission = await Permission.create({
      name,
      description
    });

    res.status(201).json(permission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Permission
const updatePermission = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const permission = await Permission.findById(req.params.id);
    if (permission) {
      permission.name = name || permission.name;
      permission.description = description || permission.description;

      const updatedPermission = await permission.save();
      res.json(updatedPermission);
    } else {
      res.status(404).json({ message: 'Permission not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Permission
const deletePermission = async (req, res) => {
  try {
    const permission = await Permission.findById(req.params.id);
    if (permission) {
      await Permission.findByIdAndDelete(req.params.id);
      res.json({ message: 'Permission deleted successfully' });
    } else {
      res.status(404).json({ message: 'Permission not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission
};
