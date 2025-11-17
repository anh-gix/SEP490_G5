import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import FooterOne from "../components/FooterOne";
import HeaderOne from "../components/HomePageforStudent/HeaderOne";
import Animation from "../helper/Animation";
import Preloader from "../helper/Preloader";
import { examService } from "../services/examService";
import { useAuth } from "../contexts/AuthContext";

const ExamDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [exam, setExam] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        const examData = await examService.getExamById(id);
        setExam(examData);
        
        // Check if user already has a submission for this exam
        if (isAuthenticated) {
          try {
            const result = await examService.startExam(id);
            if (result.submission) {
              setSubmission(result.submission);
            }
          } catch (err) {
            // If no submission exists, that's okay - user will start new one
            console.log("No existing submission");
          }
        }
        
        setError(null);
      } catch (err) {
        setError(err.message || "Không thể tải thông tin bài thi");
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [id, isAuthenticated]);

  const handleStartExam = async () => {
    if (!isAuthenticated) {
      navigate("/sign-in");
      return;
    }

    try {
      setStarting(true);
      const result = await examService.startExam(id);
      setSubmission(result.submission);
      
      // Find reading section and navigate to it
      const readingSection = exam?.sections?.find(s => s.type === "reading");
      if (readingSection && result.submission?._id) {
        navigate(`/exams/${id}/submissions/${result.submission._id}/reading`);
      }
    } catch (err) {
      setError(err.message || "Không thể bắt đầu làm bài");
    } finally {
      setStarting(false);
    }
  };

  const getSectionIcon = (type) => {
    switch (type) {
      case "reading":
        return "ph-book-open";
      case "listening":
        return "ph-headphones";
      case "writing":
        return "ph-pencil";
      case "speaking":
        return "ph-microphone";
      default:
        return "ph-file";
    }
  };

  const getSectionName = (type) => {
    switch (type) {
      case "reading":
        return "Reading";
      case "listening":
        return "Listening";
      case "writing":
        return "Writing";
      case "speaking":
        return "Speaking";
      default:
        return type;
    }
  };

  const handleSectionClick = (sectionType) => {
    if (!submission) {
      alert("Vui lòng bắt đầu làm bài trước");
      return;
    }

    if (sectionType === "reading") {
      navigate(`/exams/${id}/submissions/${submission._id}/reading`);
    } else if (sectionType === "listening") {
      navigate(`/exams/${id}/submissions/${submission._id}/listening`);
    } else if (sectionType === "writing") {
      navigate(`/exams/${id}/submissions/${submission._id}/writing`);
    }
    // Add speaking section later
  };

  const getSectionStatus = (sectionType) => {
    if (!submission) return "not-started";
    const section = submission.sections.find((s) => s.sectionType === sectionType);
    if (!section) return "not-started";
    if (section.submittedAt) return "completed";
    if (section.answers?.length > 0) return "in-progress";
    return "not-started";
  };

  return (
    <>
      <Preloader />
      <Animation />
      <HeaderOne />
      <Breadcrumb title={exam?.title || "Chi tiết bài thi"} />

      <section className='py-120'>
        <div className='container'>
          {loading ? (
            <div className='text-center py-80'>
              <div className='spinner-border text-main-600' role='status'>
                <span className='visually-hidden'>Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className='alert alert-danger' role='alert'>
              {error}
            </div>
          ) : exam ? (
            <>
              {!isAuthenticated ? (
                <>
                  {/* Hiển thị thông báo khi chưa đăng nhập */}
                

                  <div className='bg-warning-25 rounded-16 p-32 mb-40 border border-warning-200'>
                    <div className='text-center'>
                      <div className='mb-16'>
                        <i className='ph ph-warning text-warning-600 text-4xl' />
                      </div>
                      <h3 className='mb-8'>Bạn chưa đăng nhập</h3>
                      <p className='text-neutral-600 mb-24'>
                        Vui lòng đăng nhập để có thể bắt đầu làm bài thi
                      </p>
                      <button
                        onClick={() => navigate("/sign-in")}
                        className='btn btn-primary btn-lg px-40 py-16 rounded-pill'
                      >
                        Tiến hành đăng nhập
                        <i className='ph ph-arrow-right ms-8' />
                      </button>
                    </div>
                  </div>
                </>
              ) : !submission ? (
                <>
                  {/* Hiển thị thông tin đề thi khi đã đăng nhập nhưng chưa bắt đầu làm bài */}
                  <div className='bg-main-25 rounded-16 p-24 mb-40 border border-neutral-30'>
                    <h2 className='mb-16'>{exam.title}</h2>
                    {exam.description && (
                      <p className='text-neutral-600 text-lg mb-16'>{exam.description}</p>
                    )}
                    <div className='flex-align gap-24 flex-wrap'>
                      <div className='flex-align gap-8'>
                        <span className='text-neutral-700 text-2xl d-flex'>
                          <i className='ph-bold ph-clock' />
                        </span>
                        <span className='text-neutral-700 text-lg'>
                          Thời gian: {exam.totalDuration || 0} phút
                        </span>
                      </div>
                      <div className='flex-align gap-8'>
                        <span className='text-neutral-700 text-2xl d-flex'>
                          <i className='ph-bold ph-book' />
                        </span>
                        <span className='text-neutral-700 text-lg'>Level: {exam.level}</span>
                      </div>
                      <div className='flex-align gap-8'>
                        <span className='badge bg-main-600 text-white px-16 py-8 rounded-pill'>
                          {exam.examType === "real" ? "Thi thật" : "Luyện tập"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className='text-center py-40'>
                    <button
                      onClick={handleStartExam}
                      disabled={starting}
                      className='btn btn-primary btn-lg px-40 py-16 rounded-pill'
                    >
                      {starting ? "Đang khởi tạo..." : "Bắt đầu làm bài"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Chỉ hiển thị các phần thi khi đã bắt đầu làm bài */}
                  <div className='mb-40'>
                    <h2 className='mb-24'>Các phần thi</h2>
                    <div className='row gy-4'>
                      {exam.sections?.map((section, index) => {
                        const status = getSectionStatus(section.type);
                        return (
                          <div key={index} className='col-lg-6 col-md-6'>
                            <div
                              className={`bg-white rounded-16 p-24 border border-neutral-30 cursor-pointer transition-2 ${
                                status === "completed"
                                  ? "border-success"
                                  : status === "in-progress"
                                  ? "border-warning"
                                  : ""
                              } hover-shadow-sm`}
                              onClick={() => handleSectionClick(section.type)}
                            >
                              <div className='flex-between gap-16 mb-16'>
                                <div className='flex-align gap-12'>
                                  <div className='w-48 h-48 bg-main-25 rounded-12 flex-center text-main-600 text-2xl'>
                                    <i className={`ph ${getSectionIcon(section.type)}`} />
                                  </div>
                                  <div>
                                    <h4 className='mb-4'>{getSectionName(section.type)}</h4>
                                    {section.duration && (
                                      <p className='text-neutral-500 text-sm mb-0'>
                                        {section.duration} phút
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  {status === "completed" && (
                                    <span className='badge bg-success text-white px-12 py-4 rounded-pill'>
                                      Hoàn thành
                                    </span>
                                  )}
                                  {status === "in-progress" && (
                                    <span className='badge bg-warning text-white px-12 py-4 rounded-pill'>
                                      Đang làm
                                    </span>
                                  )}
                                  {status === "not-started" && (
                                    <span className='badge bg-neutral-200 text-neutral-600 px-12 py-4 rounded-pill'>
                                      Chưa bắt đầu
                                    </span>
                                  )}
                                </div>
                              </div>
                              {section.instructions && (
                                <p className='text-neutral-600 text-sm mb-0'>
                                  {section.instructions}
                                </p>
                              )}
                              {section.questionCount && (
                                <p className='text-neutral-500 text-sm mt-8 mb-0'>
                                  {section.questionCount} câu hỏi
                                </p>
                              )}
                              <div className='mt-16 pt-16 border-top border-neutral-30'>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSectionClick(section.type);
                                  }}
                                  className='btn btn-primary w-100 px-16 py-8 rounded-pill'
                                >
                                  Bắt đầu
                                  <i className='ph ph-arrow-right ms-8' />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </>
          ) : null}
        </div>
      </section>

      <FooterOne />
    </>
  );
};

export default ExamDetailPage;

