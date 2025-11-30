/**
 * Mock Data for Cambridge Quiz (Cam Session)
 * Pre-A1 Level for Kids
 */

export const cambridgeQuizMock = {
  courseId: 'cam-001',
  sessionId: 'session-001',
  course: {
    _id: 'cam-001',
    name: 'Cambridge Pre-A1 Starters',
    program: {
      program_name: 'Cambridge Young Learners',
      code: 'CAM-YLE-STARTERS',
      type: 'cambridge'
    }
  },
  camSession: {
    _id: 'session-001',
    Title: 'Animals and Colors - Lesson 1',
    Order: 1,
    Des: 'Trong buổi học này, các em sẽ học về động vật và màu sắc. Chúng ta sẽ cùng nhau làm các bài tập vui nhộn với hình ảnh đẹp mắt!',
    videoURL: 'https://goldenkids-data.tienganh123.com/file/learn/child/preschool/data/video/unit1/letter/letter_non_vip.mp4',
    Quiz: [
      // Type 1: Multiple Choice (traditional) - unchanged
      {
        _id: 'quiz-001',
        Type: 'multiple-choice',
        Question: 'What animal is this?',
        Img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600',
        Answer: ['Cat', 'Dog', 'Bird', 'Fish'],
        AnswerKey: ['Cat']
      },
      
      // Type 2: Yes/No - MULTIPLE statements (like yesno.png example)
      {
        _id: 'quiz-002',
        Type: 'yes-no',
        Question: 'Look at the picture and answer Yes or No:',
        Img: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=600',
        Answer: [
          'There are balloons in the picture',
          'The cat is sleeping under the chair',
          'The big window is open',
          'The man has black hair and glasses'
        ],
        AnswerKey: ['Yes', 'No', 'Yes', 'Yes']
      },
      
      // Type 3: Spell - MULTIPLE words to spell
      {
        _id: 'quiz-003',
        Type: 'spell',
        Question: 'Look at the pictures and spell these animals:',
        Img: 'https://images.unsplash.com/photo-1444212477490-ca407925329e?w=600',
        Answer: ['CAT', 'DOG', 'BIRD'],
        AnswerKey: ['CAT', 'DOG', 'BIRD'] // Same as Answer for spell type
      },
      
      // Type 4: Word from Box - PARAGRAPH with multiple blanks (like wordfrombox.png)
      {
        _id: 'quiz-004',
        Type: 'word-from-box',
        Question: 'Fill in the blanks with words from the box:',
        Img: '../src/assets/CamQuiz_img/wordfrombox.png',
        Answer: [
          'Lots of lizards are very small _____ but some are really big.',
          'Many lizards are green, grey or yellow. Some like eating _____ and some like eating fruit.',
          'A lizard can run on its four _____ and it has a long _____ at the end of its body.',
          'Many lizards live in _____ but, at the beach, you can find some lizards on the _____.'
        ],
        AnswerKey: ['animals', 'insects', 'legs', 'tail', 'trees', 'sand']
      },
      
      // Type 5: Another Multiple Choice
      {
        _id: 'quiz-005',
        Type: 'multiple-choice',
        Question: 'What color is the balloon?',
        Img: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600',
        Answer: ['Red', 'Blue', 'Green', 'Yellow'],
        AnswerKey: ['Red']
      },
      
      // Type 6: Another Yes/No with multiple statements
      {
        _id: 'quiz-006',
        Type: 'yes-no',
        Question: 'Read and answer Yes or No:',
        Img: 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=600',
        Answer: [
          'This is a bedroom',
          'There is a lamp on the bookcase',
          'Some of the children are singing',
          'The woman is holding some drinks'
        ],
        AnswerKey: ['No', 'Yes', 'Yes', 'Yes']
      },
      
      // Type 7: Spell with fewer words
      {
        _id: 'quiz-007',
        Type: 'spell',
        Question: 'Spell these color words:',
        Img: 'https://images.unsplash.com/photo-1525498128493-380d1990a112?w=600',
        Answer: ['RED', 'BLUE'],
        AnswerKey: ['RED', 'BLUE']
      },
      
      // Type 8: Word from box - shorter paragraph
      {
        _id: 'quiz-008',
        Type: 'word-from-box',
        Question: 'Complete the sentences:',
        Img: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=600',
        Answer: [
          'The _____ can _____ in the sky.',
          'Birds like to _____ on the _____.'
        ],
        AnswerKey: ['bird', 'fly', 'sing', 'tree']
      }
    ]
  }
};

export const getCambridgeQuizMock = () => {
  // Simulate API delay
  // Note: courseId and sessionId params can be used for filtering different sessions
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: cambridgeQuizMock
      });
    }, 500);
  });
};
