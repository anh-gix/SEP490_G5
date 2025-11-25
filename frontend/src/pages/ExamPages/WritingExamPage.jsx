import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb";
import FooterOne from "../../components/FooterOne";
import HeaderOne from "../../components/HomePageforStudent/HeaderOne";
import Animation from "../../helper/Animation";
import Preloader from "../../helper/Preloader";
import { examService } from "../../services/examService";
import { useAuth } from "../../contexts/AuthContext";

const WritingExamPage = () => {
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
        const answersArray = Object.keys(answers).map((qNum) => ({
          questionNumber: parseInt(qNum),
          answerText: answers[qNum] || "",
        }));

        await examService.submitWritingAnswers(examId, submissionId, answersArray);

        // Navigate to result page
        navigate(`/exams/${examId}/submissions/${submissionId}/writing/result`);
      } catch (err) {
        setError(err?.message || "Không thể nộp bài");
        setSubmitting(false);
      }
    },
    [submitting, answers, examId, submissionId, navigate]
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

        // Initialize answers from existing submission
        if (data.submission?.answers?.length > 0) {
          const existingAnswers = {};
          data.submission.answers.forEach((ans) => {
            existingAnswers[ans.questionNumber] = ans.answerText || "";
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

  const handleAnswerChange = (questionNumber, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionNumber]: value,
    }));
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

  const getQuestionData = useCallback(
    (questionNumber) => {
      if (!sectionData?.section?.questions) return { questionTitle: "", questionAnswer: [] };
      const question = sectionData.section.questions.find(
        (q) => q.questionNumber === questionNumber
      );
      return {
        questionTitle: question?.questionTitle || "",
        questionAnswer: question?.questionAnswer || [],
      };
    },
    [sectionData]
  );

  const generateQuestionNumbers = () => {
    if (!sectionData?.section?.questionCount) return [];
    return Array.from({ length: sectionData.section.questionCount }, (_, i) => i + 1);
  };

  const getWordCount = (text) => {
    if (!text || !text.trim()) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

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
        <div className="container-fluid px-0">
          <div className="row g-0">
            {/* Left side - PDF Viewer (if available) */}
            {getPDFUrl() && (
              <div className="col-lg-6 col-md-6">
                <div
                  className="bg-white border-end border-neutral-30 h-100"
                  style={{ minHeight: "calc(100vh - 200px)" }}
                >
                  <div className="p-24 border-bottom border-neutral-30 flex-between gap-16">
                    <h4 className="mb-0">Đề thi Writing</h4>
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
                  <div className="p-24" style={{ height: "calc(100vh - 280px)", overflow: "auto" }}>
                    <iframe
                      src={getPDFUrl()}
                      className="w-100 h-100 border-0 rounded-8"
                      title="Writing PDF"
                      style={{ minHeight: "600px" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Right side - Writing Area */}
            <div className={getPDFUrl() ? "col-lg-6 col-md-6" : "col-12"}>
              <div className="bg-main-25 h-100" style={{ minHeight: "calc(100vh - 200px)" }}>
                <div className="p-24 border-bottom border-neutral-30 bg-white">
                  <div className="flex-between gap-16 flex-wrap">
                    <div>
                      <h4 className="mb-8">Viết bài</h4>
                      {sectionData?.section?.instructions && (
                        <p className="text-neutral-600 text-sm mb-0">
                          {sectionData.section.instructions}
                        </p>
                      )}
                    </div>
                    {timeRemaining !== null && !getPDFUrl() && (
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
                </div>
                <div
                  className="p-24"
                  style={{
                    height: getPDFUrl() ? "calc(100vh - 280px)" : "calc(100vh - 200px)",
                    overflow: "auto",
                  }}
                >
                  {error && (
                    <div className="alert alert-danger mb-24" role="alert">
                      {error}
                    </div>
                  )}

                  <div className="mb-24">
                    {generateQuestionNumbers().map((qNum) => {
                      const answerText = answers[qNum] || "";
                      const wordCount = getWordCount(answerText);
                      const questionData = getQuestionData(qNum);
                      return (
                        <div
                          key={qNum}
                          className="bg-white rounded-12 p-24 mb-24 border border-neutral-30"
                        >
                          <div className="flex-between gap-16 mb-16">
                            <label className="fw-semibold text-neutral-700 text-lg">
                              Câu {qNum}
                            </label>
                            <div className="flex-align gap-16">
                              {answerText && (
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
                            onChange={(e) => handleAnswerChange(qNum, e.target.value)}
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

                  <div className="sticky-bottom bg-white border-top border-neutral-30 p-24 mt-24">
                    <div className="flex-between gap-16 flex-wrap">
                      <div>
                        <p className="text-neutral-600 text-sm mb-0">
                          Đã viết: {Object.keys(answers).filter((qNum) => answers[qNum]?.trim()).length} /{" "}
                          {sectionData?.section?.questionCount || 0} câu
                        </p>
                      </div>
                      <button
                        onClick={() => handleSubmit()}
                        disabled={submitting || Object.keys(answers).filter((qNum) => answers[qNum]?.trim()).length === 0}
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
        </div>
      </section>
    </>
  );
};

export default WritingExamPage;

