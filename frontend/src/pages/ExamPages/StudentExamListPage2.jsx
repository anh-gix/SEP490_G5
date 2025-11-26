import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { examsMock } from "../../components/student_components/student_mockdata/examMockData";
import { submissionsMock } from "../../components/student_components/student_mockdata/submissionMockData";
import HeaderOne from "../../components/HomePageforStudent/HeaderOne";
import FooterOne from "../../components/FooterOne";
import Breadcrumb from "../../components/Breadcrumb";
import Animation from "../../helper/Animation";
import Preloader from "../../helper/Preloader";

const StudentExamListPage2 = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");

  // Get submission status for an exam
  const getSubmissionStatus = (examId) => {
    // TODO: Replace with actual studentId from auth/context
    const studentId = "69268b8f61083fe5354f37a6";
    const submission = submissionsMock.find(
      (sub) => sub.examId === examId && sub.studentId === studentId
    );
    return submission?.status || null;
  };

  // Filter exams based on search query, selected filter and status filter
  const filteredExams = useMemo(() => {
    return examsMock.filter((exam) => {
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
  }, [searchQuery, selectedFilter, selectedStatusFilter]);

  // Count exams by type
  const examCounts = useMemo(() => {
    return {
      all: examsMock.length,
      ielts: examsMock.filter((exam) => exam.examType === "ielts").length,
      toeic: examsMock.filter((exam) => exam.examType === "toeic").length,
      cambridge: examsMock.filter((exam) => exam.examType === "cambridge")
        .length,
    };
  }, []);

  // Count exams by status
  const statusCounts = useMemo(() => {
    const studentId = "69268b8f61083fe5354f37a6";
    return {
      all: examsMock.length,
      completed: examsMock.filter((exam) => {
        const submission = submissionsMock.find(
          (sub) => sub.examId === exam._id && sub.studentId === studentId
        );
        return submission?.status === "completed";
      }).length,
      "in-progress": examsMock.filter((exam) => {
        const submission = submissionsMock.find(
          (sub) => sub.examId === exam._id && sub.studentId === studentId
        );
        return submission?.status === "in-progress";
      }).length,
      "not-started": examsMock.filter((exam) => {
        const submission = submissionsMock.find(
          (sub) => sub.examId === exam._id && sub.studentId === studentId
        );
        return !submission;
      }).length,
    };
  }, []);

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

  return (
    <>
      <Preloader />
      <Animation />
      <HeaderOne />
      <Breadcrumb title={"Đề thi"} />

      <section className="course-grid-view py-120">
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
                              {exam.sections?.length || 0} phần thi
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
                            {exam.sections?.slice(0, 4).map((section, index) => (
                              <span
                                key={index}
                                className="badge bg-main-25 text-neutral-700 px-12 py-6 rounded-8 text-xs fw-medium"
                                style={{ textTransform: 'capitalize' }}
                              >
                                {section.type}
                              </span>
                            ))}
                            {exam.sections?.length > 4 && (
                              <span className="badge bg-main-25 text-neutral-700 px-12 py-6 rounded-8 text-xs fw-medium">
                                +{exam.sections.length - 4} khác
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-24 border-top border-neutral-50 mt-28">
                        <Link
                          to={`/exams/${exam._id}/2`}
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

      <FooterOne />
    </>
  );
};

export default StudentExamListPage2;
