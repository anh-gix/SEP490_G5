import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const CourseDetails = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!id) {
        setError('Course ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_URL}/courses/${id}/details`);
        console.log('Course details response:', response.data);
        if (response.data.success) {
          setCourse(response.data.data);
        } else {
          setError(response.data.message || 'Failed to fetch course details');
        }
      } catch (err) {
        console.error('Error fetching course details:', err);
        setError(err.response?.data?.message || err.message || 'Error loading course details');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

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
      <section className='course-details py-120'>
        <div className='container'>
          <div className='text-center'>
            <p className='text-neutral-500'>Đang tải thông tin khóa học...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || !course) {
    return (
      <section className='course-details py-120'>
        <div className='container'>
          <div className='text-center'>
            <p className='text-danger-600'>{error || 'Không tìm thấy khóa học'}</p>
            <p className='text-neutral-500 text-sm mt-8'>ID: {id}</p>
            <Link to='/course' className='btn btn-main rounded-pill mt-24'>
              Quay lại danh sách khóa học
            </Link>
          </div>
        </div>
      </section>
    );
  }

  try {
    return (
    <section className='course-details py-120'>
      <div className='container'>
        <div className='row gy-4'>
          <div className='col-xl-8'>
            {/* Details Content Start */}
            <div className='course-details__content border border-neutral-30 rounded-12 bg-main-25 p-12'>
              <img
                src='assets/images/thumbs/course-details-img.png'
                alt={course.name || 'Course'}
                className='rounded-8 cover-img'
                onError={(e) => {
                  e.target.src = 'assets/images/thumbs/course-details-img.png';
                }}
              />
              <div className='p-20'>
                <h2 className='mt-24 mb-24'>
                  {course.name || 'Chưa có tên'}
                </h2>
                <p className='text-neutral-700'>
                  {course.description || 'Chưa có mô tả cho khóa học này.'}
                </p>
                {course.program && (
                  <>
                <span className='d-block border-bottom border-main-100 my-32' />
                    <h3 className='mb-16'>Thông tin chương trình:</h3>
                    <p className='text-neutral-700'>
                      <strong>Tên chương trình:</strong> {course.program.program_name || course.program.code || 'N/A'}<br />
                      <strong>Mã chương trình:</strong> {course.program.code || 'N/A'}
                    </p>
                  </>
                )}
                
                {course.clos && Array.isArray(course.clos) && course.clos.length > 0 && (
                  <>
                <span className='d-block border-bottom border-main-100 my-32' />
                    <h3 className='mb-16'>Mục tiêu học tập (CLOs):</h3>
                <ul className='list-dotted d-flex flex-column gap-24'>
                      {course.clos.map((clo, index) => (
                        <li key={clo?._id || index}>
                          {clo?.code || ''}: {clo?.name || 'Chưa có mô tả'}
                  </li>
                      ))}
                </ul>
                  </>
                )}
                
                <span className='d-block border-bottom border-main-100 my-32' />
                <p className='mt-24 text-neutral-700 text-sm'>
                  <strong>Ngày tạo:</strong> {formatDate(course.createdAt)}<br />
                  <strong>Cập nhật lần cuối:</strong> {formatDate(course.updatedAt)}
                </p>
              </div>
            </div>
            {/* Details Content End */}
            {/* Curriculum Start */}
            {course.sessions && Array.isArray(course.sessions) && course.sessions.length > 0 && (
            <div className='border border-neutral-30 rounded-12 bg-main-25 p-32 mt-24'>
                <h5 className='mb-0'>Chương trình học (Sessions)</h5>
              <span className='d-block border border-neutral-30 my-24 border-dashed' />
              <div
                className='accordion common-accordion style-three'
                id='accordionExampleTwo'
              >
                  {course.sessions.map((session, index) => (
                    <div key={session?._id || index} className='accordion-item'>
                  <h2 className='accordion-header'>
                    <button
                          className={`accordion-button ${index === 0 ? '' : 'collapsed'}`}
                      type='button'
                      data-bs-toggle='collapse'
                          data-bs-target={`#collapse${index}Two`}
                          aria-expanded={index === 0 ? 'true' : 'false'}
                          aria-controls={`collapse${index}Two`}
                        >
                          {session?.title || `Buổi học ${session?.order || index + 1}`}
                    </button>
                  </h2>
                  <div
                        id={`collapse${index}Two`}
                        className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`}
                    data-bs-parent='#accordionExampleTwo'
                  >
                    <div className='accordion-body p-0'>
                          {session?.description && (
                            <div className='p-16'>
                              <p className='text-neutral-700 mb-16'>{session.description}</p>
                    </div>
                          )}
                          {session?.content && Array.isArray(session.content) && session.content.length > 0 ? (
                            session.content.map((contentItem, contentIndex) => (
                      <Link
                                key={contentIndex}
                        to='#'
                        className='curriculam-item flex-between gap-16 text-neutral-500 fw-medium hover-text-main-600'
                      >
                        <span className='flex-align gap-12'>
                          <i className='text-xl d-flex ph-bold ph-video-camera' />
                          <span className='text-line-1'>
                                    {contentItem?.title || `Nội dung ${contentIndex + 1}`}
                          </span>
                        </span>
                                {contentItem?.duration && (
                        <span className='flex-align gap-12 flex-shrink-0'>
                                    {contentItem.duration}
                          <i className='text-xl d-flex ph-bold ph-video-camera' />
                        </span>
                                )}
                      </Link>
                            ))
                          ) : (
                            <div className='p-16 text-neutral-500'>
                              Chưa có nội dung chi tiết cho buổi học này.
                    </div>
                          )}
                  </div>
                </div>
                    </div>
                  ))}
                  </div>
                </div>
            )}
          </div>
          <div className='col-xl-4'>
            <div className='course-details__sidebar border border-neutral-30 rounded-12 bg-white p-8'>
              <div className='border border-neutral-30 rounded-12 bg-main-25 p-24 bg-main-25'>

                <div className='border-bottom border-neutral-40 pb-24 mb-24 flex-between flex-wrap gap-16'>
                  <div className='flex-align gap-12'>
                    <span className='text-neutral-700 text-2xl d-flex'>
                      <i className='ph ph-watch' />
                    </span>
                    <span className='text-neutral-700 text-lg fw-normal'>
                      Tên khóa học
                    </span>
                  </div>
                  <span className='text-lg fw-medium text-neutral-700 text-line-2'>
                    {course.name || 'Chưa có tên'}
                  </span>
                </div>
                <div className='border-bottom border-neutral-40 pb-24 mb-24 flex-between flex-wrap gap-16'>
                  <div className='flex-align gap-12'>
                    <span className='text-neutral-700 text-2xl d-flex'>
                      {" "}
                      <i className='ph ph-video-camera' />
                    </span>
                    <span className='text-neutral-700 text-lg fw-normal'>
                      Buổi học
                    </span>
                  </div>
                  <span className='text-lg fw-medium text-neutral-700'>
                    {course.sessions?.length || 0} Buổi
                  </span>
                </div>
                {course.program && (
                <div className='border-bottom border-neutral-40 pb-24 mb-24 flex-between flex-wrap gap-16'>
                  <div className='flex-align gap-12'>
                    <span className='text-neutral-700 text-2xl d-flex'>
                      <i className='ph ph-globe' />{" "}
                    </span>
                    <span className='text-neutral-700 text-lg fw-normal'>
                        Chương trình
                    </span>
                  </div>
                  <span className='text-lg fw-medium text-neutral-700'>
                      {course.program.program_name || course.program.code || 'N/A'}
                  </span>
                </div>
                )}
                <div className='border-bottom border-neutral-40 pb-24 mb-24 flex-between flex-wrap gap-16'>
                  <div className='flex-align gap-12'>
                    <span className='text-neutral-700 text-2xl d-flex'>
                      {" "}
                      <i className='ph ph-calendar-dot' />
                    </span>
                    <span className='text-neutral-700 text-lg fw-normal'>
                      Ngày tạo
                    </span>
                  </div>
                  <span className='text-lg fw-medium text-neutral-700'>
                    {formatDate(course.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    );
  } catch (renderError) {
    console.error('Render error:', renderError);
    return (
      <section className='course-details py-120'>
        <div className='container'>
          <div className='text-center'>
            <p className='text-danger-600'>Có lỗi xảy ra khi hiển thị trang.</p>
            <p className='text-neutral-500 text-sm mt-8'>{renderError.message}</p>
            <Link to='/course' className='btn btn-main rounded-pill mt-24'>
              Quay lại danh sách khóa học
            </Link>
          </div>
        </div>
      </section>
    );
  }
};

export default CourseDetails;
