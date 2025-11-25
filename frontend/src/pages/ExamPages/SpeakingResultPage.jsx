import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb";
import FooterOne from "../../components/FooterOne";
import HeaderOne from "../../components/HomePageforStudent/HeaderOne";
import Animation from "../../helper/Animation";
import Preloader from "../../helper/Preloader";
import { examService } from "../../services/examService";
import { useAuth } from "../../contexts/AuthContext";

const SpeakingResultPage = () => {
  const { examId, submissionId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
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
      <HeaderOne />
      <Breadcrumb title={"Kết quả Speaking"} />

      <section className="py-120">
        <div className="container">
          {error ? (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          ) : result ? (
            <>
              {/* Score Summary */}
              <div className="bg-main-25 rounded-16 p-40 mb-40 border border-neutral-30 text-center">
                <h2 className="mb-24">Kết quả phần Speaking</h2>
                <div className="row gy-4">
                  <div className="col-md-4">
                    <div className="bg-white rounded-12 p-24 border border-neutral-30">
                      <p className="text-neutral-600 text-sm mb-8">Điểm số</p>
                      <h3 className={`text-${getScoreColor()}-600 mb-0`}>
                        {result.sectionScore} / {result.maxScore || "Chưa chấm"}
                      </h3>
                    </div>
                  </div>
                  {result.maxScore > 0 && (
                    <div className="col-md-4">
                      <div className="bg-white rounded-12 p-24 border border-neutral-30">
                        <p className="text-neutral-600 text-sm mb-8">Tỷ lệ đạt</p>
                        <h3 className={`text-${getScoreColor()}-600 mb-0`}>
                          {getScorePercentage()}%
                        </h3>
                      </div>
                    </div>
                  )}
                  <div className="col-md-4">
                    <div className="bg-white rounded-12 p-24 border border-neutral-30">
                      <p className="text-neutral-600 text-sm mb-8">Tổng điểm</p>
                      <h3 className="text-main-600 mb-0">{result.totalScore}</h3>
                    </div>
                  </div>
                </div>
                {result.submittedAt && (
                  <p className="text-neutral-500 text-sm mt-24 mb-0">
                    Nộp bài lúc: {new Date(result.submittedAt).toLocaleString("vi-VN")}
                  </p>
                )}
                {result.sectionScore === 0 && result.maxScore === 0 && (
                  <div className="mt-24">
                    <div className="alert alert-info mb-0">
                      <i className="ph ph-info me-8" />
                      Bài làm của bạn đã được nộp. Giáo viên sẽ chấm điểm và cập nhật kết quả sau.
                    </div>
                  </div>
                )}
              </div>

              {/* Detailed Results */}
              <div className="bg-white rounded-16 p-24 mb-40 border border-neutral-30">
                <h3 className="mb-24">Chi tiết bài làm</h3>
                <div className="row gy-4">
                  {result.results?.map((item, index) => {
                    const recordingUrl = getRecordingUrl(item.recordingUrl);
                    return (
                      <div key={index} className="col-12">
                        <div className="rounded-12 p-24 border border-neutral-30">
                          <div className="flex-between gap-16 mb-16 flex-wrap">
                            <span className="fw-semibold text-neutral-700 text-lg">
                              Câu {item.questionNumber}
                            </span>
                            <div className="flex-align gap-16">
                              {item.score > 0 && (
                                <span className="badge bg-success text-white px-12 py-4 rounded-pill">
                                  <i className="ph ph-check me-4" />
                                  Đã chấm: {item.score} điểm
                                </span>
                              )}
                              {item.score === 0 && (
                                <span className="badge bg-warning text-white px-12 py-4 rounded-pill">
                                  <i className="ph ph-clock me-4" />
                                  Chờ chấm
                                </span>
                              )}
                              {recordingUrl && (
                                <span className="badge bg-main-600 text-white px-12 py-4 rounded-pill">
                                  <i className="ph ph-microphone me-4" />
                                  Đã ghi âm
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Recording Player */}
                          {recordingUrl && (
                            <div className="mb-16">
                              <p className="text-neutral-600 text-sm mb-8 fw-semibold">
                                Recording của bạn:
                              </p>
                              <div className="bg-main-25 rounded-8 p-16 border border-neutral-30">
                                <audio src={recordingUrl} controls className="w-100" />
                              </div>
                            </div>
                          )}

                          {/* Text Answer (if any) */}
                          {item.studentAnswer && (
                            <div className="mb-16">
                              <p className="text-neutral-600 text-sm mb-8 fw-semibold">
                                Ghi chú của bạn:
                              </p>
                              <div className="bg-main-25 rounded-8 p-16 border border-neutral-30">
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
                                Điểm: <span className="fw-semibold">{item.score}</span> /{" "}
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

              {/* Feedback */}
              {result.feedback && (
                <div className="bg-warning-25 rounded-16 p-24 mb-40 border border-warning">
                  <h4 className="mb-16">Nhận xét từ giáo viên</h4>
                  <p className="text-neutral-700 mb-0" style={{ whiteSpace: "pre-wrap" }}>
                    {result.feedback}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="text-center">
                <Link
                  to={`/exams/${examId}`}
                  className="btn btn-primary px-40 py-16 rounded-pill me-16"
                >
                  <i className="ph ph-arrow-left me-8" />
                  Quay lại bài thi
                </Link>
                <Link
                  to="/exams"
                  className="btn btn-secondary px-40 py-16 rounded-pill"
                >
                  <i className="ph ph-list me-8" />
                  Danh sách bài thi
                </Link>
              </div>
            </>
          ) : null}
        </div>
      </section>

      <FooterOne />
    </>
  );
};

export default SpeakingResultPage;

