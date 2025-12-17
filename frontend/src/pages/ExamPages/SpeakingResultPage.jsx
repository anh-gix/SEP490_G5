import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import { examService } from "../../services/examService";
import { useAuth } from "../../contexts/AuthContext";

const SpeakingResultPage = () => {
  const { examId, submissionId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBandScore, setSelectedBandScore] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/sign-in");
      return;
    }

    const fetchResult = async () => {
      try {
        setLoading(true);
        const data = await examService.getSpeakingResult(examId, submissionId);
        setResult(data);
        setError(null);
      } catch (err) {
        setError(err.message || "Không thể tải kết quả");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [examId, submissionId, isAuthenticated, navigate]);

  // Initialize selected band score when result changes
  useEffect(() => {
    if (result && result.maxScore > 0) {
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

  const getRecordingUrl = (recordingUrl) => {
    if (!recordingUrl) return null;
    // If recordingUrl is a full URL, use it directly
    if (recordingUrl.startsWith("http")) {
      return recordingUrl;
    }
    // If it starts with /, it's already a path from root
    if (recordingUrl.startsWith("/")) {
      const API_PORT = import.meta.env.VITE_API_PORT;
      return `http://localhost:${API_PORT}${recordingUrl}`;
    }
    // Otherwise, assume it's in uploads folder
    const API_PORT = import.meta.env.VITE_API_PORT;
    return `http://localhost:${API_PORT}/uploads/${recordingUrl}`;
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

  if (loading) {
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
    

      <section className="py-120">
        <div className="container">
          {error ? (
            <div className="alert alert-danger rounded-12 p-24 mb-40" role="alert">
              <i className="ph ph-warning me-8" />
              {error}
            </div>
          ) : result ? (
            <>
              {/* Section Heading */}
              <div className="section-heading text-center mb-40">
                <div className="flex-align d-inline-flex gap-8 mb-16">
                  <span className="text-main-600 text-2xl d-flex">
                    <i className="ph-bold ph-microphone" />
                  </span>
                  <h5 className="text-main-600 mb-0">Kết quả thi</h5>
                </div>
                <h2 className="mb-16">Kết quả phần Speaking</h2>
                {result.submittedAt && (
                  <p className="text-neutral-600 mb-0">
                    <i className="ph ph-clock me-8" />
                    Nộp bài lúc: {new Date(result.submittedAt).toLocaleString("vi-VN")}
                  </p>
                )}
              </div>

              {/* Score Summary */}
              <div className="row gy-4 mb-40">
                <div className="col-md-4">
                  <div className="bg-white box-shadow-md rounded-16 p-32 border border-neutral-30 text-center h-100">
                    <div className="w-60 h-60 flex-center bg-main-25 text-main-600 text-28 rounded-circle mx-auto mb-16">
                      <i className="ph-bold ph-check-circle" />
                    </div>
                    <p className="text-neutral-600 text-sm mb-8 fw-medium">Điểm số</p>
                    <h3 className={`text-${getScoreColor()}-600 mb-0 fw-bold`}>
                      {result.sectionScore} / {result.maxScore || "Chưa chấm"}
                    </h3>
                  </div>
                </div>
              </div>
              {result.sectionScore === 0 && result.maxScore === 0 && (
                <div className="mb-40">
                  <div className="alert alert-info rounded-12 p-24 mb-0 box-shadow-sm">
                    <i className="ph ph-info me-8" />
                    Bài làm của bạn đã được nộp. Giáo viên sẽ chấm điểm và cập nhật kết quả sau.
                  </div>
                </div>
              )}

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
                      <p className="text-neutral-600 text-sm mb-12 text-center fw-medium">
                        Điểm của bạn: {currentBandScore !== null ? <span className="fw-bold text-main-600">{currentBandScore}</span> : "N/A"}
                      </p>
                      <div className="d-flex flex-wrap gap-8 justify-content-center align-items-center">
                        {bandScores.map((band) => (
                          <span
                            key={band}
                            onClick={() => setSelectedBandScore(band)}
                            className={`fw-semibold ${
                              currentBandScore === band 
                                ? "bg-main-600 text-white border-main-600" 
                                : "text-main-600 bg-transparent border-neutral-30"
                            }`}
                            style={{
                              fontSize: "18px",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              padding: "8px 16px",
                              borderRadius: "8px",
                              border: "2px solid",
                              display: "inline-block"
                            }}
                            onMouseEnter={(e) => {
                              if (currentBandScore !== band) {
                                e.target.style.backgroundColor = "var(--main-25)";
                                e.target.style.borderColor = "var(--main-600)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (currentBandScore !== band) {
                                e.target.style.backgroundColor = "transparent";
                                e.target.style.borderColor = "var(--neutral-30)";
                              }
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

              {/* Detailed Results */}
              <div className="bg-white rounded-16 p-32 mb-40 border border-neutral-30 box-shadow-sm">
                <div className="flex-align gap-12 mb-24">
                  <span className="text-main-600 text-xl">
                    <i className="ph-bold ph-list-bullets" />
                  </span>
                  <h3 className="mb-0">Chi tiết bài làm</h3>
                </div>
                {result.parts?.map((partData, partIndex) => (
                  <div key={partIndex} className={partIndex > 0 ? "mt-32 pt-32 border-top border-neutral-30" : ""}>
                    {result.parts.length > 1 && (
                      <div className="mb-24">
                        <h4 className="text-main-600 fw-semibold">Part {partData.part}</h4>
                      </div>
                    )}
                    <div className="row gy-4">
                      {partData.results?.map((item, index) => {
                        const recordingUrl = getRecordingUrl(item.recordingUrl);
                        return (
                          <div key={index} className="col-12">
                            <div className="rounded-16 p-24 border border-neutral-30 box-shadow-sm">
                              <div className="flex-between gap-16 mb-16 flex-wrap">
                                <div className="flex-align gap-12">
                                  <span className="w-40 h-40 flex-center bg-main-25 text-main-600 rounded-circle flex-shrink-0">
                                    <i className="ph-bold ph-question" />
                                  </span>
                                  <span className="fw-semibold text-neutral-700 text-lg">
                                    Câu {item.questionNumber}
                                  </span>
                                </div>
                                <div className="flex-align gap-16">
                                  {item.score > 0 && (
                                    <span className="badge bg-success text-white px-16 py-6 rounded-pill">
                                      <i className="ph ph-check-circle me-4" />
                                      Đã chấm: {item.score} điểm
                                    </span>
                                  )}
                                  {item.score === 0 && (
                                    <span className="badge bg-warning text-white px-16 py-6 rounded-pill">
                                      <i className="ph ph-clock me-4" />
                                      Chờ chấm
                                    </span>
                                  )}
                                  {recordingUrl && (
                                    <span className="badge bg-main-600 text-white px-16 py-6 rounded-pill">
                                      <i className="ph ph-microphone me-4" />
                                      Đã ghi âm
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Question Title */}
                              {item.questionTitle && (
                                <div className="mb-16">
                                  <p className="text-neutral-700 fw-semibold mb-0">{item.questionTitle}</p>
                                </div>
                              )}

                              {/* Recording Player */}
                              {recordingUrl && (
                                <div className="mb-16">
                                  <p className="text-neutral-600 text-sm mb-12 fw-semibold">
                                    <i className="ph ph-microphone me-8" />
                                    Recording của bạn:
                                  </p>
                                  <div className="bg-main-25 rounded-12 p-16 border border-neutral-30">
                                    <audio src={recordingUrl} controls className="w-100" />
                                  </div>
                                </div>
                              )}

                              {/* Text Answer (if any) */}
                              {item.studentAnswer && (
                                <div className="mb-16">
                                  <p className="text-neutral-600 text-sm mb-12 fw-semibold">
                                    <i className="ph ph-note me-8" />
                                    Ghi chú của bạn:
                                  </p>
                                  <div className="bg-main-25 rounded-12 p-16 border border-neutral-30">
                                    <p
                                      className="text-neutral-700 mb-0"
                                      style={{
                                        whiteSpace: "pre-wrap",
                                        lineHeight: "1.8",
                                      }}
                                    >
                                      {item.studentAnswer}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {item.score > 0 && (
                                <div className="pt-16 border-top border-neutral-30">
                                  <span className="text-neutral-600 text-sm">
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
                <div className="bg-warning-25 rounded-16 p-32 mb-40 border border-warning box-shadow-sm">
                  <div className="flex-align gap-12 mb-16">
                    <span className="text-warning-600 text-xl">
                      <i className="ph-bold ph-chat-circle-text" />
                    </span>
                    <h4 className="mb-0">Nhận xét từ giáo viên</h4>
                  </div>
                  {result.parts.map((partData, index) => (
                    partData.feedback && (
                      <div key={index} className={index > 0 ? "mt-16 pt-16 border-top border-warning" : ""}>
                        {result.parts.length > 1 && (
                          <p className="fw-semibold text-warning-600 mb-8">Part {partData.part}:</p>
                        )}
                        <p className="text-neutral-700 mb-0" style={{ whiteSpace: "pre-wrap", lineHeight: "1.8" }}>
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
                  className="btn btn-main px-40 py-16 rounded-pill me-16"
                >
                  <i className="ph ph-arrow-left me-8" />
                  Quay lại bài thi
                </Link>
                <Link
                  to={"/student/practice-exams"}
                  className="btn btn-outline-main px-40 py-16 rounded-pill"
                >
                  <i className="ph ph-list me-8" />
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

export default SpeakingResultPage;

