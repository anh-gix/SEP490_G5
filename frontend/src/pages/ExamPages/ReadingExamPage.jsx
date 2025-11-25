import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb";
import FooterOne from "../../components/FooterOne";
import HeaderOne from "../../components/HomePageforStudent/HeaderOne";
import Animation from "../../helper/Animation";
import Preloader from "../../helper/Preloader";
import { examService } from "../../services/examService";
import { useAuth } from "../../contexts/AuthContext";

const ReadingExamPage = () => {
  const { examId, submissionId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [sectionData, setSectionData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const timerRef = useRef(null);
  const [leftWidth, setLeftWidth] = useState(50); // Percentage width for left panel
  const containerRef = useRef(null);
  const isResizingRef = useRef(false);

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

        await examService.submitReadingAnswers(examId, submissionId, answersArray);

        // Navigate to result page
        navigate(`/exams/${examId}/submissions/${submissionId}/reading/result`);
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
        const data = await examService.getReadingSection(examId, submissionId);
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
    if (sectionData.section.fileUrl.startsWith("http")) {
      return sectionData.section.fileUrl;
    }
    if (sectionData.section.fileUrl.startsWith("/")) {
      const API_PORT = import.meta.env.VITE_API_PORT;
      return `http://localhost:${API_PORT}${sectionData.section.fileUrl}`;
    }
    const API_PORT = import.meta.env.VITE_API_PORT;
    return `http://localhost:${API_PORT}/uploads/${sectionData.section.fileUrl}`;
  };

  const generateQuestionNumbers = () => {
    if (!sectionData?.section?.questionCount) return [];
    return Array.from({ length: sectionData.section.questionCount }, (_, i) => i + 1);
  };

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
     
      

      <section className="py-40">
        <style>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none; /* Chrome, Safari, Opera */
          }
          .resizable-container {
            display: flex;
            height: calc(100vh - 200px);
            min-height: calc(100vh - 200px);
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
            background-color: #4a90e2;
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
        `}</style>
        <div className="container-fluid px-0">
          <div className="resizable-container" ref={containerRef}>
            {/* Left side - PDF Viewer */}
            <div
              className="resizable-panel bg-white border-end border-neutral-30"
              style={{ width: `${leftWidth}%` }}
            >
                <div className="p-24 border-bottom border-neutral-30 flex-between gap-16">
                  <h4 className="mb-0">Đề thi Reading</h4>
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
                <div 
                  className="p-24 hide-scrollbar" 
                  style={{ 
                    height: "calc(100vh - 280px)", 
                    overflow: "auto",
                    scrollbarWidth: "none", /* Firefox */
                    msOverflowStyle: "none", /* IE and Edge */
                  }}
                >
                  {getPDFUrl() ? (
                    <iframe
                      src={getPDFUrl()}
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
                <div className="p-24 border-bottom border-neutral-30 bg-white">
                  <h4 className="mb-8">Chọn đáp án</h4>
                  {sectionData?.section?.instructions && (
                    <p className="text-neutral-600 text-sm mb-0">{sectionData.section.instructions}</p>
                  )}
                </div>
                <div className="p-24" style={{ height: "calc(100vh - 280px)", overflow: "auto" }}>
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
                          Đã trả lời: {Object.keys(answers).length} / {sectionData?.section?.questionCount || 0} câu
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

export default ReadingExamPage;
