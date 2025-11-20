import React from 'react';
import { Card, Button, Badge, ProgressBar, Dropdown } from 'react-bootstrap';

const ClassList = ({ classes, onEdit, onDelete, onViewDetails }) => {
  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Chờ khai giảng',
      active: 'Đang học',
      completed: 'Đã hoàn thành',
      cancelled: 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="row g-3">
      {classes.length > 0 ? (
        classes.map(classItem => (
          <div key={classItem.id} className="col-md-6 col-lg-4">
            <Card className="h-100 bg-white border border-neutral-30 rounded-12 box-shadow-sm transition-2 item-hover">
              <Card.Header className="bg-main-25 border-0 d-flex justify-content-between align-items-start p-16">
                <div className="flex-grow-1">
                  <h5 className="mb-8 text-neutral-700">{classItem.name}</h5>
                  <Badge 
                    bg=""
                    className={`${
                      classItem.status === 'pending' ? 'bg-warning-600 text-white' :
                      classItem.status === 'active' ? 'bg-success-600 text-white' :
                      classItem.status === 'completed' ? 'bg-main-600 text-white' : 'bg-danger-600 text-white'
                    } px-12 py-6`}
                  >
                    {getStatusText(classItem.status)}
                  </Badge>
                </div>
                <Badge bg="" className="bg-info-500 text-white px-12 py-6 ms-2">{classItem.level}</Badge>
              </Card.Header>

              <Card.Body className="p-16">
                <div className="d-flex flex-column gap-12 mb-16 text-sm">
                  <div className="flex-align gap-8">
                    <i className="fas fa-book text-neutral-500" style={{ width: '20px' }}></i>
                    <span className="text-neutral-700">{classItem.program}</span>
                  </div>
                  <div className="flex-align gap-8">
                    <i className="fas fa-layer-group text-neutral-500" style={{ width: '20px' }}></i>
                    <span className="text-neutral-700">{classItem.band}</span>
                  </div>
                  <div className="flex-align gap-8">
                    <i className="fas fa-chalkboard-teacher text-neutral-500" style={{ width: '20px' }}></i>
                    <span className="text-neutral-700">{classItem.teacherName}</span>
                  </div>
                  <div className="flex-align gap-8">
                    <i className="fas fa-door-open text-neutral-500" style={{ width: '20px' }}></i>
                    <span className="text-neutral-700">{classItem.roomName}</span>
                  </div>
                  <div className="flex-align gap-8">
                    <i className="fas fa-calendar-alt text-neutral-500" style={{ width: '20px' }}></i>
                    <span className="text-neutral-700">{classItem.schedule}</span>
                  </div>
                  <div className="flex-align gap-8">
                    <i className="fas fa-users text-neutral-500" style={{ width: '20px' }}></i>
                    <span className="text-neutral-700">{classItem.totalStudents}/{classItem.maxStudents} học viên</span>
                  </div>
                </div>

                {classItem.status === 'active' && (
                  <div>
                    <div className="flex-between mb-8 text-sm">
                      <span className="text-neutral-500">Tiến độ</span>
                      <span className="fw-semibold text-neutral-700">{classItem.currentLesson}/{classItem.totalLessons} buổi</span>
                    </div>
                    <ProgressBar 
                      now={classItem.completionRate} 
                      label={`${classItem.completionRate.toFixed(1)}%`}
                      className="bg-neutral-50"
                      style={{ height: '8px' }}
                    >
                      <div 
                        className="bg-success-600"
                        style={{ 
                          width: `${classItem.completionRate}%`,
                          height: '100%',
                          borderRadius: '4px',
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </ProgressBar>
                  </div>
                )}
              </Card.Body>

              <Card.Footer className="bg-neutral-25 border-0 d-flex gap-8 p-16">
                <Button 
                  className="btn-outline-main flex-fill text-13 fw-medium px-16 py-8 radius-8"
                  onClick={() => onViewDetails(classItem)}
                >
                  <i className="fas fa-eye me-1"></i>
                  Chi tiết
                </Button>
                <Button 
                  className="btn-outline-neutral text-13 fw-medium px-12 py-8 radius-8"
                  onClick={() => onEdit(classItem)}
                >
                  <i className="fas fa-edit"></i>
                </Button>
                {classItem.status === 'pending' && (
                  <Button 
                    className="btn-outline-danger text-13 fw-medium px-12 py-8 radius-8"
                    onClick={() => onDelete(classItem.id)}
                  >
                    <i className="fas fa-trash"></i>
                  </Button>
                )}
              </Card.Footer>
            </Card>
          </div>
        ))
      ) : (
        <div className="col-12">
          <Card className="text-center bg-white border border-neutral-30 rounded-12 box-shadow-sm">
            <Card.Body className="p-40">
              <i className="fas fa-inbox fa-4x text-neutral-400 mb-24 d-block"></i>
              <h5 className="text-neutral-700 mb-8">Chưa có lớp học nào</h5>
              <p className="text-muted">Nhấn nút "Tạo lớp mới" để bắt đầu</p>
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ClassList;
