import React from 'react';
import { Card, Button, Badge, ProgressBar, Dropdown } from 'react-bootstrap';

const ClassList = ({ classes, onEdit, onViewDetails }) => {
  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Chờ khai giảng',
      active: 'Đang học',
      completed: 'Đã hoàn thành',
      disable: 'Vô hiệu hóa'
    };
    return statusMap[status] || status;
  };

  const getMaintenanceBadgeText = (classItem) => {
    const count = classItem.maintenanceCount || classItem.maintenanceRooms?.length || 0;
    return `Có ${count} buổi sắp tới sử dụng phòng đang bảo trì`;
  };

  const getMaintenanceTooltip = (classItem) => {
    if (!classItem.hasRoomMaintenance || !classItem.maintenanceRooms?.length) return '';

    const count = classItem.maintenanceCount || classItem.maintenanceRooms.length;
    if (count === 1) {
      const room = classItem.maintenanceRooms[0];
      const date = new Date(room.scheduleDate).toLocaleDateString('vi-VN');
      return `Có 1 buổi sắp tới sử dụng phòng đang bảo trì: ${room.roomName} vào ${date} (${room.startTime}-${room.endTime})`;
    } else {
      const uniqueRooms = [...new Set(classItem.maintenanceRooms.map(r => r.roomName))];
      const roomText = uniqueRooms.length === 1 ? uniqueRooms[0] : `${uniqueRooms.length} phòng khác nhau`;
      return `Có ${count} buổi sắp tới sử dụng phòng đang bảo trì (${roomText})`;
    }
  };

  return (
    <div className="row g-3">
      {classes.length > 0 ? (
        classes.map(classItem => {
          const hasMaintenanceIssue = classItem.hasRoomMaintenance;
          return (
          <div key={classItem.id} className="col-md-6 col-lg-4">
            <Card className={`h-100 bg-white border ${hasMaintenanceIssue ? 'border-danger border-danger-600' : 'border-neutral-30'} rounded-12 box-shadow-sm transition-2 item-hover`} style={hasMaintenanceIssue ? { borderWidth: '2px', boxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)' } : {}}>
              <Card.Header className="bg-main-25 border-0 d-flex justify-content-between align-items-start p-16">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-8 mb-8">
                    <h5 className="mb-0 text-neutral-700">{classItem.name}</h5>
                  </div>
                  <div className="d-flex align-items-center gap-8">
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
                    {hasMaintenanceIssue && (
                      <Badge bg="" className="bg-danger-600 text-white px-8 py-4" title={getMaintenanceTooltip(classItem)}>
                        <i className="fas fa-exclamation-triangle me-1"></i>
                        {getMaintenanceBadgeText(classItem)}
                      </Badge>
                    )}
                  </div>
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
                    <span className="text-neutral-700">
                      {classItem.roomName}
                    </span>
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
                      variant="success"
                    />
                  </div>
                )}
              </Card.Body>

              <Card.Footer className="bg-neutral-25 border-0 d-flex gap-8 p-16">
                <Button 
                  className="btn-outline-main flex-fill text-13 fw-medium px-16 py-8 radius-8"
                  onClick={() => onViewDetails(classItem)}
                >
                  Chi tiết
                </Button>
                <Button 
                  className="btn-outline-neutral text-13 fw-medium px-12 py-8 radius-8"
                  onClick={() => onEdit(classItem)}
                >
                  <i className="fas fa-edit"></i>
                </Button>
              </Card.Footer>
            </Card>
          </div>
        );
        })
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
