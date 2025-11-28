import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState, useRef } from "react";
import { getCambridgeQuizMock } from "./student_mockdata";

/**
 * Cambridge Quiz Component
 * Trang quiz cho Cambridge sessions - Pre-A1 cho trẻ em
 */
const CambridgeQuiz = () => {
  const { courseId, sessionId } = useParams();
  const [course, setCourse] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [spellAnswers, setSpellAnswers] = useState({}); // For spell type questions
  const [wordFromBoxAnswers, setWordFromBoxAnswers] = useState({}); // For word-from-box type
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    const fetchCamSession = async () => {
    //   if (!courseId || !sessionId) {
    //     setError("Thiếu thông tin khóa học hoặc Cam Session.");
    //     setLoading(false);
    //     return;
    //   }

      try {
        setLoading(true);
        setError(null);

        // Use mock data instead of API
        const response = await getCambridgeQuizMock();

        if (!response.success) {
          setError(
            response.message || "Không thể tải thông tin Cam Session."
          );
          setLoading(false);
          return;
        }

        const { course: fetchedCourse, camSession } = response.data || {};

        if (!camSession) {
          setError("Không tìm thấy Cam Session tương ứng.");
        } else {
          setCourse(fetchedCourse || null);
          setSession(camSession);
        }
      } catch (err) {
        console.error("Error loading cam session:", err);
        setError(
          err.response?.data?.message ||
            "Có lỗi xảy ra khi tải thông tin Cam Session."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCamSession();
  }, [courseId, sessionId]);

  const quizList = useMemo(() => session?.Quiz || [], [session]);

  const handleSelectAnswer = (quizId, answer) => {
    // Save current scroll position
    scrollPositionRef.current = window.scrollY;
    
    setSelectedAnswers((prev) => ({
      ...prev,
      [quizId]: answer,
    }));
    
    // Restore scroll position after state update
    requestAnimationFrame(() => {
      window.scrollTo({
        top: scrollPositionRef.current,
        behavior: 'instant'
      });
    });
  };

  const handleSpellLetterChange = (quizId, index, value) => {
    // Save current scroll position
    scrollPositionRef.current = window.scrollY;
    
    setSpellAnswers((prev) => {
      const current = prev[quizId] || [];
      const updated = [...current];
      updated[index] = value.toUpperCase();
      return {
        ...prev,
        [quizId]: updated,
      };
    });
    
    // Restore scroll position after state update
    requestAnimationFrame(() => {
      window.scrollTo({
        top: scrollPositionRef.current,
        behavior: 'instant'
      });
    });
  };

  const handleWordFromBoxChange = (quizId, word) => {
    // Save current scroll position
    scrollPositionRef.current = window.scrollY;
    
    setWordFromBoxAnswers((prev) => ({
      ...prev,
      [quizId]: word,
    }));
    
    // Restore scroll position after state update
    requestAnimationFrame(() => {
      window.scrollTo({
        top: scrollPositionRef.current,
        behavior: 'instant'
      });
    });
  };

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
                const isSelected = selectedAnswers[subKey];
                const correctAnswer = correctAnswers[stmtIndex];
                const shouldReveal = typeof isSelected !== "undefined";
                
                return (
                  <div key={stmtIndex} className='mb-10'>
                    <p className='mb-3 fw-medium text-neutral-800' style={{ fontSize: '1.15rem' }}>
                      {stmtIndex + 1}. {statement}
                    </p>
                    <div className='d-flex gap-3 justify-content-start'>
                      {['Yes', 'No'].map((option) => {
                        const isThisSelected = isSelected === option;
                        const isCorrect = correctAnswer === option;
                        
                        let btnClass = "btn px-5 py-2 rounded-pill transition-1 fw-semibold";
                        if (shouldReveal && isThisSelected) {
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
                            onClick={() => handleSelectAnswer(subKey, option)}
                            style={{ fontSize: '1.1rem', minWidth: '120px' }}
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
                const userSpell = spellAnswers[subKey] || [];
                const letterCount = word.length;
                const isSpellSubmitted = userSpell.filter(l => l).length === letterCount;
                const userWord = userSpell.join('');
                const isSpellCorrect = isSpellSubmitted && userWord.toUpperCase() === word.toUpperCase();
                
                return (
                  <div key={wordIndex} className='mb-2'>
                    <p className='mb-3 fw-medium text-neutral-800' style={{ fontSize: '1.15rem' }}>
                      {wordIndex + 1}. 
                    </p>
                    <div className='d-flex gap-2 justify-content-center mb-2'>
                      {Array.from({ length: letterCount }).map((_, letterIndex) => (
                        <input
                          key={letterIndex}
                          type='text'
                          maxLength={1}
                          className='form-control text-center fw-bold'
                          style={{
                            width: '55px',
                            height: '55px',
                            fontSize: '1.75rem',
                            textTransform: 'uppercase',
                            borderWidth: '2px',
                            borderColor: isSpellSubmitted 
                              ? (isSpellCorrect ? '#16A34A' : '#DC2626')
                              : '#D1D5DB'
                          }}
                          value={userSpell[letterIndex] || ''}
                          onChange={(e) => {
                            handleSpellLetterChange(subKey, letterIndex, e.target.value);
                            // Auto-focus next input
                            if (e.target.value && letterIndex < letterCount - 1) {
                              const nextInput = e.target.parentElement.children[letterIndex + 1];
                              if (nextInput) nextInput.focus();
                            }
                          }}
                          disabled={isSpellSubmitted}
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
        
        const wordBox = shuffleArray(correctWords);
        
        return (
          <QuizWrapper key={quizKey}>
            {/* Word box at top */}
            <div className='mb-4 p-3 bg-main-25 border border-main-100 rounded-12'>
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
                const selectedWord = wordFromBoxAnswers[subKey];
                const correctWord = correctWords[sentIndex];
                const isWordSubmitted = !!selectedWord;
                const isWordCorrect = isWordSubmitted && selectedWord === correctWord;
                
                // Split sentence by _____ to insert dropdown
                const parts = sentence.split('_____');
                
                return (
                  <div key={sentIndex} className='mb-2'>
                    <div className='d-flex align-items-center flex-wrap gap-2 mb-2' style={{ fontSize: '1.1rem' }}>
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
                        onChange={(e) => handleWordFromBoxChange(subKey, e.target.value)}
                        disabled={isWordSubmitted}
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
                  const shouldReveal = typeof selectedAnswers[quizKey] !== "undefined";

                  let itemClass = "border rounded-pill px-4 py-3 cursor-pointer transition-1 d-flex align-items-center gap-3";
                  if (shouldReveal && isSelected) {
                    itemClass += isCorrect
                      ? " border-success-600 bg-success-50 text-success-700 fw-bold"
                      : " border-danger-600 bg-danger-50 text-danger-700 fw-bold";
                  } else if (shouldReveal && isCorrect) {
                    itemClass += " border-success-300 bg-success-25 text-success-700 fw-medium";
                  } else {
                    itemClass += " border-neutral-200 text-neutral-700 hover-border-main-600 hover-bg-main-25";
                  }

                  const letterLabel = String.fromCharCode(65 + ansIndex);

                  return (
                    <li
                      key={ansIndex}
                      className={itemClass}
                      onClick={() => handleSelectAnswer(quizKey, ans)}
                      style={{ cursor: 'pointer', fontSize: '1.15rem' }}
                    >
                      <span className='fw-bold fs-5'>{letterLabel}.</span>
                      <span className='flex-grow-1'>{ans}</span>
                      {shouldReveal && isSelected && (
                        <i className={`ph-fill fs-4 ${isCorrect ? 'ph-check-circle' : 'ph-x-circle'}`}></i>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            {Array.isArray(quiz?.AnswerKey) &&
              quiz.AnswerKey.length > 0 &&
              typeof selectedAnswers[quizKey] !== "undefined" && (
                <div className='bg-success-25 border border-success-200 rounded-8 p-3 mt-3'>
                  <p className='mb-0 text-success-700 fw-medium'>
                    <i className='ph-fill ph-lightbulb me-2'></i>
                    Correct answer: <strong>{quiz.AnswerKey.join(", ")}</strong>
                  </p>
                </div>
              )}
          </QuizWrapper>
        );
    }
  };

  if (loading) {
    return (
      <section className='course-details py-120'>
        <div className='container'>
          <div className='text-center py-5'>
            <div className='spinner-border text-main-600' role='status'>
              <span className='visually-hidden'>Đang tải...</span>
            </div>
            <p className='text-neutral-500 mt-3'>Đang tải Cambridge Quiz...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || !session) {
    return (
      <section className='course-details py-120'>
        <div className='container'>
          <div className='text-center'>
            <div className='mb-3'>
              <i className='ph ph-warning-circle text-danger' style={{ fontSize: '64px' }}></i>
            </div>
            <p className='text-danger-600 mb-3'>{error || "Không tìm thấy Cam Session."}</p>
            {courseId && (
              <Link
                to={`/course-details/${courseId}`}
                className='btn btn-main rounded-pill mt-24'
              >
                <i className='ph ph-arrow-left me-2'></i>
                Quay lại khóa học
              </Link>
            )}
          </div>
        </div>
      </section>
    );
  }

  const sessionTitle =
    session?.Title || `Cam Session ${session?.Order ? `#${session.Order}` : ""}`;

  return (
    <section className='course-details py-120'>
      <div className='container'>
        {/* Row 1: Video + Course Info Sidebar */}
        <div className='row gy-4 mb-4'>
          <div className='col-xl-8'>
            <div className='course-details__content border border-neutral-30 rounded-12 bg-white p-12'>
              <div className='rounded-12 overflow-hidden'>
                {session?.videoURL ? (
                  <video
                    id='cam-player'
                    className='w-100 rounded-12'
                    controls
                    playsInline
                  >
                    <source src={session.videoURL} type='video/mp4' />
                  </video>
                ) : (
                  <div className='ratio ratio-16x9 bg-neutral-100 rounded-12 flex-center text-neutral-500'>
                    <div className='text-center'>
                      <i className='ph ph-video-camera' style={{ fontSize: '48px' }}></i>
                      <p className='mt-2 mb-0'>Chưa có video cho Cam Session này.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className='p-20'>
                <div className='flex-between flex-wrap gap-16 mb-16'>
                  <h2 className='mb-0'>{sessionTitle}</h2>
                  {course && (
                    <Link
                      to={`/course-details/${course._id}`}
                      className='btn btn-outline-main rounded-pill'
                    >
                      <i className='ph ph-book-open me-2'></i>
                      Xem khóa học
                    </Link>
                  )}
                </div>
                {session?.Des && (
                  <p className='text-neutral-700'>{session.Des}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className='col-xl-4'>
            <div className='course-details__sidebar border border-neutral-30 rounded-12 bg-white p-24'>
              <div className='border-bottom border-neutral-40 pb-20 mb-20'>
                <p className='text-neutral-500 text-sm mb-4'>
                  <i className='ph ph-book-open me-2'></i>
                  Thông tin khóa học
                </p>
                <h5 className='mb-4'>{course?.name || "Không có tên"}</h5>
                <p className='text-neutral-600 mb-2'>
                  <strong>Chương trình:</strong>{" "}
                  {course?.program?.program_name || course?.program?.code || "N/A"}
                </p>
                <p className='text-neutral-600 mb-0'>
                  <strong>Loại khóa:</strong>{" "}
                  <span className='badge bg-main-100 text-main-600'>
                    {course?.program?.type?.toUpperCase() || "CAM"}
                  </span>
                </p>
              </div>

              <div className='border-bottom border-neutral-40 pb-20 mb-20'>
                <p className='text-neutral-500 text-sm mb-2'>
                  <i className='ph ph-hash me-2'></i>
                  Thứ tự buổi học
                </p>
                <h6 className='text-main-600 mb-0'>
                  Session #{session?.Order || "-"}
                </h6>
              </div>

              <div className='border-bottom border-neutral-40 pb-20 mb-20'>
                <p className='text-neutral-500 text-sm mb-2'>
                  <i className='ph ph-video me-2'></i>
                  Video URL
                </p>
                {session?.videoURL ? (
                  <a
                    className='text-main-600 text-sm fw-semibold text-line-2 text-decoration-none hover-text-decoration-underline'
                    href={session.videoURL}
                    target='_blank'
                    rel='noreferrer'
                  >
                    {session.videoURL}
                  </a>
                ) : (
                  <span className='text-neutral-600'>Chưa cập nhật</span>
                )}
              </div>

              <div className='mb-20'>
                <p className='text-neutral-500 text-sm mb-2'>
                  <i className='ph ph-question me-2'></i>
                  Số câu hỏi
                </p>
                <h6 className='text-neutral-700 mb-0'>
                  {quizList.length} câu
                </h6>
              </div>

              {quizList.length > 0 && (
                <div className='bg-main-25 border border-main-100 rounded-8 p-16'>
                  <p className='text-sm text-neutral-700 mb-2'>
                    <i className='ph ph-info me-2'></i>
                    <strong>Hướng dẫn:</strong>
                  </p>
                  <ul className='text-sm text-neutral-600 mb-0 ps-3'>
                    <li>Click vào đáp án để chọn</li>
                    <li>Đáp án đúng sẽ hiển thị màu xanh</li>
                    <li>Đáp án sai sẽ hiển thị màu đỏ</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Practice Section - Full Width */}
        {quizList.length > 0 && (
          <div className='row'>
            <div className='col-12'>
              <div className='cam-quiz border border-neutral-30 rounded-12 bg-white p-24'>
                <h3 className='mb-4 text-center text-main-600'>
                  <i className='ph-fill ph-star me-2'></i>
                  Let's Practice! ({quizList.length} questions)
                </h3>
                <div className='d-flex flex-column gap-4'>
                  {quizList.map((quiz, index) => renderQuizByType(quiz, index))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CambridgeQuiz;
