import React from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';

/**
 * Class Overview Component for Student
 * Hiển thị thông tin tổng quan về lớp học
 */
const ClassOverview = ({ classInfo }) => {

  if (!classInfo) {
    return (
      <div className="text-center py-5">
        <p className="text-neutral-500">Đang tải thông tin lớp học...</p>
      </div>
    );
  }

  return (
    <Row className="g-3">
      <Col lg={8}>
        {/* Course Description */}
        <Card className="bg-white border-0 rounded-12 mb-24" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
          <Card.Header className="border-0 p-20" style={{ background: 'linear-gradient(135deg, #F0F7FF 0%, #E6F2FF 100%)' }}>
            <h5 className="text-neutral-900 fw-semibold mb-0">Giới thiệu khóa học</h5>
          </Card.Header>
          <Card.Body className="p-24">
            <p className="text-neutral-700 text-14 mb-20">
              {classInfo.course?.description || 'Chưa có mô tả khóa học'}
            </p>
          </Card.Body>
        </Card>

        {/* Schedule Info */}
        <Card className="bg-white border-0 rounded-12" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
          <Card.Header className="border-0 p-20" style={{ background: 'linear-gradient(135deg, #F0F7FF 0%, #E6F2FF 100%)' }}>
            <h5 className="text-neutral-900 fw-semibold mb-0">Thông tin lịch học</h5>
          </Card.Header>
          <Card.Body className="p-24">
            <Row className="g-3">
              <Col md={6}>
                <div className="d-flex align-items-start gap-12 mb-16">
                  <div className="bg-main-600 text-white rounded-circle d-flex align-items-center justify-content-center"
                       style={{ width: '40px', height: '40px', minWidth: '40px' }}>
                    <i className="fas fa-calendar-alt"></i>
                  </div>
                  <div>
                    <div className="text-neutral-500 text-13 mb-4">Lịch học</div>
                    <div className="text-neutral-900 fw-medium text-14">
                      {classInfo.schedulePattern || 'Đang cập nhật'}
                    </div>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="d-flex align-items-start gap-12 mb-16">
                  <div className="bg-info-500 text-white rounded-circle d-flex align-items-center justify-content-center"
                       style={{ width: '40px', height: '40px', minWidth: '40px' }}>
                    <i className="fas fa-door-open"></i>
                  </div>
                  <div>
                    <div className="text-neutral-500 text-13 mb-4">Phòng học</div>
                    <div className="text-neutral-900 fw-medium text-14">
                      {classInfo.room?.room_name || 'Chưa có phòng'}
                    </div>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="d-flex align-items-start gap-12">
                  <div className="bg-success-600 text-white rounded-circle d-flex align-items-center justify-content-center"
                       style={{ width: '40px', height: '40px', minWidth: '40px' }}>
                    <i className="fas fa-calendar-check"></i>
                  </div>
                  <div>
                    <div className="text-neutral-500 text-13 mb-4">Ngày bắt đầu</div>
                    <div className="text-neutral-900 fw-medium text-14">
                      {new Date(classInfo.startDate).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="d-flex align-items-start gap-12">
                  <div className="bg-warning-600 text-white rounded-circle d-flex align-items-center justify-content-center"
                       style={{ width: '40px', height: '40px', minWidth: '40px' }}>
                    <i className="fas fa-calendar-times"></i>
                  </div>
                  <div>
                    <div className="text-neutral-500 text-13 mb-4">Ngày kết thúc</div>
                    <div className="text-neutral-900 fw-medium text-14">
                      {new Date(classInfo.endDate).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>

      <Col lg={4}>
        {/* Teacher Info */}
        <Card className="bg-white border-0 rounded-12 mb-24" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
          <Card.Header className="border-0 p-20" style={{ background: 'linear-gradient(135deg, #F0F7FF 0%, #E6F2FF 100%)' }}>
            <h5 className="text-neutral-900 fw-semibold mb-0">Giảng viên</h5>
          </Card.Header>
          <Card.Body className="p-20">
            <div className="text-center mb-16">
              <div className="bg-main-600 text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-12"
                   style={{ width: '80px', height: '80px' }}>
                <i className="fas fa-user fa-2x"></i>
              </div>
              <h6 className="text-neutral-900 fw-bold mb-4">
                {classInfo.teacher?.username || 'Chưa có giảng viên'}
              </h6>
            </div>
            <div className="d-flex flex-column gap-12">
              <div className="d-flex align-items-center gap-8">
                <i className="fas fa-envelope text-neutral-500"></i>
                <span className="text-neutral-700 text-13">
                  {classInfo.teacher?.email || 'N/A'}
                </span>
              </div>
            </div>
            <Button className="btn-outline-main text-13 fw-medium w-100 mt-16 py-10 radius-8">
              <i className="fas fa-comment me-2"></i>
              Liên hệ giảng viên
            </Button>
          </Card.Body>
        </Card>

        {/* Quick Stats */}
        <Card className="bg-gradient border-0 rounded-12 text-white" style={{ 
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          background: 'linear-gradient(135deg, var(--main-600) 0%, var(--main-700) 100%)'
        }}>
          <Card.Body className="p-20">
            <h6 className="text-white fw-semibold mb-16">Thống kê nhanh</h6>
            <div className="d-flex flex-column gap-12">
              <div className="d-flex justify-content-between align-items-center pb-12 border-bottom border-white" style={{ borderOpacity: 0.2 }}>
                <span className="text-14" style={{ opacity: 0.9 }}>Tổng số buổi</span>
                <span className="fw-bold text-16">{classInfo.totalLessons || 0}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center pb-12 border-bottom border-white" style={{ borderOpacity: 0.2 }}>
                <span className="text-14" style={{ opacity: 0.9 }}>Đã học</span>
                <span className="fw-bold text-16">{classInfo.completedLessons || 0}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-14" style={{ opacity: 0.9 }}>Còn lại</span>
                <span className="fw-bold text-16">
                  {(classInfo.totalLessons || 0) - (classInfo.completedLessons || 0)}
                </span>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default ClassOverview;
