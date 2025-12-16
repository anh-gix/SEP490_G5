import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import examService from "../../services/examService";


const ExamDetailPage2 = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startingExam, setStartingExam] = useState(false);

  // Fetch exam data on component mount
  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        setError(null);
        const examData = await examService.getExamById(id);
        setExam(examData);
      } catch (err) {
        console.error('Error fetching exam:', err);
        setError(err.message || 'Không thể tải thông tin đề thi');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchExam();
    }
  }, [id]);

  // Fetch submission after exam is loaded
  useEffect(() => {
    const fetchSubmission = async () => {
      if (!exam || !id) return;
      
      try {
        // Try to get existing submission by calling startExam
        // This will return existing submission if available, or create new one
        const result = await examService.startExam(id);
        if (result.submission) {
          setSubmission(result.submission);
        }
      } catch (err) {
        // If error (e.g., not authenticated), submission will remain null
        console.log('No submission found or not authenticated:', err);
      }
    };

    fetchSubmission();
  }, [exam, id]);

  // Get section configuration
  const getSectionConfig = (type) => {
    switch (type) {
      case "listening":
        return {
          icon: "ph-headphones",
          name: "Listening",
          gradient: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
          bgColor: "rgba(6, 182, 212, 0.1)",
          iconColor: "#06b6d4",
        };
      case "reading":
        return {
          icon: "ph-file-text",
          name: "Reading",
          gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          bgColor: "rgba(16, 185, 129, 0.1)",
          iconColor: "#10b981",
        };
      case "writing":
        return {
          icon: "ph-pencil",
          name: "Writing",
          gradient: "linear-gradient(135deg, #f97316 0%, #c2410c 100%)",
          bgColor: "rgba(249, 115, 22, 0.1)",
          iconColor: "#f97316",
        };
      case "speaking":
        return {
          icon: "ph-microphone",
          name: "Speaking",
          gradient: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
          bgColor: "rgba(236, 72, 153, 0.1)",
          iconColor: "#ec4899",
        };
      default:
        return {
          icon: "ph-file",
          name: type,
          gradient: "linear-gradient(135deg, #6b7280 0%, #374151 100%)",
          bgColor: "rgba(107, 114, 128, 0.1)",
          iconColor: "#6b7280",
        };
    }
  };

  // Calculate total questions
  const getTotalQuestions = (exam) => {
    if (!exam || !exam.sections) return 0;
    return exam.sections.reduce(
      (total, section) => total + (section.questionCount || 0),
      0
    );
  };

  // Calculate progress based on submission
  const progress = useMemo(() => {
    if (!submission || !exam || !exam.sections) return 0;
    
    const totalSections = exam.sections.length;
    if (totalSections === 0) return 0;
    
    const submittedSections = submission.sections?.filter(
      (section) => section.submittedAt !== null
    ).length || 0;
    
    return Math.round((submittedSections / totalSections) * 100);
  }, [submission, exam]);

  // Check if a section is completed (has submittedAt)
  const isSectionCompleted = (sectionType) => {
    if (!submission || !submission.sections) return false;
    const sectionSubmission = submission.sections.find(
      (s) => s.sectionType === sectionType
    );
    return sectionSubmission?.submittedAt !== null && sectionSubmission?.submittedAt !== undefined;
  };

  const handleSectionClick = async (sectionType) => {
    try {
      setStartingExam(true);
      
      // If no submission exists, create one by starting the exam
      if (!submission) {
        const result = await examService.startExam(id);
        if (result.submission) {
          setSubmission(result.submission);
          navigate(`/exams/${id}/submissions/${result.submission._id}/${sectionType}`);
        } else {
          throw new Error('Không thể tạo bài làm');
        }
      } else {
        // If submission exists, navigate directly
        navigate(`/exams/${id}/submissions/${submission._id}/${sectionType}`);
      }
    } catch (err) {
      console.error('Error starting exam:', err);
      alert(err.message || 'Không thể bắt đầu làm bài. Vui lòng thử lại.');
    } finally {
      setStartingExam(false);
    }
  };


  // Show loading state
  if (loading) {
    return (
      <>

       
        <section className="py-120">
          <div className="container">
            <div className="text-center py-80">
              <div className="spinner-border text-main-600" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
              <p className="mt-16 text-neutral-600">Đang tải thông tin đề thi...</p>
            </div>
          </div>
        </section>
      
      </>
    );
  }

  // Show error state
  if (error || !exam) {
    return (
      <>
     
       
        <section className="py-120">
          <div className="container">
            <div className="text-center py-80">
              <div className="inline-flex flex-center w-80 h-80 rounded-circle bg-danger-25 mb-24">
                <i className="ph-bold ph-warning text-4xl text-danger" />
              </div>
              <h3 className="text-xl fw-semibold text-neutral-900 mb-16">
                {error ? 'Có lỗi xảy ra' : 'Không tìm thấy đề thi'}
              </h3>
              <p className="text-neutral-500 text-lg mb-24">
                {error || 'Đề thi không tồn tại hoặc đã bị xóa'}
              </p>
              <button
                onClick={() => navigate('/exams')}
                className="btn btn-main me-12"
              >
                Quay lại danh sách
              </button>
              {error && (
                <button
                  onClick={() => window.location.reload()}
                  className="btn btn-outline-main"
                >
                  Thử lại
                </button>
              )}
            </div>
          </div>
        </section>
    
      </>
    );
  }

  return (
    <>
   
     

      <section 
        className="py-120 position-relative"
        style={{
          background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #f0f9ff 50%, #e0f2fe 75%, #f0f9ff 100%)",
          backgroundSize: "400% 400%",
          animation: "gradientShift 15s ease infinite",
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative background elements */}
        <div 
          style={{
            position: "absolute",
            top: "-50%",
            right: "-10%",
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)",
            borderRadius: "50%",
            zIndex: 0,
          }}
        />
        <div 
          style={{
            position: "absolute",
            bottom: "-30%",
            left: "-5%",
            width: "500px",
            height: "500px",
            background: "radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)",
            borderRadius: "50%",
            zIndex: 0,
          }}
        />
        <style>{`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
        <div className="container position-relative" style={{ zIndex: 1 }}>
          {/* Main Card Container */}
          <div 
            className="bg-white rounded-16 p-32 border border-neutral-30 box-shadow-md"
            style={{
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(59, 130, 246, 0.08)",
              backdropFilter: "blur(10px)",
              position: "relative",
            }}
          >
            {/* Title */}
            <h1 className="mb-40 text-neutral-900">{exam.title}</h1>

            {/* Sections Grid - Group by section type */}
            <div className="row gy-4 mb-40">
              {(() => {
                // Group sections by type
                const sectionsByType = {};
                exam.sections?.forEach((section) => {
                  const type = section.type;
                  if (!sectionsByType[type]) {
                    sectionsByType[type] = [];
                  }
                  sectionsByType[type].push(section);
                });

                // Get unique section types
                const uniqueTypes = Object.keys(sectionsByType);

                return uniqueTypes.map((sectionType, index) => {
                  const config = getSectionConfig(sectionType);
                  const isCompleted = isSectionCompleted(sectionType);
                  const sectionsOfType = sectionsByType[sectionType];
                  const totalQuestions = sectionsOfType.reduce((sum, s) => sum + (s.questionCount || 0), 0);
                  const totalDuration = sectionsOfType.reduce((sum, s) => sum + (s.duration || 0), 0);
                  
                  return (
                    <div key={index} className="col-lg-3 col-md-6 col-sm-6">
                      <div
                        className="bg-white rounded-12 p-24 border border-neutral-30 box-shadow-sm transition-2 h-100 d-flex flex-column text-center"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = "";
                        }}
                      >
                        {/* Icon */}
                        <div
                          className="mb-16 flex-center rounded-12 mx-auto"
                          style={{
                            width: "64px",
                            height: "64px",
                            backgroundColor: config.bgColor,
                          }}
                        >
                          <i
                            className={`ph ${config.icon} text-3xl`}
                            style={{ color: config.iconColor }}
                          />
                        </div>

                        {/* Section Name */}
                        <h4 className="mb-16 text-neutral-900 text-center">
                          {config.name}
                        </h4>
                        
                        {/* Part count info */}
                        {sectionsOfType.length > 1 && (
                          <p className="text-neutral-600 text-sm mb-8">
                            {sectionsOfType.length} phần
                          </p>
                        )}

                      {/* Take Test / Làm lại Button */}
                      <button
                        className="btn py-12 rounded-8 text-white fw-semibold transition-2 mb-16 flex-center gap-8"
                        style={{
                          width: "100%",
                          background: isCompleted 
                            ? "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)"
                            : config.gradient,
                          border: "none",
                        }}
                        onClick={() => handleSectionClick(sectionType)}
                        disabled={startingExam}
                      >
                        {startingExam ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-8" />
                            Đang tải...
                          </>
                        ) : isCompleted ? (
                          <>
                            Làm lại
                            <i className="ph ph-arrow-counter-clockwise" />
                          </>
                        ) : (
                          <>
                            Làm Bài
                            <i className="ph ph-lightning" />
                          </>
                        )}
                      </button>

                      {/* Key and Document Icons - Only show when section is completed */}
                      {isCompleted && (
                        <div className="flex-center gap-8 justify-content-center">
                        
                          <i 
                            className="ph ph-file-text text-neutral-400 text-xl transition-2"
                            style={{
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                            }}
                            onClick={() => {
                              if (submission && submission._id) {
                                navigate(`/exams/${id}/submissions/${submission._id}/${sectionType}/result`);
                              }
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = "#3b82f6";
                              e.currentTarget.style.transform = "scale(1.2)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = "";
                              e.currentTarget.style.transform = "scale(1)";
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
                });
              })()}
            </div>
              
            {/* Full Test Section */}
            <div
              className="bg-main-25 rounded-12 p-24 border border-neutral-30 position-relative"
            >
              <div className="d-flex flex-wrap flex-center gap-16" style={{ justifyContent: "center", alignItems: "center" }}>
                {/* Icon and Label */}
                <div className="flex-align gap-12">
                  <div className="w-48 h-48 bg-main-600 rounded-12 flex-center text-white text-2xl">
                    <i className="ph ph-squares-four" />
                  </div>
                  <div>
                    <h4 className="mb-0 text-neutral-900">Full Test®</h4>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ width: "100%", maxWidth: "400px" }}>
                  <div
                    className="position-relative rounded-pill"
                    style={{
                      height: "24px",
                      backgroundColor: "#e5e7eb",
                      border: "1px solid #d1d5db",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      className="position-absolute rounded-pill transition-2"
                      style={{
                        top: 0,
                        left: 0,
                        height: "100%",
                        width: `${progress}%`,
                        background: "linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)",
                      }}
                    />
                    <div
                      className="position-absolute flex-center text-xs fw-semibold text-neutral-700"
                      style={{
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 1,
                      }}
                    >
                      {progress}%
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

     
    </>
  );
};

export default ExamDetailPage2;

