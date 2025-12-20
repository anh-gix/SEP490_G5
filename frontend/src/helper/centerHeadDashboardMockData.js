// Mock Data cho Center Head Dashboard
// Dựa trên WorkRequest model và flow thực tế

// ===========================================
// THỐNG KÊ TỔNG QUAN
// ===========================================
// Query thực tế:
// - Programs: Program.countDocuments({ status: 'approved' }) và Program.countDocuments({ isActive: true })
// - Courses: Course.countDocuments({ status: 'completed' }) và Course.countDocuments({ isActive: true })
// - Exams: Exam.countDocuments({ status: 'approved' }) và Exam.countDocuments({ isPublished: true })
// - Pending: WorkRequest.countDocuments({ status: { $in: ['pending', 'pending_approval'] } })

export const mockDashboardStats = {
  programs: {
    total: 12,      // Program.countDocuments({ status: 'approved' })
    active: 8,      // Program.countDocuments({ status: 'approved', isActive: true })
  },
  courses: {
    total: 45,      // Course.countDocuments({ status: 'completed' })
    active: 32,     // Course.countDocuments({ status: 'completed', isActive: true })
  },
  exams: {
    total: 28,      // Exam.countDocuments({ status: 'approved' })
    published: 18,  // Exam.countDocuments({ status: 'approved', isPublished: true })
  },
  pendingRequests: 7, // WorkRequest.countDocuments({ status: { $in: ['pending', 'pending_approval'] } })
};

// ===========================================
// YÊU CẦU CHỜ DUYỆT (Work Requests)
// ===========================================
// Flow:
// 1. Center Head tạo work request (top_down) → status: 'pending'
// 2. Cấp dưới nhận việc → status: 'in_progress'
// 3. Cấp dưới hoàn thành và ấn nút "Nộp" → status: 'pending_approval'
// 4. Center Head thấy trong danh sách chờ duyệt
//
// Query: WorkRequest.find({
//   $or: [
//     { direction: 'top_down', status: 'pending_approval' },  // Công việc đã giao, cấp dưới hoàn thành chờ duyệt
//     { direction: 'bottom_up', status: 'pending' }           // Cấp dưới tự submit lên (nếu có)
//   ]
// }).populate('requestedBy assignedTo entityId')

export const mockPendingWorkRequests = [
  {
    _id: "wr001",
    direction: "top_down",
    requestType: "create_program",
    entityType: "Program",
    entityId: {
      _id: "prog001",
      code: "IELTS_B2_2025",
      program_name: "Chương trình IELTS Band 6.0",
      type: "ielts",
      level: "B2",
      status: "pending_approval",
    },
    status: "pending_approval", // Cấp dưới đã hoàn thành, chờ Center Head duyệt
    requestedBy: {
      // Center Head - người giao việc
      _id: "centerhead001",
      name: "Trần Văn Quản Lý",
      email: "quanly@example.com",
    },
    assignedTo: {
      // Subject Leader - người được giao
      _id: "sl001",
      name: "Nguyễn Văn An",
      email: "nguyenvanan@example.com",
    },
    processedBy: {
      // Subject Leader - người hoàn thành
      _id: "sl001",
      name: "Nguyễn Văn An",
    },
    requestNote: "Tạo chương trình IELTS cho học viên mục tiêu 6.0",
    responseNote: "Đã hoàn thành chương trình với 4 khóa học",
    requestedAt: "2025-12-10T08:30:00Z",
    processedAt: "2025-12-18T14:20:00Z",
  },
  {
    _id: "wr002",
    direction: "top_down",
    requestType: "create_exam",
    entityType: "Exam",
    entityId: {
      _id: "exam001",
      title: "Đề thi Cambridge B2 - Mock Test 3",
      examType: "cambridge",
      totalDuration: 180,
      status: "pending_approval",
    },
    status: "pending_approval",
    requestedBy: {
      _id: "centerhead001",
      name: "Trần Văn Quản Lý",
      email: "quanly@example.com",
    },
    assignedTo: {
      _id: "sl002",
      name: "Lê Hoàng Cường",
      email: "lehoangcuong@example.com",
    },
    processedBy: {
      _id: "sl002",
      name: "Lê Hoàng Cường",
    },
    requestNote: "Tạo đề thi thử Cambridge B2 lần 3",
    responseNote: "Đã tạo đề thi với đầy đủ 4 sections",
    requestedAt: "2025-12-12T09:15:00Z",
    processedAt: "2025-12-19T10:30:00Z",
  },
  {
    _id: "wr003",
    direction: "bottom_up",
    requestType: "program",
    entityType: "Program",
    entityId: {
      _id: "prog002",
      code: "TOEIC_700",
      program_name: "Chương trình TOEIC 700+",
      type: "toeic",
      level: "B2",
      status: "pending_approval",
    },
    status: "pending", // Bottom-up: Subject Leader tự tạo và submit
    requestedBy: {
      // Subject Leader - người tạo và submit
      _id: "sl003",
      name: "Phạm Thị Dung",
      email: "phamthidung@example.com",
    },
    requestNote: "Đề xuất chương trình TOEIC mới cho học viên mục tiêu 700+",
    requestedAt: "2025-12-17T11:00:00Z",
  },
  {
    _id: "wr004",
    direction: "top_down",
    requestType: "create_program",
    entityType: "Program",
    entityId: {
      _id: "prog003",
      code: "CAM_C1",
      program_name: "Chương trình Cambridge C1 Advanced",
      type: "cam",
      level: "C1",
      status: "pending_approval",
    },
    status: "pending_approval",
    requestedBy: {
      _id: "centerhead001",
      name: "Trần Văn Quản Lý",
      email: "quanly@example.com",
    },
    assignedTo: {
      _id: "sl001",
      name: "Nguyễn Văn An",
      email: "nguyenvanan@example.com",
    },
    processedBy: {
      _id: "sl001",
      name: "Nguyễn Văn An",
    },
    requestNote: "Tạo chương trình Cambridge C1 cho học viên nâng cao",
    responseNote: "Đã hoàn thành với 6 khóa học chuyên sâu",
    requestedAt: "2025-12-08T10:00:00Z",
    processedAt: "2025-12-16T16:45:00Z",
  },
  {
    _id: "wr005",
    direction: "bottom_up",
    requestType: "exam",
    entityType: "Exam",
    entityId: {
      _id: "exam002",
      title: "IELTS Academic Mock Test - Jan 2026",
      examType: "ielts",
      totalDuration: 170,
      status: "pending_approval",
    },
    status: "pending",
    requestedBy: {
      _id: "sl002",
      name: "Lê Hoàng Cường",
      email: "lehoangcuong@example.com",
    },
    requestNote: "Đề xuất đề thi mock IELTS Academic cho kỳ thi tháng 1/2026",
    requestedAt: "2025-12-19T08:00:00Z",
  },
];

// ===========================================
// CHỜ KÍCH HOẠT / XUẤT BẢN
// ===========================================
// Các items đã được duyệt (approved) nhưng chưa active/publish
// Query:
// - Programs: Program.find({ status: 'approved', isActive: false })
// - Courses: Course.find({ status: 'completed', isActive: false })
// - Exams: Exam.find({ status: 'approved', isPublished: false })

export const mockPendingActivation = [
  {
    _id: "prog004",
    type: "program",
    name: "TOEFL iBT 100+",
    code: "TOEFL_100",
    description: "Chương trình luyện thi TOEFL iBT mục tiêu 100+",
    status: "approved",
    isActive: false,
    approvedAt: "2025-12-15T14:30:00Z",
    metadata: {
      examType: "toefl",
      level: "C1",
      coursesCount: 6,
    },
  },
  {
    _id: "prog005",
    type: "program",
    name: "Cambridge B1 Preliminary",
    code: "CAM_B1",
    description: "Chương trình Cambridge B1 cho người mới bắt đầu",
    status: "approved",
    isActive: false,
    approvedAt: "2025-12-14T09:20:00Z",
    metadata: {
      examType: "cam",
      level: "B1",
      coursesCount: 4,
    },
  },
  {
    _id: "exam003",
    type: "exam",
    name: "IELTS Mock Test - December 2025",
    description: "Đề thi thử IELTS tháng 12/2025",
    status: "approved",
    isPublished: false,
    approvedAt: "2025-12-18T11:00:00Z",
    metadata: {
      examType: "ielts",
      duration: 170,
      sectionsCount: 4,
    },
  },
  {
    _id: "course001",
    type: "course",
    name: "IELTS Speaking Part 2 & 3",
    code: "IELTS_SPK_23",
    description: "Khóa học chuyên sâu Speaking cho IELTS",
    status: "completed",
    isActive: false,
    approvedAt: "2025-12-17T16:45:00Z",
    metadata: {
      programName: "IELTS Band 6.5",
      sessionsCount: 15,
    },
  },
];

// ===========================================
// HOẠT ĐỘNG GẦN ĐÂY
// ===========================================
// Lấy từ WorkRequest.history hoặc log riêng
// Query: WorkRequest.find({ processedBy: currentUserId })
//        .sort({ processedAt: -1 }).limit(10)

export const mockRecentActivities = [
  {
    _id: "act001",
    action: "approved",
    entityType: "Program",
    entityName: "IELTS Band 7.0",
    performedAt: "2025-12-19T10:30:00Z",
  },
  {
    _id: "act002",
    action: "activated",
    entityType: "Course",
    entityName: "Cambridge Writing Advanced",
    performedAt: "2025-12-19T09:15:00Z",
  },
  {
    _id: "act003",
    action: "rejected",
    entityType: "Exam",
    entityName: "TOEFL Practice Test 5",
    performedAt: "2025-12-18T16:20:00Z",
  },
  {
    _id: "act004",
    action: "published",
    entityType: "Exam",
    entityName: "Cambridge B2 Final Test",
    performedAt: "2025-12-18T14:00:00Z",
  },
  {
    _id: "act005",
    action: "assigned",
    entityType: "Program",
    entityName: "Tạo chương trình IELTS Listening",
    performedAt: "2025-12-18T11:30:00Z",
  },
];

// ===========================================
// HELPER FUNCTIONS
// ===========================================

export const getRequestTypeLabel = (type) => {
  const labels = {
    create_program: "Tạo chương trình",
    edit_program: "Chỉnh sửa chương trình",
    create_course: "Tạo khóa học",
    edit_course: "Chỉnh sửa khóa học",
    create_exam: "Tạo đề thi",
    edit_exam: "Chỉnh sửa đề thi",
    program: "Duyệt chương trình",
    exam: "Duyệt đề thi",
    assign_students: "Xếp lớp học viên",
  };
  return labels[type] || type;
};

export const getRequestTypeIcon = (type) => {
  const icons = {
    create_program: "ph-graduation-cap",
    edit_program: "ph-pencil-simple",
    create_course: "ph-book-open",
    edit_course: "ph-note-pencil",
    create_exam: "ph-exam",
    edit_exam: "ph-pencil-line",
    program: "ph-graduation-cap",
    exam: "ph-exam",
    assign_students: "ph-users-three",
  };
  return icons[type] || "ph-file";
};

export const getRequestTypeBgColor = (type) => {
  const colors = {
    create_program: "bg-main-600",
    edit_program: "bg-info-500",
    create_course: "bg-success-600",
    edit_course: "bg-warning-600",
    create_exam: "bg-purple-600",
    edit_exam: "bg-orange-500",
    program: "bg-main-600",
    exam: "bg-purple-600",
    assign_students: "bg-info-500",
  };
  return colors[type] || "bg-neutral-600";
};

export const getDirectionLabel = (direction) => {
  return direction === "top_down" ? "Công việc đã giao" : "Đề xuất từ cấp dưới";
};

export const getDirectionBadgeVariant = (direction) => {
  return direction === "top_down" ? "info" : "warning";
};

export const getEntityTypeIcon = (type) => {
  const icons = {
    program: "ph-graduation-cap",
    course: "ph-book-open",
    exam: "ph-exam",
  };
  return icons[type] || "ph-file";
};

export const getEntityTypeBgColor = (type) => {
  const colors = {
    program: "bg-main-600",
    course: "bg-success-600",
    exam: "bg-purple-600",
  };
  return colors[type] || "bg-neutral-600";
};

export const getActionLabel = (action) => {
  const labels = {
    approved: "Đã duyệt",
    rejected: "Đã từ chối",
    activated: "Đã kích hoạt",
    deactivated: "Đã vô hiệu hóa",
    published: "Đã xuất bản",
    unpublished: "Đã ẩn",
    assigned: "Đã giao việc",
  };
  return labels[action] || action;
};

export const getActionColor = (action) => {
  const colors = {
    approved: "text-success-600",
    rejected: "text-danger-600",
    activated: "text-success-600",
    deactivated: "text-warning-600",
    published: "text-main-600",
    unpublished: "text-neutral-600",
    assigned: "text-info-500",
  };
  return colors[action] || "text-neutral-600";
};

// Format date helper
export const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Simulate API delay
export const simulateApiDelay = (ms = 500) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
