import React, { useState } from 'react';

/**
 * VocabularyFlashcard Component
 * English-to-English flashcard for vocabulary learning
 * Front: Image + Word (English), Back: Word (English shown)
 */
const VocabularyFlashcard = ({ vocabulary, onComplete, isCompleted }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [learnedWords, setLearnedWords] = useState(new Set());

  const words = vocabulary?.words || [];
  const totalWords = words.length;
  const currentWord = words[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < totalWords - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleMarkLearned = () => {
    const newLearned = new Set(learnedWords);
    newLearned.add(currentWord);
    setLearnedWords(newLearned);

    // Auto next if not last word
    if (currentIndex < totalWords - 1) {
      setTimeout(() => {
        handleNext();
      }, 500);
    }
  };

  const handleComplete = () => {
    if (learnedWords.size === totalWords) {
      if (window.confirm('Bạn đã học xong tất cả từ vựng chưa?')) {
        if (onComplete) {
          onComplete();
        }
      }
    } else {
      alert(`Bạn cần học ${totalWords - learnedWords.size} từ còn lại!`);
    }
  };

  const progressPercentage = Math.round((learnedWords.size / totalWords) * 100);

  if (!vocabulary || totalWords === 0) {
    return (
      <div className="text-center py-60">
        <i className="fas fa-book text-neutral-300 mb-16" style={{ fontSize: '48px' }}></i>
        <p className="text-neutral-500">Không có từ vựng trong bài học này</p>
      </div>
    );
  }

  return (
    <div className="vocabulary-flashcard-container">
      {/* Progress */}
      <div className="mb-24">
        <div className="d-flex justify-content-between align-items-center mb-12">
          <h6 className="mb-0">
            <i className="fas fa-book-reader text-main-600 me-2"></i>
            Tiến độ học từ vựng
          </h6>
          <span className="badge bg-main-600 text-white px-12 py-6 rounded-pill">
            {learnedWords.size} / {totalWords} từ
          </span>
        </div>
        <div className="progress bg-neutral-100" style={{ height: '10px' }}>
          <div 
            className={`progress-bar ${progressPercentage === 100 ? 'bg-success-600' : 'bg-main-600'} transition-all`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Flashcard */}
      <div className="flashcard-wrapper mb-24">
        <div 
          className={`flashcard ${isFlipped ? 'flipped' : ''}`}
          onClick={handleFlip}
          style={{ cursor: 'pointer' }}
        >
          {/* Front Side */}
          <div className="flashcard-side flashcard-front">
            <div className="card border-0 shadow-lg rounded-16 overflow-hidden h-100">
              <div className="card-body p-0 d-flex flex-column position-relative">
                {/* Image - Full card with padding */}
                <div 
                  className="flex-grow-1 d-flex align-items-center justify-content-center p-20"
                  style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf4 100%)' }}
                >
                  <img 
                    src={vocabulary.img || 'https://placehold.co/600x400/818cf8/ffffff?text=' + encodeURIComponent('Vocab Img')} 
                    alt={currentWord}
                    className="rounded-12"
                    style={{ 
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      maxHeight: '440px'
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/600x400/818cf8/ffffff?text=' + encodeURIComponent('Vocab Img');
                    }}
                  />
                </div>

                {/* Front instruction - Compact at bottom */}
                <div className="position-absolute bottom-0 start-0 end-0 text-center pb-12 pt-8">
                  <p className="text-xs text-neutral-500 mb-0">
                    <i className="fas fa-hand-pointer text-neutral-400 me-1" style={{ fontSize: '12px' }}></i>
                    Click để lật thẻ
                  </p>
                </div>

                {/* Learned Badge */}
                {learnedWords.has(currentWord) && (
                  <div className="position-absolute top-0 end-0 m-16">
                    <span className="badge bg-success-600 text-white px-16 py-8 rounded-pill">
                      <i className="fas fa-check me-2"></i>
                      Đã học
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Back Side */}
          <div className="flashcard-side flashcard-back">
            <div className="card border-0 shadow-lg rounded-16 overflow-hidden h-100 bg-main-600 text-white position-relative">
              <div className="card-body p-40 d-flex flex-column align-items-center justify-content-center">
                <h1 className="mb-24 text-white text-capitalize" style={{ fontSize: '3rem', fontWeight: '700' }}>
                  {currentWord}
                </h1>
                
                <div className="text-center">
                  <div className="mb-16">
                    <span className="badge bg-white bg-opacity-25 text-white px-20 py-10 rounded-pill">
                      English Word
                    </span>
                  </div>
                  <p className="text-white-75 text-sm mb-0">Practice pronunciation and spelling</p>
                </div>
              </div>

              {/* Back instruction - Compact at bottom */}
              <div className="position-absolute bottom-0 start-0 end-0 text-center pb-12 pt-8">
                <p className="text-xs text-white-75 mb-0">
                  <i className="fas fa-hand-pointer text-white-50 me-1" style={{ fontSize: '12px' }}></i>
                  Click để lật lại
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Navigation */}
      <div className="d-flex align-items-center justify-content-between mb-24">
        <button 
          className="btn btn-outline-main rounded-pill"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <i className="fas fa-chevron-left me-2"></i>
          Từ trước
        </button>

        <div className="text-center">
          <p className="text-sm text-neutral-600 mb-4">
            Thẻ {currentIndex + 1} / {totalWords}
          </p>
          <div className="d-flex gap-8 justify-content-center flex-wrap">
            {words.map((word, index) => (
              <button
                key={index}
                className={`btn btn-sm ${
                  index === currentIndex ? 'btn-main' :
                  learnedWords.has(word) ? 'btn-success' :
                  'btn-outline-neutral'
                } rounded-circle p-0 d-flex align-items-center justify-content-center`}
                style={{ 
                  width: '60px', 
                  height: '60px',    
                  minWidth: '50px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  lineHeight: '1'
                }}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsFlipped(false);
                }}
                title={`${word} ${learnedWords.has(word) ? '(Đã học)' : ''}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        <button 
          className="btn btn-outline-main rounded-pill"
          onClick={handleNext}
          disabled={currentIndex === totalWords - 1}
        >
          Từ sau
          <i className="fas fa-chevron-right ms-2"></i>
        </button>
      </div>

      {/* Actions */}
      <div className="row g-12 mb-24">
        <div className="col-md-6">
          <button 
            className="btn btn-outline-success rounded-pill w-100"
            onClick={handleMarkLearned}
            disabled={learnedWords.has(currentWord)}
          >
            <i className="fas fa-check me-2"></i>
            {learnedWords.has(currentWord) ? 'Đã đánh dấu' : 'Đánh dấu đã học'}
          </button>
        </div>
        <div className="col-md-6">
          <button 
            className="btn btn-outline-warning rounded-pill w-100"
            onClick={() => {
              const newLearned = new Set(learnedWords);
              newLearned.delete(currentWord);
              setLearnedWords(newLearned);
            }}
            disabled={!learnedWords.has(currentWord)}
          >
            <i className="fas fa-redo me-2"></i>
            Học lại từ này
          </button>
        </div>
      </div>

      {/* Complete Button */}
      <div className="card border-0 bg-main-50 rounded-12">
        <div className="card-body p-20">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-12">
              <i className={`fas ${isCompleted ? 'fa-check-circle text-success-600' : 'fa-info-circle text-main-600'}`}></i>
              <div>
                <p className="mb-0 fw-medium">
                  {isCompleted ? 'Bạn đã hoàn thành phần từ vựng' : `Học ${totalWords - learnedWords.size} từ còn lại để hoàn thành`}
                </p>
                <p className="text-xs text-neutral-600 mb-0">
                  {isCompleted ? 'Bạn có thể ôn lại bất cứ lúc nào' : 'Hãy đánh dấu tất cả các từ đã học'}
                </p>
              </div>
            </div>
            
            <button 
              className={`btn ${isCompleted ? 'btn-outline-success' : learnedWords.size === totalWords ? 'btn-success' : 'btn-neutral-200'} rounded-pill`}
              onClick={handleComplete}
              disabled={learnedWords.size < totalWords || isCompleted}
            >
              {isCompleted ? (
                <>
                  <i className="fas fa-check-double me-2"></i>
                  Đã hoàn thành
                </>
              ) : (
                <>
                  <i className="fas fa-check me-2"></i>
                  Hoàn thành ({learnedWords.size}/{totalWords})
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-20">
        <div className="alert alert-info border-0 rounded-12">
          <div className="d-flex gap-12">
            <i className="fas fa-lightbulb"></i>
            <div>
              <h6 className="mb-8">Hướng dẫn học flashcard</h6>
              <ul className="mb-0 ps-3">
                <li className="text-sm mb-4">Click vào thẻ để lật và xem từ vựng</li>
                <li className="text-sm mb-4">Mặt trước: Hình ảnh + Từ tiếng Anh</li>
                <li className="text-sm mb-4">Mặt sau: Từ tiếng Anh (luyện phát âm và viết)</li>
                <li className="text-sm">Đánh dấu "Đã học" sau khi nhớ được từ</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for flip animation */}
      <style jsx>{`
        .flashcard-wrapper {
          perspective: 1000px;
          min-height: 500px;
        }

        .flashcard {
          position: relative;
          width: 100%;
          height: 500px;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }

        .flashcard.flipped {
          transform: rotateY(180deg);
        }

        .flashcard-side {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .flashcard-back {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

export default VocabularyFlashcard;
