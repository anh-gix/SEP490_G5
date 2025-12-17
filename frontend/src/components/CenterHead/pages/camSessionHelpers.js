// Quiz Type Definitions and Helpers for Cambridge Session Edit

export const QUIZ_TYPES = {
  'multiple-choice': {
    label: 'Multiple Choice',
    icon: 'ph-check-circle',
    description: 'Chọn 1 đáp án đúng từ nhiều lựa chọn',
    color: 'primary',
    answerFormat: 'Danh sách các lựa chọn (Answer)',
    answerKeyFormat: '1 đáp án đúng (AnswerKey)',
    example: {
      Question: 'What animal is this?',
      Answer: ['Cat', 'Dog', 'Bird', 'Fish'],
      AnswerKey: ['Cat']
    }
  },
  'yes-no': {
    label: 'Yes/No',
    icon: 'ph-question',
    description: 'Trả lời Yes/No cho nhiều câu hỏi',
    color: 'success',
    answerFormat: 'Danh sách các câu hỏi (Answer)',
    answerKeyFormat: 'Yes hoặc No cho mỗi câu (AnswerKey)',
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
    description: 'Đánh vần từ vựng',
    color: 'warning',
    answerFormat: 'Danh sách các từ cần đánh vần (Answer)',
    answerKeyFormat: 'Giống Answer - từ đúng (AnswerKey)',
    example: {
      Question: 'Spell these animals:',
      Answer: ['CAT', 'DOG', 'BIRD'],
      AnswerKey: ['CAT', 'DOG', 'BIRD']
    }
  },
  'word-from-box': {
    label: 'Word from Box',
    icon: 'ph-textbox',
    description: 'Điền từ vào chỗ trống',
    color: 'info',
    answerFormat: 'Các câu có chỗ trống - dùng ___ (Answer)',
    answerKeyFormat: 'Danh sách từ đúng theo thứ tự (AnswerKey)',
    example: {
      Question: 'Fill in the blanks with words from the box:',
      Answer: [
        'The _____ can _____ in the sky.',
        'Birds like to _____ on the _____.'
      ],
      AnswerKey: ['bird', 'fly', 'sing', 'tree']
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
    errors.push('Câu hỏi không được để trống');
  }

  const type = quiz.Type;
  const answerCount = quiz.Answer?.filter(a => a?.trim()).length || 0;
  const keyCount = quiz.AnswerKey?.filter(k => k?.trim()).length || 0;

  switch (type) {
    case 'multiple-choice':
      if (answerCount < 2) {
        errors.push('Multiple Choice cần ít nhất 2 lựa chọn trong Answer');
      }
      if (keyCount !== 1) {
        errors.push('Multiple Choice cần đúng 1 đáp án đúng trong AnswerKey');
      }
      if (keyCount === 1 && !quiz.Answer?.includes(quiz.AnswerKey[0])) {
        errors.push('AnswerKey phải là một trong các lựa chọn trong Answer');
      }
      break;
      
    case 'yes-no':
      if (answerCount < 1) {
        errors.push('Yes/No cần ít nhất 1 câu hỏi trong Answer');
      }
      if (keyCount !== answerCount) {
        errors.push(`Yes/No cần ${answerCount} đáp án trong AnswerKey (bằng số câu hỏi)`);
      }
      quiz.AnswerKey?.forEach((key, idx) => {
        if (key !== 'Yes' && key !== 'No') {
          errors.push(`AnswerKey[${idx}] phải là "Yes" hoặc "No" (hiện tại: "${key}")`);
        }
      });
      break;
      
    case 'spell':
      if (answerCount < 1) {
        errors.push('Spell cần ít nhất 1 từ trong Answer');
      }
      if (keyCount !== answerCount) {
        errors.push('Spell: AnswerKey phải có số lượng giống Answer');
      }
      // Check if AnswerKey matches Answer (case-insensitive)
      quiz.Answer?.forEach((ans, idx) => {
        if (quiz.AnswerKey?.[idx]?.toLowerCase() !== ans?.toLowerCase()) {
          errors.push(`Spell: AnswerKey[${idx}] phải giống Answer[${idx}]`);
        }
      });
      break;
      
    case 'word-from-box': {
      if (answerCount < 1) {
        errors.push('Word from Box cần ít nhất 1 câu có chỗ trống trong Answer');
      }
      if (keyCount < 1) {
        errors.push('Word from Box cần ít nhất 1 từ đúng trong AnswerKey');
      }
      
      // Count total blanks (___) in all Answer sentences
      const blanksCount = quiz.Answer?.reduce((sum, sentence) => {
        return sum + (sentence.match(/___/g) || []).length;
      }, 0) || 0;
      
      if (blanksCount === 0) {
        errors.push('Answer phải chứa chỗ trống (___) để điền từ');
      }
      
      if (blanksCount !== keyCount) {
        errors.push(`Số chỗ trống (${blanksCount}) phải bằng số từ trong AnswerKey (${keyCount})`);
      }
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
