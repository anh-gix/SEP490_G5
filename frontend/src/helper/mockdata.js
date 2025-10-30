// Mock Data cho Center Head Application

// Dashboard Stats
export const mockDashboardStats = {
  pendingCourses: 5,
  pendingSchedules: 2,
  approvedCourses: 12,
  rejectedCourses: 3,
};

// Pending Courses List
export const mockPendingCourses = [
  {
    _id: "course001",
    name: "Lập trình Java cơ bản",
    description: "Khóa học giới thiệu các khái niệm cơ bản về lập trình Java, bao gồm cú pháp, OOP, và các thư viện phổ biến.",
    status: "pending_approval",
    program: {
      _id: "prog001",
      program_name: "Lập trình Web",
      code: "WEB_2024"
    },
    createdBy: {
      _id: "user001",
      fullname: "Nguyễn Văn A",
      email: "nguyenvana@example.com"
    },
    createdAt: "2025-10-15T08:30:00Z",
    updatedAt: "2025-10-20T10:45:00Z",
    sessions: [
      {
        _id: "session001",
        name: "Giới thiệu Java",
        topic: "Java Fundamentals",
        material: "Slides giới thiệu về Java, cài đặt môi trường JDK, IDE Eclipse",
        clos: [
          { _id: "clo001", code: "CLO1" },
          { _id: "clo002", code: "CLO2" }
        ]
      },
      {
        _id: "session002",
        name: "Biến và Kiểu dữ liệu",
        topic: "Variables and Data Types",
        material: "Bài giảng về primitive types, wrapper classes, type casting",
        clos: [
          { _id: "clo003", code: "CLO3" }
        ]
      },
      {
        _id: "session003",
        name: "Cấu trúc điều khiển",
        topic: "Control Structures",
        material: "If-else, switch-case, loops (for, while, do-while)",
        clos: [
          { _id: "clo003", code: "CLO3" },
          { _id: "clo004", code: "CLO4" }
        ]
      }
    ],
    clos: [
      {
        _id: "clo001",
        code: "CLO1",
        detail: "Hiểu được các khái niệm cơ bản về lập trình hướng đối tượng",
        mappedPLOs: [
          { _id: "plo001", code: "PLO1", name: "Kiến thức nền tảng" },
          { _id: "plo003", code: "PLO3", name: "Tư duy logic" }
        ]
      },
      {
        _id: "clo002",
        code: "CLO2",
        detail: "Cài đặt và sử dụng thành thạo môi trường phát triển Java",
        mappedPLOs: [
          { _id: "plo002", code: "PLO2", name: "Kỹ năng thực hành" }
        ]
      },
      {
        _id: "clo003",
        code: "CLO3",
        detail: "Sử dụng các cấu trúc dữ liệu và điều khiển trong Java",
        mappedPLOs: [
          { _id: "plo001", code: "PLO1", name: "Kiến thức nền tảng" },
          { _id: "plo002", code: "PLO2", name: "Kỹ năng thực hành" }
        ]
      },
      {
        _id: "clo004",
        code: "CLO4",
        detail: "Xây dựng các chương trình Java đơn giản giải quyết bài toán thực tế",
        mappedPLOs: [
          { _id: "plo002", code: "PLO2", name: "Kỹ năng thực hành" },
          { _id: "plo004", code: "PLO4", name: "Giải quyết vấn đề" }
        ]
      }
    ]
  },
  {
    _id: "course002",
    name: "Tiếng Anh Giao tiếp B1",
    description: "Khóa học giúp học viên đạt trình độ B1 theo chuẩn CEFR, tập trung vào kỹ năng giao tiếp thực tế.",
    status: "pending_approval",
    program: {
      _id: "prog002",
      program_name: "Ngoại ngữ",
      code: "ENG_2024"
    },
    createdBy: {
      _id: "user002",
      fullname: "Trần Thị B",
      email: "tranthib@example.com"
    },
    createdAt: "2025-10-18T09:00:00Z",
    updatedAt: "2025-10-19T14:30:00Z",
    sessions: [
      {
        _id: "session004",
        name: "Introduction & Small Talk",
        topic: "Getting to know each other",
        material: "Conversation starters, common phrases, cultural notes",
        clos: [
          { _id: "clo005", code: "CLO1" }
        ]
      },
      {
        _id: "session005",
        name: "Daily Routines",
        topic: "Talking about daily activities",
        material: "Present simple tense, time expressions, vocabulary",
        clos: [
          { _id: "clo005", code: "CLO1" },
          { _id: "clo006", code: "CLO2" }
        ]
      }
    ],
    clos: [
      {
        _id: "clo005",
        code: "CLO1",
        detail: "Giao tiếp được trong các tình huống hàng ngày",
        mappedPLOs: [
          { _id: "plo005", code: "PLO1", name: "Kỹ năng giao tiếp" }
        ]
      },
      {
        _id: "clo006",
        code: "CLO2",
        detail: "Sử dụng đúng ngữ pháp cơ bản trong câu văn",
        mappedPLOs: [
          { _id: "plo006", code: "PLO2", name: "Kiến thức ngôn ngữ" }
        ]
      }
    ]
  },
  {
    _id: "course003",
    name: "Cơ sở dữ liệu MySQL",
    description: "Học về thiết kế và quản lý cơ sở dữ liệu quan hệ với MySQL",
    status: "pending_approval",
    program: {
      _id: "prog001",
      program_name: "Lập trình Web",
      code: "WEB_2024"
    },
    createdBy: {
      _id: "user003",
      fullname: "Lê Văn C",
      email: "levanc@example.com"
    },
    createdAt: "2025-10-16T11:20:00Z",
    updatedAt: "2025-10-21T09:15:00Z",
    sessions: [
      {
        _id: "session006",
        name: "Giới thiệu CSDL",
        topic: "Database Introduction",
        material: "Khái niệm CSDL, RDBMS, SQL vs NoSQL",
        clos: [
          { _id: "clo007", code: "CLO1" }
        ]
      },
      {
        _id: "session007",
        name: "SQL cơ bản",
        topic: "Basic SQL Queries",
        material: "SELECT, WHERE, ORDER BY, LIMIT",
        clos: [
          { _id: "clo008", code: "CLO2" }
        ]
      },
      {
        _id: "session008",
        name: "Thiết kế CSDL",
        topic: "Database Design",
        material: "ER Diagram, Normalization, Relationships",
        clos: [
          { _id: "clo009", code: "CLO3" }
        ]
      }
    ],
    clos: [
      {
        _id: "clo007",
        code: "CLO1",
        detail: "Hiểu khái niệm và vai trò của CSDL trong hệ thống",
        mappedPLOs: [
          { _id: "plo001", code: "PLO1", name: "Kiến thức nền tảng" }
        ]
      },
      {
        _id: "clo008",
        code: "CLO2",
        detail: "Viết được các câu truy vấn SQL cơ bản",
        mappedPLOs: [
          { _id: "plo002", code: "PLO2", name: "Kỹ năng thực hành" }
        ]
      },
      {
        _id: "clo009",
        code: "CLO3",
        detail: "Thiết kế được CSDL cho ứng dụng đơn giản",
        mappedPLOs: [
          { _id: "plo004", code: "PLO4", name: "Giải quyết vấn đề" }
        ]
      }
    ]
  },
  {
    _id: "course004",
    name: "React.js Nâng cao",
    description: "Khóa học React.js với các chủ đề nâng cao: Hooks, Context API, Performance Optimization",
    status: "pending_approval",
    program: {
      _id: "prog001",
      program_name: "Lập trình Web",
      code: "WEB_2024"
    },
    createdBy: {
      _id: "user004",
      fullname: "Phạm Thị D",
      email: "phamthid@example.com"
    },
    createdAt: "2025-10-17T13:45:00Z",
    updatedAt: "2025-10-22T16:20:00Z",
    sessions: [
      {
        _id: "session009",
        name: "React Hooks",
        topic: "useState, useEffect, Custom Hooks",
        material: "Hooks API, best practices, common patterns",
        clos: [
          { _id: "clo010", code: "CLO1" }
        ]
      },
      {
        _id: "session010",
        name: "Context API & State Management",
        topic: "Global State Management",
        material: "Context API, useContext, useReducer",
        clos: [
          { _id: "clo011", code: "CLO2" }
        ]
      }
    ],
    clos: [
      {
        _id: "clo010",
        code: "CLO1",
        detail: "Sử dụng thành thạo React Hooks",
        mappedPLOs: [
          { _id: "plo002", code: "PLO2", name: "Kỹ năng thực hành" }
        ]
      },
      {
        _id: "clo011",
        code: "CLO2",
        detail: "Quản lý state hiệu quả trong ứng dụng React",
        mappedPLOs: [
          { _id: "plo004", code: "PLO4", name: "Giải quyết vấn đề" }
        ]
      }
    ]
  },
  {
    _id: "course005",
    name: "Marketing Digital",
    description: "Chiến lược Marketing số cho doanh nghiệp hiện đại",
    status: "pending_approval",
    program: {
      _id: "prog003",
      program_name: "Kinh doanh số",
      code: "BIZ_2024"
    },
    createdBy: {
      _id: "user005",
      fullname: "Hoàng Văn E",
      email: "hoangvane@example.com"
    },
    createdAt: "2025-10-19T10:30:00Z",
    updatedAt: "2025-10-23T11:00:00Z",
    sessions: [
      {
        _id: "session011",
        name: "Giới thiệu Digital Marketing",
        topic: "Digital Marketing Overview",
        material: "Các kênh marketing, customer journey, metrics",
        clos: [
          { _id: "clo012", code: "CLO1" }
        ]
      },
      {
        _id: "session012",
        name: "SEO & Content Marketing",
        topic: "Search Engine Optimization",
        material: "On-page SEO, Content strategy, Keywords research",
        clos: [
          { _id: "clo013", code: "CLO2" }
        ]
      }
    ],
    clos: [
      {
        _id: "clo012",
        code: "CLO1",
        detail: "Hiểu về các kênh marketing số và cách áp dụng",
        mappedPLOs: [
          { _id: "plo001", code: "PLO1", name: "Kiến thức nền tảng" }
        ]
      },
      {
        _id: "clo013",
        code: "CLO2",
        detail: "Lập kế hoạch content marketing hiệu quả",
        mappedPLOs: [
          { _id: "plo004", code: "PLO4", name: "Giải quyết vấn đề" }
        ]
      }
    ]
  }
];

// Pending Schedules List
export const mockPendingSchedules = [
  {
    _id: "schedule001",
    status: "pending_approval",
    startTime: "2025-10-25T18:00:00Z",
    endTime: "2025-10-25T20:00:00Z",
    room: "A101",
    reason: "Bù nghỉ lễ Quốc khánh 2/9",
    course: {
      _id: "course001",
      name: "Lập trình Java cơ bản",
      code: "JAVA_101"
    },
    session: {
      _id: "session001",
      name: "Buổi 5: Collections Framework",
      topic: "ArrayList, HashMap, Iterator"
    },
    createdBy: {
      _id: "user006",
      fullname: "Nguyễn Giáo vụ A",
      email: "giaovu.a@example.com"
    },
    createdAt: "2025-10-20T08:00:00Z"
  },
  {
    _id: "schedule002",
    status: "pending_approval",
    startTime: "2025-10-26T09:00:00Z",
    endTime: "2025-10-26T11:00:00Z",
    room: "B203",
    reason: "Tăng cường buổi thực hành cho sinh viên yếu",
    course: {
      _id: "course002",
      name: "Tiếng Anh Giao tiếp B1",
      code: "ENG_B1"
    },
    session: {
      _id: "session013",
      name: "Extra Practice: Speaking Skills",
      topic: "Conversation practice and role-play"
    },
    createdBy: {
      _id: "user007",
      fullname: "Trần Giáo vụ B",
      email: "giaovu.b@example.com"
    },
    createdAt: "2025-10-21T10:30:00Z"
  },
  {
    _id: "schedule003",
    status: "pending_approval",
    startTime: "2025-10-27T14:00:00Z",
    endTime: "2025-10-27T16:00:00Z",
    room: "C305",
    reason: "Dạy bù do giảng viên nghỉ ốm buổi trước",
    course: {
      _id: "course003",
      name: "Cơ sở dữ liệu MySQL",
      code: "DB_201"
    },
    session: {
      _id: "session007",
      name: "Buổi 8: Stored Procedures",
      topic: "Creating and using stored procedures"
    },
    createdBy: {
      _id: "user006",
      fullname: "Nguyễn Giáo vụ A",
      email: "giaovu.a@example.com"
    },
    createdAt: "2025-10-22T09:15:00Z"
  },
  {
    _id: "schedule004",
    status: "pending_approval",
    startTime: "2025-10-28T15:30:00Z",
    endTime: "2025-10-28T17:30:00Z",
    room: "LAB_1",
    reason: "Workshop bổ sung về Performance Optimization",
    course: {
      _id: "course004",
      name: "React.js Nâng cao",
      code: "REACT_301"
    },
    session: {
      _id: "session014",
      name: "Workshop: React Performance",
      topic: "Memo, useMemo, useCallback, Code Splitting"
    },
    createdBy: {
      _id: "user008",
      fullname: "Lê Giáo vụ C",
      email: "giaovu.c@example.com"
    },
    createdAt: "2025-10-23T11:20:00Z"
  }
];

// Helper function to get course by ID
export const getCourseById = (courseId) => {
  return mockPendingCourses.find(course => course._id === courseId);
};

// Helper function to get schedule by ID
export const getScheduleById = (scheduleId) => {
  return mockPendingSchedules.find(schedule => schedule._id === scheduleId);
};

// Simulate API delay
export const simulateApiDelay = (ms = 800) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};