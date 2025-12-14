import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import studentService from '../../../services/studentService';

/**
 * Class Materials Component for Student
 * Danh sách tài liệu học tập của lớp
 */
const ClassMaterials = () => {
  const { classId } = useParams();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
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
      const response = await studentService.getClassMaterials(classId);
      setMaterials(response.materials || []);
    } catch (error) {
      console.error('Error fetching materials:', error);
      setError('Không thể tải danh sách tài liệu');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (url) => {
    if (!url || typeof url !== 'string') {
      return { icon: 'fa-file', color: 'secondary' };
    }
    
    const fileName = url.split('/').pop() || '';
    const extension = fileName.split('.').pop().toLowerCase();
    
    const iconMap = {
      pdf: { icon: 'fa-file-pdf', color: 'danger' },
      doc: { icon: 'fa-file-word', color: 'primary' },
      docx: { icon: 'fa-file-word', color: 'primary' },
      xls: { icon: 'fa-file-excel', color: 'success' },
      xlsx: { icon: 'fa-file-excel', color: 'success' },
      ppt: { icon: 'fa-file-powerpoint', color: 'warning' },
      pptx: { icon: 'fa-file-powerpoint', color: 'warning' },
      zip: { icon: 'fa-file-archive', color: 'secondary' },
      rar: { icon: 'fa-file-archive', color: 'secondary' },
    };

    return iconMap[extension] || { icon: 'fa-file', color: 'secondary' };
  };

  if (loading) {
    return (
      <div className="p-24 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="text-neutral-500 mt-3">Đang tải tài liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-24">
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="p-24">
      <Card className="bg-white border-0 rounded-12" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
        <Card.Header className="bg-main-25 border-0 p-20">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="text-neutral-900 fw-semibold mb-0">Tài liệu học tập</h5>
            <Badge className="bg-main-600 text-white px-12 py-6">
              {materials.length} tài liệu
            </Badge>
          </div>
        </Card.Header>
        <Card.Body className="p-24">
          {materials.length > 0 ? (
            <div className="d-flex flex-column gap-12">
              {materials.map((material) => {
                const { icon, color } = getFileIcon(material.url);
                
                return (
                  <Card key={material.id} className="border border-neutral-200 rounded-12 hover-shadow" style={{ transition: 'all 0.2s' }}>
                    <Card.Body className="p-16">
                      <div className="d-flex align-items-center gap-12">
                        <div className={`bg-${color}-50 text-${color}-600 rounded-circle d-flex align-items-center justify-content-center`}
                             style={{ width: '48px', height: '48px', minWidth: '48px' }}>
                          <i className={`fas ${icon} fa-lg`}></i>
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="text-neutral-900 fw-semibold mb-4">{material.title}</h6>
                          <div className="d-flex gap-16 text-neutral-500 text-13">
                            <span>
                              <i className="fas fa-book-reader me-1"></i>
                              {material.lessonTitle}
                            </span>
                            <span>
                              <i className="fas fa-calendar me-1"></i>
                              {new Date(material.uploadDate).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => window.open(material.url, '_blank')}
                        >
                          <i className="fas fa-download me-2"></i>
                          Tải xuống
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-60">
              <i className="fas fa-folder-open fa-3x text-neutral-400 mb-16"></i>
              <p className="text-neutral-500 mb-0">Chưa có tài liệu nào</p>
              <p className="text-neutral-400 text-13 mt-2">Giảng viên sẽ cập nhật tài liệu học tập sau</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ClassMaterials;
