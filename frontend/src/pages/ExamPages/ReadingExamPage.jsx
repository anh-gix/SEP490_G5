import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Animation from "../../helper/Animation";
import Preloader from "../../helper/Preloader";
import { examService } from "../../services/examService";
import { useAuth } from "../../contexts/AuthContext";
import Swal from "sweetalert2";
import logo from "../../assets/CamQuiz_img/LOGO.png";

const ReadingExamPage = () => {
  const { examId, submissionId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [sectionData, setSectionData] = useState(null);
  const [answers, setAnswers] = useState({}); // { part_1: { questionNumber: answer }, part_2: { ... } }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const timerRef = useRef(null);
  const [leftWidth, setLeftWidth] = useState(50); // Percentage width for left panel
  const containerRef = useRef(null);
  const isResizingRef = useRef(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [currentPart, setCurrentPart] = useState(1);
  const questionRefs = useRef({});

  const getQuestionData = useCallback(
    (part, questionNumber) => {
      if (!sectionData?.parts) return { questionType: "multiple_choice", questionTitle: "", questionAnswer: [] };
      const partData = sectionData.parts.find((p) => p.part === part);
      if (!partData?.section?.questions) return { questionType: "multiple_choice", questionTitle: "", questionAnswer: [] };
      const question = partData.section.questions.find(
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
            
            const answersArray = Object.keys(partAnswers).map((qNum) => {
              const questionData = getQuestionData(part, parseInt(qNum));
              const questionType = questionData.questionType;
              const answerValue = partAnswers[qNum];

              // Nếu là multiple choice type
              if (isMultipleChoiceType(questionType)) {
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

            if (answersArray.length > 0) {
              partsData.push({
                part: part,
                answers: answersArray,
              });
            }
          }
        }

        await examService.submitReadingAnswers(examId, submissionId, { parts: partsData });

        // Navigate to result page
        navigate(`/student/exams/${examId}/submissions/${submissionId}/reading/result`);
      } catch (err) {
        setError(err?.message || "Không thể nộp bài");
        setSubmitting(false);
      }
    },
    [submitting, answers, examId, submissionId, navigate, getQuestionData, isMultipleChoiceType, sectionData]
  );

  const handleSubmitWithConfirmation = useCallback(async () => {
    const result = await Swal.fire({
      title: "Xác nhận nộp bài",
      text: "Bạn có chắc chắn muốn nộp bài? Sau khi nộp bài, bạn sẽ không thể chỉnh sửa lại.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Có, nộp bài",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      handleSubmit();
    }
  }, [handleSubmit]);

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
        const data = await examService.getReadingSection(examId, submissionId);
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
        if (!cancelled) setError(err?.message || "Không thể tải phần thi Reading");
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
        // Check if there are any answers (with actual values, not empty arrays or empty strings)
        const hasAnyAnswer = sectionData?.parts?.some((partData) => {
          const partAnswers = answers[`part_${partData.part}`] || {};
          return Object.keys(partAnswers).some((qNum) => {
            const answerValue = partAnswers[qNum];
            // Check if answer has actual value: not empty array, not empty string, not null/undefined
            if (Array.isArray(answerValue)) {
              return answerValue.length > 0;
            }
            return answerValue && answerValue !== "";
          });
        });

        if (hasAnyAnswer) {
          // call handleSubmit but allow submission even if submitting flag is stale
          handleSubmit(true);
        } else {
          // Show alert if no answers
          Swal.fire({
            title: "Đã hết thời gian!!",
            text: "chúng tôi vẫn chưa ghi nhận được bất cứ câu trả lời nào của bạn",
            icon: "warning",
            confirmButtonText: "Đã hiểu",
            confirmButtonColor: "#3085d6",
          }).then(() => {
            // Navigate to result page even without answers
            navigate(`/student/exams/${examId}`);
          });
        }
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
  }, [timeRemaining, submitting, handleSubmit, answers, sectionData, examId, navigate]);

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

  const getOptionsForQuestion = (part, questionNumber) => {
    const questionData = getQuestionData(part, questionNumber);
    const questionType = questionData.questionType;
    
    if (questionType === "multiple_choice") {
      // Sử dụng questionAnswer từ API: [{ key: "A", text: "nội dung" }, ...]
      return questionData.questionAnswer || [];
    } else if (questionType === "true_false") {
      return ["True", "False"];
    }
    return [];
  };

  const handleAnswerChange = (part, questionNumber, value, questionType) => {
    const isMultiple = isMultipleChoiceType(questionType);
    const partKey = `part_${part}`;
    
    if (isMultiple) {
      // Xử lý multiple choice: toggle giá trị trong array
      setAnswers((prev) => {
        const partAnswers = prev[partKey] || {};
        const currentAnswer = partAnswers[questionNumber] || [];
        const answerArray = Array.isArray(currentAnswer) ? currentAnswer : [];
        const newAnswer = answerArray.includes(value)
          ? answerArray.filter((item) => item !== value)
          : [...answerArray, value].sort();
        
        return {
          ...prev,
          [partKey]: {
            ...partAnswers,
            [questionNumber]: newAnswer,
          },
        };
      });
    } else {
      // Xử lý single choice: lưu giá trị đơn
      setAnswers((prev) => ({
        ...prev,
        [partKey]: {
          ...(prev[partKey] || {}),
          [questionNumber]: value,
        },
      }));
    }
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
      
      <div className="reading-exam-container" style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        <style>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .reading-exam-container {
            background: hsl(var(--main-25));
          }
          .reading-exam-header {
            background: white;
            border-bottom: 1px solid hsl(var(--border-color));
            padding: 16px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-shrink: 0;
            z-index: 10;
          }
          .reading-exam-header .logo img {
            height: 40px;
            width: auto;
          }
          .reading-exam-timer {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 18px;
            font-weight: 600;
          }
          .reading-exam-timer.danger {
            color: var(--danger-600);
          }
          .reading-exam-main {
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
            border-top: 1px solid var(--border-color);
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
        <div className="reading-exam-header">
          <div className="logo">
            <Link to="/" className="link">
              <img src={logo} alt="Logo" />
            </Link>
          </div>
          
          {timeRemaining !== null && (
            <div className={`reading-exam-timer ${timeRemaining < 300 ? "danger" : ""}`}>
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
              onClick={handleSubmitWithConfirmation}
              disabled={submitting || (() => {
                // Check if at least one part has answers (with actual values, not empty arrays or empty strings)
                return !sectionData?.parts?.some((partData) => {
                  const partAnswers = answers[`part_${partData.part}`] || {};
                  return Object.keys(partAnswers).some((qNum) => {
                    const answerValue = partAnswers[qNum];
                    // Check if answer has actual value: not empty array, not empty string, not null/undefined
                    if (Array.isArray(answerValue)) {
                      return answerValue.length > 0;
                    }
                    return answerValue && answerValue !== "";
                  });
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

        {/* Main Content: PDF and Answers */}
        <div className="reading-exam-main" ref={containerRef}>
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
              {getPDFUrl(currentPart) ? (
                <iframe
                  src={getPDFUrl(currentPart)}
                  className="w-100 h-100 border-0 rounded-8"
                  title="Reading PDF"
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
                        const questionData = getQuestionData(currentPart, qNum);
                        const questionType = questionData.questionType;
                        const options = getOptionsForQuestion(currentPart, qNum);
                        const answerValue = partAnswers[qNum];
                        const hasAnswer = Array.isArray(answerValue) 
                          ? answerValue.length > 0 
                          : answerValue && answerValue !== "";
                        
                        return (
                          <div 
                            key={qNum} 
                            ref={(el) => (questionRefs.current[`part_${currentPart}_q_${qNum}`] = el)}
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
                                  const answerArray = Array.isArray(partAnswers[qNum]) ? partAnswers[qNum] : [];
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
                                        onChange={() => handleAnswerChange(currentPart, qNum, optionKey, questionType)}
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
                                  value={partAnswers[qNum] || ""}
                                  onChange={(e) => handleAnswerChange(currentPart, qNum, e.target.value, questionType)}
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
                                      partAnswers[qNum] === option
                                        ? "border-main-600 bg-main-25"
                                        : "border-neutral-30 hover-border-main-300"
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name={`part_${currentPart}_question-${qNum}`}
                                      value={option}
                                      checked={partAnswers[qNum] === option}
                                      onChange={() => handleAnswerChange(currentPart, qNum, option, questionType)}
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
                        Đã trả lời: <strong className="text-main-600">{Object.keys(partAnswers).length}</strong> / {generateQuestionNumbers(currentPart).length} câu
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
            const answerValue = partAnswers[qNum];
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

export default ReadingExamPage;
