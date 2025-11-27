import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb";
import FooterOne from "../../components/FooterOne";
import HeaderOne from "../../components/HomePageforStudent/HeaderOne";
import Animation from "../../helper/Animation";
import Preloader from "../../helper/Preloader";
import { examService } from "../../services/examService";
import { useAuth } from "../../contexts/AuthContext";

const ReadingResultPage = () => {
  const { examId, submissionId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [result, setResult] = useState(null);
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leftWidth, setLeftWidth] = useState(50);
  const containerRef = useRef(null);
  const isResizingRef = useRef(false);
  const [selectedBandScore, setSelectedBandScore] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/sign-in");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [resultData, examInfo] = await Promise.all([
          examService.getReadingResult(examId, submissionId),
          examService.getExamById(examId)
        ]);
        setResult(resultData);
        setExamData(examInfo);
        setError(null);
      } catch (err) {
        setError(err.message || "Không thể tải kết quả");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [examId, submissionId, isAuthenticated, navigate]);

  const getScorePercentage = () => {
    if (!result || !result.maxScore) return 0;
    return Math.round((result.sectionScore / result.maxScore) * 100);
  };

  const getScoreColor = () => {
    const percentage = getScorePercentage();
    if (percentage >= 80) return "success";
    if (percentage >= 60) return "warning";
    return "danger";
  };

  const getAnswerText = (answerKey, questionAnswer) => {
    if (!answerKey || !questionAnswer || questionAnswer.length === 0) {
      return answerKey || "";
    }
    
    // Nếu answerKey là array, xử lý từng phần tử
    if (Array.isArray(answerKey)) {
      return answerKey.map(key => {
        const option = questionAnswer.find(opt => opt.key === key);
        return option ? `${option.key}. ${option.text}` : key;
      }).join(", ");
    }
    
    // Nếu answerKey là string, tìm text tương ứng
    const option = questionAnswer.find(opt => opt.key === answerKey);
    return option ? `${option.key}. ${option.text}` : answerKey;
  };

  // Band Score mapping (hardcoded)
  const bandScoreData = {
    9: { correctAnswers: "39-40", skillLevel: "Expert user", description: "You have a full operational command of the language. Your use of English is appropriate, accurate and fluent, and you show complete understanding." },
    8.5: { correctAnswers: "37-38", skillLevel: "Very good user", description: "You have a fully operational command of the language with only occasional unsystematic inaccuracies and inappropriacies. Misunderstandings may occur in unfamiliar situations. You handle complex detailed argumentation well." },
    8: { correctAnswers: "35-36", skillLevel: "Very good user", description: "You have a fully operational command of the language with only occasional unsystematic inaccuracies and inappropriacies. Misunderstandings may occur in unfamiliar situations. You handle complex detailed argumentation well." },
    7.5: { correctAnswers: "33-34", skillLevel: "Good user", description: "You have an operational command of the language, though with occasional inaccuracies, inappropriacies and misunderstandings in some situations. Generally you handle complex language well and understand detailed reasoning." },
    7: { correctAnswers: "30-32", skillLevel: "Good user", description: "You have an operational command of the language, though with occasional inaccuracies, inappropriacies and misunderstandings in some situations. Generally you handle complex language well and understand detailed reasoning." },
    6.5: { correctAnswers: "27-29", skillLevel: "Competent user", description: "Generally you have an effective command of the language despite inaccuracies, inappropriacies and misunderstandings. You can use and understand fairly complex language, particularly in familiar situations." },
    6: { correctAnswers: "23-26", skillLevel: "Competent user", description: "Generally you have an effective command of the language despite inaccuracies, inappropriacies and misunderstandings. You can use and understand fairly complex language, particularly in familiar situations." },
    5.5: { correctAnswers: "20-22", skillLevel: "Modest user", description: "You have a partial command of the language, and cope with overall meaning in most situations, though you are likely to make many mistakes. You should be able to handle basic communication in your own field." },
    5: { correctAnswers: "16-19", skillLevel: "Modest user", description: "You have a partial command of the language, and cope with overall meaning in most situations, though you are likely to make many mistakes. You should be able to handle basic communication in your own field." },
    4.5: { correctAnswers: "13-15", skillLevel: "Limited user", description: "Your basic competence is limited to familiar situations. You frequently show problems in understanding and expression. You are not able to use complex language." },
    4: { correctAnswers: "10-12", skillLevel: "Limited user", description: "Your basic competence is limited to familiar situations. You frequently show problems in understanding and expression. You are not able to use complex language." },
    3.5: { correctAnswers: "7-9", skillLevel: "Extremely limited user", description: "You convey and understand only general meaning in very familiar situations. There are frequent breakdowns in communication." },
    3: { correctAnswers: "4-6", skillLevel: "Extremely limited user", description: "You convey and understand only general meaning in very familiar situations. There are frequent breakdowns in communication." }
  };

  const getBandScore = () => {
    if (!result || !result.maxScore || result.maxScore === 0) return null;
    const percentage = getScorePercentage();
    const correctAnswers = Math.round((result.sectionScore / result.maxScore) * 40); // Assuming max 40 questions
    
    // Map percentage/score to band score
    if (correctAnswers >= 39) return 9;
    if (correctAnswers >= 37) return 8.5;
    if (correctAnswers >= 35) return 8;
    if (correctAnswers >= 33) return 7.5;
    if (correctAnswers >= 30) return 7;
    if (correctAnswers >= 27) return 6.5;
    if (correctAnswers >= 23) return 6;
    if (correctAnswers >= 20) return 5.5;
    if (correctAnswers >= 16) return 5;
    if (correctAnswers >= 13) return 4.5;
    if (correctAnswers >= 10) return 4;
    if (correctAnswers >= 7) return 3.5;
    return 3;
  };

  const getPDFUrl = () => {
    if (!examData?.sections) return null;
    const readingSection = examData.sections.find(s => s.type === "reading");
    if (!readingSection?.fileUrl) return null;
    
    if (readingSection.fileUrl.startsWith("http")) {
      return readingSection.fileUrl;
    }
    if (readingSection.fileUrl.startsWith("/")) {
      const API_PORT = import.meta.env.VITE_API_PORT;
      return `http://localhost:${API_PORT}${readingSection.fileUrl}`;
    }
    const API_PORT = import.meta.env.VITE_API_PORT;
    return `http://localhost:${API_PORT}/uploads/${readingSection.fileUrl}`;
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

  // Initialize selected band score when result changes
  useEffect(() => {
    if (result && result.maxScore > 0) {
      const bandScore = getBandScore();
      if (bandScore !== null) {
        setSelectedBandScore(bandScore);
      }
    }
  }, [result]);

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
   
  
      <section className='py-120'>
        <div className='container'>
          {error ? (
            <div className='alert alert-danger rounded-12 p-24 mb-40' role='alert'>
              <i className='ph ph-warning me-8' />
              {error}
            </div>
          ) : result ? (
            <>
              {/* Section Heading */}
              <div className='section-heading text-center mb-40'>
                <div className='flex-align d-inline-flex gap-8 mb-16'>
                  <span className='text-main-600 text-2xl d-flex'>
                    <i className='ph-bold ph-book-open-text' />
                  </span>
                  <h5 className='text-main-600 mb-0'>Kết quả thi</h5>
                </div>
                <h2 className='mb-16'>Kết quả phần Reading</h2>
                {result.submittedAt && (
                  <p className='text-neutral-600 mb-0'>
                    <i className='ph ph-clock me-8' />
                    Nộp bài lúc: {new Date(result.submittedAt).toLocaleString("vi-VN")}
                  </p>
                )}
              </div>

              {/* Score Summary */}
              <div className='row gy-4 mb-40'>
                <div className='col-md-4'>
                  <div className='bg-white box-shadow-md rounded-16 p-32 border border-neutral-30 text-center h-100'>
                    <div className='w-60 h-60 flex-center bg-main-25 text-main-600 text-28 rounded-circle mx-auto mb-16'>
                      <i className='ph-bold ph-check-circle' />
                    </div>
                    <p className='text-neutral-600 text-sm mb-8 fw-medium'>Điểm số</p>
                    <h3 className={`text-${getScoreColor()}-600 mb-0 fw-bold`}>
                      {result.sectionScore} / {result.maxScore}
                    </h3>
                  </div>
                </div>
                <div className='col-md-4'>
                  <div className='bg-white box-shadow-md rounded-16 p-32 border border-neutral-30 text-center h-100'>
                    <div className='w-60 h-60 flex-center bg-main-25 text-main-600 text-28 rounded-circle mx-auto mb-16'>
                      <i className='ph-bold ph-percent' />
                    </div>
                    <p className='text-neutral-600 text-sm mb-8 fw-medium'>Tỷ lệ đúng</p>
                    <h3 className={`text-${getScoreColor()}-600 mb-0 fw-bold`}>
                      {getScorePercentage()}%
                    </h3>
                  </div>
                </div>
                <div className='col-md-4'>
                  <div className='bg-white box-shadow-md rounded-16 p-32 border border-neutral-30 text-center h-100'>
                    <div className='w-60 h-60 flex-center bg-main-25 text-main-600 text-28 rounded-circle mx-auto mb-16'>
                      <i className='ph-bold ph-star' />
                    </div>
                    <p className='text-neutral-600 text-sm mb-8 fw-medium'>Tổng điểm</p>
                    <h3 className='text-main-600 mb-0 fw-bold'>{result.totalScore}</h3>
                  </div>
                </div>
              </div>

              {/* Band Score Section */}
              {result.maxScore > 0 && (() => {
                const currentBandScore = getBandScore();
                const bandScores = [9, 8.5, 8, 7.5, 7, 6.5, 6, 5.5, 5, 4.5, 4, 3.5, 3];
                const displayBandScore = selectedBandScore !== null ? selectedBandScore : currentBandScore;
                return (
                  <div className="bg-white rounded-16 p-32 mb-40 border border-neutral-30 box-shadow-sm">
                    <div className="flex-align gap-12 mb-24">
                      <span className="text-main-600 text-xl">
                        <i className="ph-bold ph-medal" />
                      </span>
                      <h3 className="mb-0">Band Score</h3>
                    </div>
                    
                    {/* Band Score Scale */}
                    <div className="mb-24">
                      <div className="d-flex flex-wrap gap-8 justify-content-center align-items-center">
                        {bandScores.map((band) => (
                          <span
                            key={band}
                            onClick={() => setSelectedBandScore(band)}
                            className={`text-main-600 fw-semibold ${
                              displayBandScore === band ? "text-decoration-underline" : ""
                            }`}
                            style={{
                              fontSize: "18px",
                              cursor: "pointer",
                              textDecorationColor: displayBandScore === band ? "var(--main-600)" : "transparent",
                              textDecorationThickness: "2px",
                              textUnderlineOffset: "4px",
                              transition: "all 0.2s ease",
                              padding: "4px 8px",
                              borderRadius: "4px"
                            }}
                            onMouseEnter={(e) => {
                              if (displayBandScore !== band) {
                                e.target.style.backgroundColor = "var(--main-25)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = "transparent";
                            }}
                          >
                            {band}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Band Score Details */}
                    {displayBandScore && bandScoreData[displayBandScore] && (
                      <div className="border-top border-neutral-30 pt-24">
                        <div className="row gy-3">
                          <div className="col-md-4">
                            <div className="border-bottom border-neutral-30 pb-12">
                              <p className="text-neutral-600 text-sm mb-4 fw-semibold">Correct Answers:</p>
                              <p className="text-neutral-700 mb-0 fw-medium">{bandScoreData[displayBandScore].correctAnswers}</p>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="border-bottom border-neutral-30 pb-12">
                              <p className="text-neutral-600 text-sm mb-4 fw-semibold">Skill Level:</p>
                              <p className="text-neutral-700 mb-0 fw-medium">{bandScoreData[displayBandScore].skillLevel}</p>
                            </div>
                          </div>
                          <div className="col-md-12">
                            <div className="pt-12">
                              <p className="text-neutral-600 text-sm mb-4 fw-semibold">Description:</p>
                              <p className="text-neutral-700 mb-0" style={{ lineHeight: "1.8" }}>
                                {bandScoreData[displayBandScore].description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* PDF and Results Layout */}
              <style>{`
                .resizable-container {
                  display: flex;
                  position: relative;
                  width: 100%;
                  min-height: 600px;
                  border: 1px solid var(--neutral-30);
                  border-radius: 12px;
                  overflow: hidden;
                  background: white;
                }
                .resizable-panel {
                  overflow: hidden;
                  display: flex;
                  flex-direction: column;
                }
                .resizer {
                  width: 4px;
                  background: var(--neutral-30);
                  cursor: col-resize;
                  flex-shrink: 0;
                  position: relative;
                }
                .resizer:hover {
                  background: var(--main-600);
                }
                .resizer::before {
                  content: '';
                  position: absolute;
                  left: -2px;
                  right: -2px;
                  top: 0;
                  bottom: 0;
                }
              `}</style>
              <div className="resizable-container mb-40" ref={containerRef}>
                {/* Left side - PDF Viewer */}
                {getPDFUrl() && (
                  <>
                    <div
                      className="resizable-panel bg-white border-end border-neutral-30"
                      style={{ width: `${leftWidth}%` }}
                    >
                      <div className="p-24 border-bottom border-neutral-30">
                        <h4 className="mb-0">Đề thi Reading</h4>
                      </div>
                      <div 
                        className="p-24" 
                        style={{ 
                          height: "calc(100vh - 400px)", 
                          overflow: "hidden",
                        }}
                      >
                        <iframe
                          src={getPDFUrl()}
                          className="w-100 h-100 border-0 rounded-8"
                          title="Reading PDF"
                          style={{ 
                            minHeight: "600px",
                            display: "block"
                          }}
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

                    {/* Right side - Results */}
                    <div
                      className="resizable-panel bg-main-25"
                      style={{ width: `${100 - leftWidth}%` }}
                    >
                      <div className="p-24 border-bottom border-neutral-30 bg-white">
                        <div className='flex-align gap-12'>
                          <span className='text-main-600 text-xl'>
                            <i className='ph-bold ph-list-bullets' />
                          </span>
                          <h4 className="mb-0">Chi tiết đáp án</h4>
                        </div>
                      </div>
                      <div className="p-16" style={{ height: "calc(100vh - 400px)", overflow: "auto" }}>
                        <div className='row gy-2'>
                          {result.results?.map((item, index) => (
                            <div key={index} className='col-12'>
                              <div
                                className={`rounded-8 p-12 border ${
                                  item.isCorrect
                                    ? "border-success bg-success-25"
                                    : "border-danger bg-danger-25"
                                }`}
                              >
                                <div className='flex-between gap-8 mb-8 flex-wrap'>
                                  <div className='flex-align gap-8'>
                                    
                                    <span className='fw-semibold text-neutral-700 text-sm'>
                                      Câu {item.questionNumber}: {item.questionTitle && (
                                  <div className='mb-8'>
                                    <p className='text-neutral-700 fw-semibold mb-0 text-sm'>{item.questionTitle}</p>
                                  </div>
                                )}
                                    </span>
                                  </div>
                                  {item.isCorrect ? (
                                    <span className='badge bg-success text-white px-8 py-2 rounded-pill text-xs'>
                                      <i className='ph ph-check-circle me-2' />
                                      Đúng
                                    </span>
                                  ) : (
                                    <span className='badge bg-danger text-white px-8 py-2 rounded-pill text-xs'>
                                      <i className='ph ph-x-circle me-2' />
                                      Sai
                                    </span>
                                  )}
                                </div>
                                {/* Question Title */}
                               

                                <div className='mb-0'>
                                  <p className='text-neutral-600 text-xs mb-4'>
                                    <span className='fw-semibold'>Đáp án của bạn:</span>
                                  </p>
                                  <div className={`bg-white rounded-6 p-8 border ${
                                    item.isCorrect ? "border-success" : "border-danger"
                                  }`}>
                                    <p className={`mb-0 fw-medium text-sm ${
                                      item.isCorrect ? "text-success" : "text-danger"
                                    }`}>
                                      {item.studentAnswer 
                                        ? getAnswerText(item.studentAnswer, item.questionAnswer)
                                        : "Chưa trả lời"}
                                    </p>
                                  </div>
                                  {!item.isCorrect && item.correctAnswer && (
                                    <div className='mt-6'>
                                      <p className='text-neutral-600 text-xs mb-4'>
                                        <span className='fw-semibold'>Đáp án đúng:</span>
                                      </p>
                                      <div className='bg-success-25 rounded-6 p-8 border border-success'>
                                        <p className='mb-0 fw-medium text-success text-sm'>
                                          {getAnswerText(item.correctAnswer, item.questionAnswer)}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* If no PDF, show results in full width */}
                {!getPDFUrl() && (
                  <div className="resizable-panel bg-white" style={{ width: "100%" }}>
                    <div className="p-24 border-bottom border-neutral-30">
                      <div className='flex-align gap-12'>
                        <span className='text-main-600 text-xl'>
                          <i className='ph-bold ph-list-bullets' />
                        </span>
                        <h4 className="mb-0">Chi tiết đáp án</h4>
                      </div>
                    </div>
                    <div className="p-16" style={{ minHeight: "400px", overflow: "auto" }}>
                      <div className='row gy-2'>
                        {result.results?.map((item, index) => (
                          <div key={index} className='col-md-6 col-lg-4'>
                            <div
                              className={`rounded-8 p-10 border h-100 ${
                                item.isCorrect
                                  ? "border-success bg-success-25"
                                  : "border-danger bg-danger-25"
                              }`}
                            >
                              <div className='flex-between gap-8 mb-6'>
                                <span className='fw-semibold text-neutral-700 text-sm'>
                                  Câu {item.questionNumber}
                                </span>
                                {item.isCorrect ? (
                                  <span className='badge bg-success text-white px-8 py-2 rounded-pill text-xs'>
                                    <i className='ph ph-check-circle me-2' />
                                    Đúng
                                  </span>
                                ) : (
                                  <span className='badge bg-danger text-white px-8 py-2 rounded-pill text-xs'>
                                    <i className='ph ph-x-circle me-2' />
                                    Sai
                                  </span>
                                )}
                              </div>
                              {/* Question Title */}
                              {item.questionTitle && (
                                <div className='mb-6'>
                                  <p className='text-neutral-700 fw-semibold mb-0 text-xs'>{item.questionTitle}</p>
                                </div>
                              )}

                              <div className='mb-0'>
                                <p className='text-neutral-600 text-xs mb-3'>
                                  <span className='fw-semibold'>Đáp án của bạn:</span>{" "}
                                  <span
                                    className={`fw-medium ${
                                      item.isCorrect ? "text-success" : "text-danger"
                                    }`}
                                  >
                                    {item.studentAnswer 
                                      ? getAnswerText(item.studentAnswer, item.questionAnswer)
                                      : "Chưa trả lời"}
                                  </span>
                                </p>
                                {!item.isCorrect && item.correctAnswer && (
                                  <p className='text-neutral-600 text-xs mb-0'>
                                    <span className='fw-semibold'>Đáp án đúng:</span>{" "}
                                    <span className='fw-medium text-success'>
                                      {getAnswerText(item.correctAnswer, item.questionAnswer)}
                                    </span>
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Feedback */}
              {result.feedback && (
                <div className='bg-warning-25 rounded-16 p-32 mb-40 border border-warning box-shadow-sm'>
                  <div className='flex-align gap-12 mb-16'>
                    <span className='text-warning-600 text-xl'>
                      <i className='ph-bold ph-chat-circle-text' />
                    </span>
                    <h4 className='mb-0'>Nhận xét từ giáo viên</h4>
                  </div>
                  <p className='text-neutral-700 mb-0' style={{ whiteSpace: "pre-wrap", lineHeight: "1.8" }}>
                    {result.feedback}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className='text-center'>
                <Link
                  to={`/exams/${examId}`}
                  className='btn btn-main px-40 py-16 rounded-pill me-16'
                >
                  <i className='ph ph-arrow-left me-8' />
                  Quay lại bài thi
                </Link>
                <Link
                  to='/exams2'
                  className='btn btn-outline-main px-40 py-16 rounded-pill'
                >
                  <i className='ph ph-list me-8' />
                  Danh sách bài thi
                </Link>
              </div>
            </>
          ) : null}
        </div>
      </section>
    </>
  );
};

export default ReadingResultPage;

