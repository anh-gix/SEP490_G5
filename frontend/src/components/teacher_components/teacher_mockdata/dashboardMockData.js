/**
 * Teacher Dashboard Mock Data
 * Mock data cho trang dashboard giảng viên
 */

export const teacherDashboardMock = {
  stats: {
    upcomingLessons: 8,
    totalStudents: 85,
    pendingGrading: 12,
    pendingAttendance: 3
  },
  upcomingSchedule: [
    {
      id: 1,
      date: '2025-11-14',
      time: '10:30 - 12:30',
      className: 'A2-Evening-01',
      topic: 'Present Perfect Tense',
      room: 'Room 102',
      students: 25,
      isToday: true
    },
    {
      id: 2,
      date: '2025-11-14',
      time: '18:00 - 20:00',
      className: 'B1-Afternoon-02',
      topic: 'Reading Comprehension',
      room: 'Room 201',
      students: 20,
      isToday: true
    },
    {
      id: 3,
      date: '2025-11-15',
      time: '14:00 - 16:00',
      className: 'B1-Afternoon-02',
      topic: 'Listening Skills',
      room: 'Room 201',
      students: 20,
      isToday: false
    },
    {
      id: 4,
      date: '2025-11-16',
      time: '08:00 - 10:00',
      className: 'A1-Morning-03',
      topic: 'Basic Vocabulary',
      room: 'Room 105',
      students: 30,
      isToday: false
    }
  ],
  classesSummary: [
    {
      id: 1,
      name: 'A2-Evening-01',
      level: 'A2',
      students: 25,
      completedLessons: 26,
      totalLessons: 40,
      progress: 65,
      nextTest: 'Unit 5 - Grammar Test',
      nextTestDate: '18/11/2025',
      upcomingAssignment: 'Speaking Practice',
      assignmentDeadline: '16/11/2025'
    },
    {
      id: 2,
      name: 'B1-Afternoon-02',
      level: 'B1',
      students: 20,
      completedLessons: 19,
      totalLessons: 40,
      progress: 48,
      nextTest: 'Mid-term Exam',
      nextTestDate: '20/11/2025',
      upcomingAssignment: 'Essay Writing',
      assignmentDeadline: '15/11/2025'
    },
    {
      id: 3,
      name: 'A1-Morning-03',
      level: 'A1',
      students: 30,
      completedLessons: 12,
      totalLessons: 40,
      progress: 30,
      nextTest: 'Vocabulary Quiz',
      nextTestDate: '19/11/2025',
      upcomingAssignment: 'Listening Exercise',
      assignmentDeadline: '17/11/2025'
    }
  ]
};
