import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumb from '../compo/Breadcrumb';
import Card from '../compo/Card';
import Button from '../compo/Button';
import Badge from '../compo/Badge';
import Tabs from '../compo/Tabs';
import Modal from '../compo/Modal';
import { courseService } from '../../../services/courseService';
import { formatDate } from '../../../helper/helper';

const CourseDetails = ({ viewMode = 'center-head' }) => {
  const { id, programId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedCamSession, setSelectedCamSession] = useState(null);
  const [showCamSessionModal, setShowCamSessionModal] = useState(false);

  // Determine base path
  const basePath = viewMode === 'teacher' ? '/teacher' : '/center-head';

  // Get user role from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.roleId?.name || user.role;

  // Center Head should not see edit/delete buttons
  const isViewOnly = viewMode === 'center-head' || userRole === 'Center Head';

  useEffect(() => {
    fetchCourseDetails();
    
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await courseService.getCourseDetails(id);
console.log(response.data);

      if (response.success) {
        setCourse(response.data);
        setError(null);
      } else {
        setError('Không tìm thấy giáo trình');
      }
    } catch (err) {
      console.error('Error fetching course details:', err);
      setError('Không thể tải chi tiết giáo trình. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa môn học "${course.name}"?\n\nHành động này không thể hoàn tác.`)) {
      return;
    }

    try {
      setDeleteLoading(true);
      const response = await courseService.deleteCourse(id);

      if (response.success) {
        alert('Xóa môn học thành công!');
        // Navigate back to program detail or course list
        navigate(-1);
      } else {
        alert(response.message || 'Xóa môn học thất bại!');
      }
    } catch (err) {
      console.error('Error deleting course:', err);
      alert(err.message || 'Không thể xóa môn học. Vui lòng thử lại sau.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Build breadcrumb dynamically based on whether we have programId
  const breadcrumbItems = programId && course?.program ? [
    { label: 'Dashboard', path: `${basePath}/dashboard` },
    { label: 'Chương trình đào tạo', path: `${basePath}/programs` },
    { label: course.program.program_name, path: `${basePath}/programs/${programId}` },
    { label: course.name },
  ] : [
    { label: 'Dashboard', path: `${basePath}/dashboard` },
    { label: 'Danh sách môn học', path: `${basePath}/courses` },
    { label: course?.name || 'Chi tiết môn học' },
  ];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-main-600" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          {error || 'Không tìm thấy giáo trình'}
        </div>
        <Button onClick={() => navigate('/courses/pending')}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  // Tab 1: General Information
  const generalInfoTab = (
    <div className="general-info">
      <div className="row g-4">
        <div className="col-md-6">
          <div className="info-item mb-24">
            <label className="text-neutral-600 text-sm mb-8 d-block">Tên giáo trình</label>
            <p className="text-neutral-900 fw-semibold mb-0">{course.name}</p>
          </div>
        </div>
        <div className="col-md-6">
          <div className="info-item mb-24">
            <label className="text-neutral-600 text-sm mb-8 d-block">Thuộc chương trình</label>
            <p className="text-neutral-900 mb-0">
              {course.program?.program_name || 'N/A'}
              {course.program?.code && ` (${course.program.code})`}
            </p>
          </div>
        </div>
        <div className="col-md-6">
          <div className="info-item mb-24">
            <label className="text-neutral-600 text-sm mb-8 d-block">Người tạo</label>
            <p className="text-neutral-900 mb-0">
              {course.createdBy?.fullname || 'N/A'}
              {course.createdBy?.email && (
                <span className="text-neutral-600 text-sm d-block">
                  {course.createdBy.email}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="col-md-6">
          <div className="info-item mb-24">
            <label className="text-neutral-600 text-sm mb-8 d-block">Ngày tạo</label>
            <p className="text-neutral-900 mb-0">{formatDate(course.createdAt)}</p>
          </div>
        </div>
        <div className="col-12">
          <div className="info-item mb-24">
            <label className="text-neutral-600 text-sm mb-8 d-block">Mô tả</label>
            <div className="bg-neutral-20 p-16 radius-8">
              <p className="text-neutral-900 mb-0">
                {course.description || 'Chưa có mô tả'}
              </p>
            </div>
          </div>
        </div>

        {/* Materials */}
        <div className="col-12">
          <div className="info-item mb-24">
            <h6 className="text-neutral-900 fw-semibold mb-16">
              <i className="ph ph-file-text me-2"></i>
              Tài liệu khóa học ({course.materials?.length || 0} material(s))
            </h6>
            {course.materials && course.materials.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover border border-neutral-40">
                  <thead className="bg-neutral-20">
                    <tr>
                      <th className="px-24 py-16 text-neutral-700 fw-semibold" style={{ width: '30%' }}>Description</th>
                      <th className="px-24 py-16 text-neutral-700 fw-semibold" style={{ width: '15%' }}>Author</th>
                      <th className="px-24 py-16 text-neutral-700 fw-semibold" style={{ width: '15%' }}>Publisher</th>
                      <th className="px-24 py-16 text-neutral-700 fw-semibold" style={{ width: '10%' }}>Published Date</th>
                      <th className="px-24 py-16 text-neutral-700 fw-semibold" style={{ width: '15%' }}>Online URL</th>
                      <th className="px-24 py-16 text-neutral-700 fw-semibold" style={{ width: '15%' }}>Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {course.materials.map((material, index) => (
                      <tr key={material._id || index}>
                        <td className="px-24 py-16 text-neutral-700" style={{ verticalAlign: 'top' }}>
                          {material.description || '-'}
                        </td>
                        <td className="px-24 py-16 text-neutral-700" style={{ verticalAlign: 'top' }}>
                          {material.author || '-'}
                        </td>
                        <td className="px-24 py-16 text-neutral-700" style={{ verticalAlign: 'top' }}>
                          {material.publisher || '-'}
                        </td>
                        <td className="px-24 py-16 text-neutral-700" style={{ verticalAlign: 'top' }}>
                          {material.publishedDate || '-'}
                        </td>
                        <td className="px-24 py-16" style={{ verticalAlign: 'top' }}>
                          {material.onlineUrl ? (
                            <a
                              href={material.onlineUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-main-600"
                              style={{ wordBreak: 'break-all' }}
                            >
                              <i className="ph ph-link me-1"></i>
                              Link
                            </a>
                          ) : '-'}
                        </td>
                        <td className="px-24 py-16 text-neutral-700" style={{ verticalAlign: 'top' }}>
                          {material.note || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-5 text-neutral-600">
                <i className="ph ph-file-text text-neutral-400" style={{ fontSize: '48px' }}></i>
                <p className="mt-3 mb-0">Chưa có tài liệu</p>
              </div>
            )}
          </div>
        </div>

        {/* Mocktest Session Orders */}
        <div className="col-12">
          <div className="info-item">
            <label className="text-neutral-600 text-sm mb-8 d-block">
              <i className="ph ph-exam me-2"></i>
              Buổi học là bài thi thử (Mock Test)
            </label>
            {course.mocktestSessionOrders && course.mocktestSessionOrders.length > 0 ? (
              <div className="bg-neutral-20 p-16 radius-8">
                <div className="d-flex flex-wrap gap-2">
                  {course.mocktestSessionOrders.map((order, index) => (
                    <Badge key={index} variant="warning" size="md">
                      <i className="ph ph-exam me-1"></i>
                      Buổi {order}
                    </Badge>
                  ))}
                </div>
                <p className="text-neutral-600 text-sm mt-2 mb-0">
                  Các buổi học này sẽ được tổ chức dưới dạng bài thi thử (Mock Test)
                </p>
              </div>
            ) : (
              <div className="bg-neutral-20 p-16 radius-8">
                <p className="text-neutral-600 text-sm mb-0">Không có buổi học nào được đánh dấu là Mock Test</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Tab 2: Syllabus
  const isCamOnlineCourse =
    course.program?.type === 'cam' && course.learningType === 'online';

  const syllabusTab = (
    <div className="syllabus">
      {isCamOnlineCourse ? (
        // CAM online course → hiển thị Cam Sessions
        course.camSessions && course.camSessions.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover border border-neutral-40">
              <thead className="bg-neutral-20">
                <tr>
                  <th className="px-24 py-16 text-neutral-700 fw-semibold" style={{ width: '8%' }}>
                    Order
                  </th>
                  <th className="px-24 py-16 text-neutral-700 fw-semibold" style={{ width: '22%' }}>
                    Title
                  </th>
                  <th className="px-24 py-16 text-neutral-700 fw-semibold" style={{ width: '18%' }}>
                    Session Type
                  </th>
                  <th className="px-24 py-16 text-neutral-700 fw-semibold" style={{ width: '32%' }}>
                    Description
                  </th>
                  <th className="px-24 py-16 text-neutral-700 fw-semibold" style={{ width: '20%' }}>
                    Video / Media
                  </th>
                </tr>
              </thead>
              <tbody>
                {course.camSessions.map((camSession, index) => (
                  <tr
                    key={camSession._id || index}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedCamSession(camSession);
                      setShowCamSessionModal(true);
                    }}
                  >
                    <td className="px-24 py-16" style={{ verticalAlign: 'top' }}>
                      <span className="fw-semibold text-neutral-900">
                        {camSession.order ?? index + 1}
                      </span>
                    </td>
                    <td className="px-24 py-16 text-neutral-700" style={{ verticalAlign: 'top' }}>
                      {camSession.title || '-'}
                    </td>
                    <td className="px-24 py-16" style={{ verticalAlign: 'top' }}>
                      {camSession.sessionType ? (
                        <Badge variant="info" size="sm">
                          {camSession.sessionType.charAt(0).toUpperCase() +
                            camSession.sessionType.slice(1)}
                        </Badge>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td
                      className="px-24 py-16 text-neutral-700"
                      style={{ verticalAlign: 'top', whiteSpace: 'pre-wrap' }}
                    >
                      {camSession.description || '-'}
                    </td>
                    <td className="px-24 py-16" style={{ verticalAlign: 'top' }}>
                      {camSession.videoURL ? (
                        <a
                          href={camSession.videoURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-main-600 d-inline-flex align-items-center"
                          style={{ wordBreak: 'break-all' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <i className="ph ph-play-circle me-1"></i>
                          Xem video
                        </a>
                      ) : (
                        <span className="text-neutral-400 text-sm">Chưa có video</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-5 text-neutral-500">
            <i className="ph ph-book-open text-6xl mb-3 d-block"></i>
            <p>Chưa có CAM Session nào cho khóa học này</p>
          </div>
        )
      ) : course.sessions && course.sessions.length > 0 ? (
        // Course thường → hiển thị Sessions
        <div className="table-responsive">
          <table className="table table-hover border border-neutral-40">
            <thead className="bg-neutral-20">
              <tr>
                <th className="px-24 py-16 text-neutral-700 fw-semibold" style={{ width: '10%' }}>
                  Order
                </th>
                <th className="px-24 py-16 text-neutral-700 fw-semibold" style={{ width: '25%' }}>
                  Title
                </th>
                <th className="px-24 py-16 text-neutral-700 fw-semibold" style={{ width: '40%' }}>
                  Content
                </th>
                <th className="px-24 py-16 text-neutral-700 fw-semibold" style={{ width: '15%' }}>
                  Learning Type
                </th>
                <th className="px-24 py-16 text-neutral-700 fw-semibold" style={{ width: '10%' }}>
                  CLOs
                </th>
              </tr>
            </thead>
            <tbody>
              {course.sessions.map((session) => (
                <tr key={session._id}>
                  <td className="px-24 py-16" style={{ verticalAlign: 'top' }}>
                    <span className="fw-semibold text-neutral-900">{session.order}</span>
                  </td>
                  <td className="px-24 py-16 text-neutral-700" style={{ verticalAlign: 'top' }}>
                    {session.title || '-'}
                  </td>
                  <td
                    className="px-24 py-16 text-neutral-700"
                    style={{ verticalAlign: 'top', whiteSpace: 'pre-wrap' }}
                  >
                    {session.content || '-'}
                  </td>
                  <td className="px-24 py-16" style={{ verticalAlign: 'top' }}>
                    {session.learningType === 'mocktest' ? (
                      <Badge variant="warning" size="sm">
                        <i className="ph ph-exam me-1"></i>
                        Mock Test
                      </Badge>
                    ) : (
                      <Badge variant="info" size="sm">
                        <i className="ph ph-book-open me-1"></i>
                        Theory
                      </Badge>
                    )}
                  </td>
                  <td className="px-24 py-16" style={{ verticalAlign: 'top' }}>
                    {session.clos && session.clos.length > 0 ? (
                      <div className="d-flex flex-wrap gap-1">
                        {session.clos.map((clo, cloIndex) => (
                          <Badge key={cloIndex} variant="success" size="sm">
                            {typeof clo === 'object' ? clo.code : clo}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-5 text-neutral-500">
          <i className="ph ph-book-open text-6xl mb-3 d-block"></i>
          <p>Chưa có thông tin đề cương</p>
        </div>
      )}
    </div>
  );

  // Tab 3: CLO/PLO Mapping
  const cloTab = (
    <div className="clo-mapping">
      <h5 className="mb-16 text-neutral-900 fw-bold">Course Learning Outcomes (CLO)</h5>
      <p className="text-neutral-600 text-sm mb-24">Chuẩn đầu ra của học phần và ánh xạ với PLO</p>

      {course.clos && course.clos.length > 0 ? (
        <>
          {/* CLO Table */}
          <div className="table-responsive mb-32">
            <table className="table table-hover border border-neutral-40">
              <thead className="bg-neutral-20">
                <tr>
                  <th className="px-24 py-16 text-neutral-700 fw-semibold" style={{ width: '15%' }}>Mã CLO</th>
                  <th className="px-24 py-16 text-neutral-700 fw-semibold" style={{ width: '25%' }}>Tên CLO</th>
                  <th className="px-24 py-16 text-neutral-700 fw-semibold" style={{ width: '60%' }}>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {course.clos.map((clo) => (
                  <tr key={clo._id}>
                    <td className="px-24 py-16" style={{ verticalAlign: 'top' }}>
                      <span className="fw-semibold text-neutral-900">{clo.code}</span>
                    </td>
                    <td className="px-24 py-16 text-neutral-700" style={{ verticalAlign: 'top' }}>
                      {clo.name || '-'}
                    </td>
                    <td className="px-24 py-16 text-neutral-700" style={{ verticalAlign: 'top', whiteSpace: 'pre-wrap' }}>
                      {clo.detail || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CLO-PLO Mapping Matrix */}
          <h5 className="mb-16 text-neutral-900 fw-bold">Ma trận CLO-PLO</h5>
          <div className="table-responsive">
            <table className="table table-bordered border border-neutral-40">
              <thead className="bg-neutral-20">
                <tr>
                  <th className="px-24 py-16 text-neutral-700 fw-semibold">CLO / PLO</th>
                  {course.program?.plos && course.program.plos.map((plo) => (
                    <th key={plo._id} className="px-24 py-16 text-neutral-700 fw-semibold text-center">
                      {plo.code}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {course.clos.map((clo) => (
                  <tr key={clo._id}>
                    <td className="px-24 py-16 fw-semibold text-neutral-900">
                      {clo.code}
                    </td>
                    {course.program?.plos && course.program.plos.map((plo) => {
                      const isMapped = clo.mappedPLOs && clo.mappedPLOs.some(
                        mappedPlo => (typeof mappedPlo === 'object' ? mappedPlo._id : mappedPlo) === plo._id
                      );
                      return (
                        <td key={plo._id} className="px-24 py-16 text-center">
                          {isMapped ? (
                            <i className="ph ph-check-circle text-success-600" style={{ fontSize: '20px' }}></i>
                          ) : (
                            <span className="text-neutral-300">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="text-center py-5 text-neutral-500">
          <i className="ph ph-target text-6xl mb-3 d-block"></i>
          <p>Chưa có thông tin chuẩn đầu ra</p>
        </div>
      )}
    </div>
  );

  const tabs = [
    { label: 'Thông tin chung', icon: 'ph ph-info', content: generalInfoTab },
    { label: 'Đề cương', icon: 'ph ph-book-open', content: syllabusTab },
    { label: 'CLO/PLO', icon: 'ph ph-target', content: cloTab },
  ];

  return (
    <div className="course-details-container">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-24">
        <div className="flex-grow-1">
          <h4 className="mb-8 text-neutral-900 fw-bold">Chi tiết môn học: {course.name}</h4>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="outline"
            icon="ph ph-arrow-left"
            onClick={() => {
              // Navigate back to program detail if programId exists, otherwise go back
              if (programId) {
                navigate(`${basePath}/programs/${programId}`);
              } else {
                navigate(-1);
              }
            }}
          >
            Quay lại
          </Button>
          {/* Edit and Delete buttons - only for non-Center Head */}
          {!isViewOnly && (
            <>
              <Button
                variant="primary"
                icon="ph ph-pencil"
                onClick={() => {
                  const programIdToUse = programId || course.program?._id || course.program;
                  navigate(`${basePath}/programs/${programIdToUse}/courses/${id}/edit-form`);
                }}
              >
                Sửa
              </Button>
              <Button
                variant="danger"
                icon="ph ph-trash"
                onClick={handleDeleteCourse}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Đang xóa...' : 'Xóa'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Card>
        <Tabs tabs={tabs} />
      </Card>

      {/* CAM Session Detail Modal */}
      <Modal
        show={showCamSessionModal && !!selectedCamSession}
        onClose={() => {
          setShowCamSessionModal(false);
          setSelectedCamSession(null);
        }}
        title={
          selectedCamSession
            ? `Chi tiết CAM Session: ${selectedCamSession.title || ''}`
            : 'Chi tiết CAM Session'
        }
        size="lg"
      >
        {!selectedCamSession ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <div className="d-flex flex-column gap-4">
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label text-sm text-neutral-600">Order</label>
                <p className="mb-0 fw-semibold">
                  {selectedCamSession.order ?? '-'}
                </p>
              </div>
              <div className="col-md-5">
                <label className="form-label text-sm text-neutral-600">Tiêu đề</label>
                <p className="mb-0 fw-semibold">
                  {selectedCamSession.title || '-'}
                </p>
              </div>
              <div className="col-md-4">
                <label className="form-label text-sm text-neutral-600">Loại</label>
                <div>
                  {selectedCamSession.sessionType ? (
                    <Badge variant="info" size="sm">
                      {selectedCamSession.sessionType.charAt(0).toUpperCase() +
                        selectedCamSession.sessionType.slice(1)}
                    </Badge>
                  ) : (
                    <span className="text-neutral-500 text-sm">Chưa phân loại</span>
                  )}
                </div>
              </div>
              <div className="col-12">
                <label className="form-label text-sm text-neutral-600">Mô tả</label>
                <div className="bg-neutral-20 p-3 radius-8">
                  <p className="mb-0 text-neutral-800" style={{ whiteSpace: 'pre-wrap' }}>
                    {selectedCamSession.description || 'Chưa có mô tả'}
                  </p>
                </div>
              </div>
              <div className="col-12">
                <label className="form-label text-sm text-neutral-600">Video / Media</label>
                {selectedCamSession.videoURL ? (
                  <a
                    href={selectedCamSession.videoURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-main-600 d-inline-flex align-items-center"
                    style={{ wordBreak: 'break-all' }}
                  >
                    <i className="ph ph-play-circle me-1"></i>
                    Mở video trong tab mới
                  </a>
                ) : (
                  <p className="mb-0 text-neutral-500 text-sm">Chưa có video</p>
                )}
              </div>
            </div>

            <div className="border rounded-3 p-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0 fw-semibold">Quizzes</h6>
                <span className="text-sm text-neutral-500">
                  {(selectedCamSession.quizzes?.quiz || []).length} quiz
                </span>
              </div>
              {(selectedCamSession.quizzes?.quiz || []).length === 0 ? (
                <p className="mb-0 text-neutral-500 text-sm">Chưa có quiz nào.</p>
              ) : (
                <div className="row row-cols-1 row-cols-md-2 g-3">
                  {selectedCamSession.quizzes.quiz.map((quiz, idx) => (
                    <div key={`quiz-${idx}`} className="col">
                      <div className="border rounded-3 p-3 h-100">
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <span className="badge bg-neutral-100 text-neutral-800">
                            Quiz #{idx + 1}
                          </span>
                          <span className="badge bg-neutral-50 text-neutral-700">
                            {quiz.Type || 'N/A'}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-800 mb-1">
                          {quiz.Question || 'Chưa có câu hỏi'}
                        </p>
                        <p className="text-xs text-neutral-500 mb-0">
                          Đáp án: {quiz.Answer?.length || 0} | Đáp án đúng: {quiz.AnswerKey?.length || 0}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border rounded-3 p-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0 fw-semibold">Vocabulary</h6>
                <span className="text-sm text-neutral-500">
                  {(selectedCamSession.vocabulary?.items || []).length} từ
                </span>
              </div>
              {(selectedCamSession.vocabulary?.items || []).length === 0 ? (
                <p className="mb-0 text-neutral-500 text-sm">Chưa có từ vựng nào.</p>
              ) : (
                <div className="d-flex flex-wrap gap-2">
                  {selectedCamSession.vocabulary.items.map((item, idx) => (
                    <Badge key={`vocab-${idx}`} variant="primary" size="sm">
                      {item.word || `Từ #${idx + 1}`}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CourseDetails;