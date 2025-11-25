/**
 * Teacher Attendance Mock Data
 * Mock data cho điểm danh học viên
 */

export const getAttendanceMockData = (scheduleId) => {
  return {
    schedule: {
      id: scheduleId,
      className: 'A2-Evening-01',
      date: '2025-11-12',
      startTime: '18:00',
      endTime: '20:00',
      topic: 'Present Perfect Tense',
      lessonNumber: 18,
      room: 'Room 102'
    },
    students: [
      {
        id: 1,
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        studentCode: 'SV001',
        attendance: {
          status: 'present', // present, absent, late, excused
          checkInTime: '2025-11-12T18:05:00',
          markedBy: null
        }
      },
      {
        id: 2,
        name: 'Trần Thị B',
        email: 'tranthib@example.com',
        studentCode: 'SV002',
        attendance: {
          status: 'absent',
          checkInTime: null,
          markedBy: null
        }
      },
      {
        id: 3,
        name: 'Lê Văn C',
        email: 'levanc@example.com',
        studentCode: 'SV003',
        attendance: {
          status: 'late',
          checkInTime: '2025-11-12T18:25:00',
          markedBy: null
        }
      },
      {
        id: 4,
        name: 'Phạm Thị D',
        email: 'phamthid@example.com',
        studentCode: 'SV004',
        attendance: {
          status: 'excused',
          checkInTime: null,
          markedBy: null
        }
      }
    ]
  };
};
