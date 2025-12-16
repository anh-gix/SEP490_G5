const Tip = require('../models/tipModel');

// =========================
// 📚 LẤY TẤT CẢ TIPS (Public - không cần auth)
// =========================
exports.getAllTips = async (req, res) => {
  try {
    const { section } = req.query;

    let query = {};
    if (section && section !== 'all') {
      query.section = section;
    }

    const tips = await Tip.find(query)
      .select('-createdBy')
      .sort({ section: 1 })
      .lean();

    // Sort items by order within each category
    tips.forEach(tip => {
      tip.categories.forEach(cat => {
        cat.items.sort((a, b) => a.order - b.order);
      });
    });

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách tips thành công',
      total: tips.length,
      tips
    });
  } catch (error) {
    console.error('❌ Lỗi khi lấy danh sách tips:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách tips',
      error: error.message
    });
  }
};

// =========================
// 📖 LẤY TIPS THEO SECTION
// =========================
exports.getTipsBySection = async (req, res) => {
  try {
    const { section } = req.params;

    // Validate section
    const validSections = ['General', 'Toeic', 'Ielts'];
    if (!validSections.includes(section)) {
      return res.status(400).json({
        success: false,
        message: `Section không hợp lệ. Chỉ chấp nhận: ${validSections.join(', ')}`
      });
    }

    const tip = await Tip.findOne({ section })
      .select('-createdBy')
      .lean();

    if (!tip) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy tips cho section: ${section}`
      });
    }

    // Sort items by order within each category
    tip.categories.forEach(cat => {
      cat.items.sort((a, b) => a.order - b.order);
    });

    // Calculate statistics
    const totalVideos = tip.categories.reduce((sum, cat) => sum + cat.items.length, 0);

    res.status(200).json({
      success: true,
      message: 'Lấy tips thành công',
      tip,
      statistics: {
        totalCategories: tip.categories.length,
        totalVideos,
        categoriesBreakdown: tip.categories.map(cat => ({
          name: cat.name,
          count: cat.items.length
        }))
      }
    });
  } catch (error) {
    console.error('❌ Lỗi khi lấy tips theo section:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy tips',
      error: error.message
    });
  }
};

// =========================
// 📊 LẤY THỐNG KÊ TIPS
// =========================
exports.getTipsStatistics = async (req, res) => {
  try {
    const tips = await Tip.find().lean();

    const statistics = {
      totalSections: tips.length,
      sections: tips.map(tip => {
        const totalVideos = tip.categories.reduce((sum, cat) => sum + cat.items.length, 0);
        return {
          section: tip.section,
          totalCategories: tip.categories.length,
          totalVideos,
          categories: tip.categories.map(cat => ({
            name: cat.name,
            videoCount: cat.items.length
          }))
        };
      }),
      grandTotal: tips.reduce((sum, tip) => 
        sum + tip.categories.reduce((catSum, cat) => catSum + cat.items.length, 0), 0
      )
    };

    res.status(200).json({
      success: true,
      message: 'Lấy thống kê tips thành công',
      statistics
    });
  } catch (error) {
    console.error('❌ Lỗi khi lấy thống kê tips:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thống kê',
      error: error.message
    });
  }
};

// =========================
// ➕ TẠO TIP MỚI (Admin only)
// =========================
exports.createTip = async (req, res) => {
  try {
    const { section, categories } = req.body;

    // Check if tip for this section already exists
    const existingTip = await Tip.findOne({ section });
    if (existingTip) {
      return res.status(400).json({
        success: false,
        message: `Tip cho section ${section} đã tồn tại. Vui lòng cập nhật thay vì tạo mới.`
      });
    }

    const tip = await Tip.create({
      section,
      categories,
      createdBy: req.user?._id
    });

    res.status(201).json({
      success: true,
      message: 'Tạo tip thành công',
      tip
    });
  } catch (error) {
    console.error('❌ Lỗi khi tạo tip:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo tip',
      error: error.message
    });
  }
};

// =========================
// ✏️ CẬP NHẬT TIP (Admin only)
// =========================
exports.updateTip = async (req, res) => {
  try {
    const { id } = req.params;
    const { categories } = req.body;

    const tip = await Tip.findByIdAndUpdate(
      id,
      { categories },
      { new: true, runValidators: true }
    );

    if (!tip) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tip'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật tip thành công',
      tip
    });
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật tip:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật tip',
      error: error.message
    });
  }
};

// =========================
// 🗑️ XÓA TIP (Admin only)
// =========================
exports.deleteTip = async (req, res) => {
  try {
    const { id } = req.params;

    const tip = await Tip.findByIdAndDelete(id);

    if (!tip) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tip'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Xóa tip thành công'
    });
  } catch (error) {
    console.error('❌ Lỗi khi xóa tip:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa tip',
      error: error.message
    });
  }
};

module.exports = exports;
