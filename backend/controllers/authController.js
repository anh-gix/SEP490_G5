const User = require('../models/userModel');
const Role = require('../models/roleModel');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '30d',
  });
};

// Register User
const registerUser = async (req, res) => {
  try {
    const { email, password, username, phone, address, roleId } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    // Check if username already exists
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: 'Tên người dùng đã được sử dụng' });
    }

    // Check if phone already exists
    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return res.status(400).json({ message: 'Số điện thoại đã được sử dụng' });
    }

    // Check if role exists
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(400).json({ message: 'Role not found' });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      username,
      phone,
      address,
      roleId
    });

    if (user) {
      const token = generateToken(user._id);
      user.token = token;
      await user.save();

      res.status(201).json({
        _id: user._id,
        email: user.email,
        username: user.username,
        phone: user.phone,
        address: user.address,
        roleId: user.roleId,
        token: token
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate('roleId');
    if (user && (await user.comparePassword(password))) {
      const token = generateToken(user._id);
      user.token = token;
      await user.save();

      res.json({
        _id: user._id,
        email: user.email,
        username: user.username,
        phone: user.phone,
        address: user.address,
        roleId: user.roleId,
        token: token
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get User Profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('roleId');
    if (user) {
      res.json({
        _id: user._id,
        email: user.email,
        username: user.username,
        phone: user.phone,
        address: user.address,
        roleId: user.roleId
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update User Profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is being changed and if it already exists
    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email đã được sử dụng' });
      }
    }

    // Check if username is being changed and if it already exists
    if (req.body.username && req.body.username !== user.username) {
      const usernameExists = await User.findOne({ username: req.body.username });
      if (usernameExists) {
        return res.status(400).json({ message: 'Tên người dùng đã được sử dụng' });
      }
    }

    // Check if phone is being changed and if it already exists
    if (req.body.phone && req.body.phone !== user.phone) {
      const phoneExists = await User.findOne({ phone: req.body.phone });
      if (phoneExists) {
        return res.status(400).json({ message: 'Số điện thoại đã được sử dụng' });
      }
    }

    user.email = req.body.email || user.email;
    user.username = req.body.username || user.username;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;
    user.roleId = req.body.roleId || user.roleId;

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      email: updatedUser.email,
      username: updatedUser.username,
      phone: updatedUser.phone,
      address: updatedUser.address,
      roleId: updatedUser.roleId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Logout User
const logoutUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.token = null;
      await user.save();
      res.json({ message: 'Logged out successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Change Password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword; // will be hashed by pre-save hook
    await user.save();

    return res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  logoutUser,
  changePassword
};
