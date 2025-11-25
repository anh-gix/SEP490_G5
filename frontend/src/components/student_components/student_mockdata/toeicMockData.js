/**
 * Mock Data for TOEIC Practice System
 */

// Test History Mock Data
export const toeicHistoryMock = [
  {
    id: 1,
    testId: 1,
    testTitle: 'TOEIC Practice Test 1',
    type: 'full',
    attemptDate: '2025-11-01',
    totalScore: 805,
    listeningScore: 385,
    readingScore: 420,
    timeSpent: 110,
    correctAnswers: 161,
    totalQuestions: 200
  },
  {
    id: 2,
    testId: 2,
    testTitle: 'TOEIC Listening Practice 1',
    type: 'listening',
    attemptDate: '2025-10-28',
    totalScore: 385,
    listeningScore: 385,
    readingScore: 0,
    timeSpent: 43,
    correctAnswers: 77,
    totalQuestions: 100
  },
  {
    id: 3,
    testId: 3,
    testTitle: 'TOEIC Reading Practice 1',
    type: 'reading',
    attemptDate: '2025-10-25',
    totalScore: 420,
    listeningScore: 0,
    readingScore: 420,
    timeSpent: 70,
    correctAnswers: 84,
    totalQuestions: 100
  },
  {
    id: 4,
    testId: 1,
    testTitle: 'TOEIC Practice Test 1',
    type: 'full',
    attemptDate: '2025-10-20',
    totalScore: 775,
    listeningScore: 365,
    readingScore: 410,
    timeSpent: 115,
    correctAnswers: 155,
    totalQuestions: 200
  },
  {
    id: 5,
    testId: 2,
    testTitle: 'TOEIC Listening Practice 1',
    type: 'listening',
    attemptDate: '2025-10-15',
    totalScore: 355,
    listeningScore: 355,
    readingScore: 0,
    timeSpent: 45,
    correctAnswers: 71,
    totalQuestions: 100
  }
];

// Test Result Mock Data
export const getToeicResultMock = (testId) => ({
  testId: testId,
  testTitle: 'TOEIC Practice Test 1',
  attemptDate: '2025-11-01',
  timeSpent: 110, // minutes
  
  scores: {
    listening: {
      correct: 77,
      total: 100,
      score: 385,
      maxScore: 495
    },
    reading: {
      correct: 84,
      total: 100,
      score: 420,
      maxScore: 495
    },
    total: 805,
    maxTotal: 990
  },
  
  partScores: [
    { part: 1, name: 'Photographs', correct: 5, total: 6, percentage: 83.3 },
    { part: 2, name: 'Question-Response', correct: 20, total: 25, percentage: 80 },
    { part: 3, name: 'Conversations', correct: 30, total: 39, percentage: 76.9 },
    { part: 4, name: 'Talks', correct: 22, total: 30, percentage: 73.3 },
    { part: 5, name: 'Incomplete Sentences', correct: 26, total: 30, percentage: 86.7 },
    { part: 6, name: 'Text Completion', correct: 14, total: 16, percentage: 87.5 },
    { part: 7, name: 'Reading Comprehension', correct: 44, total: 54, percentage: 81.5 }
  ],
  
  // Sample detailed answers
  answers: [
    {
      questionId: 1,
      part: 1,
      type: 'listening',
      userAnswer: 'A',
      correctAnswer: 'A',
      isCorrect: true,
      explanation: 'The photograph shows a woman sitting at a desk.',
      audioUrl: '/audio/part1-q1.mp3'
    },
    {
      questionId: 2,
      part: 1,
      type: 'listening',
      userAnswer: 'B',
      correctAnswer: 'C',
      isCorrect: false,
      explanation: 'The man is standing next to the car, not sitting in it.',
      audioUrl: '/audio/part1-q2.mp3'
    }
    // ... more answers can be added as needed
  ],
  
  insights: {
    strengths: [
      'Grammar (Part 5): 86.7% - Điểm mạnh của bạn',
      'Text Completion (Part 6): 87.5% - Rất tốt'
    ],
    weaknesses: [
      'Talks (Part 4): 73.3% - Cần cải thiện khả năng nghe monologue',
      'Conversations (Part 3): 76.9% - Nên luyện thêm về đối thoại'
    ],
    recommendations: [
      'Luyện nghe Part 4 với các bài nói chuyện ngắn',
      'Tập trung vào từ vựng chuyên ngành business',
      'Làm thêm các đề thi tương tự để cải thiện'
    ]
  }
});
