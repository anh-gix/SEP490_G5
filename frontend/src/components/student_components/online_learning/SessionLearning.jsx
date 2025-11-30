import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import onlineLearningService from '../../../services/onlineLearningService';
import VideoPlayer from './VideoPlayer';
import VocabularyFlashcard from './VocabularyFlashcard';
import CambridgeQuiz from './CambridgeQuiz';

/**
 * SessionLearning Component
 * Main learning page with Video, Vocabulary, and Quiz tabs
 * Inspired by StudentTips but focused on learning activities
 */
const SessionLearning = () => {
  const { courseId, sessionId } = useParams();
  const [course, setCourse] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('video'); // video | vocabulary | quiz

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch both course detail and session content in parallel
        const [courseResponse, sessionResponse] = await Promise.all([
          onlineLearningService.getCourseDetail(courseId),
          onlineLearningService.getSessionContent(courseId, sessionId)
        ]);

        if (courseResponse.success && sessionResponse.success) {
          setCourse(courseResponse.course);
          setSession(sessionResponse.session);
        } else {
          setError(courseResponse.message || sessionResponse.message || 'Không thể tải bài học');
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching session:', err);
        setError(err.message || 'Không thể tải bài học');
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, sessionId]);

  const handleCompleteVideo = async () => {
    try {
      await onlineLearningService.markVideoCompleted(courseId, sessionId);
      
      // Update local state
      setSession(prev => ({
        ...prev,
        progress: { ...prev.progress, video: true }
      }));
    } catch (err) {
      console.error('Error marking video as completed:', err);
    }
  };

  const handleCompleteVocabulary = async () => {
    try {
      await onlineLearningService.markVocabularyCompleted(courseId, sessionId);
      
      // Update local state
      setSession(prev => ({
        ...prev,
        progress: { ...prev.progress, vocabulary: true }
      }));
    } catch (err) {
      console.error('Error marking vocabulary as completed:', err);
    }
  };

  const handleCompleteQuiz = async () => {
    try {
      await onlineLearningService.markQuizCompleted(courseId, sessionId);
      
      // Update local state
      setSession(prev => ({
        ...prev,
        progress: { ...prev.progress, quiz: true }
      }));
    } catch (err) {
      console.error('Error marking quiz as completed:', err);
    }
  };

  if (loading) {
    return (
      <div className="py-40 px-32">
        <div className="skeleton h-400 rounded-16 mb-24"></div>
        <div className="skeleton h-200 rounded-16"></div>
      </div>
    );
  }

  if (error || !course || !session) {
    return (
      <div className="py-40 px-32">
        <div className="text-center">
          <i className="fas fa-exclamation-circle text-danger-600 mb-24" style={{ fontSize: '64px' }}></i>
          <h4 className="mb-12">{error || 'Lỗi'}</h4>
          <p className="text-neutral-500 mb-24">Không thể tải bài học</p>
          <Link to={`/student/online-courses/${courseId}`} className="btn btn-main rounded-pill">
            <i className="fas fa-arrow-left me-2"></i>
            Quay lại khóa học
          </Link>
        </div>
      </div>
    );
  }

  const isSessionCompleted = session.progress.video && session.progress.quiz && session.progress.vocabulary;

  const getTabIcon = (tab) => {
    const icons = {
      video: 'fa-video',
      vocabulary: 'fa-book-reader',
      quiz: 'fa-question-circle'
    };
    return icons[tab];
  };

  const getSkillColor = (sessionType) => {
    const colors = {
      listening: 'info',
      reading: 'success',
      speaking: 'warning',
      writing: 'danger'
    };
    return colors[sessionType] || 'main';
  };

  const getSkillIcon = (sessionType) => {
    const icons = {
      listening: 'fa-headphones',
      reading: 'fa-book-open',
      speaking: 'fa-microphone',
      writing: 'fa-pen'
    };
    return icons[sessionType] || 'fa-circle';
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
            <li className="breadcrumb-item">
              <Link to={`/student/online-courses/${courseId}`} className="text-main-600">
                {course.courseCode}
              </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Lesson {session.order}
            </li>
          </ol>
        </nav>
      </div>

      <div className="row g-24">
        {/* Left: Learning Content */}
        <div className="col-lg-9">
          {/* Session Header */}
          <div className="card border-0 shadow-sm rounded-16 mb-24">
            <div className="card-body p-32">
              <div className="d-flex align-items-start justify-content-between mb-20">
                <div className="flex-grow-1">
                  <div className="mb-12">
                    <span className={`badge bg-${getSkillColor(session.sessionType)}-50 text-${getSkillColor(session.sessionType)}-600 px-16 py-8 rounded-pill me-2`}>
                      <i className={`fas ${getSkillIcon(session.sessionType)} me-2`}></i>
                      {session.sessionType}
                    </span>
                    <span className="badge bg-neutral-100 text-neutral-600 px-16 py-8 rounded-pill">
                      Lesson {session.order}
                    </span>
                  </div>
                  <h3 className="mb-12">{session.title}</h3>
                  <p className="text-neutral-600 mb-0">{session.description}</p>
                </div>

                {isSessionCompleted && (
                  <div className="ms-3">
                    <span className="badge bg-success-600 text-white px-20 py-10 rounded-pill">
                      <i className="fas fa-trophy me-2"></i>
                      Hoàn thành
                    </span>
                  </div>
                )}
              </div>

              {/* Progress Indicators */}
              <div className="d-flex gap-20 pt-20 border-top border-gray-100">
                <div className="d-flex align-items-center gap-8">
                  <i className={`fas fa-video ${session.progress.video ? 'text-success-600' : 'text-neutral-300'}`}></i>
                  <span className={`text-sm ${session.progress.video ? 'text-success-600 fw-medium' : 'text-neutral-600'}`}>
                    Video {session.progress.video && <i className="fas fa-check ms-1"></i>}
                  </span>
                </div>
                <div className="d-flex align-items-center gap-8">
                  <i className={`fas fa-book-reader ${session.progress.vocabulary ? 'text-success-600' : 'text-neutral-300'}`}></i>
                  <span className={`text-sm ${session.progress.vocabulary ? 'text-success-600 fw-medium' : 'text-neutral-600'}`}>
                    Vocabulary {session.progress.vocabulary && <i className="fas fa-check ms-1"></i>}
                  </span>
                </div>
                <div className="d-flex align-items-center gap-8">
                  <i className={`fas fa-question-circle ${session.progress.quiz ? 'text-success-600' : 'text-neutral-300'}`}></i>
                  <span className={`text-sm ${session.progress.quiz ? 'text-success-600 fw-medium' : 'text-neutral-600'}`}>
                    Quiz {session.progress.quiz && <i className="fas fa-check ms-1"></i>}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Tabs */}
          <div className="card border-0 shadow-sm rounded-16">
            {/* Tab Headers */}
            <div className="card-header bg-white border-bottom-0 p-0">
              <ul className="nav nav-tabs border-0" role="tablist">
                <li className="nav-item flex-fill" role="presentation">
                  <button
                    className={`nav-link border-0 rounded-0 py-16 w-100 ${activeTab === 'video' ? 'active bg-main-50 text-main-600 border-bottom border-main-600 border-3' : ''}`}
                    onClick={() => setActiveTab('video')}
                  >
                    <i className={`fas ${getTabIcon('video')} me-2`}></i>
                    Video
                    {session.progress.video && <i className="fas fa-check-circle text-success-600 ms-2"></i>}
                  </button>
                </li>
                <li className="nav-item flex-fill" role="presentation">
                  <button
                    className={`nav-link border-0 rounded-0 py-16 w-100 ${activeTab === 'vocabulary' ? 'active bg-main-50 text-main-600 border-bottom border-main-600 border-3' : ''}`}
                    onClick={() => setActiveTab('vocabulary')}
                  >
                    <i className={`fas ${getTabIcon('vocabulary')} me-2`}></i>
                    Vocabulary
                    {session.progress.vocabulary && <i className="fas fa-check-circle text-success-600 ms-2"></i>}
                  </button>
                </li>
                <li className="nav-item flex-fill" role="presentation">
                  <button
                    className={`nav-link border-0 rounded-0 py-16 w-100 ${activeTab === 'quiz' ? 'active bg-main-50 text-main-600 border-bottom border-main-600 border-3' : ''}`}
                    onClick={() => setActiveTab('quiz')}
                  >
                    <i className={`fas ${getTabIcon('quiz')} me-2`}></i>
                    Quiz
                    {session.progress.quiz && <i className="fas fa-check-circle text-success-600 ms-2"></i>}
                  </button>
                </li>
              </ul>
            </div>

            {/* Tab Content */}
            <div className="card-body p-32">
              {activeTab === 'video' && (
                <VideoPlayer
                  videoURL={session.videoURL}
                  onComplete={handleCompleteVideo}
                  isCompleted={session.progress.video}
                />
              )}

              {activeTab === 'vocabulary' && (
                <VocabularyFlashcard
                  vocabulary={session.vocabulary}
                  onComplete={handleCompleteVocabulary}
                  isCompleted={session.progress.vocabulary}
                />
              )}

              {activeTab === 'quiz' && (
                <CambridgeQuiz
                  quizData={session.quizzes.quiz}
                  onComplete={handleCompleteQuiz}
                  isCompleted={session.progress.quiz}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right: Lesson List */}
        <div className="col-lg-3">
          <div className="card border-0 shadow-sm rounded-16 sticky-top" style={{ top: '100px' }}>
            <div className="card-header bg-main-600 text-white p-20 border-0">
              <h6 className="mb-0">
                <i className="fas fa-list me-2"></i>
                Danh sách bài học
              </h6>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {course.sessions.map((s) => {
                  const isCurrent = s._id === sessionId;

                  return (
                    <Link
                      key={s._id}
                      to={`/student/online-courses/${courseId}/sessions/${s._id}`}
                      className={`list-group-item list-group-item-action border-0 ${
                        isCurrent ? 'bg-main-50 border-start border-main-600 border-3' : ''
                      }`}
                    >
                      <div className="d-flex align-items-center gap-12">
                        <div className={`text-center ${isCurrent ? 'text-main-600' : 'text-neutral-600'}`} style={{ width: '30px' }}>
                          {s.isCompleted ? (
                            <i className="fas fa-check-circle text-success-600"></i>
                          ) : isCurrent ? (
                            <i className="fas fa-play-circle"></i>
                          ) : (
                            <span className="fw-bold">{s.order}</span>
                          )}
                        </div>
                        <div className="flex-grow-1">
                          <p className={`text-sm mb-0 ${isCurrent ? 'fw-bold text-main-600' : 'text-neutral-900'}`}>
                            {s.title}
                          </p>
                          <p className="text-xs text-neutral-500 mb-0 text-capitalize">
                            <i className={`fas ${getSkillIcon(s.sessionType)} me-1`}></i>
                            {s.sessionType}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionLearning;
