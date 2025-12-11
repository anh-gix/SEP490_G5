// ============================================================================
// MOCK DATA EXTENDED - CENTER HEAD APPLICATION
// ============================================================================

// ============================================================================
// I. ROLES & PERMISSIONS
// ============================================================================

// Cấu trúc theo model Permission:
// - name: Tên vai trò/nhóm quyền
// - description: Mô tả
// - permissions: Map object với key là module, value là array các action

export const mockPermissions = [
  {
    _id: "perm001",
    name: "Center Head Permission",
    description: "Toàn quyền quản trị hệ thống",
    permissions: {
      "user": ["view", "create", "edit", "delete", "block", "import"],
      "role": ["view", "create", "edit", "delete", "assign"],
      "program": ["view", "create", "edit", "delete", "approve"],
      "course": ["view", "create", "edit", "delete", "approve"],
      "class": ["view", "create", "edit", "delete", "assign_teacher", "manage_student"],
      "schedule": ["view", "create", "edit", "delete", "approve"],
      "attendance": ["take"],
      "leave": ["approve"],
      "room": ["view", "create", "edit", "delete"],
      "exam": ["view", "create", "edit", "delete", "publish", "grade", "view_result"],
      "report": ["view", "export"]
    }
  },
  {
    _id: "perm002",
    name: "Subject Leader Permission",
    description: "Quản lý chương trình và khóa học",
    permissions: {
      "user": ["view"],
      "program": ["view", "create", "edit"],
      "course": ["view", "create", "edit", "approve"],
      "class": ["view"],
      "schedule": ["view"],
      "exam": ["view", "create", "edit", "publish", "grade", "view_result"],
      "report": ["view", "export"]
    }
  },
  {
    _id: "perm003",
    name: "Giáo vụ Permission",
    description: "Quản lý lớp học, lịch học và học viên",
    permissions: {
      "user": ["view", "create", "edit", "import"],
      "class": ["view", "create", "edit", "assign_teacher", "manage_student"],
      "schedule": ["view", "create", "edit", "approve"],
      "attendance": ["take"],
      "leave": ["approve"],
      "room": ["view", "create", "edit"],
      "exam": ["view_result"],
      "report": ["view"]
    }
  },
  {
    _id: "perm004",
    name: "Giảng viên Permission",
    description: "Giảng dạy và quản lý lớp học được phân công",
    permissions: {
      "user": ["view"],
      "course": ["view", "create", "edit"],
      "class": ["view"],
      "schedule": ["view", "create"],
      "attendance": ["take"],
      "leave": ["approve"],
      "room": ["view"],
      "exam": ["view", "create", "edit", "grade", "view_result"]
    }
  },
  {
    _id: "perm005",
    name: "Học viên Permission",
    description: "Học tập và tham gia các hoạt động học",
    permissions: {
      "class": ["view"],
      "schedule": ["view"],
      "exam": ["take", "view_result"]
    }
  },
  {
    _id: "perm006",
    name: "Cashier Permission",
    description: "Quản lý thanh toán học phí",
    permissions: {
      "user": ["view"],
      "class": ["view"],
      "report": ["view"]
    }
  },
  {
    _id: "perm007",
    name: "Lễ tân Permission",
    description: "Tiếp đón và hỗ trợ học viên",
    permissions: {
      "user": ["view"],
      "class": ["view"],
      "schedule": ["view"],
      "room": ["view"]
    }
  }
];

// Helper: Chuyển đổi permissions Map sang array chi tiết để hiển thị UI
export const getPermissionDetails = (permissionObj) => {
  if (!permissionObj || !permissionObj.permissions) return [];

  const details = [];
  const moduleNames = {
    "user": "Quản lý người dùng",
    "role": "Quản lý vai trò",
    "program": "Quản lý chương trình",
    "course": "Quản lý khóa học",
    "class": "Quản lý lớp học",
    "schedule": "Quản lý lịch học",
    "attendance": "Điểm danh",
    "leave": "Quản lý nghỉ phép",
    "room": "Quản lý phòng học",
    "exam": "Quản lý thi & kiểm tra",
    "report": "Báo cáo & Thống kê"
  };

  const actionNames = {
    "view": "Xem",
    "create": "Tạo mới",
    "edit": "Chỉnh sửa",
    "delete": "Xóa",
    "block": "Khóa/Mở khóa",
    "import": "Import",
    "assign": "Phân quyền",
    "approve": "Duyệt",
    "assign_teacher": "Phân giảng viên",
    "manage_student": "Quản lý học viên",
    "take": "Điểm danh",
    "publish": "Xuất bản",
    "grade": "Chấm điểm",
    "view_result": "Xem kết quả",
    "export": "Xuất file"
  };

  Object.entries(permissionObj.permissions).forEach(([module, actions]) => {
    actions.forEach(action => {
      details.push({
        _id: `${permissionObj._id}_${module}_${action}`,
        module: moduleNames[module] || module,
        name: `${actionNames[action] || action} ${moduleNames[module] || module}`,
        code: `${module}.${action}`,
        description: `Quyền ${actionNames[action]?.toLowerCase() || action} trong module ${moduleNames[module] || module}`
      });
    });
  });

  return details;
};

// Tạo danh sách tất cả permissions chi tiết để dùng cho UI
export const mockPermissionsList = mockPermissions.flatMap(getPermissionDetails);

// Cấu trúc theo model Role:
// - name: Tên vai trò
// - description: Mô tả
// - permissionId: ObjectId tham chiếu đến Permission
export const mockRoles = [
  {
    _id: "role001",
    name: "Center Head",
    description: "Trưởng trung tâm - Quyền quản trị cao nhất",
    permissionId: "perm001",
    permission: mockPermissions.find(p => p._id === "perm001"), // Populate permission details
    userCount: 1,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    _id: "role002",
    name: "Subject Leader",
    description: "Trưởng môn - Quản lý chương trình và khóa học",
    permissionId: "perm002",
    permission: mockPermissions.find(p => p._id === "perm002"),
    userCount: 8,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    _id: "role003",
    name: "Giáo vụ",
    description: "Quản lý lớp học, lịch học và học viên",
    permissionId: "perm003",
    permission: mockPermissions.find(p => p._id === "perm003"),
    userCount: 15,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    _id: "role004",
    name: "Giảng viên",
    description: "Giảng dạy và quản lý lớp học được phân công",
    permissionId: "perm004",
    permission: mockPermissions.find(p => p._id === "perm004"),
    userCount: 45,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    _id: "role005",
    name: "Học viên",
    description: "Học tập và tham gia các hoạt động học",
    permissionId: "perm005",
    permission: mockPermissions.find(p => p._id === "perm005"),
    userCount: 3456,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    _id: "role006",
    name: "Cashier",
    description: "Thu ngân - Quản lý thanh toán học phí",
    permissionId: "perm006",
    permission: mockPermissions.find(p => p._id === "perm006"),
    userCount: 3,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    _id: "role007",
    name: "Lễ tân",
    description: "Tiếp đón và hỗ trợ học viên",
    permissionId: "perm007",
    permission: mockPermissions.find(p => p._id === "perm007"),
    userCount: 5,
    createdAt: "2024-01-01T00:00:00Z",
  },
];

export const mockRoleStats = {
  centerHead: { total: 1, active: 1, inactive: 0, pending: 0 },
  subjectLeader: { total: 8, active: 7, inactive: 1, pending: 0 },
  giaovu: { total: 15, active: 14, inactive: 0, pending: 1 },
  teacher: { total: 45, active: 42, inactive: 3, pending: 0 },
  student: { total: 3456, active: 3234, inactive: 122, pending: 100 },
  cashier: { total: 3, active: 3, inactive: 0, pending: 0 },
  receptionist: { total: 5, active: 5, inactive: 0, pending: 0 },
};

// Permission Matrix
export const mockPermissionMatrix = {
  accountManagement: {
    createUser: ["Center Head", "Giáo vụ"],
    editUser: ["Center Head", "Giáo vụ"],
    deleteUser: ["Center Head", "Giáo vụ"],
    changeRole: ["Center Head"],
    importUsers: ["Center Head", "Giáo vụ"],
  },
  programManagement: {
    createProgram: ["Center Head", "Subject Leader"],
    approveProgram: ["Center Head"],
    createPLO: ["Center Head", "Subject Leader"],
    createCourse: ["Center Head", "Subject Leader", "Giảng viên"],
    approveCourse: ["Center Head", "Subject Leader"],
    createCLO: ["Center Head", "Subject Leader", "Giảng viên"],
    createSession: ["Center Head", "Subject Leader", "Giảng viên"],
  },
  classManagement: {
    createClass: ["Center Head", "Giáo vụ"],
    assignTeacher: ["Center Head", "Giáo vụ"],
    manageStudents: ["Center Head", "Giáo vụ"],
    createSchedule: ["Center Head", "Giáo vụ", "Giảng viên"],
    approveSchedule: ["Center Head", "Giáo vụ"],
    approveLeaveRequest: ["Center Head", "Giáo vụ", "Giảng viên"],
    takeAttendance: ["Giáo vụ", "Giảng viên"],
  },
  roomManagement: {
    createRoom: ["Center Head", "Giáo vụ"],
    editRoom: ["Center Head", "Giáo vụ"],
    deleteRoom: ["Center Head", "Giáo vụ"],
    viewRoomStatus: ["Center Head", "Giáo vụ", "Giảng viên"],
  },
  examManagement: {
    createExam: ["Center Head", "Subject Leader", "Giảng viên"],
    publishExam: ["Center Head", "Subject Leader"],
    takeExam: ["Học viên"],
    gradeExam: ["Center Head", "Subject Leader", "Giảng viên"],
    viewResults: ["Center Head", "Subject Leader", "Giáo vụ", "Giảng viên", "Học viên"],
  },
  reports: {
    viewAllReports: ["Center Head", "Subject Leader", "Giáo vụ"],
    exportReports: ["Center Head", "Subject Leader", "Giáo vụ"],
  },
};

// ============================================================================
// II. USERS
// ============================================================================

export const mockUsers = [
  // Center Head
  {
    _id: "user001",
    username: "centerhead01",
    email: "centerhead@example.com",
    fullname: "Nguyễn Văn Trưởng",
    phone: "0901234567",
    address: "123 Nguyễn Huệ, Q1, TP.HCM",
    roleId: "role001",
    role: { _id: "role001", name: "Center Head" },
    status: "active",
    token: "valid-token-123",
    lastLogin: "2025-11-09T08:30:00Z",
    createdAt: "2024-01-01T00:00:00Z",
  },
  // Subject Leaders
  {
    _id: "user002",
    username: "subjleader01",
    email: "leader.toeic@example.com",
    fullname: "Trần Thị Hoa",
    phone: "0902234567",
    address: "45 Lê Lợi, Q1, TP.HCM",
    roleId: "role002",
    role: { _id: "role002", name: "Subject Leader" },
    status: "active",
    token: "valid-token-124",
    lastLogin: "2025-11-08T15:20:00Z",
    createdAt: "2024-02-01T00:00:00Z",
  },
  {
    _id: "user003",
    username: "subjleader02",
    email: "leader.ielts@example.com",
    fullname: "Phạm Minh Tuấn",
    phone: "0903234567",
    address: "67 Pasteur, Q3, TP.HCM",
    roleId: "role002",
    role: { _id: "role002", name: "Subject Leader" },
    status: "active",
    token: null,
    lastLogin: "2025-11-07T10:00:00Z",
    createdAt: "2024-02-01T00:00:00Z",
  },
  // Giáo vụ
  {
    _id: "user004",
    username: "giaovu01",
    email: "giaovu01@example.com",
    fullname: "Lê Văn Bình",
    phone: "0904234567",
    address: "89 Hai Bà Trưng, Q1, TP.HCM",
    roleId: "role003",
    role: { _id: "role003", name: "Giáo vụ" },
    status: "active",
    token: "valid-token-125",
    lastLogin: "2025-11-09T07:45:00Z",
    createdAt: "2024-03-01T00:00:00Z",
  },
  {
    _id: "user005",
    username: "giaovu02",
    email: "giaovu02@example.com",
    fullname: "Hoàng Thị Lan",
    phone: "0905234567",
    address: "12 Cách Mạng Tháng 8, Q3, TP.HCM",
    roleId: "role003",
    role: { _id: "role003", name: "Giáo vụ" },
    status: "active",
    token: "valid-token-126",
    lastLogin: "2025-11-09T08:00:00Z",
    createdAt: "2024-03-01T00:00:00Z",
  },
  // Giảng viên
  {
    _id: "user006",
    username: "teacher01",
    email: "teacher01@example.com",
    fullname: "Võ Thị Mai",
    phone: "0906234567",
    address: "34 Lý Tự Trọng, Q1, TP.HCM",
    roleId: "role004",
    role: { _id: "role004", name: "Giảng viên" },
    status: "active",
    token: "valid-token-127",
    lastLogin: "2025-11-08T14:30:00Z",
    createdAt: "2024-04-01T00:00:00Z",
  },
  {
    _id: "user007",
    username: "teacher02",
    email: "teacher02@example.com",
    fullname: "Nguyễn Hữu Đạt",
    phone: "0907234567",
    address: "56 Trần Hưng Đạo, Q5, TP.HCM",
    roleId: "role004",
    role: { _id: "role004", name: "Giảng viên" },
    status: "active",
    token: "valid-token-128",
    lastLogin: "2025-11-08T16:00:00Z",
    createdAt: "2024-04-01T00:00:00Z",
  },
  {
    _id: "user008",
    username: "teacher03",
    email: "teacher03@example.com",
    fullname: "Phan Văn Hùng",
    phone: "0908234567",
    address: "78 Nguyễn Thị Minh Khai, Q3, TP.HCM",
    roleId: "role004",
    role: { _id: "role004", name: "Giảng viên" },
    status: "inactive",
    token: null,
    lastLogin: "2025-10-15T09:00:00Z",
    createdAt: "2024-04-01T00:00:00Z",
  },
  // Học viên (sample)
  {
    _id: "user009",
    username: "student001",
    email: "student001@example.com",
    fullname: "Trần Thị Ngọc",
    phone: "0909234567",
    address: "90 Điện Biên Phủ, Q3, TP.HCM",
    roleId: "role005",
    role: { _id: "role005", name: "Học viên" },
    status: "active",
    token: "valid-token-129",
    lastLogin: "2025-11-08T18:00:00Z",
    createdAt: "2024-05-01T00:00:00Z",
  },
  {
    _id: "user010",
    username: "student002",
    email: "student002@example.com",
    fullname: "Lê Minh Khoa",
    phone: "0910234567",
    address: "102 Nam Kỳ Khởi Nghĩa, Q1, TP.HCM",
    roleId: "role005",
    role: { _id: "role005", name: "Học viên" },
    status: "active",
    token: "valid-token-130",
    lastLogin: "2025-11-08T19:00:00Z",
    createdAt: "2024-05-01T00:00:00Z",
  },
];

export const mockUserStats = {
  total: 3533,
  byRole: mockRoleStats,
};

// ============================================================================
// III. PROGRAMS & PLOs
// ============================================================================

export const mockPLOs = [
  {
    _id: "plo001",
    code: "PLO-01",
    name: "Listening Comprehension",
    detail: "Hiểu được nội dung ngôn ngữ nói trong các tình huống thực tế",
    createdAt: "2024-01-15T00:00:00Z",
  },
  {
    _id: "plo002",
    code: "PLO-02",
    name: "Reading Skills",
    detail: "Đọc hiểu các loại văn bản từ cơ bản đến nâng cao",
    createdAt: "2024-01-15T00:00:00Z",
  },
  {
    _id: "plo003",
    code: "PLO-03",
    name: "Writing Proficiency",
    detail: "Viết được các dạng văn bản học thuật và giao tiếp",
    createdAt: "2024-01-15T00:00:00Z",
  },
  {
    _id: "plo004",
    code: "PLO-04",
    name: "Speaking Fluency",
    detail: "Giao tiếp lưu loát trong các tình huống thực tế",
    createdAt: "2024-01-15T00:00:00Z",
  },
  {
    _id: "plo005",
    code: "PLO-05",
    name: "Grammar Knowledge",
    detail: "Nắm vững ngữ pháp tiếng Anh",
    createdAt: "2024-01-15T00:00:00Z",
  },
  {
    _id: "plo006",
    code: "PLO-06",
    name: "Vocabulary Range",
    detail: "Có vốn từ vựng phong phú phù hợp trình độ",
    createdAt: "2024-01-15T00:00:00Z",
  },
];

export const mockPrograms = [
  {
    _id: "prog001",
    code: "TOEIC01",
    program_name: "TOEIC Foundation",
    description: "Chương trình luyện thi TOEIC từ cơ bản đến trung cấp",
    plos: ["plo001", "plo002", "plo005", "plo006"],
    ploDetails: [
      { _id: "plo001", code: "PLO-01", name: "Listening Comprehension" },
      { _id: "plo002", code: "PLO-02", name: "Reading Skills" },
      { _id: "plo005", code: "PLO-05", name: "Grammar Knowledge" },
      { _id: "plo006", code: "PLO-06", name: "Vocabulary Range" },
    ],
    courseCount: 12,
    status: "active",
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: "2024-02-01T00:00:00Z",
  },
  {
    _id: "prog002",
    code: "IELTS01",
    program_name: "IELTS Academic",
    description: "Chương trình luyện thi IELTS Academic",
    plos: ["plo001", "plo002", "plo003", "plo004", "plo005", "plo006"],
    ploDetails: [
      { _id: "plo001", code: "PLO-01", name: "Listening Comprehension" },
      { _id: "plo002", code: "PLO-02", name: "Reading Skills" },
      { _id: "plo003", code: "PLO-03", name: "Writing Proficiency" },
      { _id: "plo004", code: "PLO-04", name: "Speaking Fluency" },
      { _id: "plo005", code: "PLO-05", name: "Grammar Knowledge" },
      { _id: "plo006", code: "PLO-06", name: "Vocabulary Range" },
    ],
    courseCount: 15,
    status: "active",
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: "2024-02-01T00:00:00Z",
  },
  {
    _id: "prog003",
    code: "SPEAK01",
    program_name: "English Speaking",
    description: "Chương trình rèn luyện kỹ năng giao tiếp tiếng Anh",
    plos: ["plo004", "plo005", "plo006"],
    ploDetails: [
      { _id: "plo004", code: "PLO-04", name: "Speaking Fluency" },
      { _id: "plo005", code: "PLO-05", name: "Grammar Knowledge" },
      { _id: "plo006", code: "PLO-06", name: "Vocabulary Range" },
    ],
    courseCount: 8,
    status: "active",
    createdAt: "2024-02-15T00:00:00Z",
    updatedAt: "2024-02-15T00:00:00Z",
  },
  {
    _id: "prog004",
    code: "BUSI01",
    program_name: "Business English",
    description: "Tiếng Anh thương mại cho môi trường công việc",
    plos: ["plo002", "plo003", "plo004", "plo006"],
    ploDetails: [
      { _id: "plo002", code: "PLO-02", name: "Reading Skills" },
      { _id: "plo003", code: "PLO-03", name: "Writing Proficiency" },
      { _id: "plo004", code: "PLO-04", name: "Speaking Fluency" },
      { _id: "plo006", code: "PLO-06", name: "Vocabulary Range" },
    ],
    courseCount: 10,
    status: "draft",
    createdAt: "2024-03-01T00:00:00Z",
    updatedAt: "2024-03-01T00:00:00Z",
  },
];

export const mockProgramStats = {
  total: 15,
  active: 10,
  draft: 3,
  archived: 2,
};

// ============================================================================
// IV. COURSES, CLOs & SESSIONS
// ============================================================================

export const mockCLOs = [
  {
    _id: "clo001",
    code: "CLO-1.1",
    name: "Listening Unit 1",
    detail: "Nghe hiểu các đoạn hội thoại ngắn về chủ đề quen thuộc",
    mappedPLOs: [
      { _id: "plo001", code: "PLO-01", name: "Listening Comprehension" },
    ],
    courseId: "course001",
  },
  {
    _id: "clo002",
    code: "CLO-1.2",
    name: "Reading Unit 1",
    detail: "Đọc hiểu đoạn văn ngắn về chủ đề quen thuộc",
    mappedPLOs: [
      { _id: "plo002", code: "PLO-02", name: "Reading Skills" },
    ],
    courseId: "course001",
  },
  {
    _id: "clo003",
    code: "CLO-1.3",
    name: "Grammar Basics",
    detail: "Sử dụng đúng các thì cơ bản trong tiếng Anh",
    mappedPLOs: [
      { _id: "plo005", code: "PLO-05", name: "Grammar Knowledge" },
    ],
    courseId: "course001",
  },
];

export const mockSessions = [
  {
    _id: "session001",
    title: "Introduction to TOEIC",
    order: 1,
    content: "Giới thiệu về kỳ thi TOEIC, cấu trúc đề thi, chiến lược làm bài",
    learningType: "Online",
    clos: ["clo001", "clo002"],
    cloDetails: [
      { _id: "clo001", code: "CLO-1.1", name: "Listening Unit 1" },
      { _id: "clo002", code: "CLO-1.2", name: "Reading Unit 1" },
    ],
    courseId: "course001",
  },
  {
    _id: "session002",
    title: "Grammar Basics - Present Tenses",
    order: 2,
    content: "Học về thì hiện tại đơn, hiện tại tiếp diễn, hiện tại hoàn thành",
    learningType: "Offline",
    clos: ["clo003"],
    cloDetails: [
      { _id: "clo003", code: "CLO-1.3", name: "Grammar Basics" },
    ],
    courseId: "course001",
  },
  {
    _id: "session003",
    title: "Practice Test 1",
    order: 3,
    content: "Làm bài thi thử TOEIC Part 1-4 (Listening)",
    learningType: "Mixed",
    clos: ["clo001"],
    cloDetails: [
      { _id: "clo001", code: "CLO-1.1", name: "Listening Unit 1" },
    ],
    courseId: "course001",
  },
];

export const mockCourses = [
  {
    _id: "course001",
    name: "TOEIC B1 Foundation",
    description: "Khóa học TOEIC cho người mới bắt đầu, mục tiêu 450+ điểm",
    program: {
      _id: "prog001",
      program_name: "TOEIC Foundation",
      code: "TOEIC01",
    },
    clos: ["clo001", "clo002", "clo003"],
    cloDetails: mockCLOs,
    sessions: ["session001", "session002", "session003"],
    sessionDetails: mockSessions,
    createdBy: {
      _id: "user002",
      fullname: "Trần Thị Hoa",
      email: "leader.toeic@example.com",
    },
    submittedAt: "2025-10-20T10:00:00Z",
    revisionReason: null,
    status: "pending_approval",
    createdAt: "2025-10-15T08:30:00Z",
    updatedAt: "2025-10-20T10:45:00Z",
  },
  {
    _id: "course002",
    name: "IELTS Writing Task 1",
    description: "Chuyên sâu IELTS Writing Task 1 - Biểu đồ, bản đồ, quy trình",
    program: {
      _id: "prog002",
      program_name: "IELTS Academic",
      code: "IELTS01",
    },
    clos: [],
    sessions: [],
    createdBy: {
      _id: "user003",
      fullname: "Phạm Minh Tuấn",
      email: "leader.ielts@example.com",
    },
    submittedAt: "2025-10-18T14:00:00Z",
    revisionReason: "Cần bổ sung thêm 2 buổi luyện tập thực hành",
    status: "needs_revision",
    createdAt: "2025-10-10T09:00:00Z",
    updatedAt: "2025-10-22T11:00:00Z",
  },
  {
    _id: "course003",
    name: "Business English Communication",
    description: "Giao tiếp tiếng Anh trong môi trường công việc",
    program: {
      _id: "prog004",
      program_name: "Business English",
      code: "BUSI01",
    },
    clos: [],
    sessions: [],
    createdBy: {
      _id: "user006",
      fullname: "Võ Thị Mai",
      email: "teacher01@example.com",
    },
    submittedAt: null,
    revisionReason: null,
    status: "draft",
    createdAt: "2025-11-01T10:00:00Z",
    updatedAt: "2025-11-05T15:30:00Z",
  },
];

export const mockCourseStats = {
  total: 89,
  approved: 65,
  pendingApproval: 12,
  draft: 8,
  needsRevision: 4,
};

// ============================================================================
// V. CLASSES & ROOMS
// ============================================================================

export const mockRooms = [
  {
    _id: "room001",
    room_name: "P301",
    capacity: 30,
    location: "Tầng 3",
    description: "Phòng học có máy chiếu, điều hòa",
    status: "available",
    todayUsage: { used: 0, total: 8 },
  },
  {
    _id: "room002",
    room_name: "P205",
    capacity: 25,
    location: "Tầng 2",
    description: "Phòng học có tivi, bảng thông minh",
    status: "in_use",
    todayUsage: { used: 6, total: 8 },
  },
  {
    _id: "room003",
    room_name: "P101",
    capacity: 40,
    location: "Tầng 1",
    description: "Phòng học lớn, phù hợp cho workshop",
    status: "maintenance",
    todayUsage: { used: 0, total: 8 },
  },
  {
    _id: "room004",
    room_name: "LAB_1",
    capacity: 20,
    location: "Tầng 4",
    description: "Phòng máy tính, có 20 máy",
    status: "available",
    todayUsage: { used: 2, total: 8 },
  },
];

export const mockRoomStats = {
  total: 20,
  available: 12,
  inUse: 7,
  maintenance: 1,
};

export const mockClasses = [
  {
    _id: "class001",
    name: "A1.2024.01",
    subject: "TOEIC Foundation",
    teacherId: "user006",
    teacher: {
      _id: "user006",
      fullname: "Võ Thị Mai",
      email: "teacher01@example.com",
    },
    students: ["user009", "user010"],
    studentDetails: [
      { _id: "user009", fullname: "Trần Thị Ngọc", email: "student001@example.com" },
      { _id: "user010", fullname: "Lê Minh Khoa", email: "student002@example.com" },
    ],
    studentCount: 25,
    scheduleStatus: "scheduled",
    attendanceRate: 95.2,
    courseId: "course001",
    startDate: "2025-11-01",
    endDate: "2026-01-31",
    status: "active",
  },
  {
    _id: "class002",
    name: "B1.2024.05",
    subject: "IELTS Academic",
    teacherId: "user007",
    teacher: {
      _id: "user007",
      fullname: "Nguyễn Hữu Đạt",
      email: "teacher02@example.com",
    },
    students: [],
    studentDetails: [],
    studentCount: 30,
    scheduleStatus: "pending",
    attendanceRate: 0,
    courseId: "course002",
    startDate: "2025-11-15",
    endDate: "2026-02-15",
    status: "active",
  },
  {
    _id: "class003",
    name: "C1.2024.12",
    subject: "English Speaking",
    teacherId: "user006",
    teacher: {
      _id: "user006",
      fullname: "Võ Thị Mai",
      email: "teacher01@example.com",
    },
    students: [],
    studentDetails: [],
    studentCount: 20,
    scheduleStatus: "scheduled",
    attendanceRate: 92.8,
    courseId: "course003",
    startDate: "2025-10-20",
    endDate: "2025-12-20",
    status: "active",
  },
];

export const mockClassStats = {
  totalActive: 45,
  totalStudents: 3456,
  averageAttendance: 92.5,
};

// ============================================================================
// VI. SCHEDULES
// ============================================================================

export const mockClassSchedules = [
  {
    _id: "schedule001",
    class: {
      _id: "class001",
      name: "A1.2024.01",
      subject: "TOEIC Foundation",
    },
    session: {
      _id: "session001",
      title: "Introduction to TOEIC",
      order: 1,
    },
    topic: "Giới thiệu TOEIC - Buổi 1",
    date: "2025-11-15",
    startTime: "08:00",
    endTime: "10:00",
    room: {
      _id: "room001",
      room_name: "P301",
    },
    createdBy: {
      _id: "user004",
      fullname: "Lê Văn Bình",
    },
    reason: "Lịch học bình thường",
    rejectionReason: null,
    status: "pending_approval",
    createdAt: "2025-11-08T10:00:00Z",
  },
  {
    _id: "schedule002",
    class: {
      _id: "class001",
      name: "A1.2024.01",
      subject: "TOEIC Foundation",
    },
    session: {
      _id: "session002",
      title: "Grammar Basics",
      order: 2,
    },
    topic: "Học bù - Grammar Basics",
    date: "2025-11-20",
    startTime: "14:00",
    endTime: "16:00",
    room: {
      _id: "room002",
      room_name: "P205",
    },
    createdBy: {
      _id: "user006",
      fullname: "Võ Thị Mai",
    },
    reason: "Học bù do nghỉ lễ 20/11",
    rejectionReason: null,
    status: "pending_approval",
    createdAt: "2025-11-09T09:00:00Z",
  },
  {
    _id: "schedule003",
    class: {
      _id: "class003",
      name: "C1.2024.12",
      subject: "English Speaking",
    },
    session: null,
    topic: "Workshop: Public Speaking Skills",
    date: "2025-11-22",
    startTime: "15:00",
    endTime: "17:00",
    room: {
      _id: "room004",
      room_name: "LAB_1",
    },
    createdBy: {
      _id: "user006",
      fullname: "Võ Thị Mai",
    },
    reason: "Buổi học ngoài khóa - rèn luyện thuyết trình",
    rejectionReason: null,
    status: "approved",
    createdAt: "2025-11-05T14:00:00Z",
  },
];

export const mockStudentSchedules = [
  {
    _id: "stuSchedule001",
    student: {
      _id: "user009",
      fullname: "Trần Thị Ngọc",
      email: "student001@example.com",
    },
    classSchedule: {
      _id: "schedule001",
      date: "2025-11-15",
      startTime: "08:00",
      endTime: "10:00",
      class: { _id: "class001", name: "A1.2024.01" },
      room: { _id: "room001", room_name: "P301" },
    },
    newDate: null,
    newStartTime: null,
    newEndTime: null,
    newRoom: null,
    attendance: {
      status: "present",
      checkInTime: "2025-11-15T08:05:00Z",
      markedBy: {
        _id: "user006",
        fullname: "Võ Thị Mai",
      },
    },
    leaveRequest: null,
    createdAt: "2025-11-08T10:00:00Z",
  },
  {
    _id: "stuSchedule002",
    student: {
      _id: "user010",
      fullname: "Lê Minh Khoa",
      email: "student002@example.com",
    },
    classSchedule: {
      _id: "schedule002",
      date: "2025-11-20",
      startTime: "14:00",
      endTime: "16:00",
      class: { _id: "class001", name: "A1.2024.01" },
      room: { _id: "room002", room_name: "P205" },
    },
    newDate: null,
    newStartTime: null,
    newEndTime: null,
    newRoom: null,
    attendance: {
      status: "absent",
      checkInTime: null,
      markedBy: null,
    },
    leaveRequest: {
      reason: "Bận công việc gia đình",
      status: "pending",
      requestedAt: "2025-11-18T10:00:00Z",
    },
    createdAt: "2025-11-09T09:00:00Z",
  },
];

// ============================================================================
// VII. EXAMS & SUBMISSIONS
// ============================================================================

export const mockExams = [
  {
    _id: "exam001",
    title: "IELTS Practice Test 1",
    description: "Đề thi thử IELTS Academic - Full test (4 kỹ năng)",
    createdBy: {
      _id: "user002",
      fullname: "Trần Thị Hoa",
    },
    examType: "practice",
    level: "Academic",
    totalDuration: 180,
    sections: [
      {
        type: "listening",
        fileUrl: "/exams/ielts-practice-1-listening.pdf",
        audioUrls: ["/audio/ielts-practice-1-listening.mp3"],
        instructions: "You will hear 4 recordings. Answer all questions.",
        duration: 40,
        questionCount: 40,
        answerKey: [],
        maxScore: 40,
      },
      {
        type: "reading",
        fileUrl: "/exams/ielts-practice-1-reading.pdf",
        audioUrls: [],
        instructions: "Read the passages and answer questions.",
        duration: 60,
        questionCount: 40,
        answerKey: [],
        maxScore: 40,
      },
      {
        type: "writing",
        fileUrl: "/exams/ielts-practice-1-writing.pdf",
        audioUrls: [],
        instructions: "Complete Task 1 and Task 2.",
        duration: 60,
        questionCount: 2,
        answerKey: [],
        maxScore: 9,
      },
      {
        type: "speaking",
        fileUrl: "/exams/ielts-practice-1-speaking.pdf",
        audioUrls: [],
        instructions: "Complete 3 parts of speaking test.",
        duration: 15,
        questionCount: 3,
        answerKey: [],
        maxScore: 9,
      },
    ],
    isPublished: true,
    createdAt: "2025-10-01T00:00:00Z",
    updatedAt: "2025-10-05T00:00:00Z",
  },
  {
    _id: "exam002",
    title: "TOEIC Mock Test - Part 1-4",
    description: "Đề thi thử TOEIC Listening",
    createdBy: {
      _id: "user002",
      fullname: "Trần Thị Hoa",
    },
    examType: "real",
    level: "General",
    totalDuration: 45,
    sections: [
      {
        type: "listening",
        fileUrl: "/exams/toeic-mock-listening.pdf",
        audioUrls: ["/audio/toeic-mock-listening.mp3"],
        instructions: "Listen and answer 100 questions.",
        duration: 45,
        questionCount: 100,
        answerKey: [],
        maxScore: 495,
      },
    ],
    isPublished: true,
    createdAt: "2025-10-10T00:00:00Z",
    updatedAt: "2025-10-12T00:00:00Z",
  },
  {
    _id: "exam003",
    title: "IELTS Writing Task 2 Practice",
    description: "Luyện tập IELTS Writing Task 2",
    createdBy: {
      _id: "user003",
      fullname: "Phạm Minh Tuấn",
    },
    examType: "practice",
    level: "Academic",
    totalDuration: 40,
    sections: [
      {
        type: "writing",
        fileUrl: "/exams/ielts-writing-task2.pdf",
        audioUrls: [],
        instructions: "Write at least 250 words.",
        duration: 40,
        questionCount: 1,
        answerKey: [],
        maxScore: 9,
      },
    ],
    isPublished: false,
    createdAt: "2025-11-01T00:00:00Z",
    updatedAt: "2025-11-05T00:00:00Z",
  },
];

export const mockSubmissions = [
  {
    _id: "submission001",
    examId: "exam001",
    exam: {
      _id: "exam001",
      title: "IELTS Practice Test 1",
    },
    studentId: "user009",
    student: {
      _id: "user009",
      fullname: "Trần Thị Ngọc",
      email: "student001@example.com",
    },
    status: "completed",
    sections: [
      {
        sectionType: "listening",
        submittedAt: "2025-11-08T10:00:00Z",
        answers: [],
        sectionScore: 7.0,
        feedback: "Good listening comprehension",
        gradedBy: null,
        gradedAt: "2025-11-08T10:00:00Z",
      },
      {
        sectionType: "reading",
        submittedAt: "2025-11-08T11:00:00Z",
        answers: [],
        sectionScore: 6.5,
        feedback: "Need to improve reading speed",
        gradedBy: null,
        gradedAt: "2025-11-08T11:00:00Z",
      },
      {
        sectionType: "writing",
        submittedAt: "2025-11-08T12:00:00Z",
        answers: [
          {
            questionNumber: 1,
            answerText: "Task 1 essay content...",
            score: 6.5,
          },
          {
            questionNumber: 2,
            answerText: "Task 2 essay content...",
            score: 7.0,
          },
        ],
        sectionScore: 6.5,
        feedback: "Good structure, need to work on vocabulary range",
        gradedBy: {
          _id: "user003",
          fullname: "Phạm Minh Tuấn",
        },
        gradedAt: "2025-11-09T10:00:00Z",
      },
      {
        sectionType: "speaking",
        submittedAt: "2025-11-08T12:30:00Z",
        answers: [
          {
            questionNumber: 1,
            recordingUrl: "/recordings/student009-speaking-part1.mp3",
            score: 7.0,
          },
        ],
        sectionScore: 7.0,
        feedback: "Fluent speaking, good pronunciation",
        gradedBy: {
          _id: "user006",
          fullname: "Võ Thị Mai",
        },
        gradedAt: "2025-11-09T14:00:00Z",
      },
    ],
    totalScore: 27.0,
    bandScore: 6.75,
    createdAt: "2025-11-08T08:00:00Z",
    updatedAt: "2025-11-09T14:00:00Z",
  },
  {
    _id: "submission002",
    examId: "exam001",
    exam: {
      _id: "exam001",
      title: "IELTS Practice Test 1",
    },
    studentId: "user010",
    student: {
      _id: "user010",
      fullname: "Lê Minh Khoa",
      email: "student002@example.com",
    },
    status: "partially-submitted",
    sections: [
      {
        sectionType: "writing",
        submittedAt: "2025-11-09T10:00:00Z",
        answers: [
          {
            questionNumber: 1,
            answerText: "Task 1 essay content...",
            score: 0,
          },
        ],
        sectionScore: 0,
        feedback: null,
        gradedBy: null,
        gradedAt: null,
      },
    ],
    totalScore: 0,
    bandScore: 0,
    createdAt: "2025-11-09T09:00:00Z",
    updatedAt: "2025-11-09T10:00:00Z",
  },
];

export const mockExamStats = {
  total: 156,
  published: 120,
  draft: 36,
  totalSubmissions: 12345,
  pendingGrading: 45,
};

// ============================================================================
// VIII. DASHBOARD STATS (Updated)
// ============================================================================

export const mockDashboardStats = {
  pendingCourses: 12,
  pendingSchedules: 2,
  approvedCourses: 65,
  rejectedCourses: 4,
  totalStudents: 3456,
  activeClasses: 45,
  todayClasses: 12,
  avgAttendance: 92.5,
  pendingLeaveRequests: 8,
  pendingExamGrading: 45,
};

// ============================================================================
// IX. REPORTS DATA
// ============================================================================

export const mockReportStudents = {
  total: 3456,
  active: 3234,
  inactive: 122,
  pending: 100,
  growthRate: "+12.5%",
  byProgram: [
    { program: "TOEIC Foundation", count: 1200 },
    { program: "IELTS Academic", count: 1500 },
    { program: "English Speaking", count: 600 },
    { program: "Business English", count: 156 },
  ],
  attendanceRate: 92.5,
  topAbsentees: [
    { student: "Nguyễn Văn X", absences: 12, rate: "60%" },
    { student: "Trần Thị Y", absences: 10, rate: "65%" },
  ],
};

export const mockReportCourses = {
  totalPrograms: 15,
  totalCourses: 89,
  pendingApproval: 12,
  ploCoverage: "85%",
  topTemplates: [
    { name: "IELTS Writing Template", uses: 45 },
    { name: "TOEIC Listening Template", uses: 38 },
  ],
};

export const mockReportClasses = {
  activeClasses: 45,
  fillRate: "87%",
  pendingSchedules: 2,
  roomConflicts: 0,
};

export const mockReportRooms = {
  totalRooms: 20,
  utilizationRate: "78%",
  mostUsed: "P205 (95%)",
  leastUsed: "P101 (20%)",
};

export const mockReportExams = {
  totalExams: 156,
  totalSubmissions: 12345,
  pendingGrading: 45,
  bandScoreDistribution: [
    { band: "8.0-9.0", count: 123 },
    { band: "7.0-7.5", count: 456 },
    { band: "6.0-6.5", count: 789 },
    { band: "5.0-5.5", count: 345 },
    { band: "< 5.0", count: 123 },
  ],
};

export const mockReportEffectiveness = {
  ploAchievement: "82%",
  courseCompletion: "88%",
  studentSatisfaction: "4.2/5.0",
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const simulateApiDelay = (ms = 800) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getUserById = (userId) => {
  return mockUsers.find((user) => user._id === userId);
};

export const getRoleById = (roleId) => {
  return mockRoles.find((role) => role._id === roleId);
};

export const getProgramById = (programId) => {
  return mockPrograms.find((program) => program._id === programId);
};

export const getCourseById = (courseId) => {
  return mockCourses.find((course) => course._id === courseId);
};

export const getClassById = (classId) => {
  return mockClasses.find((cls) => cls._id === classId);
};

export const getRoomById = (roomId) => {
  return mockRooms.find((room) => room._id === roomId);
};

export const getExamById = (examId) => {
  return mockExams.find((exam) => exam._id === examId);
};
