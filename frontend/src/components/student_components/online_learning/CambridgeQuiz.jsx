import { useMemo, useState, useCallback, memo } from "react";
import Swal from 'sweetalert2';

// Memoized Quiz Item Components to prevent unnecessary re-renders
const YesNoQuizItem = memo(({ 
  statement, 
  stmtIndex, 
  subKey, 
  isSelected, 
  correctAnswer, 
  showResults, 
  isCompleted, 
  onSelect 
}) => {
  const shouldReveal = showResults && typeof isSelected !== "undefined";
  
  return (
    <div className='mb-10'>
      <p className='mb-3 fw-medium text-neutral-800' style={{ fontSize: '1.15rem', opacity: isCompleted ? 0.6 : 1 }}>
        {stmtIndex + 1}. {statement}
      </p>
      <div className='d-flex gap-3 justify-content-start'>
        {['Yes', 'No'].map((option) => {
          const isThisSelected = isSelected === option;
          const isCorrect = correctAnswer === option;
          
          let btnClass = "btn px-5 py-2 rounded-pill transition-1 fw-semibold";
          
          if (!showResults && isThisSelected) {
            btnClass += " btn-main";
          } else if (shouldReveal && isThisSelected) {
            btnClass += isCorrect ? " btn-success" : " btn-danger";
          } else if (shouldReveal && isCorrect) {
            btnClass += " btn-outline-success";
          } else {
            btnClass += " btn-outline-main";
          }
          
          return (
            <button
              key={option}
              className={btnClass}
              onClick={() => !isCompleted && onSelect(subKey, option)}
              style={{ fontSize: '1.1rem', minWidth: '120px', opacity: isCompleted ? 0.6 : 1 }}
              disabled={isCompleted}
            >
              {option === 'Yes' ? '✓ Yes' : '✗ No'}
              {shouldReveal && isThisSelected && (
                <i className={`ms-2 ph-fill ${isCorrect ? 'ph-check-circle' : 'ph-x-circle'}`}></i>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
});

const SpellQuizItem = memo(({ 
  word, 
  wordIndex, 
  subKey, 
  userSpell, 
  showResults, 
  isCompleted, 
  onChange 
}) => {
  const letterCount = word.length;
  const isSpellSubmitted = showResults && userSpell.filter(l => l).length === letterCount;
  const userWord = userSpell.join('');
  const isSpellCorrect = isSpellSubmitted && userWord.toUpperCase() === word.toUpperCase();
  
  return (
    <div className='mb-2'>
      <p className='mb-3 fw-medium text-neutral-800' style={{ fontSize: '1.15rem', opacity: isCompleted ? 0.6 : 1 }}>
        {wordIndex + 1}. 
      </p>
      <div className='d-flex gap-2 justify-content-center mb-2'>
        {Array.from({ length: letterCount }).map((_, letterIndex) => (
          <input
            key={letterIndex}
            type='text'
            maxLength={1}
            data-spell-id={subKey}
            className='form-control text-center fw-bold'
            style={{
              width: '55px',
              height: '55px',
              fontSize: '1.75rem',
              textTransform: 'uppercase',
              borderWidth: '2px',
              borderColor: isSpellSubmitted 
                ? (isSpellCorrect ? '#16A34A' : '#DC2626')
                : '#D1D5DB',
              opacity: isCompleted ? 0.6 : 1
            }}
            value={userSpell[letterIndex] || ''}
            onChange={(e) => {
              if (!isCompleted) {
                onChange(subKey, letterIndex, e.target.value, letterCount);
              }
            }}
            disabled={isCompleted}
          />
        ))}
      </div>
      {isSpellSubmitted && (
        <div className={`mt-2 p-2 rounded-8 text-center ${
          isSpellCorrect 
            ? 'bg-success-25 border border-success-200' 
            : 'bg-danger-25 border border-danger-200'
        }`}>
          <p className={`mb-0 fw-medium ${isSpellCorrect ? 'text-success-700' : 'text-danger-700'}`}>
            {isSpellCorrect 
              ? '🎉 Perfect!' 
              : `Correct: ${word.toUpperCase()}`}
          </p>
        </div>
      )}
    </div>
  );
});

const WordFromBoxItem = memo(({ 
  sentence, 
  sentIndex, 
  subKey, 
  selectedWord, 
  correctWord, 
  wordBox, 
  showResults, 
  isCompleted, 
  onChange 
}) => {
  const isWordSubmitted = showResults && !!selectedWord;
  const isWordCorrect = isWordSubmitted && selectedWord === correctWord;
  const parts = sentence.split('_____');
  
  return (
    <div className='mb-2'>
      <div className='d-flex align-items-center flex-wrap gap-2 mb-2' style={{ fontSize: '1.1rem', opacity: isCompleted ? 0.6 : 1 }}>
        <span className='fw-medium text-neutral-600'>{sentIndex + 1}.</span>
        <span className='text-neutral-800'>{parts[0]}</span>
        <select
          className='form-select form-select-sm d-inline-block fw-semibold'
          style={{ 
            width: 'auto',
            minWidth: '120px',
            fontSize: '1.05rem',
            borderWidth: '2px',
            borderColor: isWordSubmitted 
              ? (isWordCorrect ? '#16A34A' : '#DC2626')
              : '#D1D5DB'
          }}
          value={selectedWord || ''}
          onChange={(e) => !isCompleted && onChange(subKey, e.target.value)}
          disabled={isCompleted}
        >
          <option value=''>---</option>
          {wordBox.map((word, wordIndex) => (
            <option key={wordIndex} value={word}>
              {word}
            </option>
          ))}
        </select>
        <span className='text-neutral-800'>{parts[1] || ''}</span>
      </div>
      {isWordSubmitted && (
        <div className={`mt-2 p-2 rounded-8 ${
          isWordCorrect 
            ? 'bg-success-25 border border-success-200' 
            : 'bg-danger-25 border border-danger-200'
        }`}>
          <p className={`mb-0 fw-medium ${isWordCorrect ? 'text-success-700' : 'text-danger-700'}`} style={{ fontSize: '0.9rem' }}>
            {isWordCorrect 
              ? '✓ Correct!' 
              : `✗ Correct answer: ${correctWord}`}
          </p>
        </div>
      )}
    </div>
  );
});

const MultipleChoiceItem = memo(({ 
  answer, 
  ansIndex, 
  quizKey, 
  isSelected, 
  isCorrect, 
  showResults, 
  isCompleted, 
  onSelect 
}) => {
  const shouldReveal = showResults && typeof isSelected !== "undefined";
  let itemClass = "border rounded-pill px-4 py-3 cursor-pointer transition-1 d-flex align-items-center gap-3";
  
  if (!showResults && isSelected) {
    itemClass += " border-main-600 bg-main-50 text-main-700 fw-semibold";
  } else if (shouldReveal && isSelected) {
    itemClass += isCorrect
      ? " border-success-600 bg-success-50 text-success-700 fw-bold"
      : " border-danger-600 bg-danger-50 text-danger-700 fw-bold";
  } else if (shouldReveal && isCorrect) {
    itemClass += " border-success-300 bg-success-25 text-success-700 fw-medium";
  } else {
    itemClass += " border-neutral-200 text-neutral-700 hover-border-main-600 hover-bg-main-25";
  }
  
  if (isCompleted) {
    itemClass += " opacity-60";
  }

  const letterLabel = String.fromCharCode(65 + ansIndex);

  return (
    <li
      className={itemClass}
      onClick={() => !isCompleted && onSelect(quizKey, answer)}
      style={{ cursor: isCompleted ? 'not-allowed' : 'pointer', fontSize: '1.15rem' }}
    >
      <span className='fw-bold fs-5'>{letterLabel}.</span>
      <span className='flex-grow-1'>{answer}</span>
      {shouldReveal && isSelected && (
        <i className={`ph-fill fs-4 ${isCorrect ? 'ph-check-circle' : 'ph-x-circle'}`}></i>
      )}
    </li>
  );
});

/**
 * Cambridge Quiz Component
 * Component quiz cho Cambridge sessions - Pre-A1 cho trẻ em
 * Used with quizData prop from SessionLearning parent component
 */
const CambridgeQuiz = ({ quizData = null, onComplete = null, onReset = null, isCompleted = false }) => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [spellAnswers, setSpellAnswers] = useState({}); // For spell type questions
  const [wordFromBoxAnswers, setWordFromBoxAnswers] = useState({}); // For word-from-box type
  const [showResults, setShowResults] = useState(false); // Control when to show answers
  const [isChecking, setIsChecking] = useState(false); // Track if currently checking answers

  const quizList = useMemo(() => quizData || [], [quizData]);

  // Check if all quizzes are answered
  const isAllAnswered = useMemo(() => {
    if (quizList.length === 0) return false;
    
    for (let i = 0; i < quizList.length; i++) {
      const quiz = quizList[i];
      const quizKey = quiz?._id || `quiz-${i}`;
      const quizType = quiz?.Type || 'multiple-choice';
      
      if (quizType === 'yes-no') {
        const statements = quiz?.Answer || [];
        for (let j = 0; j < statements.length; j++) {
          const subKey = `${quizKey}-${j}`;
          if (!selectedAnswers[subKey]) return false;
        }
      } else if (quizType === 'spell') {
        const wordsToSpell = quiz?.Answer || [];
        for (let j = 0; j < wordsToSpell.length; j++) {
          const subKey = `${quizKey}-${j}`;
          const userSpell = spellAnswers[subKey] || [];
          const word = wordsToSpell[j];
          if (userSpell.filter(l => l).length !== word.length) return false;
        }
      } else if (quizType === 'word-from-box') {
        const sentences = quiz?.Answer || [];
        for (let j = 0; j < sentences.length; j++) {
          const subKey = `${quizKey}-${j}`;
          if (!wordFromBoxAnswers[subKey]) return false;
        }
      } else {
        // multiple-choice
        if (!selectedAnswers[quizKey]) return false;
      }
    }
    
    return true;
  }, [quizList, selectedAnswers, spellAnswers, wordFromBoxAnswers]);

  // Check if all answers are correct
  const checkAllCorrect = useCallback(() => {
    for (let i = 0; i < quizList.length; i++) {
      const quiz = quizList[i];
      const quizKey = quiz?._id || `quiz-${i}`;
      const quizType = quiz?.Type || 'multiple-choice';
      
      if (quizType === 'yes-no') {
        const statements = quiz?.Answer || [];
        const correctAnswers = quiz?.AnswerKey || [];
        for (let j = 0; j < statements.length; j++) {
          const subKey = `${quizKey}-${j}`;
          if (selectedAnswers[subKey] !== correctAnswers[j]) return false;
        }
      } else if (quizType === 'spell') {
        const wordsToSpell = quiz?.Answer || [];
        for (let j = 0; j < wordsToSpell.length; j++) {
          const subKey = `${quizKey}-${j}`;
          const userSpell = spellAnswers[subKey] || [];
          const userWord = userSpell.join('');
          const correctWord = wordsToSpell[j];
          if (userWord.toUpperCase() !== correctWord.toUpperCase()) return false;
        }
      } else if (quizType === 'word-from-box') {
        const correctWords = quiz?.AnswerKey || [];
        const sentences = quiz?.Answer || [];
        for (let j = 0; j < sentences.length; j++) {
          const subKey = `${quizKey}-${j}`;
          if (wordFromBoxAnswers[subKey] !== correctWords[j]) return false;
        }
      } else {
        // multiple-choice
        const correctAnswer = quiz?.AnswerKey?.[0];
        if (selectedAnswers[quizKey] !== correctAnswer) return false;
      }
    }
    
    return true;
  }, [quizList, selectedAnswers, spellAnswers, wordFromBoxAnswers]);

  // Handle check answers
  const handleCheckAnswers = useCallback(async () => {
    setIsChecking(true);
    setShowResults(true);
    
    const allCorrect = checkAllCorrect();
    
    if (allCorrect) {
      await Swal.fire({
        title: '🎉 Xuất sắc!',
        text: 'Bạn đã trả lời đúng tất cả các câu hỏi!',
        icon: 'success',
        confirmButtonText: 'Hoàn thành',
        confirmButtonColor: '#16A34A'
      });
      
      if (onComplete) {
        onComplete();
      }
    } else {
      await Swal.fire({
        title: '😊 Chưa chính xác',
        text: 'Bạn còn một số câu trả lời chưa đúng. Hãy xem lại và thử lại nhé!',
        icon: 'info',
        confirmButtonText: 'Xem kết quả',
        confirmButtonColor: '#3B82F6'
      });
    }
  }, [checkAllCorrect, onComplete]);

  // Handle retry quiz
  const handleRetry = useCallback(async () => {
    const result = await Swal.fire({
      title: 'Làm lại quiz?',
      text: 'Tất cả câu trả lời của bạn sẽ bị xóa.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Làm lại',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#3B82F6',
      cancelButtonColor: '#6B7280'
    });
    
    if (result.isConfirmed) {
      setSelectedAnswers({});
      setSpellAnswers({});
      setWordFromBoxAnswers({});
      setShowResults(false);
      setIsChecking(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Handle reset completed quiz
  const handleResetCompletedQuiz = useCallback(async () => {
    const result = await Swal.fire({
      title: 'Làm lại quiz đã hoàn thành?',
      text: 'Quiz sẽ được đặt lại về trạng thái chưa hoàn thành.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Làm lại',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#F59E0B',
      cancelButtonColor: '#6B7280'
    });
    
    if (result.isConfirmed) {
      setSelectedAnswers({});
      setSpellAnswers({});
      setWordFromBoxAnswers({});
      setShowResults(false);
      setIsChecking(false);
      
      // Call parent to reset completion status via backend
      if (onReset) {
        await onReset();
      }
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [onReset]);

  const handleSelectAnswer = useCallback((quizId, answer) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [quizId]: answer,
    }));
  }, []);

  const handleSpellLetterChange = useCallback((quizId, index, value, totalLength) => {
    setSpellAnswers((prev) => {
      const current = prev[quizId] || [];
      const updated = [...current];
      updated[index] = value.toUpperCase();
      return {
        ...prev,
        [quizId]: updated,
      };
    });
    
    // Auto-focus next input after state update
    if (value && index < totalLength - 1) {
      setTimeout(() => {
        const inputs = document.querySelectorAll(`input[data-spell-id="${quizId}"]`);
        if (inputs[index + 1]) {
          inputs[index + 1].focus();
        }
      }, 0);
    }
  }, []);

  const handleWordFromBoxChange = useCallback((quizId, word) => {
    setWordFromBoxAnswers((prev) => ({
      ...prev,
      [quizId]: word,
    }));
  }, []);

  const renderQuizByType = (quiz, index) => {
    const quizKey = quiz?._id || `quiz-${index}`;
    const quizType = quiz?.Type || 'multiple-choice';

    // Common wrapper
    const QuizWrapper = ({ children }) => (
      <div
        className='border border-neutral-30 rounded-16 bg-white p-24 shadow-sm'
      >
        <div className='row align-items-center'>
          {/* Image on the right - larger for kids */}
          {quiz?.Img && (
            <div className='col-lg-6 mb-3 mb-lg-0 order-lg-2'>
              <div className='rounded-12 overflow-hidden border border-neutral-30 bg-main-25 p-2'>
                <img
                  src={quiz.Img}
                  alt={`Quiz ${index + 1}`}
                  className='w-100 rounded-8'
                  style={{ objectFit: 'cover', minHeight: '400px', maxHeight: '600px' }}
                />
              </div>
            </div>
          )}
          
          {/* Question content on the left */}
          <div className={quiz?.Img ? 'col-lg-6 order-lg-1' : 'col-12'}>
            <div className='mb-3'>
              <span className='badge bg-main-600 text-white px-3 py-2 text-15 mb-3'>
                Question {index + 1}
              </span>
              <h4 className='text-neutral-800 mb-3' style={{ fontSize: '1.5rem' }}>
                {quiz?.Question || "Chưa có câu hỏi"}
              </h4>
            </div>
            
            {children}
          </div>
        </div>
      </div>
    );

    // Render based on quiz type
    switch (quizType) {
      case 'yes-no': {
        // Answer array contains multiple statements to verify
        // AnswerKey contains corresponding yes/no answers
        const statements = quiz?.Answer || [];
        const correctAnswers = quiz?.AnswerKey || [];
        
        return (
          <QuizWrapper key={quizKey}>
            <div className='d-flex flex-column gap-4'>
              {statements.map((statement, stmtIndex) => {
                const subKey = `${quizKey}-${stmtIndex}`;
                
                return (
                  <YesNoQuizItem
                    key={subKey}
                    statement={statement}
                    stmtIndex={stmtIndex}
                    subKey={subKey}
                    isSelected={selectedAnswers[subKey]}
                    correctAnswer={correctAnswers[stmtIndex]}
                    showResults={showResults}
                    isCompleted={isCompleted}
                    onSelect={handleSelectAnswer}
                  />
                );
              })}
            </div>
          </QuizWrapper>
        );
      }

      case 'spell': {
        // Answer array contains the words to spell (also the correct answers)
        const wordsToSpell = quiz?.Answer || [];
        
        return (
          <QuizWrapper key={quizKey}>
            <div className='d-flex flex-column gap-5'>
              {wordsToSpell.map((word, wordIndex) => {
                const subKey = `${quizKey}-${wordIndex}`;
                
                return (
                  <SpellQuizItem
                    key={subKey}
                    word={word}
                    wordIndex={wordIndex}
                    subKey={subKey}
                    userSpell={spellAnswers[subKey] || []}
                    showResults={showResults}
                    isCompleted={isCompleted}
                    onChange={handleSpellLetterChange}
                  />
                );
              })}
            </div>
          </QuizWrapper>
        );
      }

      case 'word-from-box': {
        // Answer array contains sentences with blanks (_____)
        // AnswerKey contains correct words for each blank
        // Generate WordBox from shuffled AnswerKey
        const sentences = quiz?.Answer || [];
        const correctWords = quiz?.AnswerKey || [];
        
        // Create word box from answer key with shuffled order
        const shuffleArray = (array) => {
          const shuffled = [...array];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          return shuffled;
        };
        
        // Memoize wordBox to prevent reshuffling on re-render
        const wordBox = useMemo(() => shuffleArray(correctWords), [correctWords.join(',')]);
        
        return (
          <QuizWrapper key={quizKey}>
            {/* Word box at top */}
            <div className='mb-4 p-3 bg-main-25 border border-main-100 rounded-12' style={{ opacity: isCompleted ? 0.6 : 1 }}>
              <p className='mb-2 fw-semibold text-main-600' style={{ fontSize: '0.95rem' }}>
                <i className='ph ph-package me-2'></i>Word Box:
              </p>
              <div className='d-flex flex-wrap gap-2'>
                {wordBox.map((word, idx) => (
                  <span key={idx} className='badge bg-white border border-main-300 text-main-700 px-3 py-2' style={{ fontSize: '1rem' }}>
                    {word}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Sentences with blanks */}
            <div className='d-flex flex-column gap-4'>
              {sentences.map((sentence, sentIndex) => {
                const subKey = `${quizKey}-${sentIndex}`;
                
                return (
                  <WordFromBoxItem
                    key={subKey}
                    sentence={sentence}
                    sentIndex={sentIndex}
                    subKey={subKey}
                    selectedWord={wordFromBoxAnswers[subKey]}
                    correctWord={correctWords[sentIndex]}
                    wordBox={wordBox}
                    showResults={showResults}
                    isCompleted={isCompleted}
                    onChange={handleWordFromBoxChange}
                  />
                );
              })}
            </div>
          </QuizWrapper>
        );
      }

      case 'multiple-choice':
      default:
        return (
          <QuizWrapper key={quizKey}>
            {Array.isArray(quiz?.Answer) && quiz.Answer.length > 0 && (
              <ul className='list-unstyled d-flex flex-column gap-3'>
                {quiz.Answer.map((ans, ansIndex) => {
                  const isSelected = selectedAnswers[quizKey] === ans;
                  const isCorrect = Array.isArray(quiz?.AnswerKey) && quiz.AnswerKey.includes(ans);
                  
                  return (
                    <MultipleChoiceItem
                      key={ansIndex}
                      answer={ans}
                      ansIndex={ansIndex}
                      quizKey={quizKey}
                      isSelected={isSelected}
                      isCorrect={isCorrect}
                      showResults={showResults}
                      isCompleted={isCompleted}
                      onSelect={handleSelectAnswer}
                    />
                  );
                })}
              </ul>
            )}
          </QuizWrapper>
        );
    }
  };

  if (!quizData || quizList.length === 0) {
    return (
      <div className='text-center py-5'>
        <i className='fas fa-question-circle text-neutral-400 mb-16' style={{ fontSize: '48px' }}></i>
        <p className='text-neutral-500'>Không có câu hỏi trong bài học này</p>
      </div>
    );
  }

  return (
    <div>
      {/* Completed Quiz Overlay */}
      {isCompleted && (
        <div className='mb-4'>
          <div className='card border-success bg-success-50 rounded-12'>
            <div className='card-body p-20'>
              <div className='d-flex align-items-center justify-content-between flex-wrap gap-3'>
                <div className='d-flex align-items-center gap-12'>
                  <i className='fas fa-check-circle text-success-600' style={{ fontSize: '32px' }}></i>
                  <div>
                    <h5 className='mb-1 text-success-700 fw-bold'>Quiz đã hoàn thành!</h5>
                    <p className='text-sm text-success-600 mb-0'>
                      Bạn có thể xem lại hoặc làm lại quiz này
                    </p>
                  </div>
                </div>
                
                <button 
                  className='btn btn-warning rounded-pill'
                  onClick={handleResetCompletedQuiz}
                >
                  <i className='fas fa-redo me-2'></i>
                  Làm lại quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Content */}
      <div className='cam-quiz border border-neutral-30 rounded-12 bg-white p-24' style={{ opacity: isCompleted ? 0.7 : 1, position: 'relative' }}>
        <h3 className='mb-4 text-center text-main-600'>
          <i className='ph-fill ph-star me-2'></i>
          Let's Practice! ({quizList.length} questions)
        </h3>
        <div className='d-flex flex-column gap-4'>
          {quizList.map((quiz, index) => renderQuizByType(quiz, index))}
        </div>

        {/* Action Buttons */}
        {!isCompleted && (
          <div className='mt-32 pt-24 border-top border-neutral-100'>
            <div className='card border-0 bg-main-50 rounded-12'>
              <div className='card-body p-20'>
                <div className='d-flex align-items-center justify-content-between flex-wrap gap-3'>
                  <div className='d-flex align-items-center gap-12'>
                    <i className='fas fa-info-circle text-main-600' style={{ fontSize: '24px' }}></i>
                    <div>
                      <p className='mb-0 fw-medium'>
                        {isAllAnswered 
                          ? 'Bạn đã trả lời tất cả câu hỏi!' 
                          : 'Hãy trả lời tất cả các câu hỏi'}
                      </p>
                      <p className='text-xs text-neutral-600 mb-0'>
                        {isAllAnswered
                          ? 'Nhấn "Kiểm tra" để xem kết quả'
                          : 'Hoàn thành để kiểm tra kết quả'}
                      </p>
                    </div>
                  </div>
                  
                  <div className='d-flex gap-2'>
                    {isChecking && (
                      <button 
                        className='btn btn-outline-primary rounded-pill'
                        onClick={handleRetry}
                      >
                        <i className='fas fa-redo me-2'></i>
                        Làm lại
                      </button>
                    )}
                    
                    <button 
                      className='btn btn-success rounded-pill'
                      onClick={handleCheckAnswers}
                      disabled={!isAllAnswered}
                    >
                      <i className='fas fa-check-circle me-2'></i>
                      Kiểm tra
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CambridgeQuiz;

