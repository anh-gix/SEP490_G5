import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const CourseGridView = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/courses`);
        if (response.data.success) {
          setCourses(response.data.data || []);
        } else {
          setError('Failed to fetch courses');
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError(err.response?.data?.message || 'Error loading courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <section className='course-grid-view py-120'>
        <div className='container'>
          <div className='text-center'>
            <p className='text-neutral-500'>Đang tải khóa học...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className='course-grid-view py-120'>
        <div className='container'>
          <div className='text-center'>
            <p className='text-danger-600'>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className='course-grid-view py-120'>
      <div className='container'>
        <div className='flex-between gap-16 flex-wrap mb-40'>
          <span className='text-neutral-500'>Showing {courses.length} of {courses.length} Results </span>
          <div className='flex-align gap-8'>
            <span className='text-neutral-500 flex-shrink-0'>Sort By :</span>
            <select className='form-select ps-20 pe-28 py-8 fw-semibold rounded-pill bg-main-25 border border-neutral-30 text-neutral-700'>
              <option value={1}>Newest</option>
              <option value={1}>Trending</option>
              <option value={1}>Popular</option>
            </select>
          </div>
        </div>
        {courses.length === 0 ? (
          <div className='text-center py-80'>
            <p className='text-neutral-500 text-lg'>Không có khóa học nào được tìm thấy.</p>
          </div>
        ) : (
          <div className='row gy-4'>
            {courses.map((course) => (
              <div key={course._id} className='col-lg-4 col-sm-6'>
                <div className='course-item bg-main-25 rounded-16 p-12 h-100 border border-neutral-30'>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to={`/course-details/${course._id}`} className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/course-img1.png'
                        alt={course.name}
                        className='course-item__img rounded-12 cover-img transition-2'
                        onError={(e) => {
                          e.target.src = 'assets/images/thumbs/course-img1.png';
                        }}
                      />
                    </Link>
                    <div className='flex-align gap-8 bg-main-600 rounded-pill px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                      <span className='text-2xl d-flex'>
                        <i className='ph ph-clock' />
                      </span>
                      <span className='text-lg fw-medium'>
                        {course.sessions?.length || 0} Buổi
                      </span>
                    </div>
                    <button
                      type='button'
                      className='wishlist-btn w-48 h-48 bg-white text-main-two-600 flex-center position-absolute inset-block-start-0 inset-inline-end-0 mt-20 me-20 z-1 text-2xl rounded-circle transition-2'
                    >
                      <i className='ph ph-heart' />
                    </button>
                  </div>
                  <div className='course-item__content'>
                    <div className=''>
                      <h4 className='mb-28'>
                        <Link to={`/course-details/${course._id}`} className='link text-line-2'>
                          {course.name || 'Chưa có tên'}
                        </Link>
                      </h4>
                      {course.description && (
                        <p className='text-neutral-600 text-sm mb-16 text-line-2'>
                          {course.description}
                        </p>
                      )}
                      <div className='flex-between gap-8 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            {course.sessions?.length || 0} Lessons
                          </span>
                        </div>
                        {course.program && (
                          <div className='flex-align gap-8'>
                            <span className='text-neutral-700 text-2xl d-flex'>
                              <i className='ph-bold ph-chart-bar' />
                            </span>
                            <span className='text-neutral-700 text-lg fw-medium'>
                              {course.program.program_name || course.program.code || 'N/A'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(0)</span>
                          </span>
                        </div>
                        {course.createdBy && (
                          <div className='flex-align gap-8'>
                            <span className='text-neutral-700 text-2xl d-flex'>
                              <div className='w-32 h-32 bg-main-600 rounded-circle flex-center text-white fw-bold'>
                                {getInitials(course.createdBy.name || course.createdBy.fullname)}
                              </div>
                            </span>
                            <span className='text-neutral-700 text-lg fw-medium'>
                              {course.createdBy.name || course.createdBy.fullname || 'Unknown'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <div>
                        <h4 className='mb-0 text-main-two-600'>Miễn phí</h4>
                        <span className='text-xs text-neutral-500'>
                          {formatDate(course.createdAt)}
                        </span>
                      </div>
                      <Link
                        to={`/course-details/${course._id}`}
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Xem chi tiết
                        <i className='ph ph-arrow-right' />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CourseGridView;
