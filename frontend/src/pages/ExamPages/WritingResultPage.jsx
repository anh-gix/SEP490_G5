import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { examService } from "../../services/examService";
import { useAuth } from "../../contexts/AuthContext";

const WritingResultPage = () => {
  const { examId, submissionId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBandScore, setSelectedBandScore] = useState(null);

  useEffect(() => {
    // Đợi auth context hoàn thành việc check authentication
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/sign-in");
      return;
    }

    const fetchResult = async () => {
      try {
        setLoading(true);
        const data = await examService.getWritingResult(examId, submissionId);
        setResult(data);
        setError(null);
      } catch (err) {
        setError(err.message || "Không thể tải kết quả");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [examId, submissionId, isAuthenticated, authLoading, navigate]);

  // Initialize selected band score when result changes
  useEffect(() => {
    if (result) {
      const bandScore = getBandScore();
      if (bandScore !== null) {
        setSelectedBandScore(bandScore);
      }
    }
  }, [result]);

  const getScorePercentage = () => {
    if (!result || !result.maxScore || result.maxScore === 0) return 0;
    return Math.round((result.sectionScore / result.maxScore) * 100);
  };

  const getScoreColor = () => {
    const percentage = getScorePercentage();
    if (percentage >= 80) return "success";
    if (percentage >= 60) return "warning";
    return "danger";
  };

  const getWordCount = (text) => {
    if (!text || !text.trim()) return 0;
    return text.trim().split(/\s+/).filter((word) => word.length > 0).length;
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
    if (!result) return null;
    if (!result.maxScore || result.maxScore === 0) return null; // Need maxScore to calculate
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

  if (authLoading || loading) {
    return (
      <>
     
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

      <section className="pt-40 pb-120">
        <div className="container">
          {error ? (
            <div className="alert alert-danger rounded-12 p-16 mb-24 text-13" role="alert">
              <i className="ph ph-warning me-6" />
              {error}
            </div>
          ) : result ? (
            <>
              {/* Section Heading */}
              <div className="section-heading text-center mb-24">
                <div className="flex-align d-inline-flex gap-8 mb-12">
                  <span className="text-main-600 text-16 d-flex">
                    <i className="ph-bold ph-pencil-simple" />
                  </span>
                  <h6 className="text-main-600 mb-0 text-14">Kết quả thi</h6>
                </div>
                <h4 className="mb-12 text-20">Kết quả phần Writing</h4>
                {result.submittedAt && (
                  <p className="text-neutral-600 mb-0 text-13">
                    <i className="ph ph-clock me-6" />
                    Nộp bài lúc: {new Date(result.submittedAt).toLocaleString("vi-VN")}
                  </p>
                )}
              </div>

              {/* Score Summary */}
              <div className="row gy-3 mb-24 justify-content-center">
                <div className="col-md-4">
                  <div className="bg-white box-shadow-md rounded-12 p-20 border border-neutral-30 text-center h-100">
                    <div className="w-48 h-48 flex-center bg-main-25 text-main-600 text-20 rounded-circle mx-auto mb-12">
                      <i className="ph-bold ph-check-circle" />
                    </div>
                    <p className="text-neutral-600 text-13 mb-6 fw-medium">Điểm số</p>
                    <h5 className={`text-${getScoreColor()}-600 mb-0 fw-bold text-18`}>
                      {result.sectionScore} / {result.maxScore || "Chưa chấm"}
                    </h5>
                    <p className="text-neutral-600 text-12 mb-0 mt-8">
                        Bài Writing sẽ được chấm sau
                      </p>
                  </div>
                </div>
              </div>
              {result.sectionScore === 0 && result.maxScore === 0 && (
                <div className="mb-24">
                  <div className="alert alert-info rounded-12 p-16 mb-0 box-shadow-sm text-13">
                    <i className="ph ph-info me-6" />
                    Bài làm của bạn đã được nộp. Giáo viên sẽ chấm điểm và cập nhật kết quả sau.
                  </div>
                </div>
              )}

              {/* Band Score Section */}
              {(() => {
                const currentBandScore = getBandScore();
                const bandScores = [9, 8.5, 8, 7.5, 7, 6.5, 6, 5.5, 5, 4.5, 4, 3.5, 3];
                const displayBandScore = selectedBandScore !== null ? selectedBandScore : currentBandScore;
                return (
                  <div className="bg-white rounded-12 p-20 mb-24 border border-neutral-30 box-shadow-sm">
                    <div className="flex-align gap-8 mb-16">
                      <span className="text-main-600 text-16">
                        <i className="ph-bold ph-medal" />
                      </span>
                      <h5 className="mb-0 text-16">Band Score</h5>
                    </div>
                    
                    {/* Band Score Scale */}
                    <div className="mb-16">
                      <p className="text-neutral-600 text-13 mb-8 text-center fw-medium">
                        Điểm của bạn: {currentBandScore !== null ? <span className="fw-bold text-main-600">{currentBandScore}</span> : "N/A"}
                      </p>
                      <div className="d-flex flex-wrap gap-6 justify-content-center align-items-center">
                        {bandScores.map((band) => {
                          const isCurrentBand = currentBandScore === band;
                          const isSelectedBand = selectedBandScore === band;
                          const isDisplayBand = displayBandScore === band;
                          
                          let className = "fw-semibold text-main-600 bg-transparent border-neutral-30";
                          if (isCurrentBand && isSelectedBand) {
                            // Band của người dùng và đang được chọn
                            className = "bg-main-600 text-white border-main-600";
                          } else if (isCurrentBand) {
                            // Band của người dùng (nhưng không được chọn)
                            className = "bg-main-25 text-main-600 border-main-600";
                          } else if (isSelectedBand || isDisplayBand) {
                            // Band được chọn (không phải của người dùng)
                            className = "bg-main-600 text-white border-main-600";
                          }
                          
                          return (
                            <span
                              key={band}
                              onClick={() => setSelectedBandScore(band)}
                              className={className}
                              style={{
                                fontSize: "14px",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                border: "2px solid",
                                display: "inline-block"
                              }}
                              onMouseEnter={(e) => {
                                if (!isCurrentBand && !isSelectedBand) {
                                  e.target.style.backgroundColor = "var(--main-25)";
                                  e.target.style.borderColor = "var(--main-600)";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isCurrentBand && !isSelectedBand) {
                                  e.target.style.backgroundColor = "transparent";
                                  e.target.style.borderColor = "var(--neutral-30)";
                                }
                              }}
                            >
                              {band}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Band Score Details */}
                    {displayBandScore && bandScoreData[displayBandScore] && (
                      <div className={`border-top border-neutral-30 pt-16 px-16 pb-16 ${
                        selectedBandScore === displayBandScore 
                          ? (currentBandScore === displayBandScore 
                              ? "bg-main-25 border-main-600" 
                              : "bg-success-25 border-main-600")
                          : ""
                      }`} style={{
                        borderRadius: "8px",
                        borderWidth: selectedBandScore === displayBandScore ? "2px" : "1px",
                        borderStyle: "solid",
                        transition: "all 0.2s ease"
                      }}>
                        <div className="row gy-2">
                          <div className="col-md-4">
                            <div className="border-bottom border-neutral-30 pb-8 px-4">
                              <p className="text-neutral-600 text-12 mb-2 fw-semibold">Correct Answers:</p>
                              <p className="text-neutral-700 mb-0 fw-medium text-13">{bandScoreData[displayBandScore].correctAnswers}</p>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="border-bottom border-neutral-30 pb-8 px-4">
                              <p className="text-neutral-600 text-12 mb-2 fw-semibold">Skill Level:</p>
                              <p className="text-neutral-700 mb-0 fw-medium text-13">{bandScoreData[displayBandScore].skillLevel}</p>
                            </div>
                          </div>
                          <div className="col-md-12">
                            <div className="pt-8 px-4">
                              <p className="text-neutral-600 text-12 mb-2 fw-semibold">Description:</p>
                              <p className="text-neutral-700 mb-0 text-13" style={{ lineHeight: "1.6" }}>
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

              {/* Detailed Results */}
              <div className="bg-white rounded-12 p-20 mb-24 border border-neutral-30 box-shadow-sm">
                <div className="flex-align gap-8 mb-16">
                  <span className="text-main-600 text-16">
                    <i className="ph-bold ph-list-bullets" />
                  </span>
                  <h5 className="mb-0 text-16">Chi tiết bài làm</h5>
                </div>
                {result.parts?.map((partData, partIndex) => (
                  <div key={partIndex} className={partIndex > 0 ? "mt-20 pt-20 border-top border-neutral-30" : ""}>
                    <div className="mb-16">
                      <h6 className="text-main-600 fw-semibold text-14">Part {partData.part}</h6>
                    </div>
                    <div className="row gy-3">
                      {partData.results?.map((item, index) => {
                        const wordCount = getWordCount(item.studentAnswer);
                        return (
                          <div key={index} className="col-12">
                            <div className="rounded-12 p-16 border border-neutral-30 box-shadow-sm">
                              <div className="flex-between gap-12 mb-12 flex-wrap">
                                <div className="flex-align gap-8">
                                  <span className="w-32 h-32 flex-center bg-main-25 text-main-600 rounded-circle flex-shrink-0 text-14">
                                    <i className="ph-bold ph-question" />
                                  </span>
                                  <span className="fw-semibold text-neutral-700 text-14">
                                    Câu {item.questionNumber}
                                  </span>
                                </div>
                                <div className="flex-align gap-12">
                                  {item.score > 0 && (
                                    <span className="badge bg-success text-white px-12 py-4 rounded-8 text-12">
                                      <i className="ph ph-check-circle me-3" />
                                      Đã chấm: {item.score} điểm
                                    </span>
                                  )}
                                  {item.score === 0 && (
                                    <span className="badge bg-warning text-white px-12 py-4 rounded-8 text-12">
                                      <i className="ph ph-clock me-3" />
                                      Chờ chấm
                                    </span>
                                  )}
                                  {wordCount > 0 && (
                                    <span className="badge bg-main-600 text-white px-12 py-4 rounded-8 text-12">
                                      <i className="ph ph-text-aa me-3" />
                                      {wordCount} từ
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Question Title */}
                              {item.questionTitle && (
                                <div className="mb-12">
                                  <p className="text-neutral-700 fw-semibold mb-0 text-13">{item.questionTitle}</p>
                                </div>
                              )}

                              <div className="mb-12">
                                <p className="text-neutral-600 text-12 mb-8 fw-semibold">
                                  <i className="ph ph-pencil-simple me-6" />
                                  Bài làm của bạn:
                                </p>
                                <div className="bg-main-25 rounded-8 p-16 border border-neutral-30">
                                  <p
                                    className="text-neutral-700 mb-0 text-13"
                                    style={{
                                      whiteSpace: "pre-wrap",
                                      lineHeight: "1.6",
                                      minHeight: "80px",
                                    }}
                                  >
                                    {item.studentAnswer || "Chưa có bài làm"}
                                  </p>
                                </div>
                              </div>
                              {item.score > 0 && (
                                <div className="pt-12 border-top border-neutral-30">
                                  <span className="text-neutral-600 text-13">
                                    Điểm: <span className="fw-bold text-main-600">{item.score}</span> /{" "}
                                    {item.maxScore || "N/A"}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Feedback - Show feedback from all parts */}
              {result.parts?.some((part) => part.feedback) && (
                <div className="bg-warning-25 rounded-12 p-20 mb-24 border border-warning box-shadow-sm">
                  <div className="flex-align gap-8 mb-12">
                    <span className="text-warning-600 text-16">
                      <i className="ph-bold ph-chat-circle-text" />
                    </span>
                    <h5 className="mb-0 text-16">Nhận xét từ giáo viên</h5>
                  </div>
                  {result.parts.map((partData, index) => (
                    partData.feedback && (
                      <div key={index} className={index > 0 ? "mt-12 pt-12 border-top border-warning" : ""}>
                        {result.parts.length > 1 && (
                          <p className="fw-semibold text-warning-600 mb-6 text-13">Part {partData.part}:</p>
                        )}
                        <p className="text-neutral-700 mb-0 text-13" style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                          {partData.feedback}
                        </p>
                      </div>
                    )
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="text-center">
                <Link
                  to={`/student/exams/${examId}`}
                  className="btn btn-main px-24 py-10 rounded-8 me-12 text-13"
                >
                  <i className="ph ph-arrow-left me-6" />
                  Quay lại bài thi
                </Link>
                <Link
                  to={"/student/practice-exams"}
                  className="btn btn-outline-main px-24 py-10 rounded-8 text-13"
                >
                  <i className="ph ph-list me-6" />
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

export default WritingResultPage;

