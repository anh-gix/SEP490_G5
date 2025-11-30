import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../compo/Breadcrumb';
import Card from '../compo/Card';
import Button from '../compo/Button';
import StatusBadge from '../compo/StatusBadge';
import Table from '../compo/Table';
import programService from '../../../services/programService';
import courseService from '../../../services/courseService';
import { formatDate } from '../../../helper/helper';

const ProgramDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [cloMapping, setCloMapping] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRejectProgramModal, setShowRejectProgramModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Get user role from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.role;

  useEffect(() => {
    fetchProgramDetail();
  }, [id]);

  const fetchProgramDetail = async () => {
    try {
      setLoading(true);

      const response = await programService.getProgramById(id);
      const programData = response.data;

      if (programData) {
        setProgram(programData);

        // Courses are included in the program response
        const programCourses = programData.courses || [];
        setCourses(programCourses);

        // Build CLO → PLO mapping from courses
        const cloMappingData = [];
        const programPLOs = programData.plos || [];

        programCourses.forEach(course => {
          if (course.clos && Array.isArray(course.clos)) {
            course.clos.forEach(clo => {
              // Map CLO's mappedPLOs (array of IDs) to actual PLO objects from program
              const mappedPLOObjects = (clo.mappedPLOs || [])
                .map(ploId => {
                  const ploIdStr = typeof ploId === 'object' ? ploId._id : ploId;
                  return programPLOs.find(p => p._id.toString() === ploIdStr.toString());
                })
                .filter(plo => plo !== undefined);

              cloMappingData.push({
                _id: clo._id,
                code: clo.code,
                name: clo.name,
                detail: clo.detail,
                courseName: course.name,
                mappedPLOs: mappedPLOObjects
              });
            });
          }
        });
        setCloMapping(cloMappingData);

        console.log('Program detail loaded from API:', programData);
      }

    } catch (err) {
      console.error('Error fetching program detail:', err);
      alert('Không thể tải thông tin chương trình!');
    } finally {
      setLoading(false);
    }
  };

  // BACKUP MOCK DATA (can be removed later)
  const _oldMockData = () => {
    const mockPrograms = {
        'prog1': {
          _id: 'prog1',
          code: 'IELTS-B2',
          program_name: 'IELTS Intermediate Program',
          description: 'Chương trình IELTS trình độ trung cấp',
          type: 'ielts',
          level: 'B2',
          band: '5.5-6.5',
          tuitionFee: 5000000,
          status: 'active',
          plos: [
            { _id: 'plo1', code: 'PLO1', name: 'Listening Skills', description: 'Hiểu và phản ứng với các đoạn hội thoại tiếng Anh' },
            { _id: 'plo2', code: 'PLO2', name: 'Reading Comprehension', description: 'Đọc hiểu các văn bản học thuật và thông tin' },
            { _id: 'plo3', code: 'PLO3', name: 'Writing Skills', description: 'Viết các bài luận và báo cáo tiếng Anh' },
            { _id: 'plo4', code: 'PLO4', name: 'Speaking Fluency', description: 'Giao tiếp lưu loát và tự tin bằng tiếng Anh' }
          ],
          courses: [
            {
              _id: 'course1',
              subjectCode: 'IELTS-B2-RW',
              name: 'IELTS Reading & Writing',
              description: 'Khóa học tập trung vào kỹ năng Reading và Writing',
              status: 'approved',
              updatedAt: new Date('2025-01-15'),
              clos: [
                {
                  _id: 'clo1',
                  code: 'CLO1',
                  name: 'Reading Strategies',
                  description: 'Áp dụng các chiến lược đọc hiệu quả cho IELTS Reading',
                  detail: 'Áp dụng các chiến lược đọc hiệu quả cho IELTS Reading',
                  mappedPLOs: [
                    { _id: 'plo2', code: 'PLO2', name: 'Reading Comprehension' }
                  ]
                },
                {
                  _id: 'clo2',
                  code: 'CLO2',
                  name: 'Writing Task 1',
                  description: 'Viết Writing Task 1 đạt band 6.0+',
                  detail: 'Viết Writing Task 1 đạt band 6.0+',
                  mappedPLOs: [
                    { _id: 'plo3', code: 'PLO3', name: 'Writing Skills' }
                  ]
                },
                {
                  _id: 'clo3',
                  code: 'CLO3',
                  name: 'Writing Task 2',
                  description: 'Viết Writing Task 2 đạt band 6.0+',
                  detail: 'Viết Writing Task 2 đạt band 6.0+',
                  mappedPLOs: [
                    { _id: 'plo3', code: 'PLO3', name: 'Writing Skills' }
                  ]
                }
              ],
              sessions: [
                { _id: 's1', title: 'Week 1', order: 1 },
                { _id: 's2', title: 'Week 2', order: 2 },
                { _id: 's3', title: 'Week 3', order: 3 }
              ]
            },
            {
              _id: 'course2',
              subjectCode: 'IELTS-B2-LS',
              name: 'IELTS Listening & Speaking',
              description: 'Khóa học tập trung vào kỹ năng Listening và Speaking',
              status: 'approved',
              updatedAt: new Date('2025-01-20'),
              clos: [
                {
                  _id: 'clo4',
                  code: 'CLO4',
                  name: 'Listening Comprehension',
                  description: 'Nghe hiểu các đoạn hội thoại và bài giảng',
                  detail: 'Nghe hiểu các đoạn hội thoại và bài giảng',
                  mappedPLOs: [
                    { _id: 'plo1', code: 'PLO1', name: 'Listening Skills' }
                  ]
                },
                {
                  _id: 'clo5',
                  code: 'CLO5',
                  name: 'Speaking Fluency',
                  description: 'Nói lưu loát trong các tình huống giao tiếp',
                  detail: 'Nói lưu loát trong các tình huống giao tiếp',
                  mappedPLOs: [
                    { _id: 'plo4', code: 'PLO4', name: 'Speaking Fluency' }
                  ]
                }
              ],
              sessions: [
                { _id: 's4', title: 'Week 1', order: 1 },
                { _id: 's5', title: 'Week 2', order: 2 }
              ]
            }
          ],
          updatedAt: new Date('2025-01-15')
        },
        'prog2': {
          _id: 'prog2',
          code: 'IELTS-C1',
          program_name: 'IELTS Advanced Program',
          description: 'Chương trình IELTS nâng cao',
          type: 'ielts',
          level: 'C1',
          band: '7.0-8.0',
          tuitionFee: 7000000,
          status: 'active',
          plos: [
            { _id: 'plo5', code: 'PLO1', name: 'Advanced Listening', description: 'Nghe hiểu nâng cao các bài giảng phức tạp' },
            { _id: 'plo6', code: 'PLO2', name: 'Critical Reading', description: 'Đọc và phân tích văn bản học thuật' },
            { _id: 'plo7', code: 'PLO3', name: 'Academic Writing', description: 'Viết luận văn học thuật chuyên nghiệp' }
          ],
          courses: [],
          updatedAt: new Date('2025-01-20')
        },
        'prog3': {
          _id: 'prog3',
          code: 'TOEIC-B1',
          program_name: 'TOEIC Basic Program',
          description: 'Chương trình TOEIC cơ bản',
          type: 'toeic',
          level: 'B1',
          band: '550-700',
          tuitionFee: 4000000,
          status: 'draft',
          plos: [
            { _id: 'plo8', code: 'PLO1', name: 'Business Listening', description: 'Nghe hiểu trong môi trường kinh doanh' },
            { _id: 'plo9', code: 'PLO2', name: 'Business Reading', description: 'Đọc hiểu tài liệu kinh doanh' }
          ],
          courses: [],
          updatedAt: new Date('2025-01-10')
        }
      };
    // END OF MOCK DATA
  };

  // ===== PROGRAM WORKFLOW HANDLERS =====
  const handleSubmitProgram = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn nộp chương trình này để phê duyệt?')) {
      return;
    }

    try {
      setActionLoading(true);
      await programService.submitProgram(id, {});
      alert('Đã nộp chương trình thành công!');
      fetchProgramDetail();
    } catch (err) {
      console.error('Error submitting program:', err);
      alert(err.message || 'Có lỗi xảy ra khi nộp chương trình');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveProgram = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn duyệt chương trình này?\n\nLưu ý: Tất cả các môn học trong chương trình sẽ được duyệt cùng lúc.')) {
      return;
    }

    try {
      setActionLoading(true);
      await programService.approveProgram(id, {
        approvalNote: 'Đã được phê duyệt bởi Center Head'
      });
      alert('Đã duyệt chương trình và toàn bộ môn học thành công!');
      fetchProgramDetail();
    } catch (err) {
      console.error('Error approving program:', err);
      alert(err.message || 'Có lỗi xảy ra khi duyệt chương trình');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectProgram = () => {
    setShowRejectProgramModal(true);
  };

  const handleConfirmRejectProgram = async () => {
    if (!rejectionReason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      setActionLoading(true);
      await programService.rejectProgram(id, {
        rejectionReason
      });
      alert('Đã từ chối chương trình thành công!');
      setShowRejectProgramModal(false);
      setRejectionReason('');
      fetchProgramDetail();
    } catch (err) {
      console.error('Error rejecting program:', err);
      alert(err.message || 'Có lỗi xảy ra khi từ chối chương trình');
    } finally {
      setActionLoading(false);
    }
  };

  // ===== COURSE WORKFLOW HANDLERS =====
  const handleSubmitCourse = async (courseId) => {
    if (!window.confirm('Bạn có chắc chắn muốn nộp môn học này để phê duyệt?')) {
      return;
    }

    try {
      setActionLoading(true);
      await courseService.submitCourse(courseId, {});
      alert('Đã nộp môn học thành công!');
      fetchProgramDetail();
    } catch (err) {
      console.error('Error submitting course:', err);
      alert(err.message || 'Có lỗi xảy ra khi nộp môn học');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveCourse = async (courseId) => {
    if (!window.confirm('Bạn có chắc chắn muốn duyệt môn học này?')) {
      return;
    }

    try {
      setActionLoading(true);
      await courseService.approveCourse(courseId, {
        approvalNote: 'Đã được phê duyệt bởi Center Head'
      });
      alert('Đã duyệt môn học thành công!');
      fetchProgramDetail();
    } catch (err) {
      console.error('Error approving course:', err);
      alert(err.message || 'Có lỗi xảy ra khi duyệt môn học');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectCourse = (courseId) => {
    setSelectedCourseId(courseId);
    setShowRejectModal(true);
  };

  const handleConfirmRejectCourse = async () => {
    if (!rejectionReason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      setActionLoading(true);
      await courseService.rejectCourse(selectedCourseId, {
        rejectionReason
      });
      alert('Đã từ chối môn học thành công!');
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedCourseId(null);
      fetchProgramDetail();
    } catch (err) {
      console.error('Error rejecting course:', err);
      alert(err.message || 'Có lỗi xảy ra khi từ chối môn học');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-main-600" role="status" />
      </div>
    );
  }

  if (!program) {
    return (
      <Card>
        <div className="text-center py-5">
          <i className="ph ph-warning-circle text-warning-500" style={{ fontSize: '64px' }}></i>
          <h5 className="text-neutral-600 mt-3 mb-3">Không tìm thấy chương trình</h5>
          <Button
            variant="primary"
            onClick={() => navigate('/center-head/programs')}
          >
            Quay lại danh sách
          </Button>
        </div>
      </Card>
    );
  }

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/center-head/dashboard' },
    { label: 'Chương trình đào tạo', path: '/center-head/programs' },
    { label: program.program_name, path: `/center-head/programs/${id}` },
  ];

  const courseColumns = [
    {
      header: 'Tên môn học',
      field: 'name',
      render: (row) => (
        <div>
          <div className="fw-semibold text-neutral-900 mb-1">{row.name}</div>
          <div className="text-sm text-neutral-600 d-none d-md-block">{row.description}</div>
        </div>
      ),
    },
    {
      header: 'CLOs',
      field: 'clos',
      hideOnMobile: true,
      render: (row) => (
        <span className="text-neutral-700">{row.clos?.length || 0} CLOs</span>
      ),
    },
    {
      header: 'Sessions',
      field: 'sessions',
      hideOnMobile: true,
      render: (row) => (
        <span className="text-neutral-700">{row.sessions?.length || 0} buổi học</span>
      ),
    },
    {
      header: 'Trạng thái',
      field: 'status',
      render: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      header: 'Cập nhật',
      field: 'updatedAt',
      hideOnMobile: true,
      render: (row) => (
        <span className="text-neutral-700">{formatDate(row.updatedAt)}</span>
      ),
    },
    {
      header: 'Hành động',
      field: 'actions',
      render: (row) => (
        <div className="d-flex flex-wrap gap-2">
          {/* Draft: Subject Leader can submit */}
          {row.status === 'draft' && (
            <Button
              variant="primary"
              size="sm"
              icon="ph ph-paper-plane-tilt"
              onClick={(e) => {
                e.stopPropagation();
                handleSubmitCourse(row._id);
              }}
              disabled={actionLoading}
            >
              <span className="d-none d-md-inline">Nộp</span>
              <span className="d-inline d-md-none">Nộp</span>
            </Button>
          )}

          {/* Pending Approval: Center Head can approve/reject */}
          {row.status === 'pending_approval' && userRole === 'centerhead' && (
            <>
              <Button
                variant="success"
                size="sm"
                icon="ph ph-check"
                onClick={(e) => {
                  e.stopPropagation();
                  handleApproveCourse(row._id);
                }}
                disabled={actionLoading}
              >
                <span className="d-none d-md-inline">Duyệt</span>
                <span className="d-inline d-md-none">✓</span>
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon="ph ph-x"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRejectCourse(row._id);
                }}
                disabled={actionLoading}
              >
                <span className="d-none d-md-inline">Từ chối</span>
                <span className="d-inline d-md-none">✗</span>
              </Button>
            </>
          )}

          {/* Needs Revision: Can resubmit */}
          {row.status === 'needs_revision' && (
            <Button
              variant="warning"
              size="sm"
              icon="ph ph-arrow-clockwise"
              onClick={(e) => {
                e.stopPropagation();
                handleSubmitCourse(row._id);
              }}
              disabled={actionLoading}
            >
              <span className="d-none d-md-inline">Nộp lại</span>
              <span className="d-inline d-md-none">Nộp lại</span>
            </Button>
          )}

          {/* View button for all statuses */}
          <Button
            variant="outline"
            size="sm"
            icon="ph ph-eye"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/center-head/courses/${row._id}/details`);
            }}
          >
            <span className="d-none d-md-inline">Xem</span>
            <span className="d-inline d-md-none">👁</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="program-detail-container">
      <Breadcrumb items={breadcrumbItems} />

      {/* Header Section */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-24 gap-3">
        <div className="flex-grow-1">
          <div className="d-flex align-items-center gap-3 mb-12">
            <Button
              variant="ghost"
              icon="ph ph-arrow-left"
              onClick={() => navigate('/center-head/programs')}
            >
              Quay lại
            </Button>
          </div>
          <h4 className="mb-8 text-neutral-900 fw-bold">{program.program_name}</h4>
          <p className="text-neutral-600 mb-12">{program.description}</p>
          <div className="d-flex flex-wrap align-items-center gap-3">
            <StatusBadge status={program.status} />
            <span className="text-neutral-600">Mã: <strong>{program.code}</strong></span>
          </div>
        </div>
        <div className="d-flex flex-wrap gap-2">
          {/* Draft or Needs Revision: Subject Leader can submit */}
          {(program.status === 'draft' || program.status === 'needs_revision') && (
            <Button
              variant="primary"
              icon="ph ph-paper-plane-tilt"
              onClick={handleSubmitProgram}
              disabled={actionLoading}
            >
              {program.status === 'needs_revision' ? 'Nộp lại Program' : 'Nộp Program'}
            </Button>
          )}

          {/* Pending Approval: Center Head can approve/reject */}
          {program.status === 'pending_approval' && userRole === 'centerhead' && (
            <>
              <Button
                variant="success"
                icon="ph ph-check"
                onClick={handleApproveProgram}
                disabled={actionLoading}
              >
                Duyệt Program
              </Button>
              <Button
                variant="danger"
                icon="ph ph-x"
                onClick={handleRejectProgram}
                disabled={actionLoading}
              >
                Từ chối Program
              </Button>
            </>
          )}

          <Button
            variant="outline"
            icon="ph ph-pencil-simple"
            onClick={() => navigate(`/center-head/programs/${id}/edit`)}
          >
            Chỉnh sửa
          </Button>
        </div>
      </div>

      {/* Program Rejection Warning */}
      {program.status === 'needs_revision' && program.rejectionReason && (
        <div className="alert alert-warning mb-24" role="alert" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="d-flex align-items-start">
            <i className="ph ph-warning-circle" style={{ fontSize: '24px', marginRight: '12px', color: '#f59e0b' }}></i>
            <div>
              <h6 className="mb-2 fw-bold">Program bị từ chối - Cần chỉnh sửa</h6>
              <p className="mb-1"><strong>Lý do từ chối:</strong></p>
              <p className="mb-0">{program.rejectionReason}</p>
              {program.rejectedBy && (
                <p className="mb-0 mt-2 text-sm text-muted">
                  Từ chối bởi: {program.rejectedBy.username || program.rejectedBy.email} - {formatDate(program.rejectedAt)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="row g-3 g-md-4 mb-24">
        <div className="col-6 col-md-3">
          <Card>
            <h6 className="text-neutral-600 mb-8">Tổng PLOs</h6>
            <h4 className="text-main-600 fw-bold mb-0">{program.plos?.length || 0}</h4>
          </Card>
        </div>
        <div className="col-6 col-md-3">
          <Card>
            <h6 className="text-neutral-600 mb-8">Tổng Courses</h6>
            <h4 className="text-success-600 fw-bold mb-0">{courses.length}</h4>
          </Card>
        </div>
        <div className="col-6 col-md-3">
          <Card>
            <h6 className="text-neutral-600 mb-8">Tổng CLOs</h6>
            <h4 className="text-warning-600 fw-bold mb-0">{cloMapping.length}</h4>
          </Card>
        </div>
        <div className="col-6 col-md-3">
          <Card>
            <h6 className="text-neutral-600 mb-8">Cập nhật lần cuối</h6>
            <h6 className="text-neutral-700 fw-semibold mb-0">{formatDate(program.updatedAt)}</h6>
          </Card>
        </div>
      </div>

      {/* Program Learning Outcomes (PLOs) */}
      <Card className="mb-24">
        <div className="d-flex justify-content-between align-items-center mb-20">
          <h5 className="mb-0 text-neutral-900 fw-bold">Program Learning Outcomes (PLOs)</h5>
        </div>

        {program.plos && program.plos.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead style={{ backgroundColor: '#F9FAFB' }}>
                <tr>
                  <th className="text-neutral-900 fw-semibold border-0" style={{ padding: '12px 16px' }}>Mã PLO</th>
                  <th className="text-neutral-900 fw-semibold border-0" style={{ padding: '12px 16px' }}>Mô tả</th>
                </tr>
              </thead>
              <tbody>
                {program.plos.map((plo) => (
                  <tr key={plo._id}>
                    <td style={{ padding: '16px' }}>
                      <span className="badge bg-main-50 text-main-600 fw-semibold" style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '20px' }}>
                        {plo.code}
                      </span>
                    </td>
                    <td className="text-neutral-700" style={{ padding: '16px' }}>
                      <div className="fw-semibold mb-1">{plo.name}</div>
                      <div className="text-sm text-neutral-600">{plo.detail}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-5 text-neutral-600">
            <i className="ph ph-books text-neutral-400" style={{ fontSize: '48px' }}></i>
            <p className="mt-3 mb-0">Chưa có PLO nào được liên kết</p>
          </div>
        )}
      </Card>

      {/* CLO → PLO Mapping */}
      <Card className="mb-24">
        <div className="d-flex justify-content-between align-items-center mb-20">
          <div>
            <h5 className="mb-4 text-neutral-900 fw-bold">Ánh xạ CLO → PLO</h5>
            <p className="text-neutral-600 mb-0 text-sm">
              Liên kết giữa các kết quả học tập cấp khóa học với cấp chương trình
            </p>
          </div>
        </div>

        {cloMapping.length > 0 ? (
          <div>
            {cloMapping.map((clo) => (
              <div
                key={clo._id}
                className="border rounded mb-3 p-3"
                style={{
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  transition: 'box-shadow 0.2s',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                <div className="d-flex align-items-start mb-3">
                  <div className="me-3">
                    <span
                      className="badge fw-semibold"
                      style={{
                        backgroundColor: '#F3E8FF',
                        color: '#9333EA',
                        padding: '8px 16px',
                        fontSize: '13px',
                        borderRadius: '20px'
                      }}
                    >
                      {clo.code}
                    </span>
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-2 text-neutral-900 fw-semibold">{clo.name}</h6>
                    <p className="text-neutral-600 mb-2" style={{ fontSize: '14px' }}>{clo.detail}</p>
                    <p className="text-neutral-500 mb-0" style={{ fontSize: '12px' }}>
                      <i className="ph ph-book-open me-1"></i>
                      Từ môn: <strong>{clo.courseName}</strong>
                    </p>
                  </div>
                </div>

                <div className="ms-4 ps-3" style={{paddingBottom: 5}}>
                  <p className="fw-semibold text-neutral-700 mb-2" style={{ fontSize: '13px' }}>LIÊN KẾT PLOs:</p>
                  {clo.mappedPLOs && clo.mappedPLOs.length > 0 ? (
                    <div className="d-flex flex-wrap gap-2">
                      {clo.mappedPLOs.map((plo) => (
                        <div
                          key={plo._id}
                          className="d-flex align-items-center gap-2"
                          style={{
                            backgroundColor: '#EFF6FF',
                            padding: '6px 12px',
                            borderRadius: '8px'
                          }}
                        >
                          <span
                            className="badge text-white"
                            style={{
                              backgroundColor: '#2563EB',
                              padding: '4px 10px',
                              fontSize: '11px',
                              borderRadius: '12px'
                            }}
                          >
                            {plo.code}
                          </span>
                          <span className="text-neutral-900" style={{ fontSize: '13px' }}>{plo.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-neutral-500 fst-italic" style={{ fontSize: '13px' }}>Chưa liên kết với PLO nào</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5 text-neutral-600">
            <i className="ph ph-link text-neutral-400" style={{ fontSize: '48px' }}></i>
            <p className="mt-3 mb-0">Chưa có CLO nào trong chương trình này</p>
          </div>
        )}
      </Card>

      {/* Courses List */}
      <Card>
        <div className="d-flex justify-content-between align-items-center mb-20">
          <div>
            <h5 className="mb-4 text-neutral-900 fw-bold">Danh sách Môn học ({courses.length})</h5>
            <p className="text-neutral-600 mb-0 text-sm">
              Các môn học thuộc chương trình này
            </p>
          </div>
        </div>

        {/* Course Rejection Warnings */}
        {courses.filter(c => c.status === 'needs_revision' && c.rejectionReason).length > 0 && (
          <div className="mb-3">
            {courses
              .filter(c => c.status === 'needs_revision' && c.rejectionReason)
              .map((course) => (
                <div
                  key={course._id}
                  className="alert alert-danger mb-2"
                  role="alert"
                  style={{ borderLeft: '4px solid #ef4444' }}
                >
                  <div className="d-flex align-items-start">
                    <i className="ph ph-x-circle" style={{ fontSize: '20px', marginRight: '12px', color: '#ef4444' }}></i>
                    <div className="flex-grow-1">
                      <h6 className="mb-1 fw-bold">{course.name} - Bị từ chối</h6>
                      <p className="mb-1 text-sm"><strong>Lý do:</strong> {course.rejectionReason}</p>
                      {course.rejectedBy && (
                        <p className="mb-0 text-xs text-muted">
                          Từ chối bởi: {course.rejectedBy.username || course.rejectedBy.email} - {formatDate(course.rejectedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {courses.length > 0 ? (
          <Table
            columns={courseColumns}
            data={courses}
            onRowClick={(row) => navigate(`/center-head/courses/${row._id}/details`)}
          />
        ) : (
          <div className="text-center py-5 text-neutral-600">
            <i className="ph ph-book text-neutral-400" style={{ fontSize: '48px' }}></i>
            <p className="mt-3 mb-0">Chưa có môn học nào trong chương trình này</p>
          </div>
        )}
      </Card>

      {/* Reject Course Modal */}
      {showRejectModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Từ chối môn học</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                    setSelectedCourseId(null);
                  }}
                  disabled={actionLoading}
                ></button>
              </div>
              <div className="modal-body">
                <label className="form-label">Lý do từ chối *</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Nhập lý do từ chối môn học..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  disabled={actionLoading}
                ></textarea>
              </div>
              <div className="modal-footer">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                    setSelectedCourseId(null);
                  }}
                  disabled={actionLoading}
                >
                  Hủy
                </Button>
                <Button
                  variant="danger"
                  onClick={handleConfirmRejectCourse}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Đang xử lý...' : 'Xác nhận từ chối'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Program Modal */}
      {showRejectProgramModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Từ chối chương trình</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowRejectProgramModal(false);
                    setRejectionReason('');
                  }}
                  disabled={actionLoading}
                ></button>
              </div>
              <div className="modal-body">
                <label className="form-label">Lý do từ chối *</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Nhập lý do từ chối chương trình..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  disabled={actionLoading}
                ></textarea>
              </div>
              <div className="modal-footer">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectProgramModal(false);
                    setRejectionReason('');
                  }}
                  disabled={actionLoading}
                >
                  Hủy
                </Button>
                <Button
                  variant="danger"
                  onClick={handleConfirmRejectProgram}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Đang xử lý...' : 'Xác nhận từ chối'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramDetail;
