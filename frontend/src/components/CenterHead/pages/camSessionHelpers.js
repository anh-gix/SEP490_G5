// Quiz Type Definitions and Helpers for Cambridge Session Edit

/**
 * CẤU TRÚC QUIZ:
 * - Question (Đề bài): 
 *   + Multiple Choice: Câu hỏi đơn
 *   + Yes/No, Spell, Word-from-Box: Đề bài chung/Yêu cầu của quiz
 * 
 * - Answer:
 *   + Multiple Choice: Các lựa chọn đáp án
 *   + Yes/No, Spell, Word-from-Box: Các câu hỏi/câu cần trả lời
 * 
 * - AnswerKey (Đáp án đúng):
 *   + Multiple Choice: 1 đáp án đúng trong các Answer
 *   + Yes/No, Spell, Word-from-Box: Đáp án đúng tương ứng với mỗi Answer
 */

export const QUIZ_TYPES = {
  'multiple-choice': {
    label: 'Multiple Choice',
    icon: 'ph-check-circle',
    description: '1 câu hỏi, nhiều lựa chọn, 1 đáp án đúng',
    color: 'primary',
    questionLabel: 'Câu hỏi',
    questionPlaceholder: 'Nhập câu hỏi (ví dụ: What animal is this?)',
    answerLabel: 'Các lựa chọn đáp án',
    answerPlaceholder: (idx) => `Lựa chọn ${idx + 1}`,
    answerKeyLabel: 'Đáp án đúng',
    answerKeyFormat: '1 đáp án (chọn từ danh sách Answer)',
    multipleQuestions: false,
    example: {
      Question: 'What animal is this?',
      Answer: ['Cat', 'Dog', 'Bird', 'Fish'],
      AnswerKey: ['Cat']
    }
  },
  'yes-no': {
    label: 'Yes/No',
    icon: 'ph-question',
    description: '1 đề bài, nhiều câu hỏi Yes/No',
    color: 'success',
    questionLabel: 'Đề bài chung',
    questionPlaceholder: 'Nhập yêu cầu/đề bài (ví dụ: Look at the picture and answer Yes or No)',
    answerLabel: 'Câu hỏi',
    answerPlaceholder: (idx) => `Câu hỏi ${idx + 1} (ví dụ: The elephant is big)`,
    answerKeyLabel: 'Đáp án',
    answerKeyFormat: 'Yes hoặc No cho mỗi câu hỏi',
    multipleQuestions: true,
    example: {
      Question: 'Look at the picture and answer Yes or No:',
      Answer: [
        'The elephant is big',
        'The monkey is sleeping',
        'There are birds in the tree'
      ],
      AnswerKey: ['Yes', 'No', 'Yes']
    }
  },
  'spell': {
    label: 'Spell',
    icon: 'ph-text-aa',
    description: '1 đề bài, nhiều từ cần đánh vần',
    color: 'warning',
    questionLabel: 'Đề bài chung',
    questionPlaceholder: 'Nhập yêu cầu/đề bài (ví dụ: Spell these animals in the picture)',
    answerLabel: 'Đề bài/Câu hỏi',
    answerPlaceholder: (idx) => `Câu hỏi ${idx + 1} (ví dụ: Number 1, The first word)`,
    answerKeyLabel: 'Từ cần đánh vần',
    answerKeyFormat: 'Từ đúng cho mỗi câu hỏi',
    multipleQuestions: true,
    example: {
      Question: 'Spell these animals:',
      Answer: ['Number 1', 'Number 2', 'Number 3'],
      AnswerKey: ['CAT', 'DOG', 'BIRD']
    }
  },
  'word-from-box': {
    label: 'Word from Box',
    icon: 'ph-textbox',
    description: '1 đề bài, nhiều câu có chỗ trống, chọn từ trong hộp',
    color: 'info',
    questionLabel: 'Đề bài chung',
    questionPlaceholder: 'Nhập yêu cầu/đề bài (ví dụ: Fill in the blanks with words from the box)',
    answerLabel: 'Câu có chỗ trống',
    answerPlaceholder: (idx) => `Câu ${idx + 1} (dùng ___ cho chỗ trống)`,
    answerKeyLabel: 'Từ điền vào',
    answerKeyFormat: 'Từ đúng cho mỗi chỗ trống',
    multipleQuestions: true,
    wordBoxLabel: 'Word Box (các từ trong hộp)',
    example: {
      Question: 'Fill in the blanks:',
      Answer: ['The ___ is blue', 'I have a ___', 'The ___ is red'],
      AnswerKey: ['sky', 'cat', 'apple']
    }
  }
};

export const SESSION_TYPES = {
  reading: { 
    icon: 'ph-book-open', 
    color: 'primary', 
    label: 'Reading',
    description: 'Luyện kỹ năng đọc hiểu'
  },
  listening: { 
    icon: 'ph-headphones', 
    color: 'success', 
    label: 'Listening',
    description: 'Luyện kỹ năng nghe'
  },
  speaking: { 
    icon: 'ph-microphone', 
    color: 'warning', 
    label: 'Speaking',
    description: 'Luyện kỹ năng nói'
  },
  writing: { 
    icon: 'ph-pencil-line', 
    color: 'danger', 
    label: 'Writing',
    description: 'Luyện kỹ năng viết'
  }
};

/**
 * Validate quiz data theo từng type
 * @param {Object} quiz - Quiz object với Type, Question, Answer, AnswerKey
 * @returns {Array<string>} - Mảng các error messages
 */
export const validateQuiz = (quiz) => {
  const errors = [];
  
  if (!quiz.Question?.trim()) {
    errors.push('Đề bài/Câu hỏi không được để trống');
  }

  const type = quiz.Type;
  const answerCount = quiz.Answer?.filter(a => a?.trim()).length || 0;
  const keyCount = quiz.AnswerKey?.filter(k => k?.trim()).length || 0;

  switch (type) {
    case 'multiple-choice':
      if (answerCount < 2) {
        errors.push('Multiple Choice cần ít nhất 2 lựa chọn đáp án');
      }
      if (keyCount !== 1) {
        errors.push('Multiple Choice cần đúng 1 đáp án đúng');
      }
      if (keyCount === 1 && !quiz.Answer?.includes(quiz.AnswerKey[0])) {
        errors.push('Đáp án đúng phải là một trong các lựa chọn');
      }
      break;
      
    case 'yes-no':
      if (answerCount < 1) {
        errors.push('Cần ít nhất 1 câu hỏi Yes/No');
      }
      if (keyCount !== answerCount) {
        errors.push(`Cần ${answerCount} đáp án (mỗi câu hỏi 1 đáp án Yes/No)`);
      }
      quiz.AnswerKey?.forEach((key, idx) => {
        if (key !== 'Yes' && key !== 'No') {
          errors.push(`Đáp án câu ${idx + 1} phải là "Yes" hoặc "No"`);
        }
      });
      break;
      
    case 'spell':
      if (answerCount < 1) {
        errors.push('Cần ít nhất 1 câu hỏi cần đánh vần');
      }
      if (keyCount !== answerCount) {
        errors.push(`Cần ${answerCount} từ cần đánh vần (mỗi câu hỏi 1 từ)`);
      }
      // Validate English only for spell answers
      quiz.AnswerKey?.forEach((word, idx) => {
        if (word?.trim() && !/^[a-zA-Z\s'-]+$/.test(word)) {
          errors.push(`Từ ${idx + 1} chỉ được chứa chữ cái tiếng Anh`);
        }
      });
      break;
      
    case 'word-from-box': {
      if (answerCount < 1) {
        errors.push('Cần ít nhất 1 câu có chỗ trống (dùng ___)');
      }
      
      // Count total blanks (___) in all Answer sentences
      const blanksCount = quiz.Answer?.reduce((sum, sentence) => {
        return sum + (sentence.match(/___/g) || []).length;
      }, 0) || 0;
      
      if (blanksCount === 0) {
        errors.push('Các câu phải chứa chỗ trống (___) để điền từ');
      }
      
      if (keyCount !== blanksCount) {
        errors.push(`Cần ${blanksCount} từ trong Word Box (bằng số chỗ trống)`);
      }
      
      // Validate English only for word box
      quiz.AnswerKey?.forEach((word, idx) => {
        if (word?.trim() && !/^[a-zA-Z\s'-]+$/.test(word)) {
          errors.push(`Từ ${idx + 1} trong Word Box chỉ được chứa chữ cái tiếng Anh`);
        }
      });
      break;
    }
      
    default:
      errors.push(`Loại quiz không hợp lệ: ${type}`);
  }

  return errors;
};

/**
 * Validate vocabulary item
 */
export const validateVocabulary = (vocab) => {
  const errors = [];
  
  if (!vocab.word?.trim()) {
    errors.push('Từ vựng không được để trống');
  }
  
  return errors;
};

/**
 * Get placeholder text for Answer input based on quiz type
 */
export const getAnswerPlaceholder = (type, index) => {
  switch (type) {
    case 'multiple-choice':
      return `Lựa chọn ${index + 1} (VD: Cat, Dog, Bird...)`;
    case 'yes-no':
      return `Câu hỏi ${index + 1} (VD: The elephant is big)`;
    case 'spell':
      return `Từ ${index + 1} cần đánh vần (VD: CAT)`;
    case 'word-from-box':
      return `Câu ${index + 1} có chỗ trống (VD: The _____ is big.)`;
    default:
      return 'Nhập nội dung...';
  }
};

/**
 * Get placeholder text for AnswerKey input based on quiz type
 */
export const getAnswerKeyPlaceholder = (type, index) => {
  switch (type) {
    case 'multiple-choice':
      return 'Đáp án đúng (VD: Cat)';
    case 'yes-no':
      return 'Chọn Yes hoặc No';
    case 'spell':
      return `Giống Answer[${index}] - từ đúng`;
    case 'word-from-box':
      return `Từ đúng thứ ${index + 1} (VD: big)`;
    default:
      return 'Nhập đáp án đúng...';
  }
};

/**
 * Empty quiz template
 */
export const emptyQuiz = () => ({
  Type: 'multiple-choice',
  Img: '',
  Question: '',
  Answer: [''],
  AnswerKey: [''],
});

/**
 * Empty vocabulary template
 */
export const emptyVocabularyItem = () => ({
  word: '',
  img: '',
});
