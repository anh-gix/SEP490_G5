import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../compo/Breadcrumb';
import Card from '../compo/Card';
import Button from '../compo/Button';
import StatusBadge from '../compo/StatusBadge';
import Table from '../compo/Table';
import { getProgramById, mockCourses, simulateApiDelay } from '../../../helper/mockdataExtended';
import { formatDate } from '../../../helper/helper';

const ProgramDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [cloMapping, setCloMapping] = useState([]);

  useEffect(() => {
    fetchProgramDetail();
  }, [id]);

  const fetchProgramDetail = async () => {
    try {
      setLoading(true);
      await simulateApiDelay(500);

      // Fetch program data
      const programData = getProgramById(id);
      setProgram(programData);

      // Fetch courses belonging to this program
      const programCourses = mockCourses.filter(
        course => course.program._id === id
      );
      setCourses(programCourses);

      // Build CLO → PLO mapping
      const cloMappingData = [];
      programCourses.forEach(course => {
        course.cloDetails?.forEach(clo => {
          cloMappingData.push({
            _id: clo._id,
            code: clo.code,
            name: clo.name,
            detail: clo.detail,
            courseName: course.name,
            mappedPLOs: clo.mappedPLOs || []
          });
        });
      });
      setCloMapping(cloMappingData);

    } catch (err) {
      console.error('Error fetching program detail:', err);
    } finally {
      setLoading(false);
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
          <div className="text-sm text-neutral-600">{row.description}</div>
        </div>
      ),
    },
    {
      header: 'CLOs',
      field: 'clos',
      render: (row) => (
        <span className="text-neutral-700">{row.clos?.length || 0} CLOs</span>
      ),
    },
    {
      header: 'Sessions',
      field: 'sessions',
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
      render: (row) => (
        <span className="text-neutral-700">{formatDate(row.updatedAt)}</span>
      ),
    },
  ];

  return (
    <div className="program-detail-container">
      <Breadcrumb items={breadcrumbItems} />

      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-start mb-24">
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
          <div className="d-flex align-items-center gap-3">
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
      <div className="row g-4 mb-24">
        <div className="col-md-3">
          <Card>
            <h6 className="text-neutral-600 mb-8">Tổng PLOs</h6>
            <h4 className="text-main-600 fw-bold mb-0">{program.plos?.length || 0}</h4>
          </Card>
        </div>
        <div className="col-md-3">
          <Card>
            <h6 className="text-neutral-600 mb-8">Tổng Courses</h6>
            <h4 className="text-success-600 fw-bold mb-0">{courses.length}</h4>
          </Card>
        </div>
        <div className="col-md-3">
          <Card>
            <h6 className="text-neutral-600 mb-8">Tổng CLOs</h6>
            <h4 className="text-warning-600 fw-bold mb-0">{cloMapping.length}</h4>
          </Card>
        </div>
        <div className="col-md-3">
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

        {program.ploDetails && program.ploDetails.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead style={{ backgroundColor: '#F9FAFB' }}>
                <tr>
                  <th className="text-neutral-900 fw-semibold border-0" style={{ padding: '12px 16px' }}>Mã PLO</th>
                  <th className="text-neutral-900 fw-semibold border-0" style={{ padding: '12px 16px' }}>Tên PLO</th>
                  <th className="text-neutral-900 fw-semibold border-0" style={{ padding: '12px 16px' }}>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {program.ploDetails.map((plo) => (
                  <tr key={plo._id}>
                    <td style={{ padding: '16px' }}>
                      <span className="badge bg-main-50 text-main-600 fw-semibold" style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '20px' }}>
                        {plo.code}
                      </span>
                    </td>
                    <td className="text-neutral-900 fw-semibold" style={{ padding: '16px' }}>{plo.name}</td>
                    <td className="text-neutral-700" style={{ padding: '16px' }}>{plo.detail || 'N/A'}</td>
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
    </div>
  );
};

export default ProgramDetail;
