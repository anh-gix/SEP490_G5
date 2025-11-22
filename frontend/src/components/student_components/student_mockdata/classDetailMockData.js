/**
 * Mock Data for Student Class Detail
 */

export const getClassDetailMock = (classId) => ({
  id: classId,
  name: 'A2-Evening-01',
  level: 'A2',
  teacher: {
    name: 'Trần Thị B',
    email: 'tranthib@example.com',
    phone: '0123456789',
    avatar: null
  },
  schedule: 'Thứ 2, 4, 6 | 18:00 - 20:00',
  room: 'Room 102',
  startDate: '2025-09-01',
  endDate: '2025-11-30',
  totalLessons: 30,
  completedLessons: 18,
  description: 'Khóa học tiếng Anh cơ bản dành cho người mới bắt đầu, tập trung vào ngữ pháp cơ bản và giao tiếp hàng ngày.',
  objectives: [
    'Nắm vững ngữ pháp cơ bản tiếng Anh',
    'Có thể giao tiếp trong các tình huống hàng ngày',
    'Đọc hiểu các văn bản đơn giản',
    'Viết các đoạn văn ngắn'
  ]
});

export const materialsMock = [
  {
    id: 1,
    title: 'Unit 5 - Present Perfect Tense',
    type: 'pdf',
    size: '2.5 MB',
    uploadDate: '2025-10-28',
    downloadUrl: '#',
    lessonNumber: 18
  },
  {
    id: 2,
    title: 'Grammar Exercise - Unit 5',
    type: 'pdf',
    size: '1.2 MB',
    uploadDate: '2025-10-28',
    downloadUrl: '#',
    lessonNumber: 18
  },
  {
    id: 3,
    title: 'Listening Practice - Video',
    type: 'video',
    size: '45 MB',
    uploadDate: '2025-10-25',
    downloadUrl: '#',
    lessonNumber: 17
  }
];

export const homeworkMock = [
  {
    id: 1,
    title: 'Unit 6 - Grammar Exercise',
    description: 'Complete exercises 1-10 on page 45',
    dueDate: '2025-11-05',
    status: 'pending',
    score: null,
    submittedDate: null,
    feedback: null,
    attachments: []
  },
  {
    id: 2,
    title: 'Reading Comprehension Test',
    description: 'Read the passage and answer questions',
    dueDate: '2025-11-07',
    status: 'pending',
    score: null,
    submittedDate: null,
    feedback: null,
    attachments: []
  },
  {
    id: 3,
    title: 'Unit 5 - Writing Assignment',
    description: 'Write a short paragraph about your daily routine',
    dueDate: '2025-10-30',
    status: 'graded',
    score: 9,
    submittedDate: '2025-10-29',
    feedback: 'Good work! Pay attention to verb tenses.',
    attachments: ['assignment_5.pdf']
  }
];

export const progressMock = {
  attendanceRate: 92,
  totalPresent: 17,
  totalAbsent: 1,
  totalLate: 0,
  averageScore: 8.5,
  grades: [
    { lessonNumber: 10, type: 'Quiz', score: 8.0, date: '2025-10-10' },
    { lessonNumber: 12, type: 'Assignment', score: 9.0, date: '2025-10-15' },
    { lessonNumber: 15, type: 'Midterm', score: 8.5, date: '2025-10-22' },
    { lessonNumber: 18, type: 'Assignment', score: 9.0, date: '2025-10-29' }
  ],
  cloAchievement: [
    { clo: 'CLO1', name: 'Ngữ pháp cơ bản', progress: 85, target: 100 },
    { clo: 'CLO2', name: 'Giao tiếp hàng ngày', progress: 78, target: 100 },
    { clo: 'CLO3', name: 'Đọc hiểu', progress: 90, target: 100 },
    { clo: 'CLO4', name: 'Viết', progress: 82, target: 100 }
  ]
};
