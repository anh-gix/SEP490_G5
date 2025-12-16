import React from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';

const ClassMaterials = ({ materials, setShowMaterialModal, getFileIcon, getFileIconColor }) => {
  return (
    <div className="p-24">
      <div className="d-flex justify-content-between align-items-center mb-20">
        <h6 className="text-neutral-900 fw-semibold mb-0">Tài liệu học tập</h6>
        <Button className="btn-main px-16 py-8 radius-8" onClick={() => setShowMaterialModal(true)}>
          <i className="fas fa-upload me-2"></i>
          Tải lên tài liệu
        </Button>
      </div>

      <Row className="g-3">
        {materials.map(material => (
          <Col md={4} key={material.id}>
            <Card className="border border-neutral-100 rounded-12 hover-shadow transition-2 h-100">
              <Card.Body className="p-20">
                <div className="d-flex align-items-start gap-12 mb-12">
                  <div className={`rounded-8 d-flex align-items-center justify-content-center ${getFileIconColor(material.type)}`}
                       style={{ width: '40px', height: '40px', backgroundColor: '#F1F3F5' }}>
                    <i className={`fas ${getFileIcon(material.type)}`} style={{ fontSize: '20px' }}></i>
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
                      {material.title}
                    </div>
                    <div className="text-neutral-500 text-11">
                      {new Date(material.uploadedAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-12">
                  <span className="text-neutral-600 text-12">{material.size}</span>
                  <span className="text-neutral-500 text-11">
                    <i className="fas fa-download me-1"></i>
                    {material.downloads} lượt tải
                  </span>
                </div>

                <div className="d-flex gap-8">
                  <Button className="btn-outline-main flex-grow-1 text-12 px-12 py-6 radius-6">
                    <i className="fas fa-eye me-1"></i>
                    Xem
                  </Button>
                  <Button className="btn-outline-danger text-12 px-12 py-6 radius-6">
                    <i className="fas fa-trash"></i>
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ClassMaterials;
