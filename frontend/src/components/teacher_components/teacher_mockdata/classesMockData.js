/**
 * Teacher Classes Mock Data
 * Mock data cho danh sách lớp học
 */

export const teacherClassesMock = [
  {
    id: 1,
    name: 'A2-Evening-01',
    level: 'A2',
    schedule: 'Thứ 2, 4, 6 | 18:00 - 20:00',
    room: 'Room 102',
    startDate: '2025-09-01',
    endDate: '2025-11-30',
    totalLessons: 30,
    completedLessons: 18,
    totalStudents: 25,
    presentStudents: 23,
    status: 'active',
    pendingAssignments: 5,
    ungradedSubmissions: 8,
    nextLesson: {
      date: '2025-11-13',
      topic: 'Present Perfect Tense'
    }
  },
  {
    id: 2,
    name: 'B1-Afternoon-02',
    level: 'B1',
    schedule: 'Thứ 3, 5, 7 | 14:00 - 16:00',
    room: 'Room 201',
    startDate: '2025-09-15',
    endDate: '2025-12-15',
    totalLessons: 30,
    completedLessons: 12,
    totalStudents: 20,
    presentStudents: 18,
    status: 'active',
    pendingAssignments: 3,
    ungradedSubmissions: 4,
    nextLesson: {
      date: '2025-11-12',
      topic: 'Advanced Grammar'
    }
  }
];
