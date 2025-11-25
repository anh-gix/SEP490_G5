import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb";
import FooterOne from "../../components/FooterOne";
import HeaderOne from "../../components/HomePageforStudent/HeaderOne";
import Animation from "../../helper/Animation";
import Preloader from "../../helper/Preloader";
import { examService } from "../../services/examService";
import { useAuth } from "../../contexts/AuthContext";

const ListeningResultPage = () => {
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
        const data = await examService.getListeningResult(examId, submissionId);
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
      <Breadcrumb title={"Kết quả Listening"} />

      <section className='py-120'>
        <div className='container'>
          {error ? (
            <div className='alert alert-danger' role='alert'>
              {error}
            </div>
          ) : result ? (
            <>
              {/* Score Summary */}
              <div className='bg-main-25 rounded-16 p-40 mb-40 border border-neutral-30 text-center'>
                <h2 className='mb-24'>Kết quả phần Listening</h2>
                <div className='row gy-4'>
                  <div className='col-md-4'>
                    <div className='bg-white rounded-12 p-24 border border-neutral-30'>
                      <p className='text-neutral-600 text-sm mb-8'>Điểm số</p>
                        <h3 className={`text-${getScoreColor()}-600 mb-0`}>
                          {result.sectionScore} / {result.maxScore}
                        </h3>
                    </div>
                  </div>
                  <div className='col-md-4'>
                    <div className='bg-white rounded-12 p-24 border border-neutral-30'>
                      <p className='text-neutral-600 text-sm mb-8'>Tỷ lệ đúng</p>
                      <h3 className={`text-${getScoreColor()}-600 mb-0`}>
                        {getScorePercentage()}%
                      </h3>
                    </div>
                  </div>
                  <div className='col-md-4'>
                    <div className='bg-white rounded-12 p-24 border border-neutral-30'>
                      <p className='text-neutral-600 text-sm mb-8'>Tổng điểm</p>
                      <h3 className='text-main-600 mb-0'>{result.totalScore}</h3>
                    </div>
                  </div>
                </div>
                {result.submittedAt && (
                  <p className='text-neutral-500 text-sm mt-24 mb-0'>
                    Nộp bài lúc: {new Date(result.submittedAt).toLocaleString("vi-VN")}
                  </p>
                )}
              </div>

              {/* Detailed Results */}
              <div className='bg-white rounded-16 p-24 mb-40 border border-neutral-30'>
                <h3 className='mb-24'>Chi tiết đáp án</h3>
                <div className='row gy-4'>
                  {result.results?.map((item, index) => (
                    <div key={index} className='col-md-6 col-lg-4'>
                      <div
                        className={`rounded-12 p-16 border ${
                          item.isCorrect
                            ? "border-success bg-success-25"
                            : "border-danger bg-danger-25"
                        }`}
                      >
                        <div className='flex-between gap-16 mb-8'>
                          <span className='fw-semibold text-neutral-700'>
                            Câu {item.questionNumber}
                          </span>
                          {item.isCorrect ? (
                            <span className='badge bg-success text-white px-12 py-4 rounded-pill'>
                              <i className='ph ph-check me-4' />
                              Đúng
                            </span>
                          ) : (
                            <span className='badge bg-danger text-white px-12 py-4 rounded-pill'>
                              <i className='ph ph-x me-4' />
                              Sai
                            </span>
                          )}
                        </div>
                        {/* Question Title */}
                        {item.questionTitle && (
                          <div className='mb-12'>
                            <p className='text-neutral-700 fw-semibold mb-0'>{item.questionTitle}</p>
                          </div>
                        )}

                        {/* Question Answers (for multiple choice) */}
                        {item.questionAnswer && item.questionAnswer.length > 0 && (
                          <div className='mb-12'>
                            <p className='text-neutral-600 text-sm mb-8'>Các đáp án:</p>
                            <div className='d-flex flex-column gap-4'>
                              {item.questionAnswer.map((option, idx) => (
                                <div key={idx} className='text-neutral-600 text-sm'>
                                  <span className='fw-semibold'>{option.key}.</span> {option.text}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className='mb-8'>
                          <p className='text-neutral-600 text-sm mb-4'>
                            Đáp án của bạn:{" "}
                            <span
                              className={`fw-semibold ${
                                item.isCorrect ? "text-success" : "text-danger"
                              }`}
                            >
                              {item.studentAnswer 
                                ? getAnswerText(item.studentAnswer, item.questionAnswer)
                                : "Chưa trả lời"}
                            </span>
                          </p>
                          {!item.isCorrect && item.correctAnswer && (
                            <p className='text-neutral-600 text-sm mb-0'>
                              Đáp án đúng:{" "}
                              <span className='fw-semibold text-success'>
                                {getAnswerText(item.correctAnswer, item.questionAnswer)}
                              </span>
                            </p>
                          )}
                        </div>
                        <div className='flex-between gap-8'>
                          <span className='text-neutral-500 text-xs'>
                            Điểm: {item.score} / {item.maxScore}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback */}
              {result.feedback && (
                <div className='bg-warning-25 rounded-16 p-24 mb-40 border border-warning'>
                  <h4 className='mb-16'>Nhận xét</h4>
                  <p className='text-neutral-700 mb-0'>{result.feedback}</p>
                </div>
              )}

              {/* Actions */}
              <div className='text-center'>
                <Link
                  to={`/exams/${examId}`}
                  className='btn btn-primary px-40 py-16 rounded-pill me-16'
                >
                  <i className='ph ph-arrow-left me-8' />
                  Quay lại bài thi
                </Link>
                <Link
                  to='/exams'
                  className='btn btn-secondary px-40 py-16 rounded-pill'
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

export default ListeningResultPage;

