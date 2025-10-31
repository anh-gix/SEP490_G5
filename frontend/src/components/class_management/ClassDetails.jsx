import React, { useState } from 'react';
import { Modal, Card, ListGroup, Badge, ProgressBar, Button, Tabs, Tab } from 'react-bootstrap';

const ClassDetails = ({ classData, onClose }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [students, setStudents] = useState([
    { id: 1, name: 'Nguyễn Văn A', email: 'a@email.com', phone: '0123456789', joinDate: '2025-01-15', attendance: 95 },
    { id: 2, name: 'Trần Thị B', email: 'b@email.com', phone: '0987654321', joinDate: '2025-01-15', attendance: 88 }
  ]);

  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', email: '', phone: '' });

  const handleAddStudent = () => {
    if (!newStudent.name || !newStudent.email) {
      alert('Vui lòng nhập tên và email học viên!');
      return;
    }

    setStudents([...students, { 
      ...newStudent, 
      id: students.length + 1, 
      joinDate: new Date().toISOString().split('T')[0],
      attendance: 100 
    }]);
    setNewStudent({ name: '', email: '', phone: '' });
    setShowAddStudent(false);
    alert('Thêm học viên thành công!');
  };

  const handleRemoveStudent = (studentId) => {
    if (window.confirm('Bạn có chắc muốn xóa học viên này khỏi lớp?')) {
      setStudents(students.filter(s => s.id !== studentId));
    }
  };

  const renderInfoTab = () => (
    <div className="p-4">
      <div className="row g-3">
        <div className="col-md-6 col-lg-3">
          <Card className="h-100">
            <Card.Header className="bg-primary text-white">
              <i className="fas fa-info-circle me-2"></i>
              <strong>Thông tin chung</strong>
            </Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Tên lớp:</span>
                  <strong>{classData.name}</strong>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Chương trình:</span>
                  <strong>{classData.program}</strong>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Cấp độ:</span>
                  <Badge bg="info">{classData.level}</Badge>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Band:</span>
                  <strong>{classData.band}</strong>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Trạng thái:</span>
                  <Badge bg={
                    classData.status === 'pending' ? 'warning' :
                    classData.status === 'active' ? 'success' :
                    classData.status === 'completed' ? 'primary' : 'danger'
                  }>
                    {classData.status === 'active' ? 'Đang học' : 
                     classData.status === 'pending' ? 'Chờ khai giảng' : 
                     classData.status === 'completed' ? 'Đã hoàn thành' : 'Đã hủy'}
                  </Badge>
                </div>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </div>

        <div className="col-md-6 col-lg-3">
          <Card className="h-100">
            <Card.Header className="bg-success text-white">
              <i className="fas fa-calendar-alt me-2"></i>
              <strong>Lịch học</strong>
            </Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Thời gian:</span>
                  <strong className="text-end">{classData.schedule}</strong>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Khai giảng:</span>
                  <strong>{classData.startDate}</strong>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Kết thúc:</span>
                  <strong>{classData.endDate}</strong>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Tiến độ:</span>
                    <strong>{classData.currentLesson}/{classData.totalLessons} buổi</strong>
                  </div>
                  <ProgressBar 
                    now={classData.completionRate} 
                    label={`${classData.completionRate.toFixed(1)}%`}
                    variant="success"
                  />
                </div>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </div>

        <div className="col-md-6 col-lg-3">
          <Card className="h-100">
            <Card.Header className="bg-warning text-dark">
              <i className="fas fa-chalkboard-teacher me-2"></i>
              <strong>Giáo viên & Phòng học</strong>
            </Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Giáo viên:</span>
                  <strong>{classData.teacherName}</strong>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Phòng học:</span>
                  <strong>{classData.roomName}</strong>
                </div>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </div>

        <div className="col-md-6 col-lg-3">
          <Card className="h-100">
            <Card.Header className="bg-info text-white">
              <i className="fas fa-users me-2"></i>
              <strong>Học viên</strong>
            </Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Tổng số:</span>
                  <strong>{classData.totalStudents}/{classData.maxStudents}</strong>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Còn trống:</span>
                  <strong>{classData.maxStudents - classData.totalStudents} chỗ</strong>
                </div>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderStudentsTab = () => (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Danh sách học viên ({students.length}/{classData.maxStudents})</h5>
        <Button 
          variant="primary"
          onClick={() => setShowAddStudent(true)}
        >
          <i className="fas fa-plus me-2"></i>
          Thêm học viên
        </Button>
      </div>

      {showAddStudent && (
        <Card className="mb-3 border-primary">
          <Card.Header className="bg-primary text-white">
            <strong>Thêm học viên mới</strong>
          </Card.Header>
          <Card.Body>
            <div className="row g-3">
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Họ và tên *"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                />
              </div>
              <div className="col-md-4">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email *"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                />
              </div>
              <div className="col-md-4">
                <input
                  type="tel"
                  className="form-control"
                  placeholder="Số điện thoại"
                  value={newStudent.phone}
                  onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})}
                />
              </div>
              <div className="col-12">
                <div className="d-flex gap-2">
                  <Button variant="success" onClick={handleAddStudent}>
                    <i className="fas fa-check me-2"></i>Thêm
                  </Button>
                  <Button variant="secondary" onClick={() => setShowAddStudent(false)}>
                    <i className="fas fa-times me-2"></i>Hủy
                  </Button>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      <div className="table-responsive">
        <table className="table table-striped table-hover table-bordered">
          <thead className="table-dark">
            <tr>
              <th style={{width: '50px'}}>STT</th>
              <th>Họ và tên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Ngày tham gia</th>
              <th style={{width: '100px'}}>Điểm danh</th>
              <th style={{width: '80px'}}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.id}>
                <td className="text-center">{index + 1}</td>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>{student.phone}</td>
                <td>{student.joinDate}</td>
                <td className="text-center">
                  <Badge bg={student.attendance >= 80 ? 'success' : 'warning'}>
                    {student.attendance}%
                  </Badge>
                </td>
                <td className="text-center">
                  <Button 
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleRemoveStudent(student.id)}
                    title="Xóa khỏi lớp"
                  >
                    <i className="fas fa-trash"></i>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderProgramTab = () => (
    <div className="p-4">
      <Card className="mb-3">
        <Card.Header>
          <h5 className="mb-0">Chương trình học: {classData.program} - {classData.level}</h5>
        </Card.Header>
        <Card.Body>
          <p className="mb-0"><strong>Band:</strong> {classData.band}</p>
        </Card.Body>
      </Card>
        
      <ListGroup>
        <ListGroup.Item className="border-success bg-light">
          <div className="d-flex align-items-start gap-3">
            <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" 
                 style={{width: '40px', height: '40px', minWidth: '40px'}}>
              <strong>1</strong>
            </div>
            <div className="flex-grow-1">
              <h6 className="mb-1">Unit 1: Greetings & Introductions</h6>
              <p className="mb-0 text-muted small">Học cách chào hỏi và tự giới thiệu bản thân</p>
            </div>
            <Badge bg="success">✓ Hoàn thành</Badge>
          </div>
        </ListGroup.Item>

        <ListGroup.Item className="border-success bg-light">
          <div className="d-flex align-items-start gap-3">
            <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" 
                 style={{width: '40px', height: '40px', minWidth: '40px'}}>
              <strong>2</strong>
            </div>
            <div className="flex-grow-1">
              <h6 className="mb-1">Unit 2: Daily Activities</h6>
              <p className="mb-0 text-muted small">Mô tả các hoạt động hàng ngày</p>
            </div>
            <Badge bg="success">✓ Hoàn thành</Badge>
          </div>
        </ListGroup.Item>

        <ListGroup.Item className="border-primary bg-primary bg-opacity-10">
          <div className="d-flex align-items-start gap-3">
            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
                 style={{width: '40px', height: '40px', minWidth: '40px'}}>
              <strong>3</strong>
            </div>
            <div className="flex-grow-1">
              <h6 className="mb-1">Unit 3: Family & Friends</h6>
              <p className="mb-0 text-muted small">Nói về gia đình và bạn bè</p>
            </div>
            <Badge bg="primary">→ Đang học</Badge>
          </div>
        </ListGroup.Item>

        <ListGroup.Item>
          <div className="d-flex align-items-start gap-3">
            <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center" 
                 style={{width: '40px', height: '40px', minWidth: '40px'}}>
              <strong>4</strong>
            </div>
            <div className="flex-grow-1">
              <h6 className="mb-1">Unit 4: Food & Drinks</h6>
              <p className="mb-0 text-muted small">Từ vựng về đồ ăn, thức uống</p>
            </div>
            <Badge bg="secondary">○ Chưa học</Badge>
          </div>
        </ListGroup.Item>

        <ListGroup.Item>
          <div className="d-flex align-items-start gap-3">
            <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center" 
                 style={{width: '40px', height: '40px', minWidth: '40px'}}>
              <strong>5</strong>
            </div>
            <div className="flex-grow-1">
              <h6 className="mb-1">Unit 5: Shopping</h6>
              <p className="mb-0 text-muted small">Giao tiếp khi mua sắm</p>
            </div>
            <Badge bg="secondary">○ Chưa học</Badge>
          </div>
        </ListGroup.Item>
      </ListGroup>
    </div>
  );

  const renderStatsTab = () => (
    <div className="p-4">
      <div className="row g-3 mb-4">
        <div className="col-md-6 col-lg-3">
          <Card className="text-center border-primary">
            <Card.Body>
              <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                   style={{width: '60px', height: '60px'}}>
                <i className="fas fa-users fa-2x"></i>
              </div>
              <h3 className="mb-1">{students.length}</h3>
              <p className="text-muted mb-0">Học viên</p>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-6 col-lg-3">
          <Card className="text-center border-success">
            <Card.Body>
              <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                   style={{width: '60px', height: '60px'}}>
                <i className="fas fa-check-circle fa-2x"></i>
              </div>
              <h3 className="mb-1">{classData.currentLesson}</h3>
              <p className="text-muted mb-0">Buổi đã học</p>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-6 col-lg-3">
          <Card className="text-center border-warning">
            <Card.Body>
              <div className="bg-warning text-dark rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                   style={{width: '60px', height: '60px'}}>
                <i className="fas fa-clock fa-2x"></i>
              </div>
              <h3 className="mb-1">{classData.totalLessons - classData.currentLesson}</h3>
              <p className="text-muted mb-0">Buổi còn lại</p>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-6 col-lg-3">
          <Card className="text-center border-info">
            <Card.Body>
              <div className="bg-info text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                   style={{width: '60px', height: '60px'}}>
                <i className="fas fa-percentage fa-2x"></i>
              </div>
              <h3 className="mb-1">{classData.completionRate.toFixed(0)}%</h3>
              <p className="text-muted mb-0">Tiến độ</p>
            </Card.Body>
          </Card>
        </div>
      </div>

      <Card>
        <Card.Header>
          <h5 className="mb-0">Tỷ lệ điểm danh trung bình</h5>
        </Card.Header>
        <Card.Body className="text-center py-5">
          <div className="d-flex justify-content-center align-items-end gap-3" style={{height: '200px'}}>
            <div className="bg-success d-flex flex-column justify-content-end align-items-center" 
                 style={{width: '60px', height: '90%', position: 'relative'}}>
              <div className="bg-success text-white fw-bold px-2 py-1 rounded"
                   style={{position: 'absolute', top: '-30px'}}>
                90%
              </div>
            </div>
          </div>
          <p className="text-muted mt-4 mb-0">Biểu đồ điểm danh theo tuần (TODO: Tích hợp Chart.js)</p>
        </Card.Body>
      </Card>
    </div>
  );

  return (
    <Modal 
      show={true} 
      onHide={onClose} 
      size="xl"
      centered
      className="class-details-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Chi tiết lớp học: {classData.name}</Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-0">
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-0"
          fill
        >
          <Tab eventKey="info" title={<><i className="fas fa-info-circle me-2"></i>Thông tin</>}>
            {renderInfoTab()}
          </Tab>
          <Tab eventKey="students" title={<><i className="fas fa-users me-2"></i>Học viên</>}>
            {renderStudentsTab()}
          </Tab>
          <Tab eventKey="program" title={<><i className="fas fa-book me-2"></i>Chương trình</>}>
            {renderProgramTab()}
          </Tab>
          <Tab eventKey="stats" title={<><i className="fas fa-chart-bar me-2"></i>Thống kê</>}>
            {renderStatsTab()}
          </Tab>
        </Tabs>
      </Modal.Body>
    </Modal>
  );
};

export default ClassDetails;
