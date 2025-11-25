import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HeaderOne from "../../components/HomePageforStudent/HeaderOne";
import Animation from "../../helper/Animation";
import Preloader from "../../helper/Preloader";
import { examService } from "../../services/examService";
import { useAuth } from "../../contexts/AuthContext";

const ListeningExamPage = () => {
  const { examId, submissionId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [sectionData, setSectionData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [splitPosition, setSplitPosition] = useState(50); // Percentage
  const [isResizing, setIsResizing] = useState(false);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  const getQuestionData = useCallback(
    (questionNumber) => {
      if (!sectionData?.section?.questions) return { questionType: "multiple_choice", questionTitle: "", questionAnswer: [] };
      const question = sectionData.section.questions.find(
        (q) => q.questionNumber === questionNumber
      );
      return {
        questionType: question?.questionType || "multiple_choice",
        questionTitle: question?.questionTitle || "",
        questionAnswer: question?.questionAnswer || [],
      };
    },
    [sectionData]
  );
  
  const getQuestionType = useCallback(
    (questionNumber) => {
      return getQuestionData(questionNumber).questionType;
    },
    [getQuestionData]
  );
  
  const isMultipleChoiceType = (questionType) => {
    return questionType === "multiple_choice";
  };
  const handleSubmit = useCallback(
    async (force = false) => {
      // Stop timer (if any)
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Stop audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // Prevent double submission unless forced
      if (submitting && !force) return;

      try {
        setSubmitting(true);
        const answersArray = Object.keys(answers).map((qNum) => {
          const questionData = getQuestionData(parseInt(qNum));
          const questionType = questionData.questionType;
          const answerValue = answers[qNum];

          // Nếu là multiple choice type
          if (isMultipleChoiceType(questionType)) {
            // Gửi array cho các loại câu hỏi cho phép chọn nhiều
            const answerArray = Array.isArray(answerValue) ? answerValue : [answerValue].filter(Boolean);
            return {
              questionNumber: parseInt(qNum),
              selectedOption: answerArray,
            };
          } else if (questionType === "true_false") {
            return {
              questionNumber: parseInt(qNum),
              selectedOption: answerValue,
            };
          } else {
            return {
              questionNumber: parseInt(qNum),
              answerText: answerValue,
            };
          }
        });

        await examService.submitListeningAnswers(examId, submissionId, answersArray);

        // Navigate to result page
        navigate(`/exams/${examId}/submissions/${submissionId}/listening/result`);
      } catch (err) {
        setError(err?.message || "Không thể nộp bài");
        setSubmitting(false);
      }
    },
    [submitting, answers, examId, submissionId, navigate, getQuestionData, isMultipleChoiceType]
  );

  // Fetch section + initialize state
  useEffect(() => {
    // Đợi AuthContext hoàn thành việc kiểm tra authentication trước khi redirect
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/sign-in");
      return;
    }

    let cancelled = false;

    const fetchSection = async () => {
      try {
        setLoading(true);
        const data = await examService.getListeningSection(examId, submissionId);
        if (cancelled) return;

        setSectionData(data);

        // Initialize answers from existing submission
        if (data.submission?.answers?.length > 0) {
          const existingAnswers = {};
          data.submission.answers.forEach((ans) => {
            // Nếu là array, giữ nguyên; nếu không, chuyển thành string
            const answerValue = ans.selectedOption ?? ans.answerText ?? "";
            existingAnswers[ans.questionNumber] = Array.isArray(answerValue) 
              ? answerValue 
              : answerValue;
          });
          setAnswers(existingAnswers);
        } else {
          setAnswers({});
        }

        // Initialize timer if duration exists
        if (data.section?.duration) {
          setTimeRemaining(data.section.duration * 60); // minutes -> seconds
        } else {
          setTimeRemaining(null);
        }

        setError(null);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Không thể tải phần thi Listening");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSection();

    return () => {
      cancelled = true;
    };
  }, [examId, submissionId, isAuthenticated, authLoading, navigate]);

  // Timer effect: start interval once, stop when timeRemaining reaches 0, auto-submit
  useEffect(() => {
    // If timer already running, do nothing here (interval updates timeRemaining)
    if (timeRemaining === null) {
      return;
    }

    // If time is up
    if (timeRemaining <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      // Auto submit if not already submitting
      if (!submitting) {
        // call handleSubmit but allow submission even if submitting flag is stale
        handleSubmit(true);
      }
      return;
    }

    // If there's no interval yet, start it
    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }

    // NOTE: we do NOT clear interval here on every re-run because we only create it when null.
    // Cleanup on unmount is handled in the separate effect below.

    // No cleanup here to avoid clearing interval each second (which would stop the timer)
  }, [timeRemaining, submitting, handleSubmit]);

  // Clear interval on unmount to avoid leaks
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getOptionsForQuestion = (questionNumber) => {
    const questionData = getQuestionData(questionNumber);
    const questionType = questionData.questionType;
    
    if (questionType === "multiple_choice") {
      // Sử dụng questionAnswer từ API: [{ key: "A", text: "nội dung" }, ...]
      return questionData.questionAnswer || [];
    } else if (questionType === "true_false") {
      return ["True", "False"];
    }
    return [];
  };

  
  const handleAnswerChange = (questionNumber, value, questionType) => {
    const isMultiple = isMultipleChoiceType(questionType);
    
    if (isMultiple) {
      // Xử lý multiple choice: toggle giá trị trong array
      setAnswers((prev) => {
        const currentAnswer = prev[questionNumber] || [];
        const answerArray = Array.isArray(currentAnswer) ? currentAnswer : [];
        const newAnswer = answerArray.includes(value)
          ? answerArray.filter((item) => item !== value)
          : [...answerArray, value].sort();
        
        return {
          ...prev,
          [questionNumber]: newAnswer,
        };
      });
    } else {
      // Xử lý single choice: lưu giá trị đơn
      setAnswers((prev) => ({
        ...prev,
        [questionNumber]: value,
      }));
    }
  };

  const getPDFUrl = () => {
    if (!sectionData?.section?.fileUrl) return null;
    // If fileUrl is a full URL, use it directly
    if (sectionData.section.fileUrl.startsWith("http")) {
      return sectionData.section.fileUrl;
    }
    // If it starts with /, it's already a path from root
    if (sectionData.section.fileUrl.startsWith("/")) {
      const API_PORT = import.meta.env.VITE_API_PORT;
      return `http://localhost:${API_PORT}${sectionData.section.fileUrl}`;
    }
    // Otherwise, assume it's in uploads folder
    const API_PORT = import.meta.env.VITE_API_PORT;
    return `http://localhost:${API_PORT}/uploads/${sectionData.section.fileUrl}`;
  };

  const getAudioUrl = (audioUrl) => {
    if (!audioUrl) return null;
    // If audioUrl is a full URL, use it directly
    if (audioUrl.startsWith("http")) {
      return audioUrl;
    }
    // If it starts with /, it's already a path from root
    if (audioUrl.startsWith("/")) {
      const API_PORT = import.meta.env.VITE_API_PORT;
      return `http://localhost:${API_PORT}${audioUrl}`;
    }
    // Otherwise, assume it's in uploads folder
    const API_PORT = import.meta.env.VITE_API_PORT;
    return `http://localhost:${API_PORT}/uploads/${audioUrl}`;
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleAudioChange = (index) => {
    setCurrentAudioIndex(index);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const audioUrls = sectionData?.section?.audioUrls || [];
  const currentAudioUrl = audioUrls[currentAudioIndex];
  // Update audio source when currentAudioIndex changes
  useEffect(() => {
    if (audioRef.current && currentAudioUrl) {
      audioRef.current.load();
      setIsPlaying(false);
    }
  }, [currentAudioIndex, currentAudioUrl]);

  const generateQuestionNumbers = () => {
    if (!sectionData?.section?.questionCount) return [];
    return Array.from({ length: sectionData.section.questionCount }, (_, i) => i + 1);
  };

  // Resizable splitter handlers
  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing || !containerRef.current) return;
      
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      
      // Limit between 20% and 80%
      const clampedPercentage = Math.max(20, Math.min(80, percentage));
      setSplitPosition(clampedPercentage);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

 

  if (authLoading || loading) {
    return (
      <>
        <Preloader />
        <Animation />
        <HeaderOne />
        <div className="text-center py-80">
          <div className="spinner-border text-main-600" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Preloader />
      <Animation />
      <section className="py-16">
        <div className="container-fluid px-0" style={{ maxWidth: '100%', width: '100%' }}>
          {/* Audio Player Section (full width) */}
          {audioUrls.length > 0 && (
            <div className="bg-white border border-neutral-30 rounded-16 p-12 mb-12 mx-0">
              {/* Audio Selector */}
              {audioUrls.length > 1 && (
                <div className="mb-8">
                  <div className="d-flex flex-wrap gap-8 align-items-center">
                    <span className="fw-semibold text-neutral-700 text-sm mb-0">Chọn audio:</span>
                    {audioUrls.map((url, index) => (
                      <button
                        key={index}
                        onClick={() => handleAudioChange(index)}
                        className={`btn ${
                          currentAudioIndex === index ? "btn-primary" : "btn-outline-primary"
                        } px-12 py-4 rounded-pill text-sm`}
                      >
                        Audio {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Audio Player */}
              <div className="bg-main-25 rounded-12 p-12 border border-neutral-30">
                <div className="text-center mb-6">
                  <h6 className="mb-0 text-sm fw-semibold">
                    {audioUrls.length > 1 ? `Audio ${currentAudioIndex + 1}` : "Audio"}
                  </h6>
                </div>
                <audio
                  ref={audioRef}
                  src={getAudioUrl(currentAudioUrl)}
                  onEnded={handleAudioEnded}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  className="w-100"
                  controls
                  style={{ height: "40px" }}
                />
              </div>
            </div>
          )}

          <div 
            ref={containerRef}
            className="d-flex g-0 position-relative"
            style={{ 
              minHeight: audioUrls.length > 0 ? (audioUrls.length > 1 ? "calc(100vh - 200px)" : "calc(100vh - 180px)") : "calc(100vh - 100px)",
              height: audioUrls.length > 0 ? (audioUrls.length > 1 ? "calc(100vh - 200px)" : "calc(100vh - 180px)") : "calc(100vh - 100px)"
            }}
          >
            {/* Left side - PDF Viewer */}
            <div
              className="bg-white border-end border-neutral-30 h-100"
              style={{ 
                width: `${splitPosition}%`,
                minWidth: '20%',
                maxWidth: '80%',
                overflow: 'hidden'
              }}
            >
              <div className="p-24 border-bottom border-neutral-30 flex-between gap-16">
                <h4 className="mb-0">Đề thi Listening</h4>
                {timeRemaining !== null && (
                  <div className="flex-align gap-8">
                    <span className="text-2xl text-main-600">
                      <i className="ph ph-clock" />
                    </span>
                    <span
                      className={`text-lg fw-bold ${
                        timeRemaining < 300 ? "text-danger" : "text-neutral-700"
                      }`}
                    >
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-24" style={{ height: audioUrls.length > 0 ? (audioUrls.length > 1 ? "calc(100vh - 280px)" : "calc(100vh - 260px)") : "calc(100vh - 180px)", overflow: "hidden" }}>
                {getPDFUrl() ? (
                  <iframe
                    src={getPDFUrl()}
                    className="w-100 h-100 border-0 rounded-8"
                    title="Listening PDF"
                    style={{ height: "100%" }}
                  />
                ) : (
                  <div className="text-center py-80">
                    <p className="text-neutral-500">Không có file PDF</p>
                  </div>
                )}
              </div>
            </div>

            {/* Resizable Gutter */}
            <div
              onMouseDown={handleMouseDown}
              className="resizable-gutter"
              style={{
                width: '4px',
                cursor: 'col-resize',
                backgroundColor: isResizing ? 'var(--main-600)' : 'var(--neutral-30)',
                position: 'relative',
                zIndex: 10,
                transition: isResizing ? 'none' : 'background-color 0.2s',
                userSelect: 'none'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: '-2px',
                  top: 0,
                  bottom: 0,
                  width: '8px',
                  cursor: 'col-resize'
                }}
              />
            </div>

            {/* Right side - Answer Section */}
            <div 
              className="bg-main-25 h-100"
              style={{ 
                width: `${100 - splitPosition}%`,
                minWidth: '20%',
                maxWidth: '80%',
                overflow: 'hidden'
              }}
            >
              <div className="p-24 border-bottom border-neutral-30 bg-white">
                <h4 className="mb-8">Chọn đáp án</h4>
                {sectionData?.section?.instructions && (
                  <p className="text-neutral-600 text-sm mb-0">
                    {sectionData.section.instructions}
                  </p>
                )}
              </div>
              <div 
                className="p-24" 
                style={{ 
                  height: audioUrls.length > 0 ? (audioUrls.length > 1 ? "calc(100vh - 280px)" : "calc(100vh - 260px)") : "calc(100vh - 180px)",
                  overflow: "auto" 
                }}
              >
                {error && (
                  <div className="alert alert-danger mb-24" role="alert">
                    {error}
                  </div>
                )}

                <div className="mb-24">
                  {generateQuestionNumbers().map((qNum) => {
                    const questionData = getQuestionData(qNum);
                    const questionType = questionData.questionType;
                    const options = getOptionsForQuestion(qNum);
                    return (
                      <div key={qNum} className="bg-white rounded-12 p-16 mb-16 border border-neutral-30">
                        <div className="flex-between gap-16 mb-12">
                          <label className="fw-semibold text-neutral-700">Câu {qNum}</label>
                          {(() => {
                            const answerValue = answers[qNum];
                            const hasAnswer = Array.isArray(answerValue) 
                              ? answerValue.length > 0 
                              : answerValue && answerValue !== "";
                            return hasAnswer && (
                              <span className="badge bg-main-600 text-white px-12 py-4 rounded-pill">
                                Đã trả lời
                              </span>
                            );
                          })()}
                        </div>

                        {/* Question Title */}
                        {questionData.questionTitle && (
                          <div className="mb-12">
                            <p className="text-neutral-700 mb-0">{questionData.questionTitle}</p>
                          </div>
                        )}

                        {/* Multiple Choice */}
                        {questionType === "multiple_choice" && (
                          <div className="d-flex flex-column gap-8">
                            {options.map((option) => {
                              const optionKey = typeof option === 'object' ? option.key : option;
                              const optionText = typeof option === 'object' ? option.text : '';
                              const answerArray = Array.isArray(answers[qNum]) ? answers[qNum] : [];
                              const isChecked = answerArray.includes(optionKey);
                              return (
                                <label
                                  key={optionKey}
                                  className={`d-flex align-items-center gap-12 p-12 rounded-8 border cursor-pointer transition-2 ${
                                    isChecked
                                      ? "border-main-600 bg-main-25"
                                      : "border-neutral-30 hover-border-main-300"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    value={optionKey}
                                    checked={isChecked}
                                    onChange={() => handleAnswerChange(qNum, optionKey, questionType)}
                                    className="form-check-input"
                                  />
                                  <div className="d-flex align-items-center gap-8">
                                    <span className="fw-semibold text-neutral-700">{optionKey}.</span>
                                    {optionText && <span className="text-neutral-700">{optionText}</span>}
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        )}

                        {/* Input Text */}
                        {questionType === "input" && (
                          <div>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Nhập đáp án của bạn..."
                              value={answers[qNum] || ""}
                              onChange={(e) => handleAnswerChange(qNum, e.target.value)}
                            />
                          </div>
                        )}

                        {/* True/False */}
                        {questionType === "true_false" && (
                          <div className="d-flex flex-column gap-8">
                            {["True", "False"].map((option) => (
                              <label
                                key={option}
                                className={`d-flex align-items-center gap-12 p-12 rounded-8 border cursor-pointer transition-2 ${
                                  answers[qNum] === option
                                    ? "border-main-600 bg-main-25"
                                    : "border-neutral-30 hover-border-main-300"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`question-${qNum}`}
                                  value={option}
                                  checked={answers[qNum] === option}
                                  onChange={() => handleAnswerChange(qNum, option, questionType)}
                                  className="form-check-input"
                                />
                                <span className="text-neutral-700">{option}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="sticky-bottom bg-white border-top border-neutral-30 p-24 mt-24">
                  <div className="flex-between gap-16 flex-wrap">
                    <div>
                      <p className="text-neutral-600 text-sm mb-0">
                        Đã trả lời: {Object.keys(answers).length} /{" "}
                        {sectionData?.section?.questionCount || 0} câu
                      </p>
                    </div>
                    <button
                      onClick={() => handleSubmit()}
                      disabled={submitting || Object.keys(answers).length === 0}
                      className="btn btn-primary px-32 py-12 rounded-pill"
                    >
                      {submitting ? "Đang nộp..." : "Nộp bài"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ListeningExamPage;

