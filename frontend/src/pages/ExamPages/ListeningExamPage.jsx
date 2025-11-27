import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  const [leftWidth, setLeftWidth] = useState(50); // Percentage width for left panel
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const containerRef = useRef(null);
  const isResizingRef = useRef(false);
  const questionRefs = useRef({});

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

        // Initialize answers as empty
        setAnswers({});

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

  // Fullscreen functionality
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch((err) => {
        console.error("Error attempting to exit fullscreen:", err);
      });
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Scroll to question
  const scrollToQuestion = useCallback((questionNumber) => {
    setCurrentQuestion(questionNumber);
    const questionElement = questionRefs.current[questionNumber];
    if (questionElement) {
      questionElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  // Resize handlers
  const handleMouseMove = useCallback((e) => {
    if (!isResizingRef.current || !containerRef.current) return;
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    // Limit between 20% and 80%
    const clampedWidth = Math.max(20, Math.min(80, newLeftWidth));
    setLeftWidth(clampedWidth);
  }, []);

  const handleMouseUp = useCallback(() => {
    isResizingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, [handleMouseMove]);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    isResizingRef.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [handleMouseMove, handleMouseUp]);

  // Cleanup resize listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

 

  if (authLoading || loading) {
    return (
      <>
        <Preloader />
        <Animation />
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
      
      <div className="listening-exam-container" style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        <style>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .listening-exam-container {
            background: hsl(var(--main-25));
          }
          .listening-exam-header {
            background: white;
            border-bottom: 1px solid hsl(var(--border-color));
            padding: 16px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-shrink: 0;
            z-index: 10;
          }
          .listening-exam-header .logo img {
            height: 40px;
            width: auto;
          }
          .listening-exam-timer {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 18px;
            font-weight: 600;
          }
          .listening-exam-timer.danger {
            color: var(--danger-600);
          }
          .listening-exam-main {
            flex: 1;
            display: flex;
            flex-direction: row;
            overflow: hidden;
            position: relative;
          }
          .resizable-panel {
            overflow: hidden;
            display: flex;
            flex-direction: column;
          }
          .resizer {
            width: 4px;
            background-color: #e0e0e0;
            cursor: col-resize;
            position: relative;
            flex-shrink: 0;
            transition: background-color 0.2s;
          }
          .resizer:hover {
            background-color: hsl(var(--main-600));
          }
          .resizer::before {
            content: '';
            position: absolute;
            left: -2px;
            right: -2px;
            top: 0;
            bottom: 0;
            cursor: col-resize;
          }
          .question-navigation {
            background: white;
            border-top: 1px solid hsl(var(--border-color));
            padding: 16px 24px;
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            justify-content: center;
            overflow-x: auto;
            flex-shrink: 0;
          }
          .question-nav-item {
            min-width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            border: 1px solid hsl(var(--border-color));
            background: white;
            color: var(--neutral-700);
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          }
          .question-nav-item:hover {
            border-color: hsl(var(--main-600));
            color: hsl(var(--main-600));
          }
          .question-nav-item.active {
            background: hsl(var(--main-600));
            color: white;
            border-color: hsl(var(--main-600));
          }
          .question-nav-item.answered {
            background: hsl(var(--main-25));
            border-color: hsl(var(--main-300));
          }
          .question-nav-item.answered.active {
            background: hsl(var(--main-600));
            border-color: hsl(var(--main-600));
          }
        `}</style>

        {/* Header: Logo, Timer, Submit Button */}
        <div className="listening-exam-header">
          <div className="logo">
            <Link to="/" className="link">
              <img src="assets/images/logo/logo.png" alt="Logo" />
            </Link>
          </div>
          
          {timeRemaining !== null && (
            <div className={`listening-exam-timer ${timeRemaining < 300 ? "danger" : ""}`}>
              <i className="ph ph-clock" style={{ fontSize: "20px" }}></i>
              <span>{formatTime(timeRemaining)}</span>
            </div>
          )}
          
          <div className="flex-align gap-16">
            <button
              onClick={toggleFullscreen}
              className="btn btn-outline-main rounded-pill flex-align gap-8"
              title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
            >
              <i className={`ph ${isFullscreen ? "ph-arrows-in" : "ph-arrows-out"}`}></i>
              {isFullscreen ? "Thoát" : "Toàn màn hình"}
            </button>
            <button
              onClick={() => handleSubmit()}
              disabled={submitting || Object.keys(answers).length === 0}
              className="btn btn-main rounded-pill px-32 py-12 flex-align gap-8"
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                  Đang nộp...
                </>
              ) : (
                <>
                  <i className="ph ph-check"></i>
                  Nộp bài
                </>
              )}
            </button>
          </div>
        </div>

        {/* Audio Player Section */}
        {audioUrls.length > 0 && (
          <div className="bg-white border-bottom border-neutral-30 px-24 py-16 flex-shrink-0">
            {audioUrls.length > 1 && (
              <div className="mb-12">
                <div className="d-flex flex-wrap gap-8 align-items-center">
                  <span className="fw-semibold text-neutral-700 text-sm mb-0">Chọn audio:</span>
                  {audioUrls.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => handleAudioChange(index)}
                      className={`btn ${
                        currentAudioIndex === index ? "btn-main" : "btn-outline-main"
                      } px-12 py-4 rounded-pill text-sm`}
                    >
                      Audio {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
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

        {/* Main Content: PDF and Answers */}
        <div className="listening-exam-main" ref={containerRef}>
          {/* Left side - PDF Viewer */}
          <div
            className="resizable-panel bg-white"
            style={{ width: `${leftWidth}%` }}
          >
            <div 
              className="p-24 hide-scrollbar" 
              style={{ 
                height: "100%", 
                overflow: "auto",
              }}
            >
              {getPDFUrl() ? (
                <iframe
                  src={getPDFUrl()}
                  className="w-100 h-100 border-0 rounded-8"
                  title="Listening PDF"
                  style={{ minHeight: "600px" }}
                />
              ) : (
                <div className="text-center py-80">
                  <p className="text-neutral-500">Không có file PDF</p>
                </div>
              )}
            </div>
          </div>

          {/* Resizer Bar */}
          <div 
            className="resizer"
            onMouseDown={handleMouseDown}
            role="separator"
            aria-label="Resize panels"
            aria-orientation="vertical"
          />

          {/* Right side - Answer Section */}
          <div
            className="resizable-panel bg-main-25"
            style={{ width: `${100 - leftWidth}%` }}
          >
            <div className="p-24" style={{ height: "100%", overflow: "auto" }}>
              {error && (
                <div className="alert alert-danger mb-24" role="alert">
                  {error}
                </div>
              )}

              {sectionData?.section?.instructions && (
                <div className="bg-white rounded-12 p-16 mb-24 border border-neutral-30">
                  <p className="text-neutral-700 mb-0 fw-semibold">Hướng dẫn:</p>
                  <p className="text-neutral-600 text-sm mb-0 mt-8">{sectionData.section.instructions}</p>
                </div>
              )}

              <div className="mb-24">
                {generateQuestionNumbers().map((qNum) => {
                  const questionData = getQuestionData(qNum);
                  const questionType = questionData.questionType;
                  const options = getOptionsForQuestion(qNum);
                  const answerValue = answers[qNum];
                  const hasAnswer = Array.isArray(answerValue) 
                    ? answerValue.length > 0 
                    : answerValue && answerValue !== "";
                  
                  return (
                    <div 
                      key={qNum} 
                      ref={(el) => (questionRefs.current[qNum] = el)}
                      className="bg-white rounded-12 p-16 mb-16 border border-neutral-30"
                    >
                      <div className="flex-between gap-16 mb-12">
                        <label className="fw-semibold text-neutral-700">Câu {qNum}</label>
                        {hasAnswer && (
                          <span className="badge bg-main-600 text-white px-12 py-4 rounded-pill">
                            Đã trả lời
                          </span>
                        )}
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
                            onChange={(e) => handleAnswerChange(qNum, e.target.value, questionType)}
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

              <div className="bg-white rounded-12 p-16 border border-neutral-30">
                <p className="text-neutral-600 text-sm mb-0 text-center">
                  Đã trả lời: <strong className="text-main-600">{Object.keys(answers).length}</strong> / {sectionData?.section?.questionCount || 0} câu
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Question Navigation at Bottom */}
        <div className="question-navigation">
          {generateQuestionNumbers().map((qNum) => {
            const answerValue = answers[qNum];
            const hasAnswer = Array.isArray(answerValue) 
              ? answerValue.length > 0 
              : answerValue && answerValue !== "";
            const isActive = currentQuestion === qNum;
            
            return (
              <button
                key={qNum}
                onClick={() => scrollToQuestion(qNum)}
                className={`question-nav-item ${isActive ? "active" : ""} ${hasAnswer ? "answered" : ""}`}
                title={`Câu ${qNum}${hasAnswer ? " - Đã trả lời" : ""}`}
              >
                {qNum}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ListeningExamPage;

