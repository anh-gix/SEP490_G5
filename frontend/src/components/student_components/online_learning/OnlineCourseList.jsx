import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import onlineLearningService from '../../../services/onlineLearningService';

/**
 * OnlineCourseList Component
 * Display list of Cambridge online courses that student is enrolled in
 * Design inspired by CourseGridView but simplified for enrolled courses
 */
const OnlineCourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        setLoading(true);

        // Fetch enrolled online courses from API
        const response = await onlineLearningService.getMyOnlineCourses();
        
        if (response.success) {
          // Map API response to component format
          const coursesData = response.courses.map(course => ({
            _id: course._id,
            courseCode: course.courseCode,
            name: course.name,
            description: course.description,
            numberOfSessions: course.numberOfSessions,
            program: course.program,
            materials: course.materials,
            preRequisite: course.preRequisite,
            createdAt: course.createdAt,
            completionPercentage: course.progress.completionPercentage,
            progress: course.progress
          }));

          setCourses(coursesData);
        } else {
          setError(response.message || 'Không thể tải danh sách khóa học');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching online courses:', err);
        setError(err.message || 'Không thể tải danh sách khóa học. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  const getProgressColor = (percentage) => {
    if (percentage === 0) return 'bg-neutral-300';
    if (percentage < 30) return 'bg-danger-600';
    if (percentage < 70) return 'bg-warning-600';
    return 'bg-success-600';
  };

  const getProgressText = (percentage) => {
    if (percentage === 0) return 'Chưa bắt đầu';
    if (percentage === 100) return 'Hoàn thành';
    return 'Đang học';
  };

  if (loading) {
    return (
      <div className="py-40 px-32">
        <div className="row g-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="col-xxl-4 col-lg-6">
              <div className="card border border-gray-100 hover-shadow-md transition-2 rounded-16 overflow-hidden">
                <div className="card-body p-24">
                  <div className="skeleton h-200 rounded-8 mb-16"></div>
                  <div className="skeleton h-24 w-75 mb-12"></div>
                  <div className="skeleton h-16 w-100 mb-8"></div>
                  <div className="skeleton h-16 w-100"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-40 px-32">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-danger-600 mb-16" style={{ fontSize: '48px' }}></i>
          <p className="text-danger-600 mb-16">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-main rounded-pill"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="py-40 px-32">
        <div className="text-center">
          <i className="fas fa-book-reader text-neutral-400 mb-24" style={{ fontSize: '64px' }}></i>
          <h4 className="mb-12">Chưa có khóa học nào</h4>
          <p className="text-neutral-500 mb-24">
            Bạn chưa đăng ký khóa học Cambridge online nào. <br />
            Liên hệ với giáo viên hoặc trung tâm để đăng ký khóa học phù hợp.
          </p>
          <Link to="/student/dashboard" className="btn btn-main rounded-pill">
            <i className="fas fa-home me-2"></i>
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-40 px-32">
      {/* Header */}
      <div className="mb-40">
        <div className="d-flex align-items-center justify-content-between mb-16">
          <div>
            <h3 className="mb-8">Khóa học bổ trợ online</h3>
            <p className="text-neutral-500">
              Khóa học online bổ trợ kiến thức cho học viên 
            </p>
          </div>
          <div className="d-flex gap-12 align-items-center">
            <span className="text-sm text-neutral-500">
              <i className="fas fa-book-open me-2"></i>
              Cambridge Young Learners
            </span>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="row g-24">
        {courses.map(course => (
          <div key={course._id} className="col-xxl-4 col-lg-6 col-md-6">
            <div className="card border border-gray-100 hover-shadow-lg transition-2 rounded-16 overflow-hidden h-100">
              {/* Course Header with Level Badge */}
              <div className="card-body p-0">
                <div className="position-relative">
                  <div 
                    className="d-flex align-items-center justify-content-center bg-gradient-main text-white"
                    style={{ height: '180px' }}
                  >
                    <div className="text-center">
                      <i className="fas fa-graduation-cap mb-12" style={{ fontSize: '48px' }}></i>
                      <h5 className="text-white mb-0">{course.program.level}</h5>
                      <p className="text-white-50 text-sm mb-0">Cambridge {course.program.type.toUpperCase()}</p>
                    </div>
                  </div>
                  
                  {/* Level Badge */}
                  <span className="position-absolute top-0 end-0 m-16 badge bg-white text-main-600 px-16 py-8 rounded-pill">
                    <i className="fas fa-layer-group me-2"></i>
                    {course.program.level}
                  </span>

                  {/* Progress Badge */}
                  <span className="position-absolute bottom-0 start-0 m-16 badge bg-white text-neutral-900 px-16 py-8 rounded-pill">
                    <i className={`fas fa-${course.completionPercentage === 100 ? 'check-circle text-success-600' : 'clock text-warning-600'} me-2`}></i>
                    {getProgressText(course.completionPercentage)}
                  </span>
                </div>

                {/* Course Info */}
                <div className="p-24">
                  {/* Course Code */}
                  <div className="mb-12">
                    <span className="badge bg-main-50 text-main-600 px-12 py-6 rounded-pill text-xs">
                      <i className="fas fa-code me-1"></i>
                      {course.courseCode}
                    </span>
                  </div>

                  {/* Course Title */}
                  <h5 className="mb-12">
                    <Link 
                      to={`/student/online-courses/${course._id}`}
                      className="text-neutral-900 hover-text-main-600 transition-2"
                    >
                      {course.name}
                    </Link>
                  </h5>

                  {/* Course Description */}
                  <p className="text-neutral-500 text-sm mb-20 line-clamp-2">
                    {course.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-20">
                    <div className="d-flex justify-content-between align-items-center mb-8">
                      <span className="text-xs text-neutral-600 fw-medium">Tiến độ học tập</span>
                      <span className="text-xs fw-bold text-main-600">{course.completionPercentage}%</span>
                    </div>
                    <div className="progress bg-neutral-100" style={{ height: '8px' }}>
                      <div 
                        className={`progress-bar ${getProgressColor(course.completionPercentage)} transition-2`}
                        role="progressbar"
                        style={{ width: `${course.completionPercentage}%` }}
                        aria-valuenow={course.completionPercentage}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                  </div>

                  {/* Course Meta */}
                  <div className="d-flex align-items-center justify-content-between mb-20 pb-20 border-bottom border-gray-100">
                    <div className="d-flex align-items-center gap-8">
                      <i className="fas fa-book text-main-600"></i>
                      <span className="text-sm text-neutral-600">
                        <span className="fw-bold text-neutral-900">{course.numberOfSessions}</span> bài học
                      </span>
                    </div>
                    <div className="d-flex align-items-center gap-8">
                      <i className="fas fa-laptop text-info-600"></i>
                      <span className="text-sm text-neutral-600">Online</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link 
                    to={`/student/online-courses/${course._id}`}
                    className="btn btn-outline-main rounded-pill w-100"
                  >
                    {course.completionPercentage === 0 ? (
                      <>
                        <i className="fas fa-play-circle me-2"></i>
                        Bắt đầu học
                      </>
                    ) : course.completionPercentage === 100 ? (
                      <>
                        <i className="fas fa-redo me-2"></i>
                        Ôn tập lại
                      </>
                    ) : (
                      <>
                        <i className="fas fa-arrow-right me-2"></i>
                        Tiếp tục học
                      </>
                    )}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Summary */}
      <div className="mt-40 p-24 bg-main-50 rounded-16">
        <div className="row g-20">
          <div className="col-md-4">
            <div className="text-center">
              <i className="fas fa-book-open text-main-600 mb-12" style={{ fontSize: '32px' }}></i>
              <h4 className="mb-4">{courses.length}</h4>
              <p className="text-neutral-600 text-sm mb-0">Khóa học đang học</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="text-center">
              <i className="fas fa-check-circle text-success-600 mb-12" style={{ fontSize: '32px' }}></i>
              <h4 className="mb-4">
                {courses.filter(c => c.completionPercentage === 100).length}
              </h4>
              <p className="text-neutral-600 text-sm mb-0">Khóa hoàn thành</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="text-center">
              <i className="fas fa-clock text-warning-600 mb-12" style={{ fontSize: '32px' }}></i>
              <h4 className="mb-4">
                {courses.filter(c => c.completionPercentage > 0 && c.completionPercentage < 100).length}
              </h4>
              <p className="text-neutral-600 text-sm mb-0">Đang tiến hành</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlineCourseList;
