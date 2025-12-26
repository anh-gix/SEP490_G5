const User = require('../models/userModel');
const Role = require('../models/roleModel');
const XLSX = require('xlsx');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

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

    // Validate phone number length (10 digits only)
    // Allow duplicate phone numbers
    let normalizedPhone = phone || '';
    if (phone) {
      const phoneDigits = phone.replace(/\D/g, '');
      // Validate BEFORE adding leading zero
      if (phoneDigits.length === 0) {
        return res.status(400).json({ 
          message: 'Số điện thoại không được để trống' 
        });
      }
      
      if (phoneDigits[0] === '0') {
        // Has leading zero: must be exactly 10 digits
        if (phoneDigits.length !== 10) {
          return res.status(400).json({ 
            message: 'Số điện thoại phải có 10 chữ số' 
          });
        }
        normalizedPhone = phoneDigits;
      } else {
        // No leading zero (Excel removed it): must be exactly 9 digits
        if (phoneDigits.length !== 9) {
          return res.status(400).json({ 
            message: 'Số điện thoại phải có 9 chữ số (thiếu số 0 ở đầu do Excel)' 
          });
        }
        // Add leading zero to normalize to 10 digits
        normalizedPhone = '0' + phoneDigits;
      }
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
      phone: normalizedPhone,
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
    const { email, password, username, phone, address, roleId, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (user) {
      user.email = email || user.email;
      user.username = username || user.username;
      user.phone = phone || user.phone;
      user.address = address || user.address;
      user.roleId = roleId || user.roleId;

      // Cập nhật isActive nếu được truyền vào (cho phép cả true và false)
      if (typeof isActive === 'boolean') {
        user.isActive = isActive;
      }

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

const uploadExcel = async (req, res) => {
  let filePath = null;
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không có file được upload' });
    }

    filePath = req.file.path;
    
    // Kiểm tra file có tồn tại không
    if (!fs.existsSync(filePath)) {
      return res.status(400).json({ message: 'File không tồn tại trên server' });
    }

    console.log('Reading file from path:', filePath);
    console.log('File size:', req.file.size);
    console.log('File mimetype:', req.file.mimetype);

    // Đọc file Excel
    let workbook;
    try {
      workbook = XLSX.readFile(filePath);
    } catch (readError) {
      console.error('Error reading Excel file:', readError);
      // Xóa file nếu đọc lỗi
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(400).json({ 
        message: 'Không thể đọc file Excel. Vui lòng kiểm tra định dạng file.',
        error: readError.message 
      });
    }

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      // Xóa file nếu không có sheet
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(400).json({ message: 'File Excel không có sheet nào' });
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    if (!worksheet) {
      // Xóa file nếu không có worksheet
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(400).json({ message: 'Sheet đầu tiên không có dữ liệu' });
    }

    const data = XLSX.utils.sheet_to_json(worksheet);

    // Xóa file sau khi đọc thành công
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (unlinkError) {
      console.error('Error deleting file:', unlinkError);
      // Không trả về lỗi nếu xóa file thất bại
    }

    if (!data || data.length === 0) {
      return res.status(400).json({ message: 'File Excel không có dữ liệu' });
    }

    // Validate và format dữ liệu
    const users = [];
    const errors = [];

    data.forEach((row, index) => {
      const rowNumber = index + 2; // +2 vì có header và index bắt đầu từ 0
      const errorsInRow = [];

      // Lấy dữ liệu từ Excel (hỗ trợ cả tiếng Việt và tiếng Anh)
      const email = row.email || row.Email || row['Email'] || '';
      const username = row.username || row.Username || row['Tên đăng nhập'] || '';
      const phone = row.phone || row.Phone || row['Số điện thoại'] || row['Điện thoại'] || '';
      const address = row.address || row.Address || row['Địa chỉ'] || '';

      // Validate
      if (!email || !email.trim()) {
        errorsInRow.push('Email không được để trống');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errorsInRow.push('Email không hợp lệ');
      }

      if (!username || !username.trim()) {
        errorsInRow.push('Username không được để trống');
      }

      if (!phone || !phone.trim()) {
        errorsInRow.push('Số điện thoại không được để trống');
      }

      if (!address || !address.trim()) {
        errorsInRow.push('Địa chỉ không được để trống');
      }

      if (errorsInRow.length > 0) {
        errors.push({
          row: rowNumber,
          errors: errorsInRow,
          data: { email, username, phone, address }
        });
      } else {
        users.push({
          email: email.trim().toLowerCase(),
          username: username.trim(),
          phone: phone.toString().trim(),
          address: address.trim(),
          // Password và roleId sẽ được thêm sau
        });
      }
    });

    // Kiểm tra trùng lặp trong file
    const emailSet = new Set();
    const usernameSet = new Set();
    const duplicates = [];

    users.forEach((user, index) => {
      if (emailSet.has(user.email)) {
        duplicates.push(`Dòng ${index + 2}: Email ${user.email} bị trùng trong file`);
      } else {
        emailSet.add(user.email);
      }

      if (usernameSet.has(user.username)) {
        duplicates.push(`Dòng ${index + 2}: Username ${user.username} bị trùng trong file`);
      } else {
        usernameSet.add(user.username);
      }
    });

    res.status(200).json({
      message: 'Đọc file Excel thành công',
      total: users.length,
      users: users,
      errors: errors,
      duplicates: duplicates,
      hasErrors: errors.length > 0 || duplicates.length > 0
    });
  } catch (error) {
    console.error('Error uploading Excel:', error);
    console.error('Error stack:', error.stack);
    
    // Xóa file nếu có lỗi và file vẫn còn
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkError) {
        console.error('Error deleting file after error:', unlinkError);
      }
    }

    res.status(500).json({ 
      message: 'Lỗi khi đọc file Excel', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// =========================
// 💾 LƯU CÁC TÀI KHOẢN VÀO DATABASE
// =========================
const saveBulkUsers = async (req, res) => {
  try {
    const { users, roleId } = req.body;

    if (!users || !Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ message: 'Danh sách người dùng không hợp lệ' });
    }

    if (!roleId) {
      return res.status(400).json({ message: 'Vui lòng chọn role' });
    }

    // Kiểm tra role có tồn tại không
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(400).json({ message: 'Role không tồn tại' });
    }

    const results = {
      success: [],
      failed: []
    };

    // Tạo password ngẫu nhiên cho mỗi user
    const generatePassword = () => {
      const length = 8;
      const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      return Array.from(crypto.randomBytes(length))
        .map(x => charset[x % charset.length])
        .join('');
    };

    // Xử lý từng user
    for (let i = 0; i < users.length; i++) {
      const userData = users[i];
      
      try {
        // Kiểm tra email đã tồn tại chưa
        const existingEmail = await User.findOne({ email: userData.email });
        if (existingEmail) {
          results.failed.push({
            email: userData.email,
            username: userData.username,
            phone: userData.phone || '',
            reason: 'Email đã tồn tại trong hệ thống'
          });
          continue;
        }

        // Validate phone number length (10 digits only)
        let normalizedPhone = userData.phone || '';
        if (userData.phone) {
          const phoneDigits = userData.phone.replace(/\D/g, '');
          // Validate BEFORE adding leading zero
          if (phoneDigits.length === 0) {
            results.failed.push({
              email: userData.email,
              username: userData.username,
              phone: userData.phone || '',
              reason: 'Số điện thoại không được để trống'
            });
            continue;
          }
          
          if (phoneDigits[0] === '0') {
            // Has leading zero: must be exactly 10 digits
            if (phoneDigits.length !== 10) {
              results.failed.push({
                email: userData.email,
                username: userData.username,
                phone: userData.phone || '',
                reason: 'Số điện thoại phải có 10 chữ số'
              });
              continue;
            }
            normalizedPhone = phoneDigits;
          } else {
            // No leading zero (Excel removed it): must be exactly 9 digits
            if (phoneDigits.length !== 9) {
              results.failed.push({
                email: userData.email,
                username: userData.username,
                phone: userData.phone || '',
                reason: 'Số điện thoại phải có 9 chữ số (thiếu số 0 ở đầu do Excel)'
              });
              continue;
            }
            // Add leading zero to normalize to 10 digits
            normalizedPhone = '0' + phoneDigits;
          }
        }

        // Kiểm tra phone number đã tồn tại chưa
        if (normalizedPhone) {
          const existingPhone = await User.findOne({ phone: normalizedPhone });
          if (existingPhone) {
            results.failed.push({
              email: userData.email,
              username: userData.username,
              phone: normalizedPhone,
              reason: 'Số điện thoại đã tồn tại trong hệ thống'
            });
            continue;
          }
        }

        // Sử dụng password từ frontend nếu có, nếu không thì generate mới
        const password = userData.password || generatePassword();

        // Tạo user mới
        const newUser = await User.create({
          email: userData.email,
          username: userData.username,
          phone: normalizedPhone,
          address: userData.address,
          password: password, // Sẽ được hash tự động bởi pre-save hook
          roleId: roleId
        });

        results.success.push({
          _id: newUser._id,
          email: newUser.email,
          username: newUser.username,
          phone: newUser.phone,
          address: newUser.address,
          password: password // Trả về password để hiển thị cho user
        });
      } catch (error) {
        results.failed.push({
          email: userData.email,
          username: userData.username,
          phone: userData.phone || '',
          reason: error.message || 'Lỗi không xác định'
        });
      }
    }

    res.status(200).json({
      message: `Đã tạo ${results.success.length} tài khoản thành công, ${results.failed.length} tài khoản thất bại`,
      total: users.length,
      success: results.success.length,
      failed: results.failed.length,
      results: results
    });
  } catch (error) {
    console.error('Error saving bulk users:', error);
    res.status(500).json({ 
      message: 'Lỗi khi lưu tài khoản', 
      error: error.message 
    });
  }
};

// Get users by roles
const getUsersByRoles = async (req, res) => {
  try {
    const { roles } = req.query; 
    
    if (!roles) {
      return res.status(400).json({
        success: false,
        message: 'roles query parameter is required'
      });
    }

    // Parse roles
    const roleNames = roles.split(',').map(r => r.trim());
    
    // Find role IDs
    const roleObjects = await Role.find({ name: { $in: roleNames } });
    
    if (roleObjects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No matching roles found',
        searchedRoles: roleNames
      });
    }

    const roleIds = roleObjects.map(r => r._id);
    
    // Get users with these roles
    const users = await User.find({ roleId: { $in: roleIds } })
      .select('_id username email phone roleId')
      .populate('roleId', 'name')
      .sort({ username: 1 })
      .lean();
    
    // Transform to include role name
    const usersWithRole = users.map(user => ({
      _id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.roleId?.name || 'Unknown'
    }));

    res.status(200).json({
      success: true,
      data: usersWithRole,
      count: usersWithRole.length
    });
  } catch (error) {
    console.error('Error getting users by roles:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  uploadExcel,
  saveBulkUsers,
  getUsersByRoles
};
