/**
 * Mock Data for Student Lesson Detail
 */

export const getLessonDetailMock = (lessonId) => ({
  id: lessonId,
  date: '2025-11-18',
  time: '18:00 - 20:00',
  className: 'A2-Evening-01',
  classId: '1',
  topic: 'Present Perfect Tense',
  room: 'Room 102 - Tòa A',
  teacher: 'Nguyễn Văn A',
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
  homeworkDeadline: '20/11/2025',
  notes: 'Vui lòng xem trước Unit 5 và chuẩn bị câu hỏi nếu có.'
});
