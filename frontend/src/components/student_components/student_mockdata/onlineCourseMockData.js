/**
 * Mock Data for Cambridge Online Courses
 * Following dbstructure v2.4: Course, CamSession, StudentOnlineLearning
 */

// ==================== COURSES ====================
export const onlineCourses = [
  {
    _id: 'course_cam_001',
    courseCode: 'CAM-PRE-A1-01',
    name: 'Cambridge Starters - Animals & Nature',
    learningType: 'online',
    description: 'Learn English with fun activities about animals, colors, and nature. Perfect for young learners starting their English journey.',
    numberOfSessions: 12,
    program: {
      _id: 'prog_cam_001',
      program_name: 'Cambridge Young Learners',
      type: 'cam',
      level: 'Pre-A1'
    },
    camSessions: ['session_001', 'session_002', 'session_003', 'session_004', 'session_005', 'session_006', 'session_007', 'session_008', 'session_009', 'session_010', 'session_011', 'session_012'],
    studentEnrollments: ['student_001'],
    materials: [
      {
        description: 'Cambridge Starters Student Book',
        author: 'Cambridge Assessment English',
        publisher: 'Cambridge University Press',
        publishedDate: '2023',
        onlineUrl: 'https://cambridge.org/starters-book',
        note: 'Digital version available'
      }
    ],
    status: 'approved',
    createdAt: '2025-10-01T00:00:00Z'
  },
  {
    _id: 'course_cam_002',
    courseCode: 'CAM-A1-01',
    name: 'Cambridge Movers - Daily Life',
    learningType: 'online',
    description: 'Explore daily activities, family, school life through interactive lessons. Build confidence in speaking and listening.',
    numberOfSessions: 16,
    program: {
      _id: 'prog_cam_002',
      program_name: 'Cambridge Young Learners',
      type: 'cam',
      level: 'A1'
    },
    camSessions: ['session_101', 'session_102', 'session_103', 'session_104', 'session_105', 'session_106', 'session_107', 'session_108', 'session_109', 'session_110', 'session_111', 'session_112', 'session_113', 'session_114', 'session_115', 'session_116'],
    studentEnrollments: ['student_001'],
    materials: [
      {
        description: 'Cambridge Movers Student Book',
        author: 'Cambridge Assessment English',
        publisher: 'Cambridge University Press',
        publishedDate: '2023',
        onlineUrl: 'https://cambridge.org/movers-book'
      }
    ],
    status: 'approved',
    createdAt: '2025-09-15T00:00:00Z'
  }
];

// ==================== CAM SESSIONS ====================
export const camSessions = {
  // Course 1: Cambridge Starters - Animals & Nature
  session_001: {
    _id: 'session_001',
    title: 'Animals in the Zoo',
    sessionType: 'listening',
    description: 'Learn animal names and sounds. Practice listening to simple descriptions.',
    order: 1,
    videoURL: 'https://cdn.example.com/cambridge/starters/lesson1-animals.mp4',
    quizzes: {
      quiz: [
        {
          _id: 'quiz_001_1',
          Type: 'multiple-choice',
          Question: 'What animal is this?',
          Img: '/assets/cambridge/animals/elephant.jpg',
          Answer: ['Elephant', 'Lion', 'Tiger', 'Giraffe'],
          AnswerKey: ['Elephant']
        },
        {
          _id: 'quiz_001_2',
          Type: 'yes-no',
          Question: 'Look at the picture and answer Yes or No:',
          Img: '/assets/cambridge/animals/zoo.jpg',
          Answer: [
            'The elephant is big',
            'The monkey is sleeping',
            'There are birds in the tree'
          ],
          AnswerKey: ['Yes', 'No', 'Yes']
        },
        {
          _id: 'quiz_001_3',
          Type: 'spell',
          Question: 'Spell these animals:',
          Img: '/assets/cambridge/animals/cat-dog.jpg',
          Answer: ['CAT', 'DOG'],
          AnswerKey: ['CAT', 'DOG']
        }
      ]
    },
    vocabulary: {
      img: '/assets/cambridge/animals/vocab-animals.jpg',
      words: ['elephant', 'lion', 'monkey', 'giraffe', 'zebra', 'tiger', 'bear', 'cat', 'dog', 'bird']
    }
  },
  session_002: {
    _id: 'session_002',
    title: 'Colors Around Us',
    sessionType: 'reading',
    description: 'Identify and name different colors. Read simple color descriptions.',
    order: 2,
    videoURL: 'https://cdn.example.com/cambridge/starters/lesson2-colors.mp4',
    quizzes: {
      quiz: [
        {
          _id: 'quiz_002_1',
          Type: 'multiple-choice',
          Question: 'What color is the apple?',
          Img: '/assets/cambridge/colors/red-apple.jpg',
          Answer: ['Red', 'Green', 'Yellow', 'Blue'],
          AnswerKey: ['Red']
        },
        {
          _id: 'quiz_002_2',
          Type: 'word-from-box',
          Question: 'Fill in the blanks:',
          Img: '/assets/cambridge/colors/rainbow.jpg',
          Answer: [
            'The sky is _____.',
            'The grass is _____.',
            'The sun is _____.'
          ],
          AnswerKey: ['blue', 'green', 'yellow']
        }
      ]
    },
    vocabulary: {
      img: '/assets/cambridge/colors/vocab-colors.jpg',
      words: ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white']
    }
  },
  session_003: {
    _id: 'session_003',
    title: 'My Family',
    sessionType: 'speaking',
    description: 'Talk about family members. Practice introducing family.',
    order: 3,
    videoURL: 'https://cdn.example.com/cambridge/starters/lesson3-family.mp4',
    quizzes: {
      quiz: [
        {
          _id: 'quiz_003_1',
          Type: 'multiple-choice',
          Question: 'Who is this?',
          Img: '/assets/cambridge/family/mother.jpg',
          Answer: ['Mother', 'Father', 'Sister', 'Brother'],
          AnswerKey: ['Mother']
        },
        {
          _id: 'quiz_003_2',
          Type: 'spell',
          Question: 'Spell family members:',
          Img: '/assets/cambridge/family/family-tree.jpg',
          Answer: ['MOTHER', 'FATHER', 'SISTER'],
          AnswerKey: ['MOTHER', 'FATHER', 'SISTER']
        }
      ]
    },
    vocabulary: {
      img: '/assets/cambridge/family/vocab-family.jpg',
      words: ['mother', 'father', 'sister', 'brother', 'grandmother', 'grandfather', 'aunt', 'uncle', 'cousin', 'baby']
    }
  },
  session_004: {
    _id: 'session_004',
    title: 'At School',
    sessionType: 'writing',
    description: 'Learn school items and classroom language.',
    order: 4,
    videoURL: 'https://cdn.example.com/cambridge/starters/lesson4-school.mp4',
    quizzes: {
      quiz: [
        {
          _id: 'quiz_004_1',
          Type: 'multiple-choice',
          Question: 'What do you write with?',
          Img: '/assets/cambridge/school/pencil.jpg',
          Answer: ['Pencil', 'Book', 'Chair', 'Table'],
          AnswerKey: ['Pencil']
        }
      ]
    },
    vocabulary: {
      img: '/assets/cambridge/school/vocab-school.jpg',
      words: ['pencil', 'book', 'chair', 'table', 'teacher', 'student', 'classroom', 'bag', 'eraser', 'ruler']
    }
  },
  // More sessions (5-12) for course 1...
  session_005: {
    _id: 'session_005',
    title: 'Food We Eat',
    sessionType: 'listening',
    description: 'Learn food vocabulary and healthy eating.',
    order: 5,
    videoURL: 'https://cdn.example.com/cambridge/starters/lesson5-food.mp4',
    quizzes: { quiz: [] },
    vocabulary: {
      img: '/assets/cambridge/food/vocab-food.jpg',
      words: ['apple', 'banana', 'bread', 'milk', 'water', 'rice', 'chicken', 'fish', 'cake', 'ice cream']
    }
  },
  session_006: {
    _id: 'session_006',
    title: 'My Body',
    sessionType: 'reading',
    description: 'Learn body parts and actions.',
    order: 6,
    videoURL: 'https://cdn.example.com/cambridge/starters/lesson6-body.mp4',
    quizzes: { quiz: [] },
    vocabulary: {
      img: '/assets/cambridge/body/vocab-body.jpg',
      words: ['head', 'eyes', 'nose', 'mouth', 'ears', 'hands', 'legs', 'feet', 'arm', 'hair']
    }
  },
  session_007: {
    _id: 'session_007',
    title: 'Weather Today',
    sessionType: 'speaking',
    description: 'Talk about weather and seasons.',
    order: 7,
    videoURL: 'https://cdn.example.com/cambridge/starters/lesson7-weather.mp4',
    quizzes: { quiz: [] },
    vocabulary: {
      img: '/assets/cambridge/weather/vocab-weather.jpg',
      words: ['sunny', 'rainy', 'cloudy', 'windy', 'hot', 'cold', 'warm', 'cool', 'snow', 'rainbow']
    }
  },
  session_008: {
    _id: 'session_008',
    title: 'Toys and Games',
    sessionType: 'listening',
    description: 'Learn about toys and playtime.',
    order: 8,
    videoURL: 'https://cdn.example.com/cambridge/starters/lesson8-toys.mp4',
    quizzes: { quiz: [] },
    vocabulary: {
      img: '/assets/cambridge/toys/vocab-toys.jpg',
      words: ['ball', 'doll', 'car', 'bike', 'kite', 'puzzle', 'blocks', 'teddy bear', 'game', 'robot']
    }
  },
  session_009: {
    _id: 'session_009',
    title: 'In My House',
    sessionType: 'reading',
    description: 'Learn rooms and furniture.',
    order: 9,
    videoURL: 'https://cdn.example.com/cambridge/starters/lesson9-house.mp4',
    quizzes: { quiz: [] },
    vocabulary: {
      img: '/assets/cambridge/house/vocab-house.jpg',
      words: ['bedroom', 'kitchen', 'bathroom', 'living room', 'bed', 'chair', 'table', 'door', 'window', 'TV']
    }
  },
  session_010: {
    _id: 'session_010',
    title: 'Numbers 1-20',
    sessionType: 'writing',
    description: 'Count and write numbers.',
    order: 10,
    videoURL: 'https://cdn.example.com/cambridge/starters/lesson10-numbers.mp4',
    quizzes: { quiz: [] },
    vocabulary: {
      img: '/assets/cambridge/numbers/vocab-numbers.jpg',
      words: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
    }
  },
  session_011: {
    _id: 'session_011',
    title: 'Clothes I Wear',
    sessionType: 'listening',
    description: 'Learn clothing vocabulary.',
    order: 11,
    videoURL: 'https://cdn.example.com/cambridge/starters/lesson11-clothes.mp4',
    quizzes: { quiz: [] },
    vocabulary: {
      img: '/assets/cambridge/clothes/vocab-clothes.jpg',
      words: ['shirt', 'pants', 'dress', 'skirt', 'shoes', 'socks', 'hat', 'jacket', 'shorts', 'sweater']
    }
  },
  session_012: {
    _id: 'session_012',
    title: 'Review: Animals to Clothes',
    sessionType: 'speaking',
    description: 'Review all topics from lessons 1-11.',
    order: 12,
    videoURL: 'https://cdn.example.com/cambridge/starters/lesson12-review.mp4',
    quizzes: { quiz: [] },
    vocabulary: {
      img: '/assets/cambridge/review/vocab-review.jpg',
      words: ['review', 'practice', 'learn', 'remember', 'speak', 'listen', 'read', 'write', 'good', 'great']
    }
  },

  // Course 2: Cambridge Movers - Daily Life (sessions 101-116)
  session_101: {
    _id: 'session_101',
    title: 'My Daily Routine',
    sessionType: 'listening',
    description: 'Talk about daily activities and time.',
    order: 1,
    videoURL: 'https://cdn.example.com/cambridge/movers/lesson1-routine.mp4',
    quizzes: { quiz: [] },
    vocabulary: {
      img: '/assets/cambridge/routine/vocab-routine.jpg',
      words: ['wake up', 'breakfast', 'lunch', 'dinner', 'sleep', 'brush teeth', 'wash face', 'go to school', 'homework', 'play']
    }
  },
  session_102: {
    _id: 'session_102',
    title: 'At the Park',
    sessionType: 'reading',
    description: 'Outdoor activities and nature.',
    order: 2,
    videoURL: 'https://cdn.example.com/cambridge/movers/lesson2-park.mp4',
    quizzes: { quiz: [] },
    vocabulary: {
      img: '/assets/cambridge/park/vocab-park.jpg',
      words: ['park', 'tree', 'flower', 'grass', 'swing', 'slide', 'bench', 'path', 'fountain', 'playground']
    }
  }
  // ... sessions 103-116 would continue similarly
};

// ==================== STUDENT ONLINE LEARNING (Progress Tracking) ====================
export const studentOnlineLearning = [
  {
    _id: 'progress_001',
    courseId: 'course_cam_001',
    studentId: 'student_001',
    sessionProgress: [
      {
        sessionId: 'session_001',
        isCompleted: {
          video: true,
          quiz: true,
          vocabulary: true
        }
      },
      {
        sessionId: 'session_002',
        isCompleted: {
          video: true,
          quiz: true,
          vocabulary: false // Not completed yet
        }
      },
      {
        sessionId: 'session_003',
        isCompleted: {
          video: true,
          quiz: false,
          vocabulary: false
        }
      },
      {
        sessionId: 'session_004',
        isCompleted: {
          video: false,
          quiz: false,
          vocabulary: false
        }
      },
      {
        sessionId: 'session_005',
        isCompleted: {
          video: false,
          quiz: false,
          vocabulary: false
        }
      },
      {
        sessionId: 'session_006',
        isCompleted: {
          video: false,
          quiz: false,
          vocabulary: false
        }
      },
      {
        sessionId: 'session_007',
        isCompleted: {
          video: false,
          quiz: false,
          vocabulary: false
        }
      },
      {
        sessionId: 'session_008',
        isCompleted: {
          video: false,
          quiz: false,
          vocabulary: false
        }
      },
      {
        sessionId: 'session_009',
        isCompleted: {
          video: false,
          quiz: false,
          vocabulary: false
        }
      },
      {
        sessionId: 'session_010',
        isCompleted: {
          video: false,
          quiz: false,
          vocabulary: false
        }
      },
      {
        sessionId: 'session_011',
        isCompleted: {
          video: false,
          quiz: false,
          vocabulary: false
        }
      },
      {
        sessionId: 'session_012',
        isCompleted: {
          video: false,
          quiz: false,
          vocabulary: false
        }
      }
    ],
    createdAt: '2025-11-01T00:00:00Z',
    updatedAt: '2025-11-28T15:30:00Z'
  },
  {
    _id: 'progress_002',
    courseId: 'course_cam_002',
    studentId: 'student_001',
    sessionProgress: [
      {
        sessionId: 'session_101',
        isCompleted: {
          video: false,
          quiz: false,
          vocabulary: false
        }
      },
      {
        sessionId: 'session_102',
        isCompleted: {
          video: false,
          quiz: false,
          vocabulary: false
        }
      }
      // ... sessions 103-116 all false (just enrolled)
    ],
    createdAt: '2025-11-25T00:00:00Z',
    updatedAt: '2025-11-25T00:00:00Z'
  }
];

// ==================== HELPER FUNCTIONS ====================

/**
 * Get student's enrolled online courses
 */
export const getStudentOnlineCourses = (studentId) => {
  return onlineCourses.filter(course => 
    course.studentEnrollments.includes(studentId)
  );
};

/**
 * Get progress for a specific course
 */
export const getCourseProgress = (courseId, studentId) => {
  return studentOnlineLearning.find(
    progress => progress.courseId === courseId && progress.studentId === studentId
  );
};

/**
 * Calculate overall completion percentage
 */
export const calculateCompletionPercentage = (progressData) => {
  if (!progressData || !progressData.sessionProgress) return 0;
  
  const totalSessions = progressData.sessionProgress.length;
  const completedSessions = progressData.sessionProgress.filter(
    session => session.isCompleted.video && session.isCompleted.quiz && session.isCompleted.vocabulary
  ).length;
  
  return Math.round((completedSessions / totalSessions) * 100);
};

/**
 * Calculate completion by skill type
 */
export const calculateSkillProgress = (course, progressData) => {
  if (!progressData || !course.camSessions) return {};
  
  const skillProgress = {
    listening: { completed: 0, total: 0 },
    reading: { completed: 0, total: 0 },
    speaking: { completed: 0, total: 0 },
    writing: { completed: 0, total: 0 }
  };
  
  progressData.sessionProgress.forEach(progress => {
    const session = camSessions[progress.sessionId];
    if (session) {
      const skill = session.sessionType;
      skillProgress[skill].total++;
      
      if (progress.isCompleted.video && progress.isCompleted.quiz && progress.isCompleted.vocabulary) {
        skillProgress[skill].completed++;
      }
    }
  });
  
  return skillProgress;
};

/**
 * Get session with progress status
 */
export const getSessionWithProgress = (sessionId, progressData) => {
  const session = camSessions[sessionId];
  if (!session || !progressData) return null;
  
  const progress = progressData.sessionProgress.find(p => p.sessionId === sessionId);
  
  return {
    ...session,
    progress: progress ? progress.isCompleted : { video: false, quiz: false, vocabulary: false }
  };
};

/**
 * Mock API delay
 */
export const mockApiDelay = (ms = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
