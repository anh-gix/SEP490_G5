import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import examService from "../../services/examService";


const StudentExamListPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [exams, setExams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch exams and submissions on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch exams
        const examsData = await examService.getAllExams();
        setExams(examsData || []);

        // Fetch submissions for each exam using getExamSubmissions
        if (examsData && examsData.length > 0) {
          try {
            const submissionsResponses = await Promise.all(
              examsData.map((exam) =>
                examService
                  .getExamSubmissions(exam._id)
                  .catch((err) => {
                    console.error(
                      `Error fetching submissions for exam ${exam._id}:`,
                      err
                    );
                    return null;
                  })
              )
            );

            const allSubmissions = submissionsResponses
              .filter((res) => res)
              .flatMap((res) => res.submissions || res);

            setSubmissions(allSubmissions || []);
          } catch (submissionError) {
            console.error("Error fetching submissions:", submissionError);
            setSubmissions([]);
          }
        } else {
          setSubmissions([]);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get submission status for an exam
  const getSubmissionStatus = (examId) => {
    const submission = submissions.find(
      (sub) => String(sub.examId) === String(examId)
    );
    return submission?.status || null;
  };

  // Filter exams based on search query, selected filter and status filter
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      // Filter by exam type
      const matchesFilter =
        selectedFilter === "all" || exam.examType === selectedFilter;

      // Filter by submission status
      const examStatus = getSubmissionStatus(exam._id);
      const matchesStatus =
        selectedStatusFilter === "all" ||
        (selectedStatusFilter === "completed" && examStatus === "completed") ||
        (selectedStatusFilter === "in-progress" && examStatus === "in-progress") ||
        (selectedStatusFilter === "not-started" && !examStatus);

      // Filter by search query (title or description)
      const matchesSearch =
        searchQuery === "" ||
        exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesStatus && matchesSearch;
    });
  }, [exams, submissions, searchQuery, selectedFilter, selectedStatusFilter]);

  // Count exams by type
  const examCounts = useMemo(() => {
    return {
      all: exams.length,
      ielts: exams.filter((exam) => exam.examType === "ielts").length,
      toeic: exams.filter((exam) => exam.examType === "toeic").length,
      cambridge: exams.filter((exam) => exam.examType === "cambridge")
        .length,
    };
  }, [exams]);

  // Count exams by status
  const statusCounts = useMemo(() => {
    return {
      all: exams.length,
      completed: exams.filter((exam) => {
        const submission = submissions.find(
          (sub) => String(sub.examId) === String(exam._id)
        );
        return submission?.status === "completed";
      }).length,
      "in-progress": exams.filter((exam) => {
        const submission = submissions.find(
          (sub) => String(sub.examId) === String(exam._id)
        );
        return submission?.status === "in-progress";
      }).length,
      "not-started": exams.filter((exam) => {
        const submission = submissions.find(
          (sub) => String(sub.examId) === String(exam._id)
        );
        return !submission;
      }).length,
    };
  }, [exams, submissions]);

  // Calculate total questions for an exam
  const getTotalQuestions = (exam) => {
    return exam.sections.reduce(
      (total, section) => total + (section.questionCount || 0),
      0
    );
  };

  // Get exam type badge color
  const getExamTypeBadgeColor = (examType) => {
    switch (examType) {
      case "ielts":
        return "bg-danger";
      case "toeic":
        return "bg-success";
      case "cambridge":
        return "bg-info";
      default:
        return "bg-main-600";
    }
  };

  // Get exam type label
  const getExamTypeLabel = (examType) => {
    switch (examType) {
      case "ielts":
        return "IELTS";
      case "toeic":
        return "TOEIC";
      case "cambridge":
        return "Cambridge";
      default:
        return examType;
    }
  };

  // Get unique section types from exam sections
  const getUniqueSectionTypes = (sections) => {
    if (!sections || sections.length === 0) return [];
    const uniqueTypes = [...new Set(sections.map(section => section.type))];
    return uniqueTypes;
  };

  // Get status badge color and label
  const getStatusBadge = (status) => {
    if (!status) return null;
    
    switch (status) {
      case "completed":
        return {
          label: "Đã hoàn thành",
          className: "bg-success"
        };
      case "in-progress":
        return {
          label: "Đang làm bài",
          className: "bg-warning"
        };
      default:
        return {
          label: status,
          className: "bg-secondary"
        };
    }
  };

  const filters = [
    { value: "all", label: "Tất cả", count: examCounts.all },
    { value: "ielts", label: "IELTS", count: examCounts.ielts },
    { value: "toeic", label: "TOEIC", count: examCounts.toeic },
    { value: "cambridge", label: "Cambridge", count: examCounts.cambridge },
  ];

  const statusFilters = [
    { value: "all", label: "Tất cả", count: statusCounts.all },
    { value: "completed", label: "Đã hoàn thành", count: statusCounts.completed },
    { value: "in-progress", label: "Đang làm bài", count: statusCounts["in-progress"] },
    { value: "not-started", label: "Chưa làm", count: statusCounts["not-started"] },
  ];

  // Show loading state
  if (loading) {
    return (
      <>
       
        <section className="course-grid-view py-120">
          <div className="container">
            <div className="text-center py-80">
              <div className="spinner-border text-main-600" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
              <p className="mt-16 text-neutral-600">Đang tải danh sách đề thi...</p>
            </div>
          </div>
        </section>
       
      </>
    );
  }

  // Show error state
  if (error) {
    return (
      <>
       
        <section className="course-grid-view py-120">
          <div className="container">
            <div className="text-center py-80">
              <div className="inline-flex flex-center w-80 h-80 rounded-circle bg-danger-25 mb-24">
                <i className="ph-bold ph-warning text-4xl text-danger" />
              </div>
              <h3 className="text-xl fw-semibold text-neutral-900 mb-16">
                Có lỗi xảy ra
              </h3>
              <p className="text-neutral-500 text-lg mb-24">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-main"
              >
                Thử lại
              </button>
            </div>
          </div>
        </section>
        
      </>
    );
  }

  return (
    <>
      <section className="course-grid-view pt-40 pb-120">
        <div className="container">
          {/* Header Section */}
          <div className="mb-40">
            <h1 className="mb-16">Danh sách đề thi</h1>
            <p className="text-neutral-600 text-lg">
              Tìm kiếm và lựa chọn đề thi phù hợp với bạn
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-40">
            <div className="position-relative" style={{ maxWidth: '42rem' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm đề thi theo tên hoặc mô tả..."
                className="common-input rounded-pill pe-64"
              />
              <button
                type="button"
                className="flex-center w-44 h-44 rounded-circle bg-main-600 hover-bg-main-700 text-white text-2xl position-absolute inset-inline-end-0 top-50 translate-middle-y me-8 transition-2"
              >
                <i className="ph-bold ph-magnifying-glass" />
              </button>
            </div>
          </div>

          {/* Filter Buttons - Exam Type */}
          <div className="mb-24">
            <p className="text-sm fw-semibold text-neutral-700 mb-12">Loại đề thi:</p>
            <div className="d-flex flex-wrap gap-12">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedFilter(filter.value)}
                  className={`btn px-24 py-12 rounded-pill fw-semibold transition-2 ${
                    selectedFilter === filter.value
                      ? "btn-main"
                      : "btn-outline-main"
                  }`}
                >
                  {filter.label}
                  {filter.count > 0 && (
                    <span className="badge bg-white text-main-600 ms-8">
                      {filter.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Dropdown - Status */}
          <div className="mb-40">
            <div className="d-flex flex-align gap-16 flex-wrap">
              <div className="flex-align gap-8">
                <label className="text-sm fw-semibold text-neutral-700 mb-0">
                  Trạng thái:
                </label>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="common-input px-16 py-8 rounded-8 fw-medium"
                  style={{ minWidth: '200px', cursor: 'pointer' }}
                >
                  {statusFilters.map((filter) => (
                    <option key={filter.value} value={filter.value}>
                      {filter.label} {filter.count > 0 && `(${filter.count})`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex-between gap-16 flex-wrap mb-40">
            <span className="text-neutral-500">
              Tìm thấy <span className="fw-semibold text-neutral-700">{filteredExams.length}</span> đề thi
              {selectedFilter !== "all" && (
                <span className="ms-8">
                  ({getExamTypeLabel(selectedFilter)})
                </span>
              )}
              {selectedStatusFilter !== "all" && (
                <span className="ms-8">
                  ({statusFilters.find(f => f.value === selectedStatusFilter)?.label})
                </span>
              )}
            </span>
          </div>

          {/* Exam Cards Grid */}
          {filteredExams.length === 0 ? (
            <div className="text-center py-80">
              <div className="inline-flex flex-center w-80 h-80 rounded-circle bg-main-25 mb-24">
                <i className="ph-bold ph-file-text text-4xl text-neutral-400" />
              </div>
              <h3 className="text-xl fw-semibold text-neutral-900 mb-16">
                Không tìm thấy đề thi nào
              </h3>
              <p className="text-neutral-500 text-lg">
                Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc của bạn
              </p>
            </div>
          ) : (
            <div className="row gy-4">
              {filteredExams.map((exam) => (
                <div key={exam._id} className="col-lg-4 col-sm-6">
                  <div className="course-item bg-white rounded-16 p-12 h-100 border border-neutral-30 box-shadow-md transition-2">
                    <div className="course-item__content">
                      {/* Card Header */}
                      <div className="mb-28">
                        <div className="flex-between gap-8 mb-16">
                          <span
                            className={`badge text-white px-16 py-8 rounded-pill ${getExamTypeBadgeColor(
                              exam.examType
                            )}`}
                          >
                            {getExamTypeLabel(exam.examType)}
                          </span>
                          {(() => {
                            const status = getSubmissionStatus(exam._id);
                            const statusBadge = getStatusBadge(status);
                            return statusBadge && (
                              <span className={`badge ${statusBadge.className} text-white px-12 py-6 rounded-pill text-xs`}>
                                {statusBadge.label}
                              </span>
                            );
                          })()}
                        </div>
                        <h4 className="mb-16">
                          <Link
                            to={`/exams/${exam._id}`}
                            className="link text-line-2 hover-text-main-600 transition-1"
                          >
                            {exam.title}
                          </Link>
                        </h4>
                        {exam.description && (
                          <p className="text-neutral-600 text-lg mb-16 text-line-2">
                            {exam.description}
                          </p>
                        )}

                        {/* Exam Info */}
                        <div className="mb-24">
                          <div className="flex-align gap-8 mb-12">
                            <span className="text-main-600 text-2xl d-flex">
                              <i className="ph-bold ph-clock" />
                            </span>
                            <span className="text-neutral-700 text-lg fw-medium">
                              {exam.totalDuration} phút
                            </span>
                          </div>
                          <div className="flex-align gap-8 mb-12">
                            <span className="text-success text-2xl d-flex">
                              <i className="ph-bold ph-file-text" />
                            </span>
                            <span className="text-neutral-700 text-lg fw-medium">
                              {getTotalQuestions(exam)} câu hỏi
                            </span>
                          </div>
                          <div className="flex-align gap-8 mb-12">
                            <span className="text-main-two-600 text-2xl d-flex">
                              <i className="ph-bold ph-list-bullets" />
                            </span>
                            <span className="text-neutral-700 text-lg fw-medium">
                              {getUniqueSectionTypes(exam.sections).length} phần thi
                            </span>
                          </div>
                          <div className="flex-align gap-8">
                            <span className="text-main-three-600 text-2xl d-flex">
                              <i className="ph-bold ph-graduation-cap" />
                            </span>
                            <span className="text-neutral-700 text-lg fw-medium">
                              {exam.level}
                            </span>
                          </div>
                        </div>

                        {/* Sections Preview */}
                        <div className="mb-24">
                          <p className="text-sm fw-semibold text-neutral-700 mb-12">
                            Các phần thi:
                          </p>
                          <div className="d-flex flex-wrap gap-8">
                            {getUniqueSectionTypes(exam.sections).map((sectionType, index) => (
                              <span
                                key={index}
                                className="badge bg-main-25 text-neutral-700 px-12 py-6 rounded-8 text-xs fw-medium"
                                style={{ textTransform: 'capitalize' }}
                              >
                                {sectionType}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-24 border-top border-neutral-50 mt-28">
                        <Link
                          to={`/student/exams/${exam._id}`}
                          className="btn btn-main flex-center gap-8 transition-2"
                          style={{ width: '100%' }}
                        >
                          Bắt đầu làm bài
                          <i className="ph ph-arrow-right" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

    </>
  );
};

export default StudentExamListPage;
