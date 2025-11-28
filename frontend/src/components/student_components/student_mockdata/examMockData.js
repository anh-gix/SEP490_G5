/**
 * Mock Data for Exams
 */

export const examsMock = [
  {
    _id: "69270430bb1882df0904db05",
    title: "TOEIC Practice Test",
    description: "Sample TOEIC exam with all skills",
    createdBy: "675b1b342342342342342222",
    examType: "cambridge",
    level: "Academic",
    totalDuration: 120,
    isPublished: true,
    sections: [
      {
        type: "reading",
        instructions: "Read the text and answer the questions.",
        duration: 25,
        questionCount: 10,
        maxScore: 10,
        answerKey: [
          {
            questionNumber: 1,
            questionTitle: "What is the main purpose of the email?",
            questionType: "multiple_choice",
            tags: ["reading_comprehension"],
            maxScore: 1,
            questionAnswer: [
              {
                key: "A",
                text: "To request information"
              },
              {
                key: "B",
                text: "To confirm an appointment"
              },
              {
                key: "C",
                text: "To make a complaint"
              },
              {
                key: "D",
                text: "To send a reminder"
              }
            ],
            correctAnswer: ["B"]
          },
          {
            questionNumber: 2,
            questionTitle: "The word 'procedure' is closest in meaning to:",
            questionType: "multiple_choice",
            tags: ["vocabulary"],
            questionAnswer: [
              {
                key: "A",
                text: "Method"
              },
              {
                key: "B",
                text: "Time"
              },
              {
                key: "C",
                text: "Reason"
              },
              {
                key: "D",
                text: "Location"
              }
            ],
            correctAnswer: ["A"]
          },
          {
            questionNumber: 3,
            questionTitle: "The passage implies that the product is:",
            questionType: "true_false",
            tags: ["reading_comprehension"],
            correctAnswer: ["True"]
          },
          {
            questionNumber: 4,
            questionTitle: "The meeting will take place on Monday.",
            questionType: "true_false",
            tags: ["reading_comprehension"],
            correctAnswer: ["False"]
          },
          {
            questionNumber: 5,
            questionTitle: "What does the chart mainly show?",
            questionType: "multiple_choice",
            tags: ["reading_comprehension"],
            questionAnswer: [
              {
                key: "A",
                text: "Company profits"
              },
              {
                key: "B",
                text: "Sales growth"
              },
              {
                key: "C",
                text: "Employee satisfaction"
              },
              {
                key: "D",
                text: "Production schedule"
              }
            ],
            correctAnswer: ["B"]
          },
          {
            questionNumber: 6,
            questionTitle: "The phrase 'in advance' means:",
            questionType: "multiple_choice",
            tags: ["vocabulary"],
            questionAnswer: [
              {
                key: "A",
                text: "Later"
              },
              {
                key: "B",
                text: "Beforehand"
              },
              {
                key: "C",
                text: "Immediately"
              },
              {
                key: "D",
                text: "Never"
              }
            ],
            correctAnswer: ["B"]
          },
          {
            questionNumber: 7,
            questionTitle: "The author suggests that customers should:",
            questionType: "true_false",
            tags: ["reading_comprehension"],
            correctAnswer: ["True"]
          },
          {
            questionNumber: 8,
            questionTitle: "The price does NOT include tax.",
            questionType: "true_false",
            tags: ["reading_comprehension"],
            correctAnswer: ["False"]
          },
          {
            questionNumber: 9,
            questionTitle: "Which department is responsible?",
            questionType: "multiple_choice",
            tags: ["grammar"],
            questionAnswer: [
              {
                key: "A",
                text: "Human Resources"
              },
              {
                key: "B",
                text: "Finance"
              },
              {
                key: "C",
                text: "Marketing"
              },
              {
                key: "D",
                text: "Administration"
              }
            ],
            correctAnswer: ["A"]
          },
          {
            questionNumber: 10,
            questionTitle: "The employee must submit the report by:",
            questionType: "multiple_choice",
            tags: ["reading_comprehension"],
            questionAnswer: [
              {
                key: "A",
                text: "Friday"
              },
              {
                key: "B",
                text: "Monday"
              },
              {
                key: "C",
                text: "Tomorrow"
              },
              {
                key: "D",
                text: "Next week"
              }
            ],
            correctAnswer: ["A"]
          }
        ]
      },
      {
        type: "listening",
        instructions: "Listen and select the correct answer.",
        duration: 20,
        questionCount: 10,
        audioUrls: ["https://example.com/audio1.mp3"],
        maxScore: 10,
        answerKey: [
          {
            questionNumber: 1,
            questionTitle: "What does the woman ask?",
            questionType: "multiple_choice",
            tags: ["listening"],
            questionAnswer: [
              {
                key: "A",
                text: "Location"
              },
              {
                key: "B",
                text: "Price"
              },
              {
                key: "C",
                text: "Schedule"
              },
              {
                key: "D",
                text: "Help"
              }
            ],
            correctAnswer: ["C"]
          },
          {
            questionNumber: 2,
            questionTitle: "The man will arrive at 8 PM.",
            questionType: "true_false",
            tags: ["listening"],
            correctAnswer: ["True"]
          },
          {
            questionNumber: 3,
            questionTitle: "What does the speaker imply?",
            questionType: "multiple_choice",
            tags: ["listening"],
            questionAnswer: [
              {
                key: "A",
                text: "He is busy"
              },
              {
                key: "B",
                text: "He is late"
              },
              {
                key: "C",
                text: "He is tired"
              },
              {
                key: "D",
                text: "He is new"
              }
            ],
            correctAnswer: ["A"]
          },
          {
            questionNumber: 4,
            questionTitle: "The meeting has been canceled.",
            questionType: "true_false",
            tags: ["listening"],
            correctAnswer: ["False"]
          },
          {
            questionNumber: 5,
            questionTitle: "What is the topic of the talk?",
            questionType: "multiple_choice",
            tags: ["listening"],
            questionAnswer: [
              {
                key: "A",
                text: "New policy"
              },
              {
                key: "B",
                text: "Weather"
              },
              {
                key: "C",
                text: "Vacation"
              },
              {
                key: "D",
                text: "Payment"
              }
            ],
            correctAnswer: ["A"]
          },
          {
            questionNumber: 6,
            questionTitle: "The store opens at 9 AM.",
            questionType: "true_false",
            tags: ["listening"],
            correctAnswer: ["True"]
          },
          {
            questionNumber: 7,
            questionTitle: "What will the woman do next?",
            questionType: "multiple_choice",
            tags: ["listening"],
            questionAnswer: [
              {
                key: "A",
                text: "Call someone"
              },
              {
                key: "B",
                text: "Leave the office"
              },
              {
                key: "C",
                text: "Send an email"
              },
              {
                key: "D",
                text: "Prepare documents"
              }
            ],
            correctAnswer: ["C"]
          },
          {
            questionNumber: 8,
            questionTitle: "The speaker is giving directions.",
            questionType: "true_false",
            tags: ["listening"],
            correctAnswer: ["True"]
          },
          {
            questionNumber: 9,
            questionTitle: "What is the main problem?",
            questionType: "multiple_choice",
            tags: ["listening"],
            questionAnswer: [
              {
                key: "A",
                text: "Broken machine"
              },
              {
                key: "B",
                text: "Late delivery"
              },
              {
                key: "C",
                text: "Missing file"
              },
              {
                key: "D",
                text: "Lost item"
              }
            ],
            correctAnswer: ["B"]
          },
          {
            questionNumber: 10,
            questionTitle: "The bus is delayed.",
            questionType: "true_false",
            tags: ["listening"],
            correctAnswer: ["True"]
          }
        ]
      },
      {
        type: "writing",
        instructions: "Write your answers.",
        duration: 30,
        questionCount: 2,
        maxScore: 8,
        answerKey: [
          {
            questionNumber: 1,
            questionTitle: "Describe a problem you recently solved.",
            questionType: "input",
            tags: ["writing"],
            correctAnswer: [""]
          },
          {
            questionNumber: 2,
            questionTitle: "Write an email requesting information.",
            questionType: "input",
            tags: ["writing"],
            correctAnswer: [""]
          }
        ]
      },
      {
        type: "speaking",
        instructions: "Speak about the topics.",
        duration: 20,
        questionCount: 5,
        maxScore: 10,
        answerKey: [
          {
            questionNumber: 1,
            questionTitle: "Introduce yourself.",
            questionType: "input",
            tags: ["speaking"],
            correctAnswer: [""]
          },
          {
            questionNumber: 2,
            questionTitle: "Describe your daily routine.",
            questionType: "input",
            tags: ["speaking"],
            correctAnswer: [""]
          },
          {
            questionNumber: 3,
            questionTitle: "Talk about your favorite place.",
            questionType: "input",
            tags: ["speaking"],
            correctAnswer: [""]
          },
          {
            questionNumber: 4,
            questionTitle: "Explain a memorable event in your life.",
            questionType: "input",
            tags: ["speaking"],
            correctAnswer: [""]
          },
          {
            questionNumber: 5,
            questionTitle: "Talk about your goals for the future.",
            questionType: "input",
            tags: ["speaking"],
            correctAnswer: [""]
          }
        ]
      }
    ]
  },
  {
    _id: "6927044ebb1882df0904db07",
    title: "TOEIC Practice Test",
    description: "Sample TOEIC exam with all skills",
    createdBy: "675b1b342342342342342222",
    examType: "toeic",
    level: "Academic",
    totalDuration: 120,
    isPublished: true,
    sections: [
      {
        type: "reading",
        instructions: "Read the text and answer the questions.",
        duration: 25,
        questionCount: 10,
        maxScore: 10,
        answerKey: [
          {
            questionNumber: 1,
            questionTitle: "What is the main purpose of the email?",
            questionType: "multiple_choice",
            tags: ["reading_comprehension"],
            maxScore: 1,
            questionAnswer: [
              {
                key: "A",
                text: "To request information"
              },
              {
                key: "B",
                text: "To confirm an appointment"
              },
              {
                key: "C",
                text: "To make a complaint"
              },
              {
                key: "D",
                text: "To send a reminder"
              }
            ],
            correctAnswer: ["B"]
          },
          {
            questionNumber: 2,
            questionTitle: "The word 'procedure' is closest in meaning to:",
            questionType: "multiple_choice",
            tags: ["vocabulary"],
            questionAnswer: [
              {
                key: "A",
                text: "Method"
              },
              {
                key: "B",
                text: "Time"
              },
              {
                key: "C",
                text: "Reason"
              },
              {
                key: "D",
                text: "Location"
              }
            ],
            correctAnswer: ["A"]
          },
          {
            questionNumber: 3,
            questionTitle: "The passage implies that the product is:",
            questionType: "true_false",
            tags: ["reading_comprehension"],
            correctAnswer: ["True"]
          },
          {
            questionNumber: 4,
            questionTitle: "The meeting will take place on Monday.",
            questionType: "true_false",
            tags: ["reading_comprehension"],
            correctAnswer: ["False"]
          },
          {
            questionNumber: 5,
            questionTitle: "What does the chart mainly show?",
            questionType: "multiple_choice",
            tags: ["reading_comprehension"],
            questionAnswer: [
              {
                key: "A",
                text: "Company profits"
              },
              {
                key: "B",
                text: "Sales growth"
              },
              {
                key: "C",
                text: "Employee satisfaction"
              },
              {
                key: "D",
                text: "Production schedule"
              }
            ],
            correctAnswer: ["B"]
          },
          {
            questionNumber: 6,
            questionTitle: "The phrase 'in advance' means:",
            questionType: "multiple_choice",
            tags: ["vocabulary"],
            questionAnswer: [
              {
                key: "A",
                text: "Later"
              },
              {
                key: "B",
                text: "Beforehand"
              },
              {
                key: "C",
                text: "Immediately"
              },
              {
                key: "D",
                text: "Never"
              }
            ],
            correctAnswer: ["B"]
          },
          {
            questionNumber: 7,
            questionTitle: "The author suggests that customers should:",
            questionType: "true_false",
            tags: ["reading_comprehension"],
            correctAnswer: ["True"]
          },
          {
            questionNumber: 8,
            questionTitle: "The price does NOT include tax.",
            questionType: "true_false",
            tags: ["reading_comprehension"],
            correctAnswer: ["False"]
          },
          {
            questionNumber: 9,
            questionTitle: "Which department is responsible?",
            questionType: "multiple_choice",
            tags: ["grammar"],
            questionAnswer: [
              {
                key: "A",
                text: "Human Resources"
              },
              {
                key: "B",
                text: "Finance"
              },
              {
                key: "C",
                text: "Marketing"
              },
              {
                key: "D",
                text: "Administration"
              }
            ],
            correctAnswer: ["A"]
          },
          {
            questionNumber: 10,
            questionTitle: "The employee must submit the report by:",
            questionType: "multiple_choice",
            tags: ["reading_comprehension"],
            questionAnswer: [
              {
                key: "A",
                text: "Friday"
              },
              {
                key: "B",
                text: "Monday"
              },
              {
                key: "C",
                text: "Tomorrow"
              },
              {
                key: "D",
                text: "Next week"
              }
            ],
            correctAnswer: ["A"]
          }
        ]
      },
      {
        type: "listening",
        instructions: "Listen and select the correct answer.",
        duration: 20,
        questionCount: 10,
        audioUrls: ["https://example.com/audio1.mp3"],
        maxScore: 10,
        answerKey: [
          {
            questionNumber: 1,
            questionTitle: "What does the woman ask?",
            questionType: "multiple_choice",
            tags: ["listening"],
            questionAnswer: [
              {
                key: "A",
                text: "Location"
              },
              {
                key: "B",
                text: "Price"
              },
              {
                key: "C",
                text: "Schedule"
              },
              {
                key: "D",
                text: "Help"
              }
            ],
            correctAnswer: ["C"]
          },
          {
            questionNumber: 2,
            questionTitle: "The man will arrive at 8 PM.",
            questionType: "true_false",
            tags: ["listening"],
            correctAnswer: ["True"]
          },
          {
            questionNumber: 3,
            questionTitle: "What does the speaker imply?",
            questionType: "multiple_choice",
            tags: ["listening"],
            questionAnswer: [
              {
                key: "A",
                text: "He is busy"
              },
              {
                key: "B",
                text: "He is late"
              },
              {
                key: "C",
                text: "He is tired"
              },
              {
                key: "D",
                text: "He is new"
              }
            ],
            correctAnswer: ["A"]
          },
          {
            questionNumber: 4,
            questionTitle: "The meeting has been canceled.",
            questionType: "true_false",
            tags: ["listening"],
            correctAnswer: ["False"]
          },
          {
            questionNumber: 5,
            questionTitle: "What is the topic of the talk?",
            questionType: "multiple_choice",
            tags: ["listening"],
            questionAnswer: [
              {
                key: "A",
                text: "New policy"
              },
              {
                key: "B",
                text: "Weather"
              },
              {
                key: "C",
                text: "Vacation"
              },
              {
                key: "D",
                text: "Payment"
              }
            ],
            correctAnswer: ["A"]
          },
          {
            questionNumber: 6,
            questionTitle: "The store opens at 9 AM.",
            questionType: "true_false",
            tags: ["listening"],
            correctAnswer: ["True"]
          },
          {
            questionNumber: 7,
            questionTitle: "What will the woman do next?",
            questionType: "multiple_choice",
            tags: ["listening"],
            questionAnswer: [
              {
                key: "A",
                text: "Call someone"
              },
              {
                key: "B",
                text: "Leave the office"
              },
              {
                key: "C",
                text: "Send an email"
              },
              {
                key: "D",
                text: "Prepare documents"
              }
            ],
            correctAnswer: ["C"]
          },
          {
            questionNumber: 8,
            questionTitle: "The speaker is giving directions.",
            questionType: "true_false",
            tags: ["listening"],
            correctAnswer: ["True"]
          },
          {
            questionNumber: 9,
            questionTitle: "What is the main problem?",
            questionType: "multiple_choice",
            tags: ["listening"],
            questionAnswer: [
              {
                key: "A",
                text: "Broken machine"
              },
              {
                key: "B",
                text: "Late delivery"
              },
              {
                key: "C",
                text: "Missing file"
              },
              {
                key: "D",
                text: "Lost item"
              }
            ],
            correctAnswer: ["B"]
          },
          {
            questionNumber: 10,
            questionTitle: "The bus is delayed.",
            questionType: "true_false",
            tags: ["listening"],
            correctAnswer: ["True"]
          }
        ]
      },
      {
        type: "writing",
        instructions: "Write your answers.",
        duration: 30,
        questionCount: 2,
        maxScore: 8,
        answerKey: [
          {
            questionNumber: 1,
            questionTitle: "Describe a problem you recently solved.",
            questionType: "input",
            tags: ["writing"],
            correctAnswer: [""]
          },
          {
            questionNumber: 2,
            questionTitle: "Write an email requesting information.",
            questionType: "input",
            tags: ["writing"],
            correctAnswer: [""]
          }
        ]
      },
      {
        type: "speaking",
        instructions: "Speak about the topics.",
        duration: 20,
        questionCount: 5,
        maxScore: 10,
        answerKey: [
          {
            questionNumber: 1,
            questionTitle: "Introduce yourself.",
            questionType: "input",
            tags: ["speaking"],
            correctAnswer: [""]
          },
          {
            questionNumber: 2,
            questionTitle: "Describe your daily routine.",
            questionType: "input",
            tags: ["speaking"],
            correctAnswer: [""]
          },
          {
            questionNumber: 3,
            questionTitle: "Talk about your favorite place.",
            questionType: "input",
            tags: ["speaking"],
            correctAnswer: [""]
          },
          {
            questionNumber: 4,
            questionTitle: "Explain a memorable event in your life.",
            questionType: "input",
            tags: ["speaking"],
            correctAnswer: [""]
          },
          {
            questionNumber: 5,
            questionTitle: "Talk about your goals for the future.",
            questionType: "input",
            tags: ["speaking"],
            correctAnswer: [""]
          }
        ]
      }
    ]
  }
];

