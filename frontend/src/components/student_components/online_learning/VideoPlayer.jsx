import React, { useState } from 'react';

/**
 * VideoPlayer Component
 * Display video lesson with completion tracking
 */
const VideoPlayer = ({ videoURL, onComplete, isCompleted }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [watchedPercentage, setWatchedPercentage] = useState(isCompleted ? 100 : 0);

  const handleMarkComplete = () => {
    if (window.confirm('Bạn đã xem xong video này chưa?')) {
      setWatchedPercentage(100);
      if (onComplete) {
        onComplete();
      }
    }
  };

  const handleSimulateProgress = () => {
    // Simulate video watching progress
    if (watchedPercentage < 100) {
      setWatchedPercentage(prev => Math.min(prev + 20, 100));
    }
  };

  return (
    <div className="video-player-container">
      {/* Video Area */}
      <div className="mb-24">
        <div className="ratio ratio-16x9 bg-neutral-900 rounded-12 overflow-hidden position-relative">
          {/* Placeholder Video Player */}
          <div className="d-flex align-items-center justify-content-center">
            {!isPlaying ? (
              <button 
                className="btn btn-lg"
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: 'none'
                }}
                onClick={() => {
                  setIsPlaying(true);
                  handleSimulateProgress();
                }}
              >
                <i className="fas fa-play text-main-600" style={{ fontSize: '32px' }}></i>
              </button>
            ) : (
              <div className="text-center text-white">
                <i className="fas fa-video mb-12" style={{ fontSize: '48px' }}></i>
                <p className="mb-8">Video đang phát...</p>
                <p className="text-sm text-white-75">
                  <i className="fas fa-link me-2"></i>
                  {videoURL}
                </p>
                <button 
                  className="btn btn-sm btn-outline-light rounded-pill mt-12"
                  onClick={handleSimulateProgress}
                >
                  <i className="fas fa-forward me-2"></i>
                  Mô phỏng tiến độ +20%
                </button>
              </div>
            )}
          </div>

          {/* Completion Badge */}
          {isCompleted && (
            <div className="position-absolute top-0 end-0 m-16">
              <span className="badge bg-success-600 text-white px-16 py-8 rounded-pill">
                <i className="fas fa-check-circle me-2"></i>
                Đã hoàn thành
              </span>
            </div>
          )}
        </div>

        {/* Video Progress */}
        <div className="mt-16">
          <div className="d-flex justify-content-between align-items-center mb-8">
            <span className="text-sm text-neutral-600">
              <i className="fas fa-clock me-2"></i>
              Tiến độ xem
            </span>
            <span className="text-sm fw-bold text-main-600">{watchedPercentage}%</span>
          </div>
          <div className="progress bg-neutral-100" style={{ height: '8px' }}>
            <div 
              className={`progress-bar ${watchedPercentage === 100 ? 'bg-success-600' : 'bg-main-600'} transition-all`}
              style={{ width: `${watchedPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="card border-0 bg-main-50 rounded-12">
        <div className="card-body p-20">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-12">
              <i className="fas fa-info-circle text-main-600"></i>
              <div>
                <p className="mb-0 fw-medium">
                  {isCompleted ? 'Bạn đã hoàn thành video này' : 'Đánh dấu hoàn thành sau khi xem xong'}
                </p>
                <p className="text-xs text-neutral-600 mb-0">
                  {isCompleted ? 'Bạn có thể xem lại bất cứ lúc nào' : 'Video cần xem ít nhất 80% để hoàn thành'}
                </p>
              </div>
            </div>
            
            <button 
              className={`btn ${isCompleted ? 'btn-outline-success' : 'btn-success'} rounded-pill`}
              onClick={handleMarkComplete}
              disabled={watchedPercentage < 80 || isCompleted}
            >
              {isCompleted ? (
                <>
                  <i className="fas fa-check-double me-2"></i>
                  Đã hoàn thành
                </>
              ) : (
                <>
                  <i className="fas fa-check me-2"></i>
                  Hoàn thành
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Video Info */}
      <div className="mt-20">
        <div className="alert alert-info border-0 rounded-12">
          <div className="d-flex gap-12">
            <i className="fas fa-lightbulb"></i>
            <div>
              <h6 className="mb-8">Hướng dẫn xem video</h6>
              <ul className="mb-0 ps-3">
                <li className="text-sm mb-4">Xem video từ đầu đến cuối để hiểu bài học tốt nhất</li>
                <li className="text-sm mb-4">Bạn có thể tạm dừng và xem lại bất kỳ phần nào</li>
                <li className="text-sm mb-4">Sau khi xem xong, hãy nhấn nút "Hoàn thành" để ghi nhận tiến độ</li>
                <li className="text-sm">Tiếp tục với Quiz và Vocabulary để hoàn thành bài học</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
