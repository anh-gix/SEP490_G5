import { useEffect, useState, useCallback } from "react";
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
  const { isAuthenticated } = useAuth();
  const [sectionData, setSectionData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [timer, setTimer] = useState(null);
  const handleSubmit = useCallback(async () => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }

    if (submitting) return; // Prevent double submission

    try {
      setSubmitting(true);
      const answersArray = Object.keys(answers).map((qNum) => ({
        questionNumber: parseInt(qNum),
        selectedOption: answers[qNum],
      }));

      await examService.submitReadingAnswers(
        examId,
        submissionId,
        answersArray
      );

      // Navigate to result page
      navigate(`/exams/${examId}/submissions/${submissionId}/reading/result`);
    } catch (err) {
      setError(err.message || "Không thể nộp bài");
      setSubmitting(false);
    }
  }, [ submitting, answers, examId, submissionId, navigate]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/sign-in");
      return;
    }

    const fetchSection = async () => {
      try {
        setLoading(true);
        const data = await examService.getReadingSection(examId, submissionId);
        setSectionData(data);

        // Initialize answers from existing submission
        if (data.submission?.answers?.length > 0) {
          const existingAnswers = {};
          data.submission.answers.forEach((ans) => {
            existingAnswers[ans.questionNumber] = ans.selectedOption;
          });
          setAnswers(existingAnswers);
        }

        // Initialize timer if duration exists
        if (data.section?.duration) {
          setTimeRemaining(data.section.duration * 60); // Convert minutes to seconds
        }

        setError(null);
      } catch (err) {
        setError(err.message || "Không thể tải phần thi Reading");
      } finally {
        setLoading(false);
      }
    };

    fetchSection();
  }, [examId, submissionId, isAuthenticated, navigate]);

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0) {
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setTimer(interval);
      return () => clearInterval(interval);
    } else if (timeRemaining === 0 && !submitting) {
      // Auto submit when time runs out
      handleSubmit();
    }
  }, [timeRemaining, submitting, handleSubmit]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (questionNumber, selectedOption) => {
    setAnswers((prev) => ({
      ...prev,
      [questionNumber]: selectedOption,
    }));
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

  const generateQuestionNumbers = () => {
    if (!sectionData?.section?.questionCount) return [];
    return Array.from({ length: sectionData.section.questionCount }, (_, i) => i + 1);
  };

  if (loading) {
    return (
      <>
        <Preloader />
        <Animation />
        <HeaderOne />
        <div className='text-center py-80'>
          <div className='spinner-border text-main-600' role='status'>
            <span className='visually-hidden'>Loading...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Preloader />
      <Animation />
      <HeaderOne />
      <Breadcrumb title={"Reading Section"} />

      <section className='py-40'>
        <div className='container-fluid px-0'>
          <div className='row g-0'>
            {/* Left side - PDF Viewer */}
            <div className='col-lg-6 col-md-6'>
              <div className='bg-white border-end border-neutral-30 h-100' style={{ minHeight: "calc(100vh - 200px)" }}>
                <div className='p-24 border-bottom border-neutral-30 flex-between gap-16'>
                  <h4 className='mb-0'>Đề thi Reading</h4>
                  {timeRemaining !== null && (
                    <div className='flex-align gap-8'>
                      <span className='text-2xl text-main-600'>
                        <i className='ph ph-clock' />
                      </span>
                      <span className={`text-lg fw-bold ${timeRemaining < 300 ? "text-danger" : "text-neutral-700"}`}>
                        {formatTime(timeRemaining)}
                      </span>
                    </div>
                  )}
                </div>
                <div className='p-24' style={{ height: "calc(100vh - 280px)", overflow: "auto" }}>
                  {getPDFUrl() ? (
                    <iframe
                      src={getPDFUrl()}
                      className='w-100 h-100 border-0 rounded-8'
                      title='Reading PDF'
                      style={{ minHeight: "600px" }}
                    />
                  ) : (
                    <div className='text-center py-80'>
                      <p className='text-neutral-500'>Không có file PDF</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right side - Answer Section */}
            <div className='col-lg-6 col-md-6'>
              <div className='bg-main-25 h-100' style={{ minHeight: "calc(100vh - 200px)" }}>
                <div className='p-24 border-bottom border-neutral-30 bg-white'>
                  <h4 className='mb-8'>Chọn đáp án</h4>
                  {sectionData?.section?.instructions && (
                    <p className='text-neutral-600 text-sm mb-0'>
                      {sectionData.section.instructions}
                    </p>
                  )}
                </div>
                <div className='p-24' style={{ height: "calc(100vh - 280px)", overflow: "auto" }}>
                  {error && (
                    <div className='alert alert-danger mb-24' role='alert'>
                      {error}
                    </div>
                  )}

                  <div className='mb-24'>
                    {generateQuestionNumbers().map((qNum) => (
                      <div
                        key={qNum}
                        className='bg-white rounded-12 p-16 mb-16 border border-neutral-30'
                      >
                        <div className='flex-between gap-16 mb-12'>
                          <label className='fw-semibold text-neutral-700'>
                            Câu {qNum}
                          </label>
                          {answers[qNum] && (
                            <span className='badge bg-main-600 text-white px-12 py-4 rounded-pill'>
                              Đã chọn
                            </span>
                          )}
                        </div>
                        <div className='d-flex flex-column gap-8'>
                          {["A", "B", "C", "D"].map((option) => (
                            <label
                              key={option}
                              className={`d-flex align-items-center gap-12 p-12 rounded-8 border cursor-pointer transition-2 ${
                                answers[qNum] === option
                                  ? "border-main-600 bg-main-25"
                                  : "border-neutral-30 hover-border-main-300"
                              }`}
                            >
                              <input
                                type='radio'
                                name={`question-${qNum}`}
                                value={option}
                                checked={answers[qNum] === option}
                                onChange={() => handleAnswerChange(qNum, option)}
                                className='form-check-input'
                              />
                              <span className='text-neutral-700'>{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className='sticky-bottom bg-white border-top border-neutral-30 p-24 mt-24'>
                    <div className='flex-between gap-16 flex-wrap'>
                      <div>
                        <p className='text-neutral-600 text-sm mb-0'>
                          Đã trả lời: {Object.keys(answers).length} /{" "}
                          {sectionData?.section?.questionCount || 0} câu
                        </p>
                      </div>
                      <button
                        onClick={handleSubmit}
                        disabled={submitting || Object.keys(answers).length === 0}
                        className='btn btn-primary px-32 py-12 rounded-pill'
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

      <FooterOne />
    </>
  );
};

export default ReadingExamPage;

