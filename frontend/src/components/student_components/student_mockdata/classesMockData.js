/**
 * Mock Data for My Classes
 */

export const classesMock = [
  {
    id: 1,
    name: 'A2-Evening-01',
    level: 'A2',
    teacher: 'Trần Thị B',
    schedule: 'Thứ 2, 4, 6 | 18:00 - 20:00',
    startDate: '2025-09-01',
    endDate: '2025-11-30',
    totalLessons: 30,
    completedLessons: 18,
    nextLesson: {
      date: '2025-11-03',
      topic: 'Present Perfect Tense'
    },
    pendingAssignments: 2,
    attendanceRate: 92,
    averageScore: 8.5,
    status: 'active',
    thumbnail: null
  },
  {
    id: 2,
    name: 'IELTS-Writing-03',
    level: 'IELTS',
    teacher: 'Nguyễn Văn C',
    schedule: 'Thứ 3, 5 | 19:00 - 21:00',
    startDate: '2025-10-01',
    endDate: '2025-12-20',
    totalLessons: 20,
    completedLessons: 8,
    nextLesson: {
      date: '2025-11-05',
      topic: 'Task 2 Essay Structure'
    },
    pendingAssignments: 1,
    attendanceRate: 100,
    averageScore: 7.8,
    status: 'active',
    thumbnail: null
  },
  {
    id: 3,
    name: 'A1-Morning-02',
    level: 'A1',
    teacher: 'Lê Thị D',
    schedule: 'Thứ 2, 4 | 09:00 - 11:00',
    startDate: '2025-06-01',
    endDate: '2025-08-30',
    totalLessons: 24,
    completedLessons: 24,
    nextLesson: null,
    pendingAssignments: 0,
    attendanceRate: 95,
    averageScore: 8.2,
    status: 'completed',
    thumbnail: null
  }
];
