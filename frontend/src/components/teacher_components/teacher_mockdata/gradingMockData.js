/**
 * Teacher Grading Mock Data
 * Mock data cho chấm điểm bài tập
 */

export const gradingAssignmentsMock = [
  {
    id: 1,
    title: 'Unit 5 - Grammar Exercise',
    className: 'A2-Evening-01',
    classId: 1,
    dueDate: '2025-11-20',
    totalSubmitted: 18,
    graded: 10,
    pending: 8,
    type: 'homework'
  },
  {
    id: 2,
    title: 'Listening Practice - Part 1',
    className: 'A2-Evening-01',
    classId: 1,
    dueDate: '2025-11-15',
    totalSubmitted: 25,
    graded: 20,
    pending: 5,
    type: 'practice'
  },
  {
    id: 3,
    title: 'Midterm Test',
    className: 'B1-Afternoon-02',
    classId: 2,
    dueDate: '2025-11-18',
    totalSubmitted: 15,
    graded: 5,
    pending: 10,
    type: 'test'
  }
];

export const submissionsMock = [
  {
    id: 1,
    studentName: 'Nguyễn Văn A',
    studentCode: 'SV001',
    studentEmail: 'nguyenvana@example.com',
    submittedAt: '2025-11-19T10:30:00',
    status: 'pending', // pending, graded
    files: [
      { name: 'Unit5_Exercise.pdf', size: '2.5 MB', url: '#' }
    ],
    scores: null,
    feedback: null
  },
  {
    id: 2,
    studentName: 'Trần Thị B',
    studentCode: 'SV002',
    studentEmail: 'tranthib@example.com',
    submittedAt: '2025-11-18T15:20:00',
    status: 'graded',
    files: [
      { name: 'Unit5_Homework.docx', size: '1.8 MB', url: '#' }
    ],
    scores: {
      reading: 8.5,
      listening: 7.0,
      writing: 8.0,
      speaking: 7.5,
      total: 7.75
    },
    feedback: 'Bài làm tốt, cần cải thiện phần listening.'
  },
  {
    id: 3,
    studentName: 'Lê Văn C',
    studentCode: 'SV003',
    studentEmail: 'levanc@example.com',
    submittedAt: '2025-11-19T14:45:00',
    status: 'pending',
    files: [
      { name: 'Grammar_Exercise.pdf', size: '3.2 MB', url: '#' }
    ],
    scores: null,
    feedback: null
  }
];
