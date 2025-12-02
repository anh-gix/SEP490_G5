import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumb from '../compo/Breadcrumb';
import Card from '../compo/Card';
import Button from '../compo/Button';
import Badge from '../compo/Badge';
import Tabs from '../compo/Tabs';
import { courseService } from '../../../services/courseService';
import { formatDate } from '../../../helper/helper';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await courseService.getCourseDetails(id);

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

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/center-head/dashboard' },
    { label: 'Danh sách môn học', path: '/center-head/courses' },
    { label: 'Chi tiết môn học', path: `/center-head/courses/${id}/details` },
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
  const syllabusTab = (
    <div className="syllabus">
      {course.sessions && course.sessions.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-hover border border-neutral-40">
            <thead className="bg-neutral-20">
              <tr>
                <th className="px-24 py-16 text-neutral-700 fw-semibold" style={{ width: '10%' }}>Order</th>
                <th className="px-24 py-16 text-neutral-700 fw-semibold" style={{ width: '25%' }}>Title</th>
                <th className="px-24 py-16 text-neutral-700 fw-semibold" style={{ width: '40%' }}>Content</th>
                <th className="px-24 py-16 text-neutral-700 fw-semibold" style={{ width: '15%' }}>Learning Type</th>
                <th className="px-24 py-16 text-neutral-700 fw-semibold" style={{ width: '10%' }}>CLOs</th>
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
                  <td className="px-24 py-16 text-neutral-700" style={{ verticalAlign: 'top', whiteSpace: 'pre-wrap' }}>
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
                    ) : '-'}
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
            onClick={() => navigate(-1)}
          >
            Quay lại
          </Button>
          <Button
            variant="primary"
            icon="ph ph-pencil"
            onClick={() => navigate(`/center-head/programs/${course.program?._id || course.program}/courses/${id}/edit-form`)}
          >
            Sửa
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Card>
        <Tabs tabs={tabs} />
      </Card>
    </div>
  );
};

export default CourseDetails;