import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import { examService } from "../../services/examService";
import { useAuth } from "../../contexts/AuthContext";

const ListeningResultPage = () => {
  const { examId, submissionId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [result, setResult] = useState(null);
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leftWidth, setLeftWidth] = useState(50);
  const containerRef = useRef(null);
  const isResizingRef = useRef(false);
  const [selectedBandScore, setSelectedBandScore] = useState(null);

  useEffect(() => {
    // Đợi auth context hoàn thành việc check authentication
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/sign-in");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [resultData, examInfo] = await Promise.all([
          examService.getListeningResult(examId, submissionId),
          examService.getExamById(examId)
        ]);
        setResult(resultData);
        setExamData(examInfo);
        setError(null);
      } catch (err) {
        setError(err.message || "Không thể tải kết quả");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [examId, submissionId, isAuthenticated, authLoading, navigate]);

  const getScorePercentage = () => {
    if (!result || !result.maxScore) return 0;
    return Math.round((result.sectionScore / result.maxScore) * 100);
  };

  const getCorrectAnswersCount = () => {
    if (!result || !result.parts) return 0;
    let correctCount = 0;
    result.parts.forEach(part => {
      if (part.results) {
        part.results.forEach(item => {
          if (item.isCorrect) {
            correctCount++;
          }
        });
      }
    });
    return correctCount;
  };

  const getTotalQuestionsCount = () => {
    if (!examData || !examData.sections) return 0;
    const listeningSections = examData.sections.filter(s => s.type === "listening");
    return listeningSections.reduce((sum, s) => sum + (s.questionCount || 0), 0);
  };

  const getTotalMaxScore = () => {
    if (!examData || !examData.sections) return result?.maxScore || 0;
    const listeningSections = examData.sections.filter(s => s.type === "listening");
    return listeningSections.reduce((sum, section) => {
      return sum + (section.maxScore || 0);
    }, 0);
  };

  const getScoreColor = () => {
    const percentage = getScorePercentage();
    if (percentage >= 80) return "success";
    if (percentage >= 60) return "warning";
    return "danger";
  };

  const getAnswerText = (answerKey, questionAnswer) => {
    if (!answerKey || !questionAnswer || questionAnswer.length === 0) {
      return answerKey || "";
    }
    
    // Nếu answerKey là array, xử lý từng phần tử
    if (Array.isArray(answerKey)) {
      return answerKey.map(key => {
        const option = questionAnswer.find(opt => opt.key === key);
        return option ? `${option.key}. ${option.text}` : key;
      }).join(", ");
    }
    
    // Nếu answerKey là string, tìm text tương ứng
    const option = questionAnswer.find(opt => opt.key === answerKey);
    return option ? `${option.key}. ${option.text}` : answerKey;
  };

  // Hàm lấy tất cả các listening part numbers từ examData
  const getAllListeningParts = () => {
    if (!examData?.sections) return [];
    const listeningSections = examData.sections.filter(s => s.type === "listening");
    return listeningSections
      .map(s => s.part || 1)
      .filter((part, index, self) => self.indexOf(part) === index) // Remove duplicates
      .sort((a, b) => a - b);
  };

  // Hàm merge tất cả câu hỏi từ examData với kết quả từ result
  const getAllQuestionsForPart = (partNumber) => {
    if (!examData?.sections) return [];
    
    // Lấy section tương ứng với part
    const section = examData.sections.find(
      s => s.type === "listening" && (s.part || 1) === partNumber
    );
    
    if (!section || !section.answerKey) return [];
    
    // Lấy kết quả đã làm cho part này (nếu có)
    const partResult = result?.parts?.find(p => p.part === partNumber);
    const answeredQuestions = partResult?.results || [];
    
    // Tạo map để tra cứu nhanh câu đã trả lời
    const answeredMap = new Map();
    answeredQuestions.forEach(item => {
      answeredMap.set(item.questionNumber, item);
    });
    
    // Merge tất cả câu hỏi từ answerKey với kết quả đã làm
    return section.answerKey.map(answerKeyItem => {
      const answeredItem = answeredMap.get(answerKeyItem.questionNumber);
      
      if (answeredItem) {
        // Câu đã được trả lời
        return answeredItem;
      } else {
        // Câu chưa được trả lời
        return {
          questionNumber: answerKeyItem.questionNumber,
          questionTitle: answerKeyItem.questionTitle || "",
          questionAnswer: answerKeyItem.questionAnswer || [],
          studentAnswer: null,
          correctAnswer: Array.isArray(answerKeyItem.correctAnswer) 
            ? answerKeyItem.correctAnswer 
            : [answerKeyItem.correctAnswer || ""],
          score: 0,
          maxScore: answerKeyItem.maxScore || 1,
          isCorrect: false,
        };
      }
    }).sort((a, b) => a.questionNumber - b.questionNumber);
  };

  // Band Score mapping (hardcoded)
  const bandScoreData = {
    9: { correctAnswers: "39-40", skillLevel: "Expert user", description: "You have a full operational command of the language. Your use of English is appropriate, accurate and fluent, and you show complete understanding." },
    8.5: { correctAnswers: "37-38", skillLevel: "Very good user", description: "You have a fully operational command of the language with only occasional unsystematic inaccuracies and inappropriacies. Misunderstandings may occur in unfamiliar situations. You handle complex detailed argumentation well." },
    8: { correctAnswers: "35-36", skillLevel: "Very good user", description: "You have a fully operational command of the language with only occasional unsystematic inaccuracies and inappropriacies. Misunderstandings may occur in unfamiliar situations. You handle complex detailed argumentation well." },
    7.5: { correctAnswers: "33-34", skillLevel: "Good user", description: "You have an operational command of the language, though with occasional inaccuracies, inappropriacies and misunderstandings in some situations. Generally you handle complex language well and understand detailed reasoning." },
    7: { correctAnswers: "30-32", skillLevel: "Good user", description: "You have an operational command of the language, though with occasional inaccuracies, inappropriacies and misunderstandings in some situations. Generally you handle complex language well and understand detailed reasoning." },
    6.5: { correctAnswers: "27-29", skillLevel: "Competent user", description: "Generally you have an effective command of the language despite inaccuracies, inappropriacies and misunderstandings. You can use and understand fairly complex language, particularly in familiar situations." },
    6: { correctAnswers: "23-26", skillLevel: "Competent user", description: "Generally you have an effective command of the language despite inaccuracies, inappropriacies and misunderstandings. You can use and understand fairly complex language, particularly in familiar situations." },
    5.5: { correctAnswers: "20-22", skillLevel: "Modest user", description: "You have a partial command of the language, and cope with overall meaning in most situations, though you are likely to make many mistakes. You should be able to handle basic communication in your own field." },
    5: { correctAnswers: "16-19", skillLevel: "Modest user", description: "You have a partial command of the language, and cope with overall meaning in most situations, though you are likely to make many mistakes. You should be able to handle basic communication in your own field." },
    4.5: { correctAnswers: "13-15", skillLevel: "Limited user", description: "Your basic competence is limited to familiar situations. You frequently show problems in understanding and expression. You are not able to use complex language." },
    4: { correctAnswers: "10-12", skillLevel: "Limited user", description: "Your basic competence is limited to familiar situations. You frequently show problems in understanding and expression. You are not able to use complex language." },
    3.5: { correctAnswers: "7-9", skillLevel: "Extremely limited user", description: "You convey and understand only general meaning in very familiar situations. There are frequent breakdowns in communication." },
    3: { correctAnswers: "4-6", skillLevel: "Extremely limited user", description: "You convey and understand only general meaning in very familiar situations. There are frequent breakdowns in communication." }
  };

  const getBandScore = () => {
    if (!result || !result.maxScore || result.maxScore === 0) return null;
    const correctAnswers = getCorrectAnswersCount();
    
    // Map correct answers to band score
    if (correctAnswers >= 39) return 9;
    if (correctAnswers >= 37) return 8.5;
    if (correctAnswers >= 35) return 8;
    if (correctAnswers >= 33) return 7.5;
    if (correctAnswers >= 30) return 7;
    if (correctAnswers >= 27) return 6.5;
    if (correctAnswers >= 23) return 6;
    if (correctAnswers >= 20) return 5.5;
    if (correctAnswers >= 16) return 5;
    if (correctAnswers >= 13) return 4.5;
    if (correctAnswers >= 10) return 4;
    if (correctAnswers >= 7) return 3.5;
    return 3;
  };

  const getPDFUrl = (part) => {
    if (!examData?.sections) return null;
    const listeningSections = examData.sections.filter(s => s.type === "listening");
    if (listeningSections.length === 0) return null;
    
    // If part is specified, find that part, otherwise use first part
    const listeningSection = part 
      ? listeningSections.find(s => (s.part || 1) === part)
      : listeningSections[0];
    
    if (!listeningSection?.fileUrl) return null;
    
    if (listeningSection.fileUrl.startsWith("http")) {
      return listeningSection.fileUrl;
    }
    if (listeningSection.fileUrl.startsWith("/")) {
      const API_PORT = import.meta.env.VITE_API_PORT;
      return `http://localhost:${API_PORT}${listeningSection.fileUrl}`;
    }
    const API_PORT = import.meta.env.VITE_API_PORT;
    return `http://localhost:${API_PORT}/uploads/${listeningSection.fileUrl}`;
  };

  const getAudioUrl = (part) => {
    if (!examData?.sections) return null;
    const listeningSections = examData.sections.filter(s => s.type === "listening");
    if (listeningSections.length === 0) return null;
    
    // If part is specified, find that part, otherwise use first part
    const listeningSection = part 
      ? listeningSections.find(s => (s.part || 1) === part)
      : listeningSections[0];
    
    if (!listeningSection?.audioUrl) return null;
    
    if (listeningSection.audioUrl.startsWith("http")) {
      return listeningSection.audioUrl;
    }
    if (listeningSection.audioUrl.startsWith("/")) {
      const API_PORT = import.meta.env.VITE_API_PORT;
      return `http://localhost:${API_PORT}${listeningSection.audioUrl}`;
    }
    const API_PORT = import.meta.env.VITE_API_PORT;
    return `http://localhost:${API_PORT}/uploads/${listeningSection.audioUrl}`;
  };

  // Resize handlers
  const handleMouseMove = useCallback((e) => {
    if (!isResizingRef.current || !containerRef.current) return;
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    // Limit between 20% and 80%
    const clampedWidth = Math.max(20, Math.min(80, newLeftWidth));
    setLeftWidth(clampedWidth);
  }, []);

  const handleMouseUp = useCallback(() => {
    isResizingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, [handleMouseMove]);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    isResizingRef.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [handleMouseMove, handleMouseUp]);

  // Cleanup resize listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Initialize selected band score when result changes
  useEffect(() => {
    if (result && result.maxScore > 0) {
      const bandScore = getBandScore();
      if (bandScore !== null) {
        setSelectedBandScore(bandScore);
      }
    }
  }, [result]);

  if (authLoading || loading) {
    return (
      <>
   
        <div className='text-center py-80'>
          <div className='spinner-border text-main-600' role='status'>
            <span className='visually-hidden'>Loading...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
  
     

      <section className='pt-40 pb-120'>
        <div className='container'>
          {error ? (
            <div className='alert alert-danger rounded-12 p-16 mb-24 text-13' role='alert'>
              <i className='ph ph-warning me-6' />
              {error}
            </div>
          ) : result ? (
            <>
              {/* Section Heading */}
              <div className='section-heading text-center mb-24'>
                <div className='flex-align d-inline-flex gap-8 mb-12'>
                  <span className='text-main-600 text-16 d-flex'>
                    <i className='ph-bold ph-headphones' />
                  </span>
                  <h6 className='text-main-600 mb-0 text-14'>Kết quả thi</h6>
                </div>
                <h4 className='mb-12 text-20'>Kết quả phần Listening</h4>
                {result.submittedAt && (
                  <p className='text-neutral-600 mb-0 text-13'>
                    <i className='ph ph-clock me-6' />
                    Nộp bài lúc: {new Date(result.submittedAt).toLocaleString("vi-VN")}
                  </p>
                )}
              </div>

              {/* Score Summary */}
              <div className='row gy-3 mb-24'>
                <div className='col-md-4'>
                  <div className='bg-white box-shadow-md rounded-12 p-20 border border-neutral-30 text-center h-100'>
                    <div className='w-48 h-48 flex-center bg-main-25 text-main-600 text-20 rounded-circle mx-auto mb-12'>
                      <i className='ph-bold ph-check-circle' />
                    </div>
                    <p className='text-neutral-600 text-13 mb-6 fw-medium'>Điểm số</p>
                    <h5 className={`text-${getScoreColor()}-600 mb-0 fw-bold text-18`}>
                      {result.sectionScore} / {getTotalMaxScore()}
                    </h5>
                  </div>
                </div>
                <div className='col-md-4'>
                  <div className='bg-white box-shadow-md rounded-12 p-20 border border-neutral-30 text-center h-100'>
                    <div className='w-48 h-48 flex-center bg-main-25 text-main-600 text-20 rounded-circle mx-auto mb-12'>
                      <i className='ph-bold ph-percent' />
                    </div>
                    <p className='text-neutral-600 text-13 mb-6 fw-medium'>Tỷ lệ đúng</p>
                    <h5 className={`text-${getScoreColor()}-600 mb-0 fw-bold text-18`}>
                      {getScorePercentage()}%
                    </h5>
                  </div>
                </div>
                <div className='col-md-4'>
                  <div className='bg-white box-shadow-md rounded-12 p-20 border border-neutral-30 text-center h-100'>
                    <div className='w-48 h-48 flex-center bg-main-25 text-main-600 text-20 rounded-circle mx-auto mb-12'>
                      <i className='ph-bold ph-check-circle' />
                    </div>
                    <p className='text-neutral-600 text-13 mb-6 fw-medium'>Số câu đúng</p>
                    <h5 className='text-main-600 mb-0 fw-bold text-18'>
                      {getCorrectAnswersCount()} / {getTotalQuestionsCount()}
                    </h5>
                  </div>
                </div>
              </div>

              {/* Band Score Section */}
              {result.maxScore > 0 && (() => {
                const currentBandScore = getBandScore();
                const bandScores = [9, 8.5, 8, 7.5, 7, 6.5, 6, 5.5, 5, 4.5, 4, 3.5, 3];
                const displayBandScore = selectedBandScore !== null ? selectedBandScore : currentBandScore;
                return (
                  <div className="bg-white rounded-12 p-20 mb-24 border border-neutral-30 box-shadow-sm">
                    <div className="flex-align gap-8 mb-16">
                      <span className="text-main-600 text-16">
                        <i className="ph-bold ph-medal" />
                      </span>
                      <h5 className="mb-0 text-16">Band Score</h5>
                    </div>
                    
                    {/* Band Score Scale */}
                    <div className="mb-16">
                      <p className="text-neutral-600 text-13 mb-8 text-center fw-medium">
                        Band Score của bạn: {currentBandScore !== null ? <span className="fw-bold text-main-600">{currentBandScore}</span> : "N/A"}
                      </p>
                      <div className="d-flex flex-wrap gap-6 justify-content-center align-items-center">
                        {bandScores.map((band) => {
                          const isCurrentBand = currentBandScore === band;
                          const isSelectedBand = selectedBandScore === band;
                          const isDisplayBand = displayBandScore === band;
                          
                          let className = "fw-semibold text-main-600 bg-transparent border-neutral-30";
                          if (isCurrentBand && isSelectedBand) {
                            // Band của người dùng và đang được chọn
                            className = "bg-main-600 text-white border-main-600";
                          } else if (isCurrentBand) {
                            // Band của người dùng (nhưng không được chọn)
                            className = "bg-main-25 text-main-600 border-main-600";
                          } else if (isSelectedBand || isDisplayBand) {
                            // Band được chọn (không phải của người dùng)
                            className = "bg-main-600 text-white border-main-600";
                          }
                          
                          return (
                            <span
                              key={band}
                              onClick={() => setSelectedBandScore(band)}
                              className={className}
                              style={{
                                fontSize: "14px",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                border: "2px solid",
                                display: "inline-block"
                              }}
                              onMouseEnter={(e) => {
                                if (!isCurrentBand && !isSelectedBand) {
                                  e.target.style.backgroundColor = "var(--main-25)";
                                  e.target.style.borderColor = "var(--main-600)";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isCurrentBand && !isSelectedBand) {
                                  e.target.style.backgroundColor = "transparent";
                                  e.target.style.borderColor = "var(--neutral-30)";
                                }
                              }}
                            >
                              {band}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Band Score Details */}
                    {displayBandScore && bandScoreData[displayBandScore] && (
                      <div className={`border-top border-neutral-30 pt-16 px-16 pb-16 ${
                        selectedBandScore === displayBandScore 
                          ? (currentBandScore === displayBandScore 
                              ? "bg-main-25 border-main-600" 
                              : "bg-success-25 border-main-600")
                          : ""
                      }`} style={{
                        borderRadius: "8px",
                        borderWidth: selectedBandScore === displayBandScore ? "2px" : "1px",
                        borderStyle: "solid",
                        transition: "all 0.2s ease"
                      }}>
                        <div className="row gy-2">
                          <div className="col-md-4">
                            <div className="border-bottom border-neutral-30 pb-8 px-4">
                              <p className="text-neutral-600 text-12 mb-2 fw-semibold">Correct Answers:</p>
                              <p className="text-neutral-700 mb-0 fw-medium text-13">{bandScoreData[displayBandScore].correctAnswers}</p>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="border-bottom border-neutral-30 pb-8 px-4">
                              <p className="text-neutral-600 text-12 mb-2 fw-semibold">Skill Level:</p>
                              <p className="text-neutral-700 mb-0 fw-medium text-13">{bandScoreData[displayBandScore].skillLevel}</p>
                            </div>
                          </div>
                          <div className="col-md-12">
                            <div className="pt-8 px-4">
                              <p className="text-neutral-600 text-12 mb-2 fw-semibold">Description:</p>
                              <p className="text-neutral-700 mb-0 text-13" style={{ lineHeight: "1.6" }}>
                                {bandScoreData[displayBandScore].description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* PDF and Results Layout */}
              <style>{`
                .resizable-container {
                  display: flex;
                  position: relative;
                  width: 100%;
                  height: calc(100vh - 350px);
                  min-height: 700px;
                  max-height: 900px;
                  border: 1px solid var(--neutral-30);
                  border-radius: 12px;
                  overflow: hidden;
                  background: white;
                }
                .resizable-panel {
                  overflow: hidden;
                  display: flex;
                  flex-direction: column;
                  height: 100%;
                }
                .resizable-panel-content {
                  flex: 1;
                  overflow: auto;
                  display: flex;
                  flex-direction: column;
                }
                .resizer {
                  width: 4px;
                  background: var(--neutral-30);
                  cursor: col-resize;
                  flex-shrink: 0;
                  position: relative;
                  height: 100%;
                }
                .resizer:hover {
                  background: var(--main-600);
                }
                .resizer::before {
                  content: '';
                  position: absolute;
                  left: -2px;
                  right: -2px;
                  top: 0;
                  bottom: 0;
                }
              `}</style>
              <div className="resizable-container mb-40" ref={containerRef}>
                {/* Left side - PDF Viewer */}
                {result.parts && result.parts.length > 0 && getPDFUrl(result.parts[0].part) && (
                  <>
                    <div
                      className="resizable-panel bg-white border-end border-neutral-30"
                      style={{ width: `${leftWidth}%` }}
                    >
                      <div className="p-16 border-bottom border-neutral-30 flex-shrink-0">
                        <h5 className="mb-0 text-16">Đề thi Listening</h5>
                      </div>
                      <div className="resizable-panel-content p-16">
                        <iframe
                          src={getPDFUrl(result.parts[0].part)}
                          className="w-100 h-100 border-0 rounded-8"
                          title="Listening PDF"
                          style={{ 
                            minHeight: "100%",
                            display: "block",
                            width: "100%"
                          }}
                        />
                      </div>
                    </div>

                    {/* Resizer Bar */}
                    <div 
                      className="resizer"
                      onMouseDown={handleMouseDown}
                      role="separator"
                      aria-label="Resize panels"
                      aria-orientation="vertical"
                    />

                    {/* Right side - Results */}
                    <div
                      className="resizable-panel bg-main-25"
                      style={{ width: `${100 - leftWidth}%` }}
                    >
                      <div className="p-16 border-bottom border-neutral-30 bg-white flex-shrink-0">
                        <div className='flex-align gap-8'>
                          <span className='text-main-600 text-16'>
                            <i className='ph-bold ph-list-bullets' />
                          </span>
                          <h5 className="mb-0 text-16">Chi tiết đáp án</h5>
                        </div>
                      </div>
                      <div className="resizable-panel-content p-12">
                        {(() => {
                          const allParts = getAllListeningParts();
                          return allParts.map((partNumber, partIndex) => {
                            const allQuestions = getAllQuestionsForPart(partNumber);
                            if (allQuestions.length === 0) return null;
                            return (
                              <div key={partIndex} className="mb-16">
                                <div className="mb-12">
                                  <h6 className="text-main-600 fw-semibold text-14">Part {partNumber}</h6>
                                </div>
                              <div className='row gy-2'>
                                {allQuestions.map((item, index) => {
                                  const isAnswered = item.studentAnswer !== null && item.studentAnswer !== undefined;
                                  const isUnanswered = !isAnswered;
                                  return (
                                    <div key={index} className='col-12'>
                                      <div
                                        className={`rounded-8 p-10 border ${
                                          isUnanswered
                                            ? "border-warning bg-warning-25"
                                            : item.isCorrect
                                            ? "border-success bg-success-25"
                                            : "border-danger bg-danger-25"
                                        }`}
                                      >
                                        <div className='flex-between gap-6 mb-6 flex-wrap'>
                                          <div className='flex-align gap-6'>
                                            <span className='fw-semibold text-neutral-700 text-13'>
                                              Câu {item.questionNumber}: {item.questionTitle && (
                                                <div className='mb-6'>
                                                  <p className='text-neutral-700 fw-semibold mb-0 text-13'>{item.questionTitle}</p>
                                                </div>
                                              )}
                                            </span>
                                          </div>
                                          {isUnanswered ? (
                                            <span className='badge bg-warning text-white px-8 py-2 rounded-8 text-11'>
                                              <i className='ph ph-clock me-2' />
                                              Chưa làm
                                            </span>
                                          ) : item.isCorrect ? (
                                            <span className='badge bg-success text-white px-8 py-2 rounded-8 text-11'>
                                              <i className='ph ph-check-circle me-2' />
                                              Đúng
                                            </span>
                                          ) : (
                                            <span className='badge bg-danger text-white px-8 py-2 rounded-8 text-11'>
                                              <i className='ph ph-x-circle me-2' />
                                              Sai
                                            </span>
                                          )}
                                        </div>
                                        <div className='mb-0'>
                                          <p className='text-neutral-600 text-12 mb-3'>
                                            <span className='fw-semibold'>Đáp án của bạn:</span>
                                          </p>
                                          <div className={`bg-white rounded-6 p-8 border ${
                                            isUnanswered 
                                              ? "border-warning" 
                                              : item.isCorrect 
                                              ? "border-success" 
                                              : "border-danger"
                                          }`}>
                                            <p className={`mb-0 fw-medium text-13 ${
                                              isUnanswered
                                                ? "text-warning"
                                                : item.isCorrect 
                                                ? "text-success" 
                                                : "text-danger"
                                            }`}>
                                              {item.studentAnswer 
                                                ? getAnswerText(item.studentAnswer, item.questionAnswer)
                                                : "Chưa trả lời"}
                                            </p>
                                          </div>
                                          {(isUnanswered || !item.isCorrect) && item.correctAnswer && (
                                            <div className='mt-4'>
                                              <p className='text-neutral-600 text-12 mb-3'>
                                                <span className='fw-semibold'>Đáp án đúng:</span>
                                              </p>
                                              <div className='bg-success-25 rounded-6 p-8 border border-success'>
                                                <p className='mb-0 fw-medium text-success text-13'>
                                                  {getAnswerText(item.correctAnswer, item.questionAnswer)}
                                                </p>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </>
                )}

                {/* If no PDF, show results in full width */}
                {(!result.parts || result.parts.length === 0 || !getPDFUrl(result.parts[0]?.part)) && (
                  <div className="resizable-panel bg-white" style={{ width: "100%" }}>
                    <div className="p-16 border-bottom border-neutral-30 flex-shrink-0">
                      <div className='flex-align gap-8'>
                        <span className='text-main-600 text-16'>
                          <i className='ph-bold ph-list-bullets' />
                        </span>
                        <h5 className="mb-0 text-16">Chi tiết đáp án</h5>
                      </div>
                    </div>
                    <div className="resizable-panel-content p-12">
                      {(() => {
                        const allParts = getAllListeningParts();
                        return allParts.map((partNumber, partIndex) => {
                          const allQuestions = getAllQuestionsForPart(partNumber);
                          if (allQuestions.length === 0) return null;
                          return (
                            <div key={partIndex} className="mb-16">
                              <div className="mb-12">
                                <h6 className="text-main-600 fw-semibold text-14">Part {partNumber}</h6>
                              </div>
                            <div className='row gy-2'>
                              {allQuestions.map((item, index) => {
                                const isAnswered = item.studentAnswer !== null && item.studentAnswer !== undefined;
                                const isUnanswered = !isAnswered;
                                return (
                                  <div key={index} className='col-md-6 col-lg-4'>
                                    <div
                                      className={`rounded-8 p-10 border h-100 ${
                                        isUnanswered
                                          ? "border-warning bg-warning-25"
                                          : item.isCorrect
                                          ? "border-success bg-success-25"
                                          : "border-danger bg-danger-25"
                                      }`}
                                    >
                                      <div className='flex-between gap-6 mb-6'>
                                        <span className='fw-semibold text-neutral-700 text-13'>
                                          Câu {item.questionNumber}
                                        </span>
                                        {isUnanswered ? (
                                          <span className='badge bg-warning text-white px-8 py-2 rounded-8 text-11'>
                                            <i className='ph ph-clock me-2' />
                                            Chưa làm
                                          </span>
                                        ) : item.isCorrect ? (
                                          <span className='badge bg-success text-white px-8 py-2 rounded-8 text-11'>
                                            <i className='ph ph-check me-2' />
                                            Đúng
                                          </span>
                                        ) : (
                                          <span className='badge bg-danger text-white px-8 py-2 rounded-8 text-11'>
                                            <i className='ph ph-x me-2' />
                                            Sai
                                          </span>
                                        )}
                                      </div>
                                      {/* Question Title */}
                                      {item.questionTitle && (
                                        <div className='mb-6'>
                                          <p className='text-neutral-700 fw-semibold mb-0 text-12'>{item.questionTitle}</p>
                                        </div>
                                      )}

                                      <div className='mb-0'>
                                        <p className='text-neutral-600 text-12 mb-3'>
                                          <span className='fw-semibold'>Đáp án của bạn:</span>{" "}
                                          <span
                                            className={`fw-medium ${
                                              isUnanswered
                                                ? "text-warning"
                                                : item.isCorrect 
                                                ? "text-success" 
                                                : "text-danger"
                                            }`}
                                          >
                                            {item.studentAnswer 
                                              ? getAnswerText(item.studentAnswer, item.questionAnswer)
                                              : "Chưa trả lời"}
                                          </span>
                                        </p>
                                        {(isUnanswered || !item.isCorrect) && item.correctAnswer && (
                                          <p className='text-neutral-600 text-12 mb-0'>
                                            <span className='fw-semibold'>Đáp án đúng:</span>{" "}
                                            <span className='fw-medium text-success'>
                                              {getAnswerText(item.correctAnswer, item.questionAnswer)}
                                            </span>
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Feedback - Show feedback from all parts */}
              {result.parts?.some((part) => part.feedback) && (
                <div className='bg-warning-25 rounded-12 p-20 mb-24 border border-warning box-shadow-sm'>
                  <div className='flex-align gap-8 mb-12'>
                    <span className='text-warning-600 text-16'>
                      <i className='ph-bold ph-chat-circle-text' />
                    </span>
                    <h5 className='mb-0 text-16'>Nhận xét từ giáo viên</h5>
                  </div>
                  {result.parts.map((partData, index) => (
                    partData.feedback && (
                      <div key={index} className={index > 0 ? "mt-12 pt-12 border-top border-warning" : ""}>
                        {result.parts.length > 1 && (
                          <p className='fw-semibold text-warning-600 mb-6 text-13'>Part {partData.part}:</p>
                        )}
                        <p className='text-neutral-700 mb-0 text-13' style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                          {partData.feedback}
                        </p>
                      </div>
                    )
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className='text-center'>
                <Link
                  to={`/student/exams/${examId}`}
                  className='btn btn-main px-24 py-10 rounded-8 me-12 text-13'
                >
                  <i className='ph ph-arrow-left me-6' />
                  Quay lại bài thi
                </Link>
                <Link
                  to={'/student/practice-exams'}
                  className='btn btn-outline-main px-24 py-10 rounded-8 text-13'
                >
                  <i className='ph ph-list me-6' />
                  Danh sách bài thi
                </Link>
              </div>
            </>
          ) : null}
        </div>
      </section>

    </>
  );
};

export default ListeningResultPage;

