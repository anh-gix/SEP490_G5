import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb";
import FooterOne from "../../components/FooterOne";
import HeaderOne from "../../components/HomePageforStudent/HeaderOne";
import Animation from "../../helper/Animation";
import Preloader from "../../helper/Preloader";
import { examService } from "../../services/examService";

const StudentExamListPage = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const data = await examService.getAllExams();
        setExams(data);
        setError(null);
      } catch (err) {
        setError(err.message || "Không thể tải danh sách bài thi");
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  return (
    <>
      <Preloader />
      <Animation />
      <HeaderOne />
      <Breadcrumb title={"Đề thi"} />
      
      <section className='course-grid-view py-120'>
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
          ) : exams.length === 0 ? (
            <div className='text-center py-80'>
              <p className='text-neutral-500 text-lg'>Chưa có bài thi nào</p>
            </div>
          ) : (
            <>
              <div className='flex-between gap-16 flex-wrap mb-40'>
                <span className='text-neutral-500'>
                  Hiển thị {exams.length} bài thi
                </span>
              </div>
              <div className='row gy-4'>
                {exams.map((exam) => (
                  <div key={exam._id} className='col-lg-4 col-sm-6'>
                    <div className='course-item bg-main-25 rounded-16 p-12 h-100 border border-neutral-30'>
                      <div className='course-item__content'>
                        <div className='mb-28'>
                          <h4 className='mb-16'>
                            <Link
                              to={`/exams/${exam._id}`}
                              className='link text-line-2'
                            >
                              {exam.title}
                            </Link>
                          </h4>
                          {exam.description && (
                            <p className='text-neutral-600 text-lg mb-16'>
                              {exam.description}
                            </p>
                          )}
                          <div className='flex-between gap-8 flex-wrap mb-16'>
                            <div className='flex-align gap-8'>
                              <span className='text-neutral-700 text-2xl d-flex'>
                                <i className='ph-bold ph-clock' />
                              </span>
                              <span className='text-neutral-700 text-lg fw-medium'>
                                {exam.totalDuration || 0} phút
                              </span>
                            </div>
                            <div className='flex-align gap-8'>
                              <span className='text-neutral-700 text-2xl d-flex'>
                                <i className='ph-bold ph-book' />
                              </span>
                              <span className='text-neutral-700 text-lg fw-medium'>
                                {exam.level}
                              </span>
                            </div>
                          </div>
                          <div className='flex-align gap-8 mb-16'>
                            <span className='text-neutral-700 text-2xl d-flex'>
                              <i className='ph-bold ph-list-bullets' />
                            </span>
                            <span className='text-neutral-700 text-lg fw-medium'>
                              {exam.sections?.length || 0} phần thi
                            </span>
                          </div>
                        </div>
                        <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28'>
                          <span className='badge bg-main-600 text-white px-16 py-8 rounded-pill'>
                            {exam.examType === "real" ? "Thi thật" : "Luyện tập"}
                          </span>
                          <Link
                            to={`/exams/${exam._id}`}
                            className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                          >
                            Bắt đầu
                            <i className='ph ph-arrow-right' />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <FooterOne />
    </>
  );
};

export default StudentExamListPage;

