import React, { useRef, useEffect, useState } from 'react';

/**
 * VideoPlayer Component
 * Display video lesson with completion tracking
 * Auto-marks complete when video ends
 */
const VideoPlayer = ({ videoURL, onComplete, isCompleted }) => {
  const videoRef = useRef(null);
  const [hasWatchedToEnd, setHasWatchedToEnd] = useState(isCompleted);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleVideoEnd = () => {
      if (!hasWatchedToEnd && !isCompleted) {
        setHasWatchedToEnd(true);
        if (onComplete) {
          onComplete();
        }
      }
    };

    videoElement.addEventListener('ended', handleVideoEnd);

    return () => {
      videoElement.removeEventListener('ended', handleVideoEnd);
    };
  }, [hasWatchedToEnd, isCompleted, onComplete]);

  const handleMarkComplete = () => {
    if (window.confirm('Bạn đã xem xong video này chưa?')) {
      setHasWatchedToEnd(true);
      if (onComplete) {
        onComplete();
      }
    }
  };

  return (
    <div className="video-player-container">
      {/* Video Area */}
      <div className="mb-24">
        <div className="position-relative rounded-12 overflow-hidden bg-neutral-900">
          <video
            ref={videoRef}
            className="w-100"
            style={{ maxHeight: '600px', objectFit: 'contain' }}
            controls
            controlsList="nodownload"
            playsInline
          >
            <source src={videoURL} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Completion Badge */}
          {(isCompleted || hasWatchedToEnd) && (
            <div className="position-absolute top-0 end-0 m-16">
              <span className="badge bg-success-600 text-white px-16 py-8 rounded-pill shadow-lg">
                <i className="fas fa-check-circle me-2"></i>
                Đã hoàn thành
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="card border-0 bg-main-50 rounded-12">
        <div className="card-body p-20">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-12">
            <div className="d-flex align-items-center gap-12">
              <i className={`fas ${isCompleted || hasWatchedToEnd ? 'fa-check-circle text-success-600' : 'fa-info-circle text-main-600'}`}></i>
              <div>
                <p className="mb-0 fw-medium">
                  {isCompleted || hasWatchedToEnd ? 'Bạn đã hoàn thành video này' : 'Xem video để tiếp tục'}
                </p>
                <p className="text-xs text-neutral-600 mb-0">
                  {isCompleted || hasWatchedToEnd ? 'Bạn có thể xem lại bất cứ lúc nào' : 'Video sẽ tự động đánh dấu hoàn thành khi xem hết'}
                </p>
              </div>
            </div>
            
            {!(isCompleted || hasWatchedToEnd) && (
              <button 
                className="btn btn-success rounded-pill"
                onClick={handleMarkComplete}
              >
                <i className="fas fa-check me-2"></i>
                Đánh dấu đã xem
              </button>
            )}
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
                <li className="text-sm mb-4">Video sẽ tự động đánh dấu hoàn thành khi xem hết</li>
                <li className="text-sm mb-4">Bạn có thể tạm dừng và xem lại bất kỳ phần nào</li>
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
