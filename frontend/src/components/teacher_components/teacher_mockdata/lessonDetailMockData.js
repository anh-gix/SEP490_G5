/**
 * Teacher Lesson Detail Mock Data
 * Mock data cho chi tiết buổi học
 */

export const getLessonDetailMock = (lessonId) => {
  return {
    id: lessonId,
    date: '2025-11-14',
    time: '10:30 - 12:30',
    className: 'A2-Evening-01',
    classId: '1',
    topic: 'Present Perfect Tense',
    room: 'Room 102',
    students: 25,
    attendedStudents: 23,
    level: 'A2',
    status: 'upcoming',
    description: 'Học về thì hiện tại hoàn thành, cách sử dụng và các dạng bài tập thực hành',
    objectives: [
      'Hiểu và vận dụng được cấu trúc Present Perfect Tense',
      'Phân biệt được Present Perfect và Past Simple',
      'Làm bài tập thực hành về thì hiện tại hoàn thành'
    ],
    materials: [
      'Unit 5 - Grammar Book',
      'Exercise Worksheet',
      'PowerPoint Presentation'
    ],
    homework: 'Complete Exercise 1-5 in Unit 5',
    homeworkDeadline: '17/11/2025',
    notes: 'Chuẩn bị bài giảng về Present Perfect. Nhớ mang theo tài liệu photocopied.'
  };
};
