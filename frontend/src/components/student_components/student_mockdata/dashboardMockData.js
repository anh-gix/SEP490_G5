/**
 * Mock Data for Student Dashboard
 */

export const studentInfoMock = {
  name: 'Nguyễn Văn A',
  studentId: 'SV001',
  className: 'A2-Evening-01',
  level: 'A2',
  avatar: null,
  attendanceRate: 92,
  completedLessons: 18,
  totalLessons: 30,
  averageScore: 8.5
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

  // Add some schedules
  weekDays[0].schedules.push({ time: '18:00', subject: 'Grammar', room: '102' });
  weekDays[2].schedules.push({ time: '18:00', subject: 'Reading', room: '102' });
  weekDays[4].schedules.push({ time: '18:00', subject: 'Listening', room: '102' });

  return weekDays;
};

export const assignmentsMock = [
  {
    id: 1,
    title: 'Unit 6 - Grammar Exercise',
    dueDate: '2025-11-18',
    status: 'pending',
    subject: 'Grammar',
    priority: 'high'
  },
  {
    id: 2,
    title: 'Reading Comprehension Test',
    dueDate: '2025-11-20',
    status: 'pending',
    subject: 'Reading',
    priority: 'medium'
  },
  {
    id: 3,
    title: 'Listening Practice Unit 5',
    dueDate: '2025-11-16',
    status: 'pending',
    subject: 'Listening',
    priority: 'medium'
  },
  {
    id: 4,
    title: 'Vocabulary Quiz - Unit 7',
    dueDate: '2025-11-22',
    status: 'pending',
    subject: 'Vocabulary',
    priority: 'low'
  },
  {
    id: 5,
    title: 'Speaking Practice Recording',
    dueDate: '2025-11-12',
    status: 'overdue',
    subject: 'Speaking',
    priority: 'high'
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
