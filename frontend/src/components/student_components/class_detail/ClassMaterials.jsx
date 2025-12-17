import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import studentService from '../../../services/studentService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Class Materials Component for Student
 * Danh sách tài liệu học tập của lớp - View only (similar to teacher design)
 */
const ClassMaterials = () => {
  const { classId } = useParams();
  const [courseMaterials, setCourseMaterials] = useState([]);
  const [classMaterials, setClassMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (classId) {
      fetchMaterials();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch class materials
      try {
        const response = await studentService.getClassMaterials(classId);
        setClassMaterials(response.materials || []);
      } catch (classErr) {
        console.error('Error fetching class materials:', classErr);
        setClassMaterials([]);
      }

      // Fetch course materials if available
      // Note: May need to implement studentService.getCourseMaterials
      // For now, using empty array
      setCourseMaterials([]);
    } catch (err) {
      console.error('Unexpected error in fetchMaterials:', err);
      if (!err.message?.includes('Route not found') && !err.message?.includes('404')) {
        setError('Không thể tải danh sách tài liệu');
      }
    } finally {
      setLoading(false);
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
    if (!url || typeof url !== 'string') return '';
    const extension = url.split('.').pop().toLowerCase();
    return extension;
  };

  const getFileIcon = (url) => {
    if (!url || typeof url !== 'string') return 'fa-file';
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
    if (!url || typeof url !== 'string') return 'text-neutral-600';
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
    if (!url || typeof url !== 'string') return 'Unknown';
    return url.split('/').pop();
  };

  // Group class materials by lesson
  const groupedClassMaterials = classMaterials.reduce((acc, material) => {
    const key = `${material.lessonNumber}-${material.lessonTitle}`;
    if (!acc[key]) {
      acc[key] = {
        lessonNumber: material.lessonNumber,
        lessonTitle: material.lessonTitle,
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
              Tài liệu chung của khóa học
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

      {/* Class Materials Section */}
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
          <Badge bg="primary" className="px-12 py-6">
            {classMaterials.length} tài liệu
          </Badge>
        </div>

        {classMaterials.length === 0 ? (
          <div className="bg-white border-0 rounded-12 text-center py-60" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
            <i className="fas fa-folder-open text-neutral-300 mb-3" style={{ fontSize: '48px' }}></i>
            <p className="text-neutral-500 mb-0">Chưa có tài liệu nào cho lớp này</p>
            <p className="text-neutral-400 text-13 mt-2 mb-0">Giảng viên sẽ cập nhật tài liệu học tập sau</p>
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
                    <Col md={4} key={`material-${matIndex}`}>
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
                              <div className="text-neutral-500 text-11">
                                {material.uploadDate && new Date(material.uploadDate).toLocaleDateString('vi-VN')}
                              </div>
                            </div>
                          </div>

                          <div className="d-flex gap-8">
                            <Button 
                              className="btn-outline-main flex-grow-1 text-12 px-12 py-6 radius-6"
                              onClick={() => handleDownloadMaterial(material.url, material.title || getFileName(material.url))}
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassMaterials;
