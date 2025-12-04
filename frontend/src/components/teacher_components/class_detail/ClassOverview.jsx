import React from 'react';
import { Row, Col, Card, ProgressBar, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const ClassOverview = ({ classInfo, materials, setShowMaterialModal }) => {
  return (
    <div className="p-24">
      <Row className="g-3 mb-24">
        <Col md={3}>
          <Card className="bg-main-25 border-0 h-100">
            <Card.Body className="p-20">
              <div className="text-main-600 text-13 mb-8">Tiến độ học</div>
              <div className="text-neutral-900 fw-bold text-28 mb-8">
                {Math.round((classInfo.completedLessons / classInfo.totalLessons) * 100)}%
              </div>
              <div className="text-neutral-600 text-12">
                {classInfo.completedLessons}/{classInfo.totalLessons} buổi
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="bg-success-25 border-0 h-100">
            <Card.Body className="p-20">
              <div className="text-success-600 text-13 mb-8">Điểm danh TB</div>
              <div className="text-neutral-900 fw-bold text-28 mb-8">
                {classInfo.averageAttendance}%
              </div>
              <div className="text-neutral-600 text-12">Tỷ lệ tham gia</div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="bg-warning-25 border-0 h-100">
            <Card.Body className="p-20">
              <div className="text-warning-600 text-13 mb-8">Bài tập</div>
              <div className="text-neutral-900 fw-bold text-28 mb-8">
                {classInfo.totalAssignments || 0}
              </div>
              <div className="text-neutral-600 text-12">Đã giao</div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="bg-info-25 border-0 h-100">
            <Card.Body className="p-20">
              <div className="text-info-600 text-13 mb-8">Tài liệu</div>
              <div className="text-neutral-900 fw-bold text-28 mb-8">
                {materials.length}
              </div>
              <div className="text-neutral-600 text-12">Files đã tải lên</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Progress Chart */}
      <Card className="border border-neutral-100 rounded-12 mb-24">
        <Card.Body className="p-20">
          <h6 className="text-neutral-900 fw-semibold mb-16">Tiến độ học tập</h6>
          <div className="mb-12">
            <div className="d-flex justify-content-between mb-8">
              <span className="text-neutral-600 text-13">Hoàn thành</span>
              <span className="text-neutral-900 fw-semibold text-13">
                {classInfo.completedLessons}/{classInfo.totalLessons} buổi
              </span>
            </div>
            <ProgressBar 
              now={(classInfo.completedLessons / classInfo.totalLessons) * 100}
              className="rounded-pill"
              style={{ height: '8px' }}
            />
          </div>
        </Card.Body>
      </Card>

      {/* Quick Actions */}
      <Row className="g-3">
        <Col md={6}>
          <Link to="/teacher/assignments" className="text-decoration-none">
            <Card className="border border-main-200 rounded-12 hover-shadow transition-2" style={{ cursor: 'pointer' }}>
              <Card.Body className="p-20">
                <div className="d-flex align-items-center gap-16">
                  <div className="rounded-12 bg-main-100 d-flex align-items-center justify-content-center"
                       style={{ width: '48px', height: '48px' }}>
                    <i className="fas fa-plus text-main-600" style={{ fontSize: '20px' }}></i>
                  </div>
                  <div className="flex-grow-1">
                    <div className="text-neutral-900 fw-semibold text-15">Tạo bài tập mới</div>
                    <div className="text-neutral-500 text-12">Giao bài cho lớp này</div>
                  </div>
                  <i className="fas fa-chevron-right text-neutral-400"></i>
                </div>
              </Card.Body>
            </Card>
          </Link>
        </Col>

        <Col md={6}>
          <Card 
            className="border border-success-200 rounded-12 hover-shadow transition-2" 
            style={{ cursor: 'pointer' }}
            onClick={() => setShowMaterialModal(true)}
          >
            <Card.Body className="p-20">
              <div className="d-flex align-items-center gap-16">
                <div className="rounded-12 bg-success-100 d-flex align-items-center justify-content-center"
                     style={{ width: '48px', height: '48px' }}>
                  <i className="fas fa-upload text-success-600" style={{ fontSize: '20px' }}></i>
                </div>
                <div className="flex-grow-1">
                  <div className="text-neutral-900 fw-semibold text-15">Tải lên tài liệu</div>
                  <div className="text-neutral-500 text-12">Chia sẻ file với học viên</div>
                </div>
                <i className="fas fa-chevron-right text-neutral-400"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ClassOverview;
