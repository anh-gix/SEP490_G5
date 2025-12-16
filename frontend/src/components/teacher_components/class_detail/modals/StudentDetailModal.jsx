import React, { useState } from 'react';
import { Modal, Button, Form, Badge, Row, Col, Card, Table } from 'react-bootstrap';
<<<<<<< HEAD

=======
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

/* eslint-disable no-unused-vars */
>>>>>>> origin/Namvv-teacher-class-management
const StudentDetailModal = ({ 
  show, 
  onHide, 
  student,
<<<<<<< HEAD
=======
  classInfo,
>>>>>>> origin/Namvv-teacher-class-management
  onUpdateMocktestScore 
}) => {
  const [editingMocktest, setEditingMocktest] = useState(null);
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [mocktestScores, setMocktestScores] = useState({
    reading: '',
    listening: '',
    writing: '',
    speaking: ''
  });

  if (!student) return null;

  const handleEditMocktest = (sessionOrder, scheduleId, currentScores) => {
<<<<<<< HEAD
    console.log('🔍 Edit Mocktest Debug:', {
=======
    console.log(' Edit Mocktest Debug:', {
>>>>>>> origin/Namvv-teacher-class-management
      sessionOrder,
      scheduleId,
      currentScores,
      studentId: student.id || student._id,
      studentName: student.name
    });
    
    setEditingMocktest(sessionOrder);
    setEditingScheduleId(scheduleId);
    if (currentScores && typeof currentScores === 'object') {
      setMocktestScores({
        reading: currentScores.reading || '',
        listening: currentScores.listening || '',
        writing: currentScores.writing || '',
        speaking: currentScores.speaking || ''
      });
    } else {
      setMocktestScores({ reading: '', listening: '', writing: '', speaking: '' });
    }
  };

<<<<<<< HEAD
  const handleSaveMocktestScore = () => {
    console.log('💾 Save Mocktest Score:', {
      studentId: student.id || student._id,
      scheduleId: editingScheduleId,
      scores: mocktestScores,
      sessionOrder: editingMocktest
    });
    
    if (onUpdateMocktestScore && editingScheduleId) {
      onUpdateMocktestScore(student.id || student._id, editingScheduleId, mocktestScores);
    }
    setEditingMocktest(null);
    setEditingScheduleId(null);
    setMocktestScores({ reading: '', listening: '', writing: '', speaking: '' });
=======
  const handleSaveMocktestScore = async () => {
    // Validate scores
    const programType = classInfo?.course?.program?.type?.toLowerCase() || 'ielts';
    let hasValidScore = false;
    
    Object.values(mocktestScores).forEach(score => {
      if (score !== '' && score !== null && score !== undefined && score > 0) {
        hasValidScore = true;
      }
    });
    
    if (!hasValidScore) {
      toast.warning('Vui lòng nhập ít nhất một điểm kỹ năng');
      return;
    }
    
    // Show confirmation
    const result = await Swal.fire({
      title: 'Xác nhận cập nhật điểm',
      html: `Bạn có chắc chắn muốn cập nhật điểm Mocktest ${editingMocktest} cho học viên <strong>${student.name}</strong>?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#487FFF',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy'
    });
    
    if (result.isConfirmed) {
      try {
        if (onUpdateMocktestScore && editingScheduleId) {
          await onUpdateMocktestScore(student.id || student._id, editingScheduleId, mocktestScores);
          toast.success('Cập nhật điểm thành công!');
          setEditingMocktest(null);
          setEditingScheduleId(null);
          setMocktestScores({ reading: '', listening: '', writing: '', speaking: '' });
        }
      } catch (error) {
        toast.error('Không thể cập nhật điểm. Vui lòng thử lại.');
        console.error('Error updating mocktest score:', error);
      }
    }
>>>>>>> origin/Namvv-teacher-class-management
  };

  const handleCancelEdit = () => {
    setEditingMocktest(null);
    setEditingScheduleId(null);
    setMocktestScores({ reading: '', listening: '', writing: '', speaking: '' });
  };

<<<<<<< HEAD
  // Calculate total score
  const calculateTotal = (skillScores) => {
    if (!skillScores) return null;
    let total = (skillScores.reading || 0) + 
                (skillScores.listening || 0) + 
                (skillScores.writing || 0) + 
                (skillScores.speaking || 0);
    return Math.round(total * 10) / 10;
=======
  // Calculate total score based on program type
  const calculateTotal = (skillScores) => {
    if (!skillScores) return null;
    
    const programType = classInfo?.course?.program?.type?.toLowerCase() || 'ielts';
    let totalScore = null;
    
    if (programType === 'ielts') {
      // IELTS: Average of 4 skills
      const sum = (skillScores.reading || 0) + 
                  (skillScores.listening || 0) + 
                  (skillScores.writing || 0) + 
                  (skillScores.speaking || 0);
      totalScore = sum > 0 ? (sum / 4).toFixed(1) : null;
    } else if (programType === 'toeic') {
      // TOEIC: Sum of 2 skills (max 990)
      const sum = (skillScores.listening || 0) + (skillScores.reading || 0);
      totalScore = sum > 0 ? sum : null;
    } else if (programType === 'cam' || programType === 'cambridge') {
      // Cambridge: Sum of 2 parts (max 30)
      const sum = (skillScores.reading || 0) + (skillScores.listening || 0);
      totalScore = sum > 0 ? sum : null;
    }
    
    return totalScore;
>>>>>>> origin/Namvv-teacher-class-management
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="border-bottom">
        <Modal.Title className="text-neutral-900 fw-bold text-18">
          <i className="fas fa-user-graduate me-2 text-main-600"></i>
          Chi tiết học viên
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="p-24">
        {/* Thông tin cơ bản */}
        <Card className="border-0 bg-neutral-25 mb-20">
          <Card.Body className="p-20">
            <h5 className="text-neutral-900 fw-semibold text-16 mb-16">
              <i className="fas fa-id-card me-2 text-main-600"></i>
              Thông tin cơ bản
            </h5>
            <Row>
              <Col md={6}>
                <div className="mb-12">
                  <span className="text-neutral-600 text-13">Họ và tên:</span>
                  <div className="text-neutral-900 fw-semibold text-15 mt-4">{student.name}</div>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-12">
                  <span className="text-neutral-600 text-13">Email:</span>
                  <div className="text-neutral-900 text-14 mt-4">{student.email}</div>
                </div>
              </Col>
              {student.phone && (
                <Col md={6}>
                  <div className="mb-12">
                    <span className="text-neutral-600 text-13">Số điện thoại:</span>
                    <div className="text-neutral-900 text-14 mt-4">{student.phone}</div>
                  </div>
                </Col>
              )}
            </Row>
          </Card.Body>
        </Card>

        {/* Thống kê học tập */}
        <Card className="border-0 bg-neutral-25 mb-20">
          <Card.Body className="p-20">
            <h5 className="text-neutral-900 fw-semibold text-16 mb-16">
              <i className="fas fa-chart-line me-2 text-main-600"></i>
              Thống kê học tập
            </h5>
            <Row>
              <Col md={6}>
                <div className="bg-white p-16 radius-8 mb-12">
                  <div className="d-flex justify-content-between align-items-center mb-8">
                    <span className="text-neutral-600 text-13">Điểm danh</span>
                    <Badge className={`${
                      student.attendanceRate >= 80 ? 'bg-success-100 text-success-600' : 
                      student.attendanceRate >= 60 ? 'bg-warning-100 text-warning-600' : 
                      'bg-danger-100 text-danger-600'
                    } px-12 py-6 text-14 fw-semibold`}>
                      {student.attendanceRate}%
                    </Badge>
                  </div>
                  <div className="text-neutral-500 text-12">
                    {student.attendanceCount}/{student.totalLessons} buổi học
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="bg-white p-16 radius-8 mb-12">
                  <div className="d-flex justify-content-between align-items-center mb-8">
                    <span className="text-neutral-600 text-13">Hoàn thành bài tập</span>
                    <Badge className={`${
                      student.homeworkCompletionRate >= 80 ? 'bg-success-100 text-success-600' : 
                      student.homeworkCompletionRate >= 60 ? 'bg-warning-100 text-warning-600' : 
                      'bg-danger-100 text-danger-600'
                    } px-12 py-6 text-14 fw-semibold`}>
                      {student.homeworkCompletionRate}%
                    </Badge>
                  </div>
                  <div className="text-neutral-500 text-12">
                    {student.submittedAssignments}/{student.totalAssignments} bài tập
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Điểm Mocktest */}
        <Card className="border-0 bg-neutral-25">
          <Card.Body className="p-20">
            <h5 className="text-neutral-900 fw-semibold text-16 mb-16">
              <i className="fas fa-file-alt me-2 text-main-600"></i>
              Điểm Mocktest
            </h5>
            
            {student.mocktestSessionOrders && student.mocktestSessionOrders.length > 0 ? (
              <Table hover className="mb-0 bg-white">
                <thead>
                  <tr className="bg-neutral-50">
                    <th className="px-16 py-12 text-neutral-900 fw-semibold text-13 border-0">Bài thi</th>
                    <th className="px-16 py-12 text-neutral-900 fw-semibold text-13 border-0 text-center">Reading</th>
                    <th className="px-16 py-12 text-neutral-900 fw-semibold text-13 border-0 text-center">Listening</th>
                    <th className="px-16 py-12 text-neutral-900 fw-semibold text-13 border-0 text-center">Writing</th>
                    <th className="px-16 py-12 text-neutral-900 fw-semibold text-13 border-0 text-center">Speaking</th>
                    <th className="px-16 py-12 text-neutral-900 fw-semibold text-13 border-0 text-center">Tổng</th>
                    <th className="px-16 py-12 text-neutral-900 fw-semibold text-13 border-0 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {student.mocktestSessionOrders.map((sessionOrder, idx) => {
                    const mocktest = student.mocktestScores?.[`mocktest${sessionOrder}`];
                    const scheduleId = mocktest?.scheduleId;
                    const skillScores = mocktest?.skillScores;
                    const totalScore = calculateTotal(skillScores);
                    const isEditing = editingMocktest === sessionOrder;

                    return (
                      <tr key={idx}>
                        <td className="px-16 py-12">
                          <Badge className="bg-main-600 text-white px-10 py-6 text-13 fw-semibold">
                            Mocktest {idx + 1}
                          </Badge>
                        </td>
                        {isEditing ? (
                          <>
                            <td className="px-16 py-12 text-center">
                              <Form.Control
                                type="number"
                                size="sm"
                                value={mocktestScores.reading}
                                onChange={(e) => setMocktestScores({...mocktestScores, reading: parseFloat(e.target.value) || ''})}
                                placeholder="0"
                                className="text-center"
                                style={{ width: '70px', margin: '0 auto' }}
                              />
                            </td>
                            <td className="px-16 py-12 text-center">
                              <Form.Control
                                type="number"
                                size="sm"
                                value={mocktestScores.listening}
                                onChange={(e) => setMocktestScores({...mocktestScores, listening: parseFloat(e.target.value) || ''})}
                                placeholder="0"
                                className="text-center"
                                style={{ width: '70px', margin: '0 auto' }}
                              />
                            </td>
                            <td className="px-16 py-12 text-center">
                              <Form.Control
                                type="number"
                                size="sm"
                                value={mocktestScores.writing}
                                onChange={(e) => setMocktestScores({...mocktestScores, writing: parseFloat(e.target.value) || ''})}
                                placeholder="0"
                                className="text-center"
                                style={{ width: '70px', margin: '0 auto' }}
                              />
                            </td>
                            <td className="px-16 py-12 text-center">
                              <Form.Control
                                type="number"
                                size="sm"
                                value={mocktestScores.speaking}
                                onChange={(e) => setMocktestScores({...mocktestScores, speaking: parseFloat(e.target.value) || ''})}
                                placeholder="0"
                                className="text-center"
                                style={{ width: '70px', margin: '0 auto' }}
                              />
                            </td>
                            <td className="px-16 py-12 text-center">
                              <Badge className="bg-neutral-200 text-neutral-700 px-8 py-4 text-13">
                                {calculateTotal(mocktestScores) || '-'}
                              </Badge>
                            </td>
                            <td className="px-16 py-12 text-center">
                              <div className="d-flex gap-2 justify-content-center">
                                <Button 
                                  size="sm" 
                                  className="btn-success text-11 px-8 py-4"
                                  onClick={handleSaveMocktestScore}
                                >
                                  <i className="fas fa-check"></i>
                                </Button>
                                <Button 
                                  size="sm" 
                                  className="btn-outline-secondary text-11 px-8 py-4"
                                  onClick={handleCancelEdit}
                                >
                                  <i className="fas fa-times"></i>
                                </Button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-16 py-12 text-center">
<<<<<<< HEAD
                              <Badge className={`${skillScores?.reading ? 'bg-info-100 text-info-700' : 'bg-neutral-100 text-neutral-500'} px-8 py-4 text-13`}>
=======
                              <Badge className={`${skillScores?.reading ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-500'} px-8 py-4 text-13`}>
>>>>>>> origin/Namvv-teacher-class-management
                                {skillScores?.reading || '-'}
                              </Badge>
                            </td>
                            <td className="px-16 py-12 text-center">
<<<<<<< HEAD
                              <Badge className={`${skillScores?.listening ? 'bg-purple-100 text-purple-700' : 'bg-neutral-100 text-neutral-500'} px-8 py-4 text-13`}>
=======
                              <Badge className={`${skillScores?.listening ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-500'} px-8 py-4 text-13`}>
>>>>>>> origin/Namvv-teacher-class-management
                                {skillScores?.listening || '-'}
                              </Badge>
                            </td>
                            <td className="px-16 py-12 text-center">
<<<<<<< HEAD
                              <Badge className={`${skillScores?.writing ? 'bg-warning-100 text-warning-700' : 'bg-neutral-100 text-neutral-500'} px-8 py-4 text-13`}>
=======
                              <Badge className={`${skillScores?.writing ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-500'} px-8 py-4 text-13`}>
>>>>>>> origin/Namvv-teacher-class-management
                                {skillScores?.writing || '-'}
                              </Badge>
                            </td>
                            <td className="px-16 py-12 text-center">
<<<<<<< HEAD
                              <Badge className={`${skillScores?.speaking ? 'bg-success-100 text-success-700' : 'bg-neutral-100 text-neutral-500'} px-8 py-4 text-13`}>
=======
                              <Badge className={`${skillScores?.speaking ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-500'} px-8 py-4 text-13`}>
>>>>>>> origin/Namvv-teacher-class-management
                                {skillScores?.speaking || '-'}
                              </Badge>
                            </td>
                            <td className="px-16 py-12 text-center">
                              <Badge className={`${
<<<<<<< HEAD
                                totalScore >= 700 ? 'bg-success-600' : 
                                totalScore >= 500 ? 'bg-warning-600' : 
                                totalScore ? 'bg-danger-600' : 
                                'bg-neutral-300'
=======
                                (() => {
                                  const programType = classInfo?.course?.program?.type?.toLowerCase() || 'ielts';
                                  if (!totalScore) return 'bg-neutral-300';
                                  
                                  if (programType === 'ielts') {
                                    return totalScore >= 6.5 ? 'bg-success-600' : totalScore >= 5.0 ? 'bg-warning-600' : 'bg-danger-600';
                                  } else if (programType === 'toeic') {
                                    return totalScore >= 700 ? 'bg-success-600' : totalScore >= 500 ? 'bg-warning-600' : 'bg-danger-600';
                                  } else if (programType === 'cam' || programType === 'cambridge') {
                                    return totalScore >= 20 ? 'bg-success-600' : totalScore >= 15 ? 'bg-warning-600' : 'bg-danger-600';
                                  }
                                  return 'bg-neutral-300';
                                })()
>>>>>>> origin/Namvv-teacher-class-management
                              } text-white px-10 py-6 text-14 fw-semibold`}>
                                {totalScore || '-'}
                              </Badge>
                            </td>
                            <td className="px-16 py-12 text-center">
                              <Button 
                                size="sm" 
                                className="btn-outline-main text-11 px-10 py-4"
                                onClick={() => handleEditMocktest(sessionOrder, scheduleId, skillScores)}
                                disabled={!scheduleId}
                              >
                                <i className="fas fa-edit me-1"></i>
                                Sửa
                              </Button>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            ) : (
              <div className="text-center text-neutral-500 py-32">
                <i className="fas fa-inbox text-48 mb-12 d-block text-neutral-300"></i>
                <p className="text-14">Chưa có điểm mocktest</p>
              </div>
            )}
          </Card.Body>
        </Card>
      </Modal.Body>

      <Modal.Footer className="border-top">
        <Button 
          className="btn-outline-secondary px-20 py-10 radius-8" 
          onClick={onHide}
        >
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default StudentDetailModal;
