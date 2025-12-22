const User = require('../models/userModel');
const Role = require('../models/roleModel');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET , {
    expiresIn: '1d',
  });
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

    // Phone can be duplicate, no need to check

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

// Gửi mã xác thực quên mật khẩu
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Vui lòng nhập email' });
    }

    // Chuẩn hóa email: trim và lowercase
    const normalizedEmail = email.trim().toLowerCase();
    console.log('Finding user with email:', normalizedEmail);

    const user = await User.findOne({ email: normalizedEmail });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      return res.status(404).json({ message: 'Email không tồn tại' });
    }

    // Tạo mã xác thực 6 chữ số
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailVerificationCode = code;
    await user.save();

    // Gửi email
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Mã đặt lại mật khẩu',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Đặt lại mật khẩu</h2>
            <p>Bạn đã yêu cầu đặt lại mật khẩu. Mã xác thực của bạn là:</p>
            <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
              ${code}
            </div>
            <p style="color: #666;">Mã này sẽ hết hiệu lực sau 15 phút.</p>
            <p style="color: #666;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
          </div>
        `
      });
      
      res.json({ message: 'Đã gửi mã đặt lại mật khẩu về email' });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Trả về mã để test (chỉ trong môi trường development)
      if (process.env.NODE_ENV === 'development') {
        return res.json({ 
          message: 'Không thể gửi email. Mã xác thực (chỉ hiển thị trong development)',
          code: code // Chỉ để test, xóa trong production
        });
      }
      throw emailError;
    }
  } catch (err) {
    res.status(500).json({ message: 'Lỗi gửi mã', error: err.message });
  }
};

// Đặt lại mật khẩu
const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    
    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }

    // Chuẩn hóa email: trim và lowercase
    const normalizedEmail = email.trim().toLowerCase();
    console.log('Resetting password for email:', normalizedEmail);

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'Email không tồn tại' });
    }

    if (user.emailVerificationCode !== code) {
      return res.status(400).json({ message: 'Mã xác thực không đúng' });
    }

    // Đặt lại mật khẩu (sẽ được hash bởi pre-save hook)
    user.password = newPassword;
    user.emailVerificationCode = undefined;
    await user.save();

    res.json({ message: 'Đặt lại mật khẩu thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi đặt lại mật khẩu', error: err.message });
  }
};

module.exports = {
  loginUser,
  getUserProfile,
  updateUserProfile,
  logoutUser,
  changePassword,
  forgotPassword,
  resetPassword
};
