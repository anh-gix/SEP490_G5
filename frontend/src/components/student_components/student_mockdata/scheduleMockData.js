/**
 * Mock Data for Student Schedule
 */

export const generateScheduleMockData = () => {
  const today = new Date();
  
  return [
    // Previous week
    {
      _id: '1',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 10).toISOString(),
      startTime: '18:00',
      endTime: '20:00',
      topic: 'Introduction & Greetings',
      teacher: { username: 'Nguyễn Văn A' },
      room: { room_name: '102', location: 'Tòa A' },
      className: 'A2-Evening-01',
      subject: 'Grammar',
      attendance: { status: 'present' }
    },
    {
      _id: '2',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 8).toISOString(),
      startTime: '18:00',
      endTime: '20:00',
      topic: 'Present Simple Tense',
      teacher: { username: 'Nguyễn Văn A' },
      room: { room_name: '102', location: 'Tòa A' },
      className: 'A2-Evening-01',
      subject: 'Grammar',
      attendance: { status: 'present' }
    },
    {
      _id: '3',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6).toISOString(),
      startTime: '18:00',
      endTime: '20:00',
      topic: 'Daily Routines & Activities',
      teacher: { username: 'Nguyễn Văn A' },
      room: { room_name: '102', location: 'Tòa A' },
      className: 'A2-Evening-01',
      subject: 'Vocabulary',
      attendance: { status: 'present' }
    },
    // This week
    {
      _id: '4',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3).toISOString(),
      startTime: '18:00',
      endTime: '20:00',
      topic: 'Reading Comprehension Skills',
      teacher: { username: 'Nguyễn Văn A' },
      room: { room_name: '102', location: 'Tòa A' },
      className: 'A2-Evening-01',
      subject: 'Reading',
      attendance: { status: 'present' }
    },
    {
      _id: '5',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1).toISOString(),
      startTime: '18:00',
      endTime: '20:00',
      topic: 'Listening Practice - Part 1',
      teacher: { username: 'Nguyễn Văn A' },
      room: { room_name: '102', location: 'Tòa A' },
      className: 'A2-Evening-01',
      subject: 'Listening',
      attendance: { status: 'present' }
    },
    // Upcoming lessons
    {
      _id: '6',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString(),
      startTime: '18:00',
      endTime: '20:00',
      topic: 'Present Perfect Tense',
      teacher: { username: 'Nguyễn Văn A' },
      room: { room_name: '102', location: 'Tòa A' },
      className: 'A2-Evening-01',
      subject: 'Grammar',
      attendance: null
    },
    {
      _id: '7',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3).toISOString(),
      startTime: '18:00',
      endTime: '20:00',
      topic: 'Past Continuous Tense',
      teacher: { username: 'Nguyễn Văn A' },
      room: { room_name: '102', location: 'Tòa A' },
      className: 'A2-Evening-01',
      subject: 'Grammar',
      attendance: null
    },
    {
      _id: '8',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5).toISOString(),
      startTime: '18:00',
      endTime: '20:00',
      topic: 'Writing Skills - Email Writing',
      teacher: { username: 'Nguyễn Văn A' },
      room: { room_name: '102', location: 'Tòa A' },
      className: 'A2-Evening-01',
      subject: 'Writing',
      attendance: null
    },
    {
      _id: '9',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 8).toISOString(),
      startTime: '18:00',
      endTime: '20:00',
      topic: 'Speaking Practice - Conversations',
      teacher: { username: 'Nguyễn Văn A' },
      room: { room_name: '102', location: 'Tòa A' },
      className: 'A2-Evening-01',
      subject: 'Speaking',
      attendance: null
    },
    {
      _id: '10',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10).toISOString(),
      startTime: '18:00',
      endTime: '20:00',
      topic: 'Review & Practice Test',
      teacher: { username: 'Nguyễn Văn A' },
      room: { room_name: '102', location: 'Tòa A' },
      className: 'A2-Evening-01',
      subject: 'Review',
      attendance: null
    }
  ];
};
