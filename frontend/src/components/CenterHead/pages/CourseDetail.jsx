import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumb from '../compo/Breadcrumb';
import Card from '../compo/Card';
import Button from '../compo/Button';
import Badge from '../compo/Badge';
import Tabs from '../compo/Tabs';
// import { courseAPI } from '../services/api';
import { getCourseById, simulateApiDelay } from '../../../helper/mockdata';
import { formatDate } from '../../../helper/helper';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [revisionNote, setRevisionNote] = useState('');
  const [showRevisionModal, setShowRevisionModal] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      // Simulate API call with delay
      await simulateApiDelay(700);
      
      // Use mock data
      const courseData = getCourseById(id);
      if (!courseData) {
        setError('Không tìm thấy giáo trình');
      } else {
        setCourse(courseData);
        setError(null);
      }
      
      // Real API call (commented out)
      // const response = await courseAPI.getCourseDetails(id);
      // setCourse(response.data.course);
      // setError(null);
    } catch (err) {
      console.error('Error fetching course details:', err);
      setError('Không thể tải chi tiết giáo trình. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn phê duyệt giáo trình này?')) {
      return;
    }

    try {
      setActionLoading(true);
      // Simulate API call
      await simulateApiDelay(1000);
      
      // Real API call (commented out)
      // await courseAPI.approveCourse(id);
      
      alert('Đã phê duyệt giáo trình thành công!');
      navigate('/courses/pending');
    } catch (err) {
      console.error('Error approving course:', err);
      alert('Có lỗi xảy ra khi phê duyệt giáo trình. Vui lòng thử lại.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!revisionNote.trim()) {
      alert('Vui lòng nhập lý do yêu cầu chỉnh sửa');
      return;
    }

    try {
      setActionLoading(true);
      // Simulate API call
      await simulateApiDelay(1000);
      
      // Real API call (commented out)
      // await courseAPI.requestRevision(id, { revisionNote });
      
      alert('Đã gửi yêu cầu chỉnh sửa thành công!');
      navigate('/courses/pending');
    } catch (err) {
      console.error('Error requesting revision:', err);
      alert('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.');
    } finally {
      setActionLoading(false);
      setShowRevisionModal(false);
      setRevisionNote('');
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/center-head/dashboard' },
    { label: 'Giáo trình chờ duyệt', path: '/courses/pending' },
    { label: 'Chi tiết giáo trình', path: `/courses/${id}/details` },
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
          <div className="info-item">
            <label className="text-neutral-600 text-sm mb-8 d-block">Mô tả</label>
            <div className="bg-neutral-20 p-16 radius-8">
              <p className="text-neutral-900 mb-0">
                {course.description || 'Chưa có mô tả'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Tab 2: Syllabus
  const syllabusTab = (
    <div className="syllabus">
      {course.sessions && course.sessions.length > 0 ? (
        <div className="sessions-list">
          {course.sessions.map((session, index) => (
            <Card key={session._id} className="mb-16">
              <div className="d-flex align-items-start gap-3">
                <div className="w-40 h-40 bg-main-600 text-white d-flex align-items-center justify-content-center radius-8 fw-bold flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-grow-1">
                  <h6 className="mb-8 text-neutral-900 fw-semibold">
                    {session.name || session.topic || `Buổi ${index + 1}`}
                  </h6>
                  
                  {/* CLOs */}
                  {session.clos && session.clos.length > 0 && (
                    <div className="mb-12">
                      <span className="text-neutral-600 text-sm me-2">CLO:</span>
                      {session.clos.map((clo, cloIndex) => (
                        <Badge key={cloIndex} variant="info" size="sm" className="me-2">
                          {clo.code}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {/* Materials */}
                  {session.material && (
                    <div className="bg-neutral-20 p-12 radius-4">
                      <p className="text-neutral-700 text-sm mb-0">
                        <i className="ph ph-file-text me-2"></i>
                        {session.material}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
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
      {course.clos && course.clos.length > 0 ? (
        <div className="clos-list">
          {course.clos.map((clo, index) => (
            <Card key={clo._id} className="mb-16">
              <div className="d-flex align-items-start gap-3">
                <Badge variant="success" size="md" className="flex-shrink-0">
                  {clo.code}
                </Badge>
                <div className="flex-grow-1">
                  <p className="text-neutral-900 mb-12">{clo.detail}</p>
                  
                  {/* Mapped PLOs */}
                  {clo.mappedPLOs && clo.mappedPLOs.length > 0 && (
                    <div>
                      <span className="text-neutral-600 text-sm fw-medium">
                        <i className="ph ph-arrow-right me-2"></i>
                        Ánh xạ tới:
                      </span>
                      <div className="d-flex flex-wrap gap-2 mt-8">
                        {clo.mappedPLOs.map((plo, ploIndex) => (
                          <div 
                            key={ploIndex}
                            className="bg-main-50 px-12 py-6 radius-4 text-sm"
                          >
                            <span className="fw-semibold text-main-600">{plo.code}</span>
                            {plo.name && (
                              <span className="text-neutral-700"> - {plo.name}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
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
          <h4 className="mb-8 text-neutral-900 fw-bold">Chi tiết: {course.name}</h4>
          <Badge variant="warning">
            <i className="ph ph-clock me-1"></i>
            Chờ phê duyệt
          </Badge>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="outline"
            icon="ph ph-pencil"
            onClick={() => setShowRevisionModal(true)}
            disabled={actionLoading}
          >
            Yêu cầu chỉnh sửa
          </Button>
          <Button
            variant="success"
            icon="ph ph-check"
            onClick={handleApprove}
            disabled={actionLoading}
          >
            {actionLoading ? 'Đang xử lý...' : 'Phê duyệt'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Card>
        <Tabs tabs={tabs} />
      </Card>

      {/* Revision Modal */}
      {showRevisionModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Yêu cầu chỉnh sửa</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowRevisionModal(false)}
                  disabled={actionLoading}
                ></button>
              </div>
              <div className="modal-body">
                <label className="form-label">Lý do yêu cầu chỉnh sửa *</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Nhập lý do yêu cầu chỉnh sửa..."
                  value={revisionNote}
                  onChange={(e) => setRevisionNote(e.target.value)}
                  disabled={actionLoading}
                ></textarea>
              </div>
              <div className="modal-footer">
                <Button
                  variant="outline"
                  onClick={() => setShowRevisionModal(false)}
                  disabled={actionLoading}
                >
                  Hủy
                </Button>
                <Button
                  variant="primary"
                  onClick={handleRequestRevision}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetails;