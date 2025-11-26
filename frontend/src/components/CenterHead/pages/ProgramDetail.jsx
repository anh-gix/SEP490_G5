import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../compo/Breadcrumb';
import Card from '../compo/Card';
import Button from '../compo/Button';
import StatusBadge from '../compo/StatusBadge';
import Table from '../compo/Table';
import { programService } from '../../../services/programService';
import { courseService } from '../../../services/courseService';
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
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchProgramDetail();
  }, [id]);

  const fetchProgramDetail = async () => {
    try {
      setLoading(true);

      // TODO: Replace with actual API call when backend is ready
      // const response = await programService.getProgramById(id);

      // Mock data based on program ID
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

      const programData = mockPrograms[id];

      if (programData) {
        setProgram(programData);

        // Courses are included in the program response
        const programCourses = programData.courses || [];
        setCourses(programCourses);

        // Build CLO → PLO mapping from courses
        const cloMappingData = [];
        programCourses.forEach(course => {
          if (course.clos && Array.isArray(course.clos)) {
            course.clos.forEach(clo => {
              cloMappingData.push({
                _id: clo._id,
                code: clo.code,
                name: clo.name || clo.description,
                detail: clo.description || clo.detail,
                courseName: course.name,
                mappedPLOs: clo.mappedPLOs || []
              });
            });
          }
        });
        setCloMapping(cloMappingData);

        console.log('Mock program detail loaded:', programData);
      }

    } catch (err) {
      console.error('Error fetching program detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptCourse = async (courseId) => {
    if (!window.confirm('Bạn có chắc chắn muốn chấp nhận giáo trình này vào chương trình?')) {
      return;
    }

    try {
      setActionLoading(true);
      await courseService.acceptCourseToProgram(courseId, {
        approvalNote: 'Đã được chấp nhận bởi Program Head'
      });

      alert('Đã chấp nhận giáo trình thành công!');
      fetchProgramDetail(); // Refresh data
    } catch (err) {
      console.error('Error accepting course:', err);
      alert(err.message || 'Có lỗi xảy ra khi chấp nhận giáo trình');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectCourse = (courseId) => {
    setSelectedCourseId(courseId);
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      setActionLoading(true);
      await courseService.rejectCourseFromProgram(selectedCourseId, {
        rejectionReason
      });

      alert('Đã từ chối giáo trình thành công!');
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedCourseId(null);
      fetchProgramDetail(); // Refresh data
    } catch (err) {
      console.error('Error rejecting course:', err);
      alert(err.message || 'Có lỗi xảy ra khi từ chối giáo trình');
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
          {row.status === 'pending_approval' ? (
            <>
              <Button
                variant="success"
                size="sm"
                icon="ph ph-check"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAcceptCourse(row._id);
                }}
                disabled={actionLoading}
              >
                <span className="d-none d-md-inline">Chấp nhận</span>
                <span className="d-inline d-md-none">OK</span>
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
                <span className="d-inline d-md-none">X</span>
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              icon="ph ph-eye"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/center-head/courses/${row._id}/details`);
              }}
            >
              Xem
            </Button>
          )}
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
        <div className="d-flex gap-2">
          <Button
            variant="outline"
            icon="ph ph-pencil-simple"
            onClick={() => navigate(`/center-head/programs/${id}/edit`)}
          >
            Chỉnh sửa
          </Button>
        </div>
      </div>

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
                    <td className="text-neutral-700" style={{ padding: '16px' }}>{plo.description || 'N/A'}</td>
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

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Từ chối giáo trình</h5>
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
                  placeholder="Nhập lý do từ chối giáo trình..."
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
                  onClick={handleConfirmReject}
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
