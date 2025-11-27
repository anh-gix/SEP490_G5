const CLO = require('../models/cloModel');
const Course = require('../models/courseModel');
const PLO = require('../models/ploModel');

// =========================
// CLO CRUD OPERATIONS
// =========================

/**
 * Get all CLOs
 * GET /api/clos
 */
const getAllCLOs = async (req, res) => {
  try {
    const clos = await CLO.find()
      .populate('mappedPLOs', 'code name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: clos,
      count: clos.length
    });
  } catch (error) {
    console.error('Error getting CLOs:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách CLO',
      error: error.message
    });
  }
};

/**
 * Get CLO by ID
 * GET /api/clos/:id
 */
const getCLOById = async (req, res) => {
  try {
    const { id } = req.params;

    const clo = await CLO.findById(id).populate('mappedPLOs', 'code name detail');

    if (!clo) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy CLO'
      });
    }

    res.status(200).json({
      success: true,
      data: clo
    });
  } catch (error) {
    console.error('Error getting CLO by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin CLO',
      error: error.message
    });
  }
};

/**
 * Create new CLO
 * POST /api/clos
 */
const createCLO = async (req, res) => {
  try {
    const { code, name, detail, mappedPLOs, documentUrl, documentPath } = req.body;

    // Validation
    if (!code || !name || !detail) {
      return res.status(400).json({
        success: false,
        message: 'Mã, tên và chi tiết CLO là bắt buộc'
      });
    }

    // Validate mappedPLOs if provided
    if (mappedPLOs && mappedPLOs.length > 0) {
      const validPLOs = await PLO.find({ _id: { $in: mappedPLOs } });
      if (validPLOs.length !== mappedPLOs.length) {
        return res.status(400).json({
          success: false,
          message: 'Một hoặc nhiều PLO không hợp lệ'
        });
      }
    }

    const clo = await CLO.create({
      code,
      name,
      detail,
      mappedPLOs: mappedPLOs || [],
      documentUrl,
      documentPath
    });

    const populatedCLO = await CLO.findById(clo._id).populate('mappedPLOs', 'code name');

    res.status(201).json({
      success: true,
      message: 'Tạo CLO thành công',
      data: populatedCLO
    });
  } catch (error) {
    console.error('Error creating CLO:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo CLO',
      error: error.message
    });
  }
};

/**
 * Create multiple CLOs at once
 * POST /api/clos/bulk
 */
const createBulkCLOs = async (req, res) => {
  try {
    const { clos } = req.body;

    if (!Array.isArray(clos) || clos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Danh sách CLOs không hợp lệ'
      });
    }

    // Validate each CLO
    for (const clo of clos) {
      if (!clo.code || !clo.name || !clo.detail) {
        return res.status(400).json({
          success: false,
          message: 'Mỗi CLO phải có đầy đủ mã, tên và chi tiết'
        });
      }
    }

    // Validate all mappedPLOs
    const allPLOIds = clos.flatMap(clo => clo.mappedPLOs || []);
    if (allPLOIds.length > 0) {
      const uniquePLOIds = [...new Set(allPLOIds)];
      const validPLOs = await PLO.find({ _id: { $in: uniquePLOIds } });
      if (validPLOs.length !== uniquePLOIds.length) {
        return res.status(400).json({
          success: false,
          message: 'Một hoặc nhiều PLO không hợp lệ'
        });
      }
    }

    const createdCLOs = await CLO.insertMany(clos);

    // Populate the created CLOs
    const populatedCLOs = await CLO.find({ _id: { $in: createdCLOs.map(c => c._id) } })
      .populate('mappedPLOs', 'code name');

    res.status(201).json({
      success: true,
      message: `Tạo thành công ${createdCLOs.length} CLOs`,
      data: populatedCLOs
    });
  } catch (error) {
    console.error('Error creating bulk CLOs:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo danh sách CLO',
      error: error.message
    });
  }
};

/**
 * Update CLO
 * PUT /api/clos/:id
 */
const updateCLO = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, detail, mappedPLOs, documentUrl, documentPath } = req.body;

    const clo = await CLO.findById(id);
    if (!clo) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy CLO'
      });
    }

    // Validate mappedPLOs if provided
    if (mappedPLOs && mappedPLOs.length > 0) {
      const validPLOs = await PLO.find({ _id: { $in: mappedPLOs } });
      if (validPLOs.length !== mappedPLOs.length) {
        return res.status(400).json({
          success: false,
          message: 'Một hoặc nhiều PLO không hợp lệ'
        });
      }
    }

    // Update fields
    if (code) clo.code = code;
    if (name) clo.name = name;
    if (detail !== undefined) clo.detail = detail;
    if (mappedPLOs !== undefined) clo.mappedPLOs = mappedPLOs;
    if (documentUrl !== undefined) clo.documentUrl = documentUrl;
    if (documentPath !== undefined) clo.documentPath = documentPath;

    await clo.save();

    const updatedCLO = await CLO.findById(id).populate('mappedPLOs', 'code name');

    res.status(200).json({
      success: true,
      message: 'Cập nhật CLO thành công',
      data: updatedCLO
    });
  } catch (error) {
    console.error('Error updating CLO:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật CLO',
      error: error.message
    });
  }
};

/**
 * Delete CLO
 * DELETE /api/clos/:id
 */
const deleteCLO = async (req, res) => {
  try {
    const { id } = req.params;

    const clo = await CLO.findById(id);
    if (!clo) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy CLO'
      });
    }

    // Check if CLO is being used in any course
    const courseCount = await Course.countDocuments({ clos: id });
    if (courseCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa CLO đang được sử dụng trong giáo trình'
      });
    }

    await CLO.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Xóa CLO thành công'
    });
  } catch (error) {
    console.error('Error deleting CLO:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa CLO',
      error: error.message
    });
  }
};

/**
 * Map CLO to PLOs
 * POST /api/clos/:id/map-plos
 */
const mapCLOtoPLOs = async (req, res) => {
  try {
    const { id } = req.params;
    const { ploIds } = req.body;

    if (!Array.isArray(ploIds)) {
      return res.status(400).json({
        success: false,
        message: 'Danh sách PLO không hợp lệ'
      });
    }

    const clo = await CLO.findById(id);
    if (!clo) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy CLO'
      });
    }

    // Validate PLOs exist
    if (ploIds.length > 0) {
      const validPLOs = await PLO.find({ _id: { $in: ploIds } });
      if (validPLOs.length !== ploIds.length) {
        return res.status(400).json({
          success: false,
          message: 'Một hoặc nhiều PLO không hợp lệ'
        });
      }
    }

    clo.mappedPLOs = ploIds;
    await clo.save();

    const updatedCLO = await CLO.findById(id).populate('mappedPLOs', 'code name detail');

    res.status(200).json({
      success: true,
      message: 'Ánh xạ CLO với PLO thành công',
      data: updatedCLO
    });
  } catch (error) {
    console.error('Error mapping CLO to PLOs:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi ánh xạ CLO với PLO',
      error: error.message
    });
  }
};

module.exports = {
  getAllCLOs,
  getCLOById,
  createCLO,
  createBulkCLOs,
  updateCLO,
  deleteCLO,
  mapCLOtoPLOs
};