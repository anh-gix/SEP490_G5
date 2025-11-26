import { useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { examsMock } from "../../components/student_components/student_mockdata/examMockData";
import HeaderOne from "../../components/HomePageforStudent/HeaderOne";
import FooterOne from "../../components/FooterOne";
import Breadcrumb from "../../components/Breadcrumb";
import Animation from "../../helper/Animation";
import Preloader from "../../helper/Preloader";

const ExamDetailPage2 = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Find exam by ID from mock data
  const exam = useMemo(() => {
    return examsMock.find((e) => e._id === id);
  }, [id]);

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

  // Calculate progress (mock - can be replaced with real data)
  const progress = 0; // 0% progress

  const handleSectionClick = (sectionType,submissionId) => {
    // Navigate to section exam page
    // This will need to be updated when submission system is ready
    navigate(`/exams/${id}/submissions/${submissionId}/${sectionType}`);
  };

  const handleFullTestClick = () => {
    // Navigate to full test
    // This will need to be updated when submission system is ready
    navigate(`/exams/${id}/full-test`);
  };

  if (!exam) {
    return (
      <>
        <Preloader />
        <Animation />
        <HeaderOne />
        <Breadcrumb title={"Chi tiết đề thi"} />
        <section className="py-120">
          <div className="container">
            <div className="text-center py-80">
              <p className="text-neutral-500 text-lg">
                Không tìm thấy đề thi
              </p>
            </div>
          </div>
        </section>
        <FooterOne />
      </>
    );
  }

  return (
    <>
      <Preloader />
      <Animation />
      <HeaderOne />
      <Breadcrumb title={exam.title || "Chi tiết đề thi"} />

      <section className="py-120">
        <div className="container">
          {/* Main Card Container */}
          <div className="bg-white rounded-16 p-32 border border-neutral-30 box-shadow-md">
            {/* Title */}
            <h1 className="mb-40 text-neutral-900">{exam.title}</h1>

            {/* Sections Grid */}
            <div className="row gy-4 mb-40">
              {exam.sections?.map((section, index) => {
                const config = getSectionConfig(section.type);
                return (
                  <div key={index} className="col-lg-3 col-md-6 col-sm-6">
                    <div
                      className="bg-white rounded-12 p-24 border border-neutral-30 box-shadow-sm transition-2 h-100 d-flex flex-column text-center"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSectionClick(section.type)}
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

                      {/* Take Test Button */}
                      <button
                        className="btn py-12 rounded-8 text-white fw-semibold transition-2 mb-16 flex-center gap-8"
                        style={{
                          width: "100%",
                          background: config.gradient,
                          border: "none",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSectionClick(section.type,section.submissionId);
                        }}
                      >
                        Take Test
                        <i className="ph ph-lightning" />
                      </button>

                      {/* Key and Document Icons */}
                      <div className="flex-center gap-8 justify-content-center">
                        <i 
                          className="ph ph-key text-neutral-400 text-xl transition-2"
                          style={{
                            cursor: "pointer",
                            transition: "all 0.2s ease",
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
                        <i 
                          className="ph ph-file-text text-neutral-400 text-xl transition-2"
                          style={{
                            cursor: "pointer",
                            transition: "all 0.2s ease",
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
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Full Test Section */}
            <div
              className="bg-main-25 rounded-12 p-24 border border-neutral-30 position-relative"
              style={{ cursor: "pointer" }}
              onClick={handleFullTestClick}
            >
              <div className="d-flex flex-wrap flex-between gap-16">
                {/* Left: Icon and Label */}
                <div className="flex-align gap-12">
                  <div className="w-48 h-48 bg-main-600 rounded-12 flex-center text-white text-2xl">
                    <i className="ph ph-squares-four" />
                  </div>
                  <div>
                    <h4 className="mb-0 text-neutral-900">Full Test®</h4>
                  </div>
                </div>

                {/* Center: Progress Bar */}
                <div style={{ flex: "1 1 auto", maxWidth: "400px" }}>
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

                {/* Right: Start Button */}
                <button
                  className="btn btn-main px-24 py-12 rounded-pill fw-semibold transition-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFullTestClick();
                  }}
                >
                  Start
                  <i className="ph ph-lightning ms-8" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FooterOne />
    </>
  );
};

export default ExamDetailPage2;

