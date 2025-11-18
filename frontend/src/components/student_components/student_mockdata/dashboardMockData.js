/**
 * Mock Data for Student Dashboard
 */

export const studentInfoMock = {
  name: 'Nguyễn Văn A',
  studentId: 'SV001',
  avatar: null
};

export const generateWeekScheduleMock = () => {
  const today = new Date();
  const weekDays = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - today.getDay() + i + 1); // Monday-Sunday
    weekDays.push({
      date: date,
      dayName: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
      dayNumber: date.getDate(),
      isToday: date.toDateString() === today.toDateString(),
      schedules: []
    });
  }

  // Add some schedules from different classes
  weekDays[0].schedules.push({ time: '18:00', subject: 'Grammar', room: '102' });
  weekDays[0].schedules.push({ time: '19:30', subject: 'TOEIC Reading', room: '205' });
  weekDays[2].schedules.push({ time: '18:00', subject: 'Reading', room: '102' });
  weekDays[3].schedules.push({ time: '19:30', subject: 'TOEIC Listening', room: '205' });
  weekDays[4].schedules.push({ time: '18:00', subject: 'Listening', room: '102' });

  return weekDays;
};

// Active classes that student is currently enrolled in
// Format: Level - Program - Number (e.g., A2-TOEIC-01)
export const activeClassesMock = [
  {
    id: 1,
    className: 'A2-TOEIC-01',
    level: 'A2',
    program: 'TOEIC',
    course: 'Fundamental English',
    teacher: 'Nguyễn Thị Mai',
    schedule: 'T2, T4, T6 (19:30-21:00)',
    completedLessons: 15,
    totalLessons: 30,
    attendanceRate: 95
  },
  {
    id: 2,
    className: 'B1-IELTS-02',
    level: 'B1',
    program: 'IELTS',
    course: 'General English',
    teacher: 'Trần Văn Hùng',
    schedule: 'T3, T5, T7 (18:00-19:30)',
    completedLessons: 8,
    totalLessons: 25,
    attendanceRate: 88
  }
];

export const dashboardAssignmentsMock = [
  {
    id: 1,
    title: 'Unit 6 - Grammar Exercise',
    dueDate: '2025-11-18',
    status: 'pending',
    subject: 'Grammar',
    priority: 'high',
    className: 'B1-IELTS-02'
  },
  {
    id: 2,
    title: 'Reading Comprehension Part 5-6',
    dueDate: '2025-11-20',
    status: 'pending',
    subject: 'Reading',
    priority: 'medium',
    className: 'A2-TOEIC-01'
  },
  {
    id: 3,
    title: 'Listening Practice Unit 5',
    dueDate: '2025-11-16',
    status: 'pending',
    subject: 'Listening',
    priority: 'medium',
    className: 'B1-IELTS-02'
  },
  {
    id: 4,
    title: 'TOEIC Vocabulary Quiz - Unit 7',
    dueDate: '2025-11-22',
    status: 'pending',
    subject: 'Vocabulary',
    priority: 'low',
    className: 'A2-TOEIC-01'
  },
  {
    id: 5,
    title: 'Speaking Practice Recording',
    dueDate: '2025-11-12',
    status: 'overdue',
    subject: 'Speaking',
    priority: 'high',
    className: 'B1-IELTS-02'
  }
];

export const toeicResultsMock = [
  {
    id: 1,
    testName: 'TOEIC Practice Test 1',
    date: '2025-11-01',
    listening: 385,
    reading: 420,
    total: 805
  },
  {
    id: 2,
    testName: 'TOEIC Practice Test 2',
    date: '2025-10-25',
    listening: 365,
    reading: 410,
    total: 775
  }
];
