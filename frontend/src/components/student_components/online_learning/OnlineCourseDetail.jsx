import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import onlineLearningService from '../../../services/onlineLearningService';

/**
 * OnlineCourseDetail Component
 * Display detailed information about an online course and student's progress
 * Design inspired by CourseDetails but focused on learning progress
 */
const OnlineCourseDetail = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview | lessons

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        setLoading(true);

        // Fetch course detail from API
        const response = await onlineLearningService.getCourseDetail(courseId);
        
        if (response.success) {
          setCourse(response.course);
        } else {
          setError(response.message || 'Không tìm thấy khóa học');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching course detail:', err);
        setError(err.message || 'Không thể tải thông tin khóa học');
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [courseId]);

  if (loading) {
    return (
      <div className="py-40 px-32">
        <div className="skeleton h-400 rounded-16 mb-24"></div>
        <div className="skeleton h-200 rounded-16"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="py-40 px-32">
        <div className="text-center">
          <i className="fas fa-exclamation-circle text-danger-600 mb-24" style={{ fontSize: '64px' }}></i>
          <h4 className="mb-12">{error || 'Lỗi'}</h4>
          <p className="text-neutral-500 mb-24">Không thể tải thông tin khóa học</p>
          <Link to="/student/online-courses" className="btn btn-main rounded-pill">
            <i className="fas fa-arrow-left me-2"></i>
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const completionPercentage = course.progress?.completionPercentage || 0;
  const sessions = course.sessions || [];
  
  // Calculate skill progress from sessions
  const skillProgress = {
    listening: { completed: 0, total: 0 },
    reading: { completed: 0, total: 0 },
    speaking: { completed: 0, total: 0 },
    writing: { completed: 0, total: 0 }
  };

  sessions.forEach(session => {
    if (session.sessionType) {
      skillProgress[session.sessionType].total++;
      if (session.isCompleted) {
        skillProgress[session.sessionType].completed++;
      }
    }
  });

  const getSessionStatus = (session) => {
    const { video, quiz, vocabulary } = session.progress;
    if (video && quiz && vocabulary) return 'completed';
    if (video || quiz || vocabulary) return 'in-progress';
    return 'not-started';
  };

  const getSessionStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <i className="fas fa-check-circle text-success-600"></i>;
      case 'in-progress':
        return <i className="fas fa-spinner text-warning-600"></i>;
      default:
        return <i className="far fa-circle text-neutral-300"></i>;
    }
  };

  const getSkillIcon = (skill) => {
    const icons = {
      listening: 'fa-headphones',
      reading: 'fa-book-open',
      speaking: 'fa-microphone',
      writing: 'fa-pen'
    };
    return icons[skill] || 'fa-circle';
  };

  const getSkillColor = (skill) => {
    const colors = {
      listening: 'info',
      reading: 'success',
      speaking: 'warning',
      writing: 'danger'
    };
    return colors[skill] || 'main';
  };

  return (
    <div className="py-40 px-32">
      {/* Breadcrumb */}
      <div className="mb-24">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/student/online-courses" className="text-main-600">
                <i className="fas fa-laptop me-2"></i>
                Khóa học Online
              </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {course.courseCode}
            </li>
          </ol>
        </nav>
      </div>

      {/* Course Header */}
      <div className="card border-0 shadow-sm rounded-16 overflow-hidden mb-32">
        <div className="row g-0">
          {/* Left: Course Info */}
          <div className="col-lg-8">
            <div className="p-40">
              {/* Badge & Title */}
              <div className="mb-20">
                <span className="badge bg-main-600 text-white px-16 py-8 rounded-pill mb-12">
                  <i className="fas fa-graduation-cap me-2"></i>
                  {course.program.program_name} - {course.program.level}
                </span>
                <h2 className="mb-12">{course.name}</h2>
                <p className="text-neutral-600 mb-0">{course.description}</p>
              </div>

              {/* Meta Info */}
              <div className="d-flex flex-wrap gap-24 mb-24">
                <div className="d-flex align-items-center gap-8">
                  <i className="fas fa-code text-main-600"></i>
                  <span className="text-sm"><strong>Mã:</strong> {course.courseCode}</span>
                </div>
                <div className="d-flex align-items-center gap-8">
                  <i className="fas fa-book text-info-600"></i>
                  <span className="text-sm"><strong>{course.numberOfSessions}</strong> bài học</span>
                </div>
                <div className="d-flex align-items-center gap-8">
                  <i className="fas fa-laptop text-success-600"></i>
                  <span className="text-sm">Học online</span>
                </div>
              </div>

              {/* Overall Progress */}
              <div className="bg-main-50 rounded-12 p-20">
                <div className="d-flex justify-content-between align-items-center mb-12">
                  <h6 className="mb-0">
                    <i className="fas fa-chart-line text-main-600 me-2"></i>
                    Tiến độ tổng quan
                  </h6>
                  <span className="badge bg-main-600 text-white px-12 py-6 rounded-pill">
                    {completionPercentage}%
                  </span>
                </div>
                <div className="progress bg-white" style={{ height: '12px' }}>
                  <div 
                    className={`progress-bar ${
                      completionPercentage === 100 ? 'bg-success-600' :
                      completionPercentage >= 50 ? 'bg-main-600' : 'bg-warning-600'
                    }`}
                    role="progressbar"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-neutral-600 mt-8 mb-0">
                  <i className="fas fa-check-circle text-success-600 me-1"></i>
                  {course.progress?.completedSessions || 0} / {course.numberOfSessions} bài học hoàn thành
                </p>
              </div>
            </div>
          </div>

          {/* Right: Stats */}
          <div className="col-lg-4 bg-gradient-main text-white">
            <div className="p-40 h-100 d-flex flex-column justify-content-center">
              <h5 className="text-white mb-24">Thống kê học tập</h5>
              
              <div className="mb-20">
                <div className="d-flex align-items-center gap-12 mb-8">
                  <i className="fas fa-video" style={{ width: '20px' }}></i>
                  <span className="text-sm">Videos đã xem</span>
                </div>
                <div className="progress bg-white bg-opacity-25" style={{ height: '6px' }}>
                  <div 
                    className="progress-bar bg-white"
                    style={{ width: `${(sessions.filter(s => s.progress.video).length / course.numberOfSessions) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-white-75 mt-4 mb-0">
                  {sessions.filter(s => s.progress.video).length} / {course.numberOfSessions}
                </p>
              </div>

              <div className="mb-20">
                <div className="d-flex align-items-center gap-12 mb-8">
                  <i className="fas fa-question-circle" style={{ width: '20px' }}></i>
                  <span className="text-sm">Quizzes hoàn thành</span>
                </div>
                <div className="progress bg-white bg-opacity-25" style={{ height: '6px' }}>
                  <div 
                    className="progress-bar bg-white"
                    style={{ width: `${(sessions.filter(s => s.progress.quiz).length / course.numberOfSessions) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-white-75 mt-4 mb-0">
                  {sessions.filter(s => s.progress.quiz).length} / {course.numberOfSessions}
                </p>
              </div>

              <div>
                <div className="d-flex align-items-center gap-12 mb-8">
                  <i className="fas fa-book-reader" style={{ width: '20px' }}></i>
                  <span className="text-sm">Từ vựng đã học</span>
                </div>
                <div className="progress bg-white bg-opacity-25" style={{ height: '6px' }}>
                  <div 
                    className="progress-bar bg-white"
                    style={{ width: `${(sessions.filter(s => s.progress.vocabulary).length / course.numberOfSessions) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-white-75 mt-4 mb-0">
                  {sessions.filter(s => s.progress.vocabulary).length} / {course.numberOfSessions}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skill Progress */}
      <div className="card border-0 shadow-sm rounded-16 mb-32">
        <div className="card-body p-32">
          <h5 className="mb-24">
            <i className="fas fa-chart-pie text-main-600 me-2"></i>
            Tiến độ theo kỹ năng
          </h5>
          
          <div className="row g-20">
            {Object.entries(skillProgress).map(([skill, data]) => {
              const percentage = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
              const color = getSkillColor(skill);
              
              return (
                <div key={skill} className="col-md-6 col-lg-3">
                  <div className={`p-20 rounded-12 bg-${color}-50 border border-${color}-100`}>
                    <div className="d-flex align-items-center justify-content-between mb-12">
                      <div className="d-flex align-items-center gap-8">
                        <i className={`fas ${getSkillIcon(skill)} text-${color}-600`}></i>
                        <h6 className="mb-0 text-capitalize">{skill}</h6>
                      </div>
                      <span className={`badge bg-${color}-600 text-white px-8 py-4 rounded-pill text-xs`}>
                        {percentage}%
                      </span>
                    </div>
                    <div className={`progress bg-white`} style={{ height: '8px' }}>
                      <div 
                        className={`progress-bar bg-${color}-600`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-neutral-600 mt-8 mb-0">
                      {data.completed} / {data.total} bài học
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-pills mb-24" role="tablist">
        <li className="nav-item" role="presentation">
          <button 
            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="fas fa-info-circle me-2"></i>
            Tổng quan
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button 
            className={`nav-link ${activeTab === 'lessons' ? 'active' : ''}`}
            onClick={() => setActiveTab('lessons')}
          >
            <i className="fas fa-list me-2"></i>
            Danh sách bài học ({sessions.length})
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="card border-0 shadow-sm rounded-16">
            <div className="card-body p-32">
              <h5 className="mb-20">
                <i className="fas fa-book-open text-main-600 me-2"></i>
                Về khóa học này
              </h5>
              <p className="text-neutral-600 mb-24">{course.description}</p>

              {course.materials && course.materials.length > 0 && (
                <>
                  <h6 className="mb-16">
                    <i className="fas fa-file-alt text-info-600 me-2"></i>
                    Tài liệu tham khảo
                  </h6>
                  <div className="list-group list-group-flush">
                    {course.materials.map((material, index) => (
                      <div key={index} className="list-group-item px-0">
                        <div className="d-flex align-items-start gap-12">
                          <i className="fas fa-book text-main-600 mt-1"></i>
                          <div className="flex-grow-1">
                            <h6 className="mb-4">{material.description}</h6>
                            {material.author && (
                              <p className="text-sm text-neutral-600 mb-2">
                                <strong>Tác giả:</strong> {material.author}
                              </p>
                            )}
                            {material.publisher && (
                              <p className="text-sm text-neutral-600 mb-2">
                                <strong>Nhà xuất bản:</strong> {material.publisher} ({material.publishedDate})
                              </p>
                            )}
                            {material.onlineUrl && (
                              <a 
                                href={material.onlineUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-main-600 hover-text-main-700"
                              >
                                <i className="fas fa-external-link-alt me-1"></i>
                                Xem tài liệu online
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Lessons Tab */}
        {activeTab === 'lessons' && (
          <div className="row g-20">
            {sessions.map((session, index) => {
              const status = getSessionStatus(session);
              const isLocked = index > 0 && getSessionStatus(sessions[index - 1]) !== 'completed';

              return (
                <div key={session._id} className="col-12">
                  <div className={`card border-0 shadow-sm rounded-12 overflow-hidden ${isLocked ? 'opacity-50' : 'hover-shadow-lg transition-2'}`}>
                    <div className="row g-0 align-items-center">
                      {/* Left: Session Number */}
                      <div className="col-auto">
                        <div className={`bg-${getSkillColor(session.sessionType)}-600 text-white p-24 d-flex align-items-center justify-content-center`} style={{ width: '80px', height: '100%', minHeight: '120px' }}>
                          <div className="text-center">
                            <h4 className="text-white mb-0">{session.order}</h4>
                            <p className="text-white-75 text-xs mb-0">Lesson</p>
                          </div>
                        </div>
                      </div>

                      {/* Status Icon - Fixed position */}
                      <div className="col-auto">
                        <div className="px-20" style={{ width: '70px' }}>
                          <div className="text-center" style={{ fontSize: '28px' }}>
                            {getSessionStatusIcon(status)}
                          </div>
                        </div>
                      </div>

                      {/* Middle: Session Info */}
                      <div className="col">
                        <div className="p-20">
                          <div className="mb-8">
                            <span className={`badge bg-${getSkillColor(session.sessionType)}-50 text-${getSkillColor(session.sessionType)}-600 px-12 py-4 rounded-pill text-xs me-2`}>
                              <i className={`fas ${getSkillIcon(session.sessionType)} me-1`}></i>
                              {session.sessionType}
                            </span>
                            {status === 'completed' && (
                              <span className="badge bg-success-50 text-success-600 px-12 py-4 rounded-pill text-xs">
                                <i className="fas fa-check me-1"></i>
                                Hoàn thành
                              </span>
                            )}
                            {isLocked && (
                              <span className="badge bg-neutral-100 text-neutral-600 px-12 py-4 rounded-pill text-xs">
                                <i className="fas fa-lock me-1"></i>
                                Khóa
                              </span>
                            )}
                          </div>
                          <h6 className="mb-8">{session.title}</h6>
                          <p className="text-sm text-neutral-600 mb-12">{session.description}</p>

                          {/* Progress Indicators */}
                          <div className="d-flex gap-16">
                            <div className="d-flex align-items-center gap-6">
                              <i className={`fas fa-video ${session.progress.video ? 'text-success-600' : 'text-neutral-300'}`}></i>
                              <span className="text-xs text-neutral-600">Video</span>
                            </div>
                            <div className="d-flex align-items-center gap-6">
                              <i className={`fas fa-question-circle ${session.progress.quiz ? 'text-success-600' : 'text-neutral-300'}`}></i>
                              <span className="text-xs text-neutral-600">Quiz</span>
                            </div>
                            <div className="d-flex align-items-center gap-6">
                              <i className={`fas fa-book-reader ${session.progress.vocabulary ? 'text-success-600' : 'text-neutral-300'}`}></i>
                              <span className="text-xs text-neutral-600">Vocabulary</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Action Button - Fixed width */}
                      <div className="col-auto">
                        <div className="p-20" style={{ width: '160px' }}>
                          {isLocked ? (
                            <button className="btn btn-neutral-200 rounded-pill w-100" disabled>
                              <i className="fas fa-lock me-2"></i>
                              Đang khóa
                            </button>
                          ) : (
                            <Link 
                              to={`/student/online-courses/${courseId}/sessions/${session._id}`}
                              className={`btn btn-${status === 'completed' ? 'outline-success' : 'main'} rounded-pill w-100`}
                            >
                              {status === 'completed' ? (
                                <>
                                  <i className="fas fa-redo me-2"></i>
                                  Ôn lại
                                </>
                              ) : status === 'in-progress' ? (
                                <>
                                  <i className="fas fa-play me-2"></i>
                                  Tiếp tục
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-play-circle me-2"></i>
                                  Bắt đầu
                                </>
                              )}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OnlineCourseDetail;
