const User = require('../models/userModel');
const Role = require('../models/roleModel');

// Get All Users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).populate('roleId');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get User by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('roleId');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create User
const createUser = async (req, res) => {
  try {
    const { email, password, username, phone, address, roleId } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if username already exists
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Check if role exists
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(400).json({ message: 'Role not found' });
    }

    const user = await User.create({
      email,
      password,
      username,
      phone,
      address,
      roleId
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update User
const updateUser = async (req, res) => {
  try {
    const { email, password, username, phone, address, roleId } = req.body;
    
    const user = await User.findById(req.params.id);
    if (user) {
      user.email = email || user.email;
      user.username = username || user.username;
      user.phone = phone || user.phone;
      user.address = address || user.address;
      user.roleId = roleId || user.roleId;
      
      if (password) {
        user.password = password;
      }

      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete User
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await User.findByIdAndDelete(req.params.id);
      res.json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
