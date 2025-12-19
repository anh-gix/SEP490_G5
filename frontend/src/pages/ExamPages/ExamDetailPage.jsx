import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import examService from "../../services/examService";


const ExamDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startingExam, setStartingExam] = useState(false);

  // Tính submission hiện tại từ submissions và selectedSubmissionId
  const submission = useMemo(() => {
    if (!selectedSubmissionId || submissions.length === 0) return null;
    return submissions.find(sub => sub._id === selectedSubmissionId) || null;
  }, [submissions, selectedSubmissionId]);

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

  // Fetch submissions history after exam is loaded
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!exam || !id) return;
      
      try {
        // Fetch all submissions for this exam
        const result = await examService.getExamSubmissions(id);
        if (result.submissions && result.submissions.length > 0) {
          setSubmissions(result.submissions);
          // Set the latest submission as default
          setSelectedSubmissionId(result.submissions[0]._id);
        } else {
          // If no submissions, try to get/create one by calling startExam
          const startResult = await examService.startExam(id);
          if (startResult.submission) {
            setSubmissions([startResult.submission]);
            setSelectedSubmissionId(startResult.submission._id);
          }
        }
      } catch (err) {
        // If error (e.g., not authenticated), submission will remain null
        console.log('No submission found or not authenticated:', err);
      }
    };

    fetchSubmissions();
  }, [exam, id]);

  // Handle submission selection from dropdown
  const handleSubmissionChange = (submissionId) => {
    setSelectedSubmissionId(submissionId);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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


  // Calculate progress based on submission
  const progress = useMemo(() => {
    if (!submission || !exam || !exam.sections) return 0;
    
    const totalSections = exam.sections.length;
    if (totalSections === 0) return 0;
    
    const submittedSections = submission.sections?.filter(
      (section) => section.submittedAt !== null && section.submittedAt !== undefined
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
      // Check if section is completed (user clicked "Làm lại")
      const isCompleted = isSectionCompleted(sectionType);
      
      // Only show loading spinner when NOT retrying (first time or continuing)
      if (!isCompleted) {
        setStartingExam(true);
      }
      
      // If no submission exists, create one by starting the exam
      if (!submission) {
        const result = await examService.startExam(id);
        if (result.submission) {
          setSubmissions([result.submission]);
          setSelectedSubmissionId(result.submission._id);
          navigate(`/exams/${id}/submissions/${result.submission._id}/${sectionType}`);
        } else {
          throw new Error('Không thể tạo bài làm');
        }
      } else if (isCompleted) {
        // If section is completed, create a new submission for retry
        const result = await examService.createNewSubmission(id);
        if (result.submission) {
          // Refresh submissions list and set new submission as selected
          const submissionsResult = await examService.getExamSubmissions(id);
          if (submissionsResult.submissions) {
            setSubmissions(submissionsResult.submissions);
            setSelectedSubmissionId(result.submission._id);
          } else {
            setSubmissions([result.submission]);
            setSelectedSubmissionId(result.submission._id);
          }
          navigate(`/exams/${id}/submissions/${result.submission._id}/${sectionType}`);
        } else {
          throw new Error('Không thể tạo bài làm mới');
        }
      } else {
        // If submission exists and section not completed, navigate directly
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
            {/* Title and Submission History Dropdown */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-40 gap-16">
              <h1 className="mb-0 text-neutral-900">{exam.title}</h1>
              
              {/* Submission History Dropdown */}
              {submissions.length > 0 && (
                <div 
                  className="d-flex flex-align gap-12"
                  style={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <div className="d-flex flex-align gap-8">
                    <div 
                      className="flex-center rounded-8"
                      style={{
                        width: '36px',
                        height: '36px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      }}
                    >
                      <i className="ph ph-clock-clockwise text-white text-lg" />
                    </div>
                    <div>
                      <label 
                        className="text-neutral-700 fw-semibold d-block mb-4" 
                        style={{ 
                          whiteSpace: 'nowrap',
                          fontSize: '13px',
                          color: '#64748b'
                        }}
                      >
                        Lịch sử làm bài
                      </label>
                      <div className="position-relative">
                        <select
                          value={selectedSubmissionId || ''}
                          onChange={(e) => handleSubmissionChange(e.target.value)}
                          style={{
                            minWidth: '320px',
                            padding: '10px 40px 10px 16px',
                            border: '2px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            backgroundColor: '#fff',
                            cursor: 'pointer',
                            fontWeight: '500',
                            color: '#1e293b',
                            appearance: 'none',
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364758b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 12px center',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#3b82f6';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e2e8f0';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#3b82f6';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                            e.currentTarget.style.outline = 'none';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = '#e2e8f0';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          {submissions.map((sub, index) => {
                            const statusConfig = {
                              'completed': { text: 'Hoàn thành', color: '#10b981', bg: '#d1fae5' },
                              'partially-submitted': { text: 'Đã nộp một phần', color: '#f59e0b', bg: '#fef3c7' },
                              'in-progress': { text: 'Đang làm', color: '#3b82f6', bg: '#dbeafe' },
                            };
                            const status = statusConfig[sub.status] || { text: '', color: '', bg: '' };
                            
                            return (
                              <option key={sub._id} value={sub._id}>
                                Lần {submissions.length - index} • {formatDate(sub.createdAt)} 
                                {status.text ? ` • ${status.text}` : ''}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

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

                      {/* Xem kết quả Button - Only show when section is completed */}
                      {isCompleted && (
                        <button
                          className="btn py-12 rounded-8 fw-semibold transition-2 flex-center gap-8"
                          style={{
                            width: "100%",
                            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                            border: "none",
                            color: "#fff",
                          }}
                          onClick={() => {
                            if (submission && submission._id) {
                              navigate(`/student/exams/${id}/submissions/${submission._id}/${sectionType}/result`);
                            }
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)";
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.4)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)";
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          <i className="ph ph-eye" />
                          Xem kết quả
                        </button>
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

export default ExamDetailPage;

