/**
 * Teacher Class Detail Mock Data
 * Mock data cho chi tiết lớp học
 */

export const getClassDetailMock = (classId) => {
  return {
    classInfo: {
      id: classId,
      name: 'A2-Evening-01',
      level: 'A2',
      subject: 'English Communication',
      startDate: '2025-09-01',
      endDate: '2025-12-15',
      schedule: 'Thứ 2, 4, 6 - 18:00-20:00',
      room: 'Room 102',
      totalLessons: 30,
      completedLessons: 18,
      totalStudents: 25,
      activeStudents: 24,
      averageAttendance: 92,
      nextLesson: {
        date: '2025-11-13',
        time: '18:00-20:00',
        topic: 'Present Perfect Tense'
      }
    },
    students: [
      {
        id: 1,
        name: 'Nguyễn Văn A',
        code: 'SV001',
        email: 'nguyenvana@example.com',
        phone: '0901234567',
        attendanceRate: 95,
        averageScore: 8.5,
        totalAssignments: 12,
        submittedAssignments: 11,
        status: 'active'
      },
      {
        id: 2,
        name: 'Trần Thị B',
        code: 'SV002',
        email: 'tranthib@example.com',
        phone: '0901234568',
        attendanceRate: 88,
        averageScore: 7.8,
        totalAssignments: 12,
        submittedAssignments: 10,
        status: 'active'
      },
      {
        id: 3,
        name: 'Lê Văn C',
        code: 'SV003',
        email: 'levanc@example.com',
        phone: '0901234569',
        attendanceRate: 92,
        averageScore: 8.0,
        totalAssignments: 12,
        submittedAssignments: 12,
        status: 'active'
      }
    ],
    materials: [
      {
        id: 1,
        title: 'Unit 5 - Grammar Reference',
        type: 'document',
        uploadedAt: '2025-11-01T10:00:00',
        size: '2.5 MB',
        downloads: 23,
        url: '#'
      },
      {
        id: 2,
        title: 'Listening Exercise Audio',
        type: 'audio',
        uploadedAt: '2025-11-05T14:30:00',
        size: '5.8 MB',
        downloads: 20,
        url: '#'
      },
      {
        id: 3,
        title: 'Presentation Slides - Week 9',
        type: 'presentation',
        uploadedAt: '2025-11-08T09:15:00',
        size: '8.2 MB',
        downloads: 25,
        url: '#'
      }
    ],
    assignments: [
      {
        id: 1,
        title: 'Unit 5 - Grammar Exercise',
        type: 'homework',
        dueDate: '2025-11-20',
        submitted: 18,
        total: 25,
        graded: 10,
        averageScore: 7.8,
        submissions: [
          { studentId: 1, studentName: 'Nguyễn Văn A', submittedAt: '2025-11-18T14:30:00', score: 8.5, status: 'graded' },
          { studentId: 2, studentName: 'Trần Thị B', submittedAt: '2025-11-19T10:15:00', score: 7.0, status: 'graded' },
          { studentId: 3, studentName: 'Lê Văn C', submittedAt: '2025-11-19T16:45:00', score: null, status: 'submitted' }
        ]
      },
      {
        id: 2,
        title: 'Listening Practice - Part 1',
        type: 'practice',
        dueDate: '2025-11-15',
        submitted: 25,
        total: 25,
        graded: 20,
        averageScore: 8.2,
        submissions: [
          { studentId: 1, studentName: 'Nguyễn Văn A', submittedAt: '2025-11-14T09:20:00', score: 9.0, status: 'graded' },
          { studentId: 2, studentName: 'Trần Thị B', submittedAt: '2025-11-14T11:30:00', score: 8.5, status: 'graded' }
        ]
      }
    ],
    lessons: [
      {
        id: 1,
        lessonNumber: 1,
        date: '2025-09-01',
        time: '18:00-20:00',
        topic: 'Introduction & Greetings',
        status: 'completed',
        attendanceCount: 24,
        totalStudents: 25,
        hasAttendance: true
      },
      {
        id: 2,
        lessonNumber: 2,
        date: '2025-09-03',
        time: '18:00-20:00',
        topic: 'Present Simple Tense',
        status: 'completed',
        attendanceCount: 23,
        totalStudents: 25,
        hasAttendance: true
      },
      {
        id: 3,
        lessonNumber: 3,
        date: '2025-09-05',
        time: '18:00-20:00',
        topic: 'Daily Routines & Activities',
        status: 'completed',
        attendanceCount: 25,
        totalStudents: 25,
        hasAttendance: true
      },
      {
        id: 18,
        lessonNumber: 18,
        date: '2025-11-11',
        time: '18:00-20:00',
        topic: 'Past Continuous',
        status: 'completed',
        attendanceCount: 22,
        totalStudents: 25,
        hasAttendance: true
      },
      {
        id: 19,
        lessonNumber: 19,
        date: '2025-11-13',
        time: '18:00-20:00',
        topic: 'Present Perfect Tense',
        status: 'upcoming',
        attendanceCount: 0,
        totalStudents: 25,
        hasAttendance: false
      }
    ]
  };
};
