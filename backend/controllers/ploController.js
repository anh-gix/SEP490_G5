const PLO = require('../models/ploModel');
const Program = require('../models/programModel');

// =========================
// PLO CRUD OPERATIONS
// =========================

/**
 * Get all PLOs
 * GET /api/plos
 */
const getAllPLOs = async (req, res) => {
  try {
    const plos = await PLO.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: plos,
      count: plos.length
    });
  } catch (error) {
    console.error('Error getting PLOs:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách PLO',
      error: error.message
    });
  }
};

/**
 * Get PLO by ID
 * GET /api/plos/:id
 */
const getPLOById = async (req, res) => {
  try {
    const { id } = req.params;

    const plo = await PLO.findById(id);

    if (!plo) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy PLO'
      });
    }

    res.status(200).json({
      success: true,
      data: plo
    });
  } catch (error) {
    console.error('Error getting PLO by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin PLO',
      error: error.message
    });
  }
};

/**
 * Create new PLO
 * POST /api/plos
 */
const createPLO = async (req, res) => {
  try {
    const { code, name, detail } = req.body;

    // Validation
    if (!code || !name || !detail) {
      return res.status(400).json({
        success: false,
        message: 'Mã, tên và chi tiết PLO là bắt buộc'
      });
    }

    // Check if code already exists
    const existingPLO = await PLO.findOne({ code });
    if (existingPLO) {
      return res.status(400).json({
        success: false,
        message: 'Mã PLO đã tồn tại'
      });
    }

    const plo = await PLO.create({
      code,
      name,
      detail
    });

    res.status(201).json({
      success: true,
      message: 'Tạo PLO thành công',
      data: plo
    });
  } catch (error) {
    console.error('Error creating PLO:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo PLO',
      error: error.message
    });
  }
};

/**
 * Create multiple PLOs at once
 * POST /api/plos/bulk
 */
const createBulkPLOs = async (req, res) => {
  try {
    const { plos } = req.body;

    if (!Array.isArray(plos) || plos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Danh sách PLOs không hợp lệ'
      });
    }

    // Validate each PLO
    for (const plo of plos) {
      if (!plo.code || !plo.name || !plo.detail) {
        return res.status(400).json({
          success: false,
          message: 'Mỗi PLO phải có đầy đủ mã, tên và chi tiết'
        });
      }
    }

    // Check for duplicate codes in request
    const codes = plos.map(p => p.code);
    const duplicatesInRequest = codes.filter((code, index) => codes.indexOf(code) !== index);
    if (duplicatesInRequest.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Có mã PLO bị trùng trong danh sách: ${duplicatesInRequest.join(', ')}`
      });
    }

    // Check for existing codes in database
    const existingPLOs = await PLO.find({ code: { $in: codes } });
    if (existingPLOs.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Các mã PLO sau đã tồn tại: ${existingPLOs.map(p => p.code).join(', ')}`
      });
    }

    const createdPLOs = await PLO.insertMany(plos);

    res.status(201).json({
      success: true,
      message: `Tạo thành công ${createdPLOs.length} PLOs`,
      data: createdPLOs
    });
  } catch (error) {
    console.error('Error creating bulk PLOs:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo danh sách PLO',
      error: error.message
    });
  }
};

/**
 * Update PLO
 * PUT /api/plos/:id
 */
const updatePLO = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, detail } = req.body;

    const plo = await PLO.findById(id);
    if (!plo) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy PLO'
      });
    }

    // Check if new code already exists (if code is being changed)
    if (code && code !== plo.code) {
      const existingPLO = await PLO.findOne({ code });
      if (existingPLO) {
        return res.status(400).json({
          success: false,
          message: 'Mã PLO đã tồn tại'
        });
      }
    }

    // Update fields
    if (code) plo.code = code;
    if (name) plo.name = name;
    if (detail !== undefined) plo.detail = detail;

    await plo.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật PLO thành công',
      data: plo
    });
  } catch (error) {
    console.error('Error updating PLO:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật PLO',
      error: error.message
    });
  }
};

/**
 * Delete PLO
 * DELETE /api/plos/:id
 */
const deletePLO = async (req, res) => {
  try {
    const { id } = req.params;

    const plo = await PLO.findById(id);
    if (!plo) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy PLO'
      });
    }

    // Check if PLO is being used in any program
    const programCount = await Program.countDocuments({ plos: id });
    if (programCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa PLO đang được sử dụng trong chương trình'
      });
    }

    await PLO.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Xóa PLO thành công'
    });
  } catch (error) {
    console.error('Error deleting PLO:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa PLO',
      error: error.message
    });
  }
};

module.exports = {
  getAllPLOs,
  getPLOById,
  createPLO,
  createBulkPLOs,
  updatePLO,
  deletePLO
};