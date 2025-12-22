import React, { useState } from 'react';
import { Table, Badge, Button, Card, Dropdown } from 'react-bootstrap';
import { toast } from 'react-toastify';
import ImportMocktestScoresModal from './modals/ImportMocktestScoresModal';

const ClassStudents = ({ students, onViewStudentDetail, hideActions = false, classInfo, lessons = [], onRefreshStudents, hideImportMocktest = false, hideMocktestColumn = false }) => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedMocktestSchedule, setSelectedMocktestSchedule] = useState(null);
  const [selectedMocktestOrder, setSelectedMocktestOrder] = useState(null);

  // Get mocktest session orders from first student (they should all have the same)
  const mocktestSessionOrders = students.length > 0 && students[0].mocktestSessionOrders 
    ? students[0].mocktestSessionOrders 
    : [];

  const handleSelectMocktestSession = (order) => {
    // Find the schedule ID for this mocktest session order
    const lesson = lessons.find(l => {
      // Check different possible field names
      if (l.sessionOrder === order) return true;
      if (l.order === order) return true;
      if (l.mocktest && l.mocktest.order === order) return true;
      if (l.session && l.session.order === order) return true;
      return false;
    });
    
    if (!lesson || (!lesson.scheduleId && !lesson._id)) {
      toast.error('Không tìm thấy buổi học cho mocktest này');
      return;
    }
    
    // Check if lesson has occurred (status must be completed or in-progress)
    const lessonStatus = lesson.status?.toLowerCase();
    const lessonDate = new Date(lesson.date);
    const now = new Date();
    
    // Lesson hasn't occurred yet if:
    // 1. Status is 'scheduled' or 'pending'
    // 2. OR lesson date is in the future
    const hasNotOccurred = 
      lessonStatus === 'scheduled' || 
      lessonStatus === 'pending' || 
      lessonDate > now;
    
    if (hasNotOccurred) {
      toast.warning(`Buổi Mocktest ${order} chưa diễn ra. Vui lòng chờ sau ngày ${lessonDate.toLocaleDateString('vi-VN')}`);
      return;
    }
    
    const scheduleId = lesson.scheduleId || lesson._id;
    setSelectedMocktestSchedule(scheduleId);
    setSelectedMocktestOrder(order);
    setShowImportModal(true);
  };

  const handleImportSuccess = () => {
    if (onRefreshStudents) {
      onRefreshStudents();
    }
  };

  return (
    <div className="p-0">
      {/* Header with Import Button */}
      <Card className="border-0 mb-3">
        <Card.Body className="px-20 py-16">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 className="mb-1 fw-semibold">Danh sách học viên</h6>
              <p className="mb-0 text-neutral-600 text-13">Tổng số: {students.length} học viên</p>
            </div>
            {!hideImportMocktest && (
              <>
                {mocktestSessionOrders.length > 0 ? (
                  <Dropdown>
                    <Dropdown.Toggle variant="primary" size="sm" className="px-16 py-8">
                      <i className="fas fa-file-import me-2"></i>
                      Import Điểm Mocktest
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      {mocktestSessionOrders.map((order, idx) => {
                        // Find lesson to check if it has occurred
                        const lesson = lessons.find(l => l.sessionOrder === order);
                        const lessonStatus = lesson?.status?.toLowerCase();
                        const lessonDate = lesson?.date ? new Date(lesson.date) : null;
                        const hasNotOccurred = 
                          lessonStatus === 'scheduled' || 
                          lessonStatus === 'pending' || 
                          (lessonDate && lessonDate > new Date());
                        
                        return (
                          <Dropdown.Item 
                            key={idx}
                            onClick={() => handleSelectMocktestSession(order)}
                            className="d-flex align-items-center justify-content-between"
                            style={{
                              transition: 'all 0.2s ease',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f0f7ff';
                              e.currentTarget.style.paddingLeft = '20px';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '';
                              e.currentTarget.style.paddingLeft = '';
                            }}
                          >
                            <span>
                              <i className="fas fa-file-alt me-2"></i>
                              Mocktest {idx + 1} (Buổi {order})
                            </span>
                            {hasNotOccurred && (
                              <Badge bg="warning" className="ms-2 text-10">
                                Chưa diễn ra
                              </Badge>
                            )}
                          </Dropdown.Item>
                        );
                      })}
                    </Dropdown.Menu>
                  </Dropdown>
                ) : (
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="px-16 py-8"
                    disabled
                    title="Lớp học chưa có buổi mocktest"
                  >
                    <i className="fas fa-file-import me-2"></i>
                    Import Điểm Mocktest
                  </Button>
                )}
              </>
            )}
          </div>
        </Card.Body>
      </Card>

      <Table hover className="mb-0">
        <thead>
          <tr className="bg-neutral-25">
            <th className="px-12 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center" style={{ width: '50px', minWidth: '50px' }}>STT</th>
            <th className="px-16 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center" style={{ width: '180px' }}>Họ và tên</th>
            <th className="px-16 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center" style={{ width: '200px' }}>Email</th>
            <th className="px-12 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center" style={{ width: '110px' }}>Điểm danh</th>
            <th className="px-12 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center" style={{ width: '110px' }}>Bài tập</th>
            {!hideMocktestColumn && (
              <th className="px-16 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Mocktest</th>
            )}
            {!hideActions && (
              <th className="px-12 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center" style={{ width: '130px', minWidth: '130px' }}>Thao tác</th>
            )}
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => {
            // Calculate actual attendance count based on rate and total
            // If attendanceCount is 0 but rate is not 0, calculate from rate
            const actualAttendanceCount = student.attendanceCount > 0 
              ? student.attendanceCount 
              : (student.attendanceRate > 0 && student.totalLessons > 0)
                ? Math.round((student.attendanceRate / 100) * student.totalLessons)
                : 0;
            
            // Calculate actual homework count based on rate and total
            const actualHomeworkCount = student.submittedAssignments > 0
              ? student.submittedAssignments
              : (student.homeworkCompletionRate > 0 && student.totalAssignments > 0)
                ? Math.round((student.homeworkCompletionRate / 100) * student.totalAssignments)
                : 0;
            
            return (
            <tr key={student.id || student._id}>
              <td className="px-12 py-16 text-neutral-700 text-13 text-center">{index + 1}</td>
              <td className="px-16 py-16 text-neutral-900 text-14 text-center">{student.name}</td>
              <td className="px-16 py-16 text-neutral-600 text-13 text-center">{student.email}</td>
              <td className="px-12 py-16 text-center">
                <div>
                  <Badge className={`mb-1 ${student.attendanceRate >= 80 ? 'bg-success-100 text-success-600' : student.attendanceRate >= 60 ? 'bg-warning-100 text-warning-600' : 'bg-danger-100 text-danger-600'}`}>
                    {student.attendanceRate}%
                  </Badge>
                  <div className="text-neutral-500 text-11">
                    {actualAttendanceCount}/{student.totalLessons} buổi
                  </div>
                </div>
              </td>
              <td className="px-12 py-16 text-center">
                <div>
                  <Badge className={`mb-1 ${student.homeworkCompletionRate >= 80 ? 'bg-success-100 text-success-600' : student.homeworkCompletionRate >= 60 ? 'bg-warning-100 text-warning-600' : 'bg-danger-100 text-danger-600'}`}>
                    {student.homeworkCompletionRate}%
                  </Badge>
                  <div className="text-neutral-500 text-11">
                    {actualHomeworkCount}/{student.totalAssignments} bài
                  </div>
                </div>
              </td>
              {!hideMocktestColumn && (
                <td className="px-16 py-16 text-center">
                  <div className="d-flex flex-wrap gap-2 justify-content-center">
                    {student.mocktestSessionOrders && student.mocktestSessionOrders.length > 0 ? (
                      student.mocktestSessionOrders.map((sessionOrder, idx) => {
                        const mocktest = student.mocktestScores?.[`mocktest${sessionOrder}`];
                        const skillScores = mocktest?.skillScores;

                        // Get program type
                        const programType = classInfo?.course?.program?.type?.toLowerCase() || 'ielts';

                        // Calculate total based on program type
                        let totalScore = null;
                        let displaySkills = [];

                        if (skillScores) {
                          if (programType === 'ielts') {
                            // IELTS: Sum of 4 skills (R, L, W, S)
                            totalScore = (skillScores.reading || 0) +
                                        (skillScores.listening || 0) +
                                        (skillScores.writing || 0) +
                                        (skillScores.speaking || 0);
                            totalScore = totalScore > 0 ? (totalScore / 4).toFixed(1) : null;

                            if (skillScores.reading > 0) displaySkills.push({ label: 'R', value: skillScores.reading, color: 'primary' });
                            if (skillScores.listening > 0) displaySkills.push({ label: 'L', value: skillScores.listening, color: 'primary' });
                            if (skillScores.writing > 0) displaySkills.push({ label: 'W', value: skillScores.writing, color: 'primary' });
                            if (skillScores.speaking > 0) displaySkills.push({ label: 'S', value: skillScores.speaking, color: 'primary' });
                          } else if (programType === 'toeic') {
                            // TOEIC: Sum of 2 skills (L, R) max 990
                            totalScore = (skillScores.listening || 0) + (skillScores.reading || 0);
                            totalScore = totalScore > 0 ? totalScore : null;

                            if (skillScores.listening > 0) displaySkills.push({ label: 'L', value: skillScores.listening, color: 'primary' });
                            if (skillScores.reading > 0) displaySkills.push({ label: 'R', value: skillScores.reading, color: 'primary' });
                          } else if (programType === 'cam' || programType === 'cambridge') {
                            // Cambridge: Sum of 2 parts (R&W, L) max 30
                            totalScore = (skillScores.reading || 0) + (skillScores.listening || 0);
                            totalScore = totalScore > 0 ? totalScore : null;

                            if (skillScores.reading > 0) displaySkills.push({ label: 'R&W', value: skillScores.reading, color: 'primary' });
                            if (skillScores.listening > 0) displaySkills.push({ label: 'L', value: skillScores.listening, color: 'primary' });
                          }
                        }

                        // Determine badge color based on program type and score
                        let badgeColor = 'bg-neutral-300';
                        if (totalScore) {
                          if (programType === 'ielts') {
                            badgeColor = totalScore >= 6.5 ? 'bg-success-600' : totalScore >= 5.0 ? 'bg-warning-600' : 'bg-danger-600';
                          } else if (programType === 'toeic') {
                            badgeColor = totalScore >= 700 ? 'bg-success-600' : totalScore >= 500 ? 'bg-warning-600' : 'bg-danger-600';
                          } else if (programType === 'cam' || programType === 'cambridge') {
                            badgeColor = totalScore >= 20 ? 'bg-success-600' : totalScore >= 15 ? 'bg-warning-600' : 'bg-danger-600';
                          }
                        }

                        return (
                          <div key={idx} className="text-center">
                            <div className="mb-1">
                              <Badge
                                className={`${badgeColor} text-white px-10 py-6 text-12 fw-semibold`}
                                style={{ minWidth: '65px' }}
                              >
                                MT{idx + 1}: {totalScore || '-'}
                              </Badge>
                            </div>
                            {displaySkills.length > 0 && totalScore && (
                              <div className="d-flex flex-wrap gap-1 justify-content-center" style={{ fontSize: '11px', maxWidth: '120px', margin: '0 auto' }}>
                                {displaySkills.map((skill, skillIdx) => (
                                  <Badge
                                    key={skillIdx}
                                    className={`bg-${skill.color}-100 text-${skill.color}-700 px-4 py-2`}
                                  >
                                    {skill.label}: {skill.value}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-neutral-400 text-12">Chưa có</span>
                    )}
                  </div>
                </td>
              )}
              {!hideActions && (
                <td className="px-12 py-16 text-center">
                  <Button 
                    className="btn-outline-main text-11 px-10 py-6 radius-6" 
                    style={{ whiteSpace: 'nowrap' }}
                    onClick={() => onViewStudentDetail(student)}
                  >
                    <i className="fas fa-eye me-1"></i>
                    Chi tiết
                  </Button>
                </td>
              )}
            </tr>
            );
          })}
        </tbody>
      </Table>

      {/* Import Modal */}
      <ImportMocktestScoresModal
        show={showImportModal}
        onHide={() => {
          setShowImportModal(false);
          setSelectedMocktestSchedule(null);
          setSelectedMocktestOrder(null);
        }}
        classInfo={classInfo}
        students={students}
        scheduleId={selectedMocktestSchedule}
        mocktestOrder={selectedMocktestOrder}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
};

export default ClassStudents;
