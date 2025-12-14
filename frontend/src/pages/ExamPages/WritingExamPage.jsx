import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Animation from "../../helper/Animation";
import Preloader from "../../helper/Preloader";
import { examService } from "../../services/examService";
import { useAuth } from "../../contexts/AuthContext";

const WritingExamPage = () => {
  const { examId, submissionId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [sectionData, setSectionData] = useState(null);
  const [answers, setAnswers] = useState({}); // { part_1: { questionNumber: answerText }, part_2: { ... } }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [currentPart, setCurrentPart] = useState(1);
  const [leftWidth, setLeftWidth] = useState(50);
  const timerRef = useRef(null);
  const containerRef = useRef(null);
  const isResizingRef = useRef(false);
  const questionRefs = useRef({});

  const handleSubmit = useCallback(
    async (force = false) => {
      // Stop timer (if any)
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Prevent double submission unless forced
      if (submitting && !force) return;

      try {
        setSubmitting(true);
        
        // Xử lý answers cho tất cả các part
        const partsData = [];
        
        if (sectionData?.parts) {
          for (const partData of sectionData.parts) {
            const part = partData.part;
            const partAnswers = answers[`part_${part}`] || {};
            
            const answersArray = Object.keys(partAnswers).map((qNum) => ({
              questionNumber: parseInt(qNum),
              answerText: partAnswers[qNum] || "",
            }));

            if (answersArray.length > 0) {
              partsData.push({
                part: part,
                answers: answersArray,
              });
            }
          }
        }

        await examService.submitWritingAnswers(examId, submissionId, { parts: partsData });

        // Navigate to result page
        navigate(`/exams/${examId}/submissions/${submissionId}/writing/result`);
      } catch (err) {
        setError(err?.message || "Không thể nộp bài");
        setSubmitting(false);
      }
    },
    [submitting, answers, examId, submissionId, navigate, sectionData]
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
        const data = await examService.getWritingSection(examId, submissionId);
        if (cancelled) return;

        setSectionData(data);

        // Initialize answers as empty for all parts
        const initialAnswers = {};
        if (data.parts) {
          data.parts.forEach((partData) => {
            initialAnswers[`part_${partData.part}`] = {};
          });
        }
        setAnswers(initialAnswers);

        // Initialize timer if totalDuration exists
        if (data.totalDuration) {
          setTimeRemaining(data.totalDuration * 60); // minutes -> seconds
        } else {
          setTimeRemaining(null);
        }

        // Set current part to first part
        if (data.parts && data.parts.length > 0) {
          setCurrentPart(data.parts[0].part);
        }

        setError(null);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Không thể tải phần thi Writing");
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
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (part, questionNumber, value) => {
    const partKey = `part_${part}`;
    setAnswers((prev) => ({
      ...prev,
      [partKey]: {
        ...(prev[partKey] || {}),
        [questionNumber]: value,
      },
    }));
  };

  const getPDFUrl = (part) => {
    if (!sectionData?.parts) return null;
    const partData = sectionData.parts.find((p) => p.part === part);
    if (!partData?.section?.fileUrl) return null;
    
    const fileUrl = partData.section.fileUrl;
    if (fileUrl.startsWith("http")) {
      return fileUrl;
    }
    if (fileUrl.startsWith("/")) {
      const API_PORT = import.meta.env.VITE_API_PORT;
      return `http://localhost:${API_PORT}${fileUrl}`;
    }
    const API_PORT = import.meta.env.VITE_API_PORT;
    return `http://localhost:${API_PORT}/uploads/${fileUrl}`;
  };

  const getQuestionData = useCallback(
    (part, questionNumber) => {
      if (!sectionData?.parts) return { questionTitle: "", questionAnswer: [] };
      const partData = sectionData.parts.find((p) => p.part === part);
      if (!partData?.section?.questions) return { questionTitle: "", questionAnswer: [] };
      const question = partData.section.questions.find(
        (q) => q.questionNumber === questionNumber
      );
      return {
        questionTitle: question?.questionTitle || "",
        questionAnswer: question?.questionAnswer || [],
      };
    },
    [sectionData]
  );

  const generateQuestionNumbers = (part) => {
    if (!sectionData?.parts) return [];
    const partData = sectionData.parts.find((p) => p.part === part);
    if (!partData?.section?.questions) return [];
    // Lấy tất cả questionNumber từ questions array và sắp xếp
    return partData.section.questions
      .map((q) => q.questionNumber)
      .filter((num) => num != null)
      .sort((a, b) => a - b);
  };

  const getWordCount = (text) => {
    if (!text || !text.trim()) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
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
    const questionElement = questionRefs.current[`part_${currentPart}_q_${questionNumber}`];
    if (questionElement) {
      questionElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentPart]);

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
      
      <div className="writing-exam-container" style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        <style>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .writing-exam-container {
            background: hsl(var(--main-25));
          }
          .writing-exam-header {
            background: white;
            border-bottom: 1px solid hsl(var(--border-color));
            padding: 16px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-shrink: 0;
            z-index: 10;
          }
          .writing-exam-header .logo img {
            height: 40px;
            width: auto;
          }
          .writing-exam-timer {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 18px;
            font-weight: 600;
          }
          .writing-exam-timer.danger {
            color: var(--danger-600);
          }
          .writing-exam-main {
            flex: 1;
            display: flex;
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
        <div className="writing-exam-header">
          <div className="logo">
            <Link to="/" className="link">
              <img src="assets/images/logo/logo.png" alt="Logo" />
            </Link>
          </div>
          
          {timeRemaining !== null && (
            <div className={`writing-exam-timer ${timeRemaining < 300 ? "danger" : ""}`}>
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
              disabled={submitting || (() => {
                // Check if at least one part has answers
                return !sectionData?.parts?.some((partData) => {
                  const partAnswers = answers[`part_${partData.part}`] || {};
                  return Object.keys(partAnswers).some((qNum) => partAnswers[qNum]?.trim());
                });
              })()}
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

        {/* Main Content: PDF and Writing Area */}
        <div className="writing-exam-main" ref={containerRef}>
          {/* Left side - PDF Viewer (if available) */}
          {getPDFUrl(currentPart) && (
            <>
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
                  <iframe
                    src={getPDFUrl(currentPart)}
                    className="w-100 h-100 border-0 rounded-8"
                    title="Writing PDF"
                    style={{ minHeight: "600px" }}
                  />
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
            </>
          )}

          {/* Right side - Writing Area */}
          <div
            className="resizable-panel bg-main-25"
            style={{ width: getPDFUrl(currentPart) ? `${100 - leftWidth}%` : "100%" }}
          >
            <div className="p-24" style={{ height: "100%", overflow: "auto" }}>
              {error && (
                <div className="alert alert-danger mb-24" role="alert">
                  {error}
                </div>
              )}

              {/* Part Selector */}
              {sectionData?.parts && sectionData.parts.length > 1 && (
                <div className="bg-white rounded-12 p-16 mb-24 border border-neutral-30">
                  <div className="d-flex flex-wrap gap-8 align-items-center">
                    <span className="fw-semibold text-neutral-700 text-sm mb-0">Chọn phần:</span>
                    {sectionData.parts.map((partData) => (
                      <button
                        key={partData.part}
                        onClick={() => {
                          setCurrentPart(partData.part);
                          setCurrentQuestion(1);
                        }}
                        className={`btn ${
                          currentPart === partData.part ? "btn-main" : "btn-outline-main"
                        } px-12 py-4 rounded-pill text-sm`}
                      >
                        Part {partData.part}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(() => {
                const currentPartData = sectionData?.parts?.find((p) => p.part === currentPart);
                const partAnswers = answers[`part_${currentPart}`] || {};
                
                return (
                  <>
                    {currentPartData?.section?.instructions && (
                      <div className="bg-white rounded-12 p-16 mb-24 border border-neutral-30">
                        <p className="text-neutral-700 mb-0 fw-semibold">Hướng dẫn:</p>
                        <p className="text-neutral-600 text-sm mb-0 mt-8">{currentPartData.section.instructions}</p>
                      </div>
                    )}

                    <div className="mb-24">
                      {generateQuestionNumbers(currentPart).map((qNum) => {
                        const answerText = partAnswers[qNum] || "";
                        const wordCount = getWordCount(answerText);
                        const questionData = getQuestionData(currentPart, qNum);
                        const hasAnswer = answerText && answerText.trim();
                        
                        return (
                          <div
                            key={qNum}
                            ref={(el) => (questionRefs.current[`part_${currentPart}_q_${qNum}`] = el)}
                            className="bg-white rounded-12 p-24 mb-24 border border-neutral-30"
                          >
                            <div className="flex-between gap-16 mb-16">
                              <label className="fw-semibold text-neutral-700 text-lg">
                                Câu {qNum}
                              </label>
                              <div className="flex-align gap-16">
                                {hasAnswer && (
                                  <span className="badge bg-main-600 text-white px-12 py-4 rounded-pill">
                                    Đã viết ({wordCount} từ)
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Question Title */}
                            {questionData.questionTitle && (
                              <div className="mb-16">
                                <p className="text-neutral-700 fw-semibold mb-0">{questionData.questionTitle}</p>
                              </div>
                            )}

                            {/* Question Answers (if any) */}
                            {questionData.questionAnswer && questionData.questionAnswer.length > 0 && (
                              <div className="mb-16">
                                <p className="text-neutral-600 text-sm mb-8">Các đáp án:</p>
                                <div className="d-flex flex-column gap-4">
                                  {questionData.questionAnswer.map((option, idx) => (
                                    <div key={idx} className="text-neutral-600 text-sm">
                                      <span className="fw-semibold">{option.key}.</span> {option.text}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <textarea
                              className="form-control"
                              rows={12}
                              placeholder="Viết câu trả lời của bạn ở đây..."
                              value={answerText}
                              onChange={(e) => handleAnswerChange(currentPart, qNum, e.target.value)}
                              style={{
                                fontSize: "16px",
                                lineHeight: "1.6",
                                resize: "vertical",
                              }}
                            />
                            <div className="mt-8 text-end">
                              <span className="text-neutral-500 text-sm">
                                Số từ: {wordCount}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-white rounded-12 p-16 border border-neutral-30">
                      <p className="text-neutral-600 text-sm mb-0 text-center">
                        Đã viết: <strong className="text-main-600">
                          {Object.keys(partAnswers).filter((qNum) => partAnswers[qNum]?.trim()).length}
                        </strong> / {generateQuestionNumbers(currentPart).length} câu
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Question Navigation at Bottom */}
        <div className="question-navigation">
          {generateQuestionNumbers(currentPart).map((qNum) => {
            const partAnswers = answers[`part_${currentPart}`] || {};
            const answerText = partAnswers[qNum] || "";
            const hasAnswer = answerText && answerText.trim();
            const isActive = currentQuestion === qNum;
            
            return (
              <button
                key={qNum}
                onClick={() => scrollToQuestion(qNum)}
                className={`question-nav-item ${isActive ? "active" : ""} ${hasAnswer ? "answered" : ""}`}
                title={`Câu ${qNum}${hasAnswer ? " - Đã viết" : ""}`}
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

export default WritingExamPage;

