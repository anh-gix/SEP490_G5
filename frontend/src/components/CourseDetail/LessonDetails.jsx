import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const LessonDetails = () => {
  const { courseId, sessionId } = useParams();
  const [course, setCourse] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});

  useEffect(() => {
    const fetchCamSession = async () => {
      if (!courseId || !sessionId) {
        setError("Thiếu thông tin khóa học hoặc Cam Session.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${API_URL}/courseshome/course-home/${courseId}/cam-session/${sessionId}`
        );

        if (!response.data.success) {
          setError(
            response.data.message || "Không thể tải thông tin Cam Session."
          );
          setLoading(false);
          return;
        }

        const { course: fetchedCourse, camSession } = response.data.data || {};

        if (!camSession) {
          setError("Không tìm thấy Cam Session tương ứng.");
        } else {
          setCourse(fetchedCourse || null);
          setSession(camSession);
        }
      } catch (err) {
        console.error("Error loading cam session:", err);
        setError(
          err.response?.data?.message ||
            "Có lỗi xảy ra khi tải thông tin Cam Session."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCamSession();
  }, [courseId, sessionId]);

  const quizList = useMemo(() => session?.Quiz || [], [session]);

  const handleSelectAnswer = (quizId, answer) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [quizId]: answer,
    }));
  };

  if (loading) {
    return (
      <section className='course-details py-120'>
        <div className='container'>
          <div className='text-center'>
            <p className='text-neutral-500'>Đang tải Cam Session...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || !session) {
    return (
      <section className='course-details py-120'>
        <div className='container'>
          <div className='text-center'>
            <p className='text-danger-600'>{error || "Không tìm thấy Cam Session."}</p>
            {courseId && (
              <Link
                to={`/course-details/${courseId}`}
                className='btn btn-main rounded-pill mt-24'
              >
                Quay lại khóa học
              </Link>
            )}
          </div>
        </div>
      </section>
    );
  }

  const sessionTitle =
    session?.Title || `Cam Session ${session?.Order ? `#${session.Order}` : ""}`;

  return (
    <section className='course-details py-120'>
      <div className='container'>
        <div className='row gy-4'>
          <div className='col-xl-8'>
            <div className='course-details__content border border-neutral-30 rounded-12 bg-main-25 p-12'>
              <div className='rounded-12 overflow-hidden'>
                {session?.videoURL ? (
                  <video
                    id='cam-player'
                    className='w-100 rounded-12'
                    controls
                    playsInline
                    poster='/assets/images/thumbs/course-details-img.png'//sau thay ảnh nền 
                  >
                    <source src={session.videoURL} type='video/mp4' />
                  </video>
                ) : (
                  <div className='ratio ratio-16x9 bg-neutral-100 rounded-12 flex-center text-neutral-500'>
                    <span>Chưa có video cho Cam Session này.</span>
                  </div>
                )}
              </div>

              <div className='p-20'>
                <div className='flex-between flex-wrap gap-16 mb-16'>
                  <h2 className='mb-0'>{sessionTitle}</h2>
                  {course && (
                    <Link
                      to={`/course-details/${course._id}`}
                      className='btn btn-outline-main rounded-pill'
                    >
                      Xem khóa học
                    </Link>
                  )}
                </div>
                {session?.Des && (
                  <>
                    <p className='text-neutral-700'>{session.Des}</p>
                    <span className='d-block border-bottom border-main-100 my-24' />
                  </>
                )}

                {quizList.length > 0 && (
                  <div className='cam-quiz'>
                    <h4 className='mb-16'>Quiz trong buổi học</h4>
                    <div className='d-flex flex-column gap-20'>
                      {quizList.map((quiz, index) => (
                        <div
                          key={quiz?._id || index}
                          className='border border-neutral-30 rounded-12 bg-white p-20'
                        >
                          <div className='flex-between gap-12 flex-wrap mb-12'>
                            <h5 className='mb-0'>Câu hỏi {index + 1}</h5>
                            <div className='w-120 h-80 bg-neutral-100 rounded-8 overflow-hidden border border-neutral-30 flex-center'>
                              {quiz?.Img ? (
                                <img
                                  src={quiz.Img}
                                  alt={`Quiz ${index + 1}`}
                                  className='cover-img w-100 h-100'
                                />
                              ) : (
                                <span className='text-neutral-500 text-sm'>
                                  Không có ảnh
                                </span>
                              )}
                            </div>
                          </div>
                          <p className='text-neutral-700 mb-16'>
                            {quiz?.Question || "Chưa có câu hỏi"}
                          </p>
                          {Array.isArray(quiz?.Answer) && quiz.Answer.length > 0 && (
                            <ul className='list-unstyled d-flex flex-column gap-12 mb-16'>
                              {quiz.Answer.map((ans, ansIndex) => {
                                const quizKey = quiz?._id || `quiz-${index}`;
                                const isSelected = selectedAnswers[quizKey] === ans;
                                const isCorrect =
                                  Array.isArray(quiz?.AnswerKey) &&
                                  quiz.AnswerKey.includes(ans);
                                const shouldReveal =
                                  typeof selectedAnswers[quizKey] !== "undefined";

                                let itemClass =
                                  "border rounded-pill px-16 py-10 cursor-pointer transition-1";
                                if (shouldReveal && isSelected) {
                                  itemClass += isCorrect
                                    ? " border-success-200 bg-success-50 text-success-700"
                                    : " border-danger-200 bg-danger-50 text-danger-700";
                                } else {
                                  itemClass += " border-neutral-40 text-neutral-700 hover-border-main-300";
                                }

                                return (
                                  <li
                                    key={ansIndex}
                                    className={itemClass}
                                    onClick={() => handleSelectAnswer(quizKey, ans)}
                                  >
                                    {ans}
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                          {Array.isArray(quiz?.AnswerKey) &&
                            quiz.AnswerKey.length > 0 &&
                            typeof selectedAnswers[quiz?._id || `quiz-${index}`] !==
                              "undefined" && (
                              <p className='text-sm mb-0'>
                                Đáp án đúng:&nbsp;
                                <strong className='text-success-600'>
                                  {quiz.AnswerKey.join(", ")}
                                </strong>
                              </p>
                            )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className='col-xl-4'>
            <div className='course-details__sidebar border border-neutral-30 rounded-12 bg-white p-24'>
              <div className='border-bottom border-neutral-40 pb-20 mb-20'>
                <p className='text-neutral-500 text-sm mb-4'>Thông tin khóa học</p>
                <h5 className='mb-4'>{course?.name || "Không có tên"}</h5>
                <p className='text-neutral-600 mb-2'>
                  <strong>Chương trình:</strong>{" "}
                  {course?.program?.program_name || course?.program?.code || "N/A"}
                </p>
                <p className='text-neutral-600 mb-0'>
                  <strong>Loại khóa:</strong> {course?.program?.type?.toUpperCase() || "CAM"}
                </p>
              </div>

              <div className='border-bottom border-neutral-40 pb-20 mb-20'>
                <p className='text-neutral-500 text-sm mb-2'>Thứ tự buổi học</p>
                <h6 className='text-neutral-700 mb-0'>#{session?.Order || "-"}</h6>
              </div>

              <div className='border-bottom border-neutral-40 pb-20 mb-20'>
                <p className='text-neutral-500 text-sm mb-2'>Video URL</p>
                {session?.videoURL ? (
                  <a
                    className='text-main-600 text-sm fw-semibold text-line-2'
                    href={session.videoURL}
                    target='_blank'
                    rel='noreferrer'
                  >
                    {session.videoURL}
                  </a>
                ) : (
                  <span className='text-neutral-600'>Chưa cập nhật</span>
                )}
              </div>

              <div>
                <p className='text-neutral-500 text-sm mb-2'>Số quiz</p>
                <h6 className='text-neutral-700 mb-0'>{quizList.length}</h6>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LessonDetails;

