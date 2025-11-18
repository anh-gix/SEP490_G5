/**
 * Mock Data for Student Schedule
 * Updated to match new class structure: Level-Program-Number
 */

export const generateScheduleMockData = () => {
  const today = new Date();
  
  return [
    // Previous week - A2-TOEIC-01
    {
      _id: '1',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 10).toISOString(),
      startTime: '19:30',
      endTime: '21:00',
      topic: 'TOEIC Reading Part 5 - Grammar',
      teacher: { username: 'Nguyễn Thị Mai' },
      room: { room_name: '205', location: 'Tòa B' },
      className: 'A2-TOEIC-01',
      program: 'TOEIC',
      course: 'Fundamental English',
      subject: 'Reading',
      attendance: { status: 'present' }
    },
    {
      _id: '2',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 8).toISOString(),
      startTime: '19:30',
      endTime: '21:00',
      topic: 'TOEIC Listening Part 1-2',
      teacher: { username: 'Nguyễn Thị Mai' },
      room: { room_name: '205', location: 'Tòa B' },
      className: 'A2-TOEIC-01',
      program: 'TOEIC',
      course: 'Fundamental English',
      subject: 'Listening',
      attendance: { status: 'present' }
    },
    {
      _id: '3',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6).toISOString(),
      startTime: '19:30',
      endTime: '21:00',
      topic: 'TOEIC Reading Part 6 - Text Completion',
      teacher: { username: 'Nguyễn Thị Mai' },
      room: { room_name: '205', location: 'Tòa B' },
      className: 'A2-TOEIC-01',
      program: 'TOEIC',
      course: 'Fundamental English',
      subject: 'Reading',
      attendance: { status: 'present' }
    },
    // Previous week - B1-IELTS-02
    {
      _id: '11',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 9).toISOString(),
      startTime: '18:00',
      endTime: '19:30',
      topic: 'IELTS Writing Task 1 - Graphs & Charts',
      teacher: { username: 'Trần Văn Hùng' },
      room: { room_name: '102', location: 'Tòa A' },
      className: 'B1-IELTS-02',
      program: 'IELTS',
      course: 'General English',
      subject: 'Writing',
      attendance: { status: 'present' }
    },
    {
      _id: '12',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7).toISOString(),
      startTime: '18:00',
      endTime: '19:30',
      topic: 'IELTS Speaking Part 1 - Introduction',
      teacher: { username: 'Trần Văn Hùng' },
      room: { room_name: '102', location: 'Tòa A' },
      className: 'B1-IELTS-02',
      program: 'IELTS',
      course: 'General English',
      subject: 'Speaking',
      attendance: { status: 'present' }
    },
    {
      _id: '13',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5).toISOString(),
      startTime: '18:00',
      endTime: '19:30',
      topic: 'IELTS Reading - Multiple Choice',
      teacher: { username: 'Trần Văn Hùng' },
      room: { room_name: '102', location: 'Tòa A' },
      className: 'B1-IELTS-02',
      program: 'IELTS',
      course: 'General English',
      subject: 'Reading',
      attendance: { status: 'present' }
    },
    // This week - A2-TOEIC-01
    {
      _id: '4',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3).toISOString(),
      startTime: '19:30',
      endTime: '21:00',
      topic: 'TOEIC Listening Part 3 - Conversations',
      teacher: { username: 'Nguyễn Thị Mai' },
      room: { room_name: '205', location: 'Tòa B' },
      className: 'A2-TOEIC-01',
      program: 'TOEIC',
      course: 'Fundamental English',
      subject: 'Listening',
      attendance: { status: 'present' }
    },
    {
      _id: '5',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1).toISOString(),
      startTime: '19:30',
      endTime: '21:00',
      topic: 'TOEIC Reading Part 7 - Single Passages',
      teacher: { username: 'Nguyễn Thị Mai' },
      room: { room_name: '205', location: 'Tòa B' },
      className: 'A2-TOEIC-01',
      program: 'TOEIC',
      course: 'Fundamental English',
      subject: 'Reading',
      attendance: { status: 'present' }
    },
    // This week - B1-IELTS-02
    {
      _id: '14',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2).toISOString(),
      startTime: '18:00',
      endTime: '19:30',
      topic: 'IELTS Listening Section 1-2',
      teacher: { username: 'Trần Văn Hùng' },
      room: { room_name: '102', location: 'Tòa A' },
      className: 'B1-IELTS-02',
      program: 'IELTS',
      course: 'General English',
      subject: 'Listening',
      attendance: { status: 'present' }
    },
    // Upcoming lessons - A2-TOEIC-01
    {
      _id: '6',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString(),
      startTime: '19:30',
      endTime: '21:00',
      topic: 'TOEIC Listening Part 4 - Talks',
      teacher: { username: 'Nguyễn Thị Mai' },
      room: { room_name: '205', location: 'Tòa B' },
      className: 'A2-TOEIC-01',
      program: 'TOEIC',
      course: 'Fundamental English',
      subject: 'Listening',
      attendance: null
    },
    {
      _id: '7',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3).toISOString(),
      startTime: '19:30',
      endTime: '21:00',
      topic: 'TOEIC Reading Part 7 - Double Passages',
      teacher: { username: 'Nguyễn Thị Mai' },
      room: { room_name: '205', location: 'Tòa B' },
      className: 'A2-TOEIC-01',
      program: 'TOEIC',
      course: 'Fundamental English',
      subject: 'Reading',
      attendance: null
    },
    {
      _id: '8',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5).toISOString(),
      startTime: '19:30',
      endTime: '21:00',
      topic: 'TOEIC Vocabulary - Business Terms',
      teacher: { username: 'Nguyễn Thị Mai' },
      room: { room_name: '205', location: 'Tòa B' },
      className: 'A2-TOEIC-01',
      program: 'TOEIC',
      course: 'Fundamental English',
      subject: 'Vocabulary',
      attendance: null
    },
    // Upcoming lessons - B1-IELTS-02
    {
      _id: '15',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2).toISOString(),
      startTime: '18:00',
      endTime: '19:30',
      topic: 'IELTS Writing Task 2 - Opinion Essays',
      teacher: { username: 'Trần Văn Hùng' },
      room: { room_name: '102', location: 'Tòa A' },
      className: 'B1-IELTS-02',
      program: 'IELTS',
      course: 'General English',
      subject: 'Writing',
      attendance: null
    },
    {
      _id: '16',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4).toISOString(),
      startTime: '18:00',
      endTime: '19:30',
      topic: 'IELTS Speaking Part 2 - Cue Card',
      teacher: { username: 'Trần Văn Hùng' },
      room: { room_name: '102', location: 'Tòa A' },
      className: 'B1-IELTS-02',
      program: 'IELTS',
      course: 'General English',
      subject: 'Speaking',
      attendance: null
    },
    {
      _id: '9',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 8).toISOString(),
      startTime: '19:30',
      endTime: '21:00',
      topic: 'TOEIC Practice Test - Full Test',
      teacher: { username: 'Nguyễn Thị Mai' },
      room: { room_name: '205', location: 'Tòa B' },
      className: 'A2-TOEIC-01',
      program: 'TOEIC',
      course: 'Fundamental English',
      subject: 'Practice Test',
      attendance: null
    },
    {
      _id: '17',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 9).toISOString(),
      startTime: '18:00',
      endTime: '19:30',
      topic: 'IELTS Reading - True/False/Not Given',
      teacher: { username: 'Trần Văn Hùng' },
      room: { room_name: '102', location: 'Tòa A' },
      className: 'B1-IELTS-02',
      program: 'IELTS',
      course: 'General English',
      subject: 'Reading',
      attendance: null
    },
    {
      _id: '10',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10).toISOString(),
      startTime: '19:30',
      endTime: '21:00',
      topic: 'TOEIC Review & Test Strategies',
      teacher: { username: 'Nguyễn Thị Mai' },
      room: { room_name: '205', location: 'Tòa B' },
      className: 'A2-TOEIC-01',
      program: 'TOEIC',
      course: 'Fundamental English',
      subject: 'Review',
      attendance: null
    }
  ];
};
