import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import teacherService from '../../../services/teacherService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const ClassMaterials = ({ classId, courseId, setShowMaterialModal, onMaterialsLoaded }) => {
  const [courseMaterials, setCourseMaterials] = useState([]);
  const [classMaterials, setClassMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [managementMode, setManagementMode] = useState(false); // Toggle between view and manage mode

  useEffect(() => {
    if (classId) {
      fetchMaterials();
    }
  }, [classId, courseId]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch class materials
      try {
        const classResponse = await teacherService.getClassMaterials(classId);
        if (classResponse.success) {
          setClassMaterials(classResponse.materials || []);
        }
      } catch (classErr) {
        console.error('Error fetching class materials:', classErr);
        // If endpoint doesn't exist yet, set empty array
        if (classErr.message?.includes('Route not found') || classErr.message?.includes('404')) {
          console.warn(' Class materials API not implemented yet, using empty data');
          setClassMaterials([]);
        } else {
          // For other errors, set empty and log
          console.error(' Critical error fetching class materials:', classErr);
          setClassMaterials([]);
        }
      }

      // Fetch course materials if courseId exists (optional, may not be implemented)
      if (courseId) {
        try {
          const courseResponse = await teacherService.getCourseMaterials(courseId);
          if (courseResponse.success) {
            setCourseMaterials(courseResponse.materials || []);
          }
        } catch (err) {
          console.warn(' Course materials API not available:', err.message);
          // Not critical, continue with empty course materials
          setCourseMaterials([]);
        }
      }

      // Notify parent that materials are loaded (for refresh)
      if (onMaterialsLoaded) {
        onMaterialsLoaded();
      }
    } catch (err) {
      console.error(' Unexpected error in fetchMaterials:', err);
      // Don't show error for missing API endpoints
      if (!err.message?.includes('Route not found') && !err.message?.includes('404')) {
        setError(err.message || 'Không thể tải danh sách tài liệu');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMaterial = async (scheduleId, materialUrl, lessonTitle) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa tài liệu',
      html: `
        <p>Bạn có chắc chắn muốn xóa tài liệu này?</p>
        <p class="text-muted mb-0">Buổi học: <strong>${lessonTitle}</strong></p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (!result.isConfirmed) return;

    try {
      await teacherService.deleteMaterialFromSchedule(scheduleId, materialUrl);
      
      toast.success('Xóa tài liệu thành công!', {
        position: 'top-right',
        autoClose: 3000
      });

      // Refresh materials list
      fetchMaterials();
    } catch (err) {
      console.error('Error deleting material:', err);
      const errorMsg = err.message || 'Không thể xóa tài liệu. Vui lòng thử lại.';
      toast.error(errorMsg, {
        position: 'top-right',
        autoClose: 5000
      });
    }
  };

  const handleDownloadMaterial = (url, title) => {
    window.open(`${API_URL}${url}`, '_blank');
    toast.info(`Đang mở file: ${title}`, {
      position: 'top-right',
      autoClose: 2000
    });
  };

  const getFileExtension = (url) => {
    const extension = url.split('.').pop().toLowerCase();
    return extension;
  };

  const getFileIcon = (url) => {
    const ext = getFileExtension(url);
    const iconMap = {
      pdf: 'fa-file-pdf',
      doc: 'fa-file-word',
      docx: 'fa-file-word',
      xls: 'fa-file-excel',
      xlsx: 'fa-file-excel',
      ppt: 'fa-file-powerpoint',
      pptx: 'fa-file-powerpoint',
      zip: 'fa-file-archive',
      rar: 'fa-file-archive',
      mp3: 'fa-file-audio',
      mp4: 'fa-file-video',
      jpg: 'fa-file-image',
      jpeg: 'fa-file-image',
      png: 'fa-file-image'
    };
    return iconMap[ext] || 'fa-file';
  };

  const getFileIconColor = (url) => {
    const ext = getFileExtension(url);
    const colorMap = {
      pdf: 'text-danger-600',
      doc: 'text-primary-600',
      docx: 'text-primary-600',
      xls: 'text-success-600',
      xlsx: 'text-success-600',
      ppt: 'text-warning-600',
      pptx: 'text-warning-600',
      zip: 'text-neutral-600',
      rar: 'text-neutral-600',
      mp3: 'text-info-600',
      mp4: 'text-purple-600'
    };
    return colorMap[ext] || 'text-neutral-600';
  };

  const getFileName = (url) => {
    return url.split('/').pop();
  };

  // Group class materials by lesson
  const groupedClassMaterials = classMaterials.reduce((acc, material) => {
    const key = `${material.lessonNumber}-${material.lessonTitle}`;
    if (!acc[key]) {
      acc[key] = {
        lessonNumber: material.lessonNumber,
        lessonTitle: material.lessonTitle,
        scheduleId: material.scheduleId,
        materials: []
      };
    }
    acc[key].materials.push(material);
    return acc;
  }, {});

  const sortedGroupedMaterials = Object.values(groupedClassMaterials).sort(
    (a, b) => (b.lessonNumber || 0) - (a.lessonNumber || 0)
  );

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-neutral-600">Đang tải danh sách tài liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-24">
        <Alert variant="danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
          <Button variant="outline-danger" size="sm" className="ms-3" onClick={fetchMaterials}>
            <i className="fas fa-redo me-2"></i>Thử lại
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-24">
      {/* Course Materials Section (Read-only) */}
      <div className="mb-32">
        <div className="d-flex justify-content-between align-items-center mb-20">
          <div>
            <h6 className="text-neutral-900 fw-semibold mb-1">
              <i className="fas fa-book me-2 text-primary-600"></i>
              Tài liệu khóa học
            </h6>
            <p className="text-neutral-500 text-13 mb-0">
              Tài liệu chung của khóa học (chỉ xem)
            </p>
          </div>
          <Badge bg="info" className="px-12 py-6">
            {courseMaterials.length} tài liệu
          </Badge>
        </div>

        {courseMaterials.length === 0 ? (
          <div className="bg-white border-0 rounded-12 text-center py-10" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
            <i className="fas fa-book-open text-neutral-300 mb-3" style={{ fontSize: '48px' }}></i>
            <p className="text-neutral-500 mb-0">Chưa có tài liệu khóa học</p>
          </div>
        ) : (
          <Row className="g-3">
            {courseMaterials.map((material, index) => (
              <Col md={4} key={`course-${index}`}>
                <Card className="border border-neutral-100 rounded-12 hover-shadow transition-2 h-100">
                  <Card.Body className="p-20">
                    <div className="d-flex align-items-start gap-12 mb-12">
                      <div className={`rounded-8 d-flex align-items-center justify-content-center ${getFileIconColor(material.url)}`}
                           style={{ width: '40px', height: '40px', backgroundColor: '#F1F3F5' }}>
                        <i className={`fas ${getFileIcon(material.url)}`} style={{ fontSize: '20px' }}></i>
                      </div>
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <div className="text-neutral-900 fw-semibold text-14 mb-4"
                             style={{ 
                               overflow: 'hidden', 
                               textOverflow: 'ellipsis',
                               display: '-webkit-box',
                               WebkitLineClamp: 2,
                               WebkitBoxOrient: 'vertical'
                             }}>
                          {material.title || getFileName(material.url)}
                        </div>
                        <Badge bg="secondary" className="text-10 px-8 py-4">
                          Tài liệu khóa học
                        </Badge>
                      </div>
                    </div>

                    <div className="d-flex gap-8">
                      <Button 
                        className="btn-outline-main flex-grow-1 text-12 px-12 py-6 radius-6"
                        onClick={() => handleDownloadMaterial(material.url, material.title)}
                      >
                        <i className="fas fa-eye me-1"></i>
                        Xem
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* Divider */}
      <div className="mb-32" style={{ borderTop: '1px solid #E5E7EB' }}></div>

      {/* Class Materials Section (Editable) */}
      <div>
        <div className="d-flex justify-content-between align-items-center mb-20">
          <div>
            <h6 className="text-neutral-900 fw-semibold mb-1">
              <i className="fas fa-folder-open me-2 text-main-600"></i>
              Tài liệu riêng của lớp
            </h6>
            <p className="text-neutral-500 text-13 mb-0">
              Tài liệu được thêm riêng cho lớp này
            </p>
          </div>
          <div className="d-flex gap-2">
            {!managementMode ? (
              <>
                <Badge bg="primary" className="px-12 py-6">
                  {classMaterials.length} tài liệu
                </Badge>
                {classMaterials.length > 0 && (
                  <Button 
                    className="btn-outline-main px-16 py-8 radius-8 text-13"
                    onClick={() => setManagementMode(true)}
                  >
                    <i className="fas fa-cog me-2"></i>
                    Quản lý tài liệu lớp
                  </Button>
                )}
              </>
            ) : (
              <Button 
                className="btn-outline-secondary px-16 py-8 radius-8 text-13"
                onClick={() => setManagementMode(false)}
              >
                <i className="fas fa-times me-2"></i>
                Đóng chế độ quản lý
              </Button>
            )}
            <Button 
              className="btn-main px-16 py-8 radius-8 text-13" 
              onClick={() => setShowMaterialModal(true)}
            >
              
              Thêm tài liệu
            </Button>
          </div>
        </div>

        {classMaterials.length === 0 ? (
          <div className="bg-white border-0 rounded-12 text-center py-60" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
            <i className="fas fa-folder-open text-neutral-300 mb-3" style={{ fontSize: '48px' }}></i>
            <p className="text-neutral-500 mb-0">Chưa có tài liệu nào cho lớp này</p>
            <p className="text-neutral-400 text-13 mt-2 mb-3">Bắt đầu thêm tài liệu cho các buổi học</p>
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => setShowMaterialModal(true)}
            >
              
              Thêm tài liệu đầu tiên
            </Button>
          </div>
        ) : (
          <div className="d-flex flex-column gap-4">
            {sortedGroupedMaterials.map((group, groupIndex) => (
              <div key={`lesson-${groupIndex}`} className="mb-14">
                <h6 className="text-neutral-700 fw-bold mb-12 text-15">
                  <i className="fas fa-book-reader me-2 text-primary-600"></i>
                  Buổi {group.lessonNumber}: {group.lessonTitle}
                </h6>
                <Row className="g-3">
                  {group.materials.map((material, matIndex) => (
                    <Col md={2} key={`material-${matIndex}`}>
                      <Card className="border border-neutral-100 rounded-12 hover-shadow transition-2 h-100">
                        <Card.Body className="p-20 pb-0">
                          <div className="d-flex align-items-start gap-12 mb-12">
                            <div className={`rounded-8 d-flex align-items-center justify-content-center ${getFileIconColor(material.url)}`}
                                 style={{ width: '40px', height: '40px', backgroundColor: '#F1F3F5' }}>
                              <i className={`fas ${getFileIcon(material.url)}`} style={{ fontSize: '20px' }}></i>
                            </div>
                            <div className="flex-grow-1" style={{ minWidth: 0 }}>
                              <div className="text-neutral-900 fw-semibold text-14 mb-4"
                                   style={{ 
                                     overflow: 'hidden', 
                                     textOverflow: 'ellipsis',
                                     display: '-webkit-box',
                                     WebkitLineClamp: 2,
                                     WebkitBoxOrient: 'vertical'
                                   }}>
                                {material.title || getFileName(material.url)}
                              </div>
                              <div className="text-neutral-500 text-11">
                                {material.uploadDate && new Date(material.uploadDate).toLocaleDateString('vi-VN')}
                              </div>
                            </div>
                          </div>

                          
                        </Card.Body>
                        <Card.Body className="p-20">
                        <div className="d-flex gap-8">
                            <Button 
                              className="btn-outline-main flex-grow-1 text-12 px-12 py-6 radius-6"
                              onClick={() => handleDownloadMaterial(material.url, material.title || getFileName(material.url))}
                            >
                              <i className="fas fa-eye me-1"></i>
                              Xem
                            </Button>
                            {managementMode && (
                              <Button 
                                className="text-12 px-12 py-6 radius-6"
                                style={{
                                  backgroundColor: '#FEE2E2',
                                  border: '1px solid #FECACA',
                                  color: '#DC2626'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#FCA5A5';
                                  e.currentTarget.style.borderColor = '#F87171';
                                  e.currentTarget.style.color = '#FFFFFF';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '#FEE2E2';
                                  e.currentTarget.style.borderColor = '#FECACA';
                                  e.currentTarget.style.color = '#DC2626';
                                }}
                                onClick={() => handleDeleteMaterial(
                                  material.scheduleId, 
                                  material.url, 
                                  `${group.lessonNumber}: ${group.lessonTitle}`
                                )}
                              >
                                <i className="fas fa-trash"></i>
                              </Button>
                            )}
                          </div>
                          </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassMaterials;
