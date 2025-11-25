import React from 'react';
import { Table, Badge, Button } from 'react-bootstrap';

const ClassStudents = ({ students, onViewStudentDetail }) => {
  return (
    <div className="p-0">
      <Table hover className="mb-0">
        <thead>
          <tr className="bg-neutral-25">
            <th className="px-12 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center" style={{ width: '50px', minWidth: '50px' }}>STT</th>
            <th className="px-16 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center" style={{ width: '180px' }}>Họ và tên</th>
            <th className="px-16 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center" style={{ width: '200px' }}>Email</th>
            <th className="px-12 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center" style={{ width: '110px' }}>Điểm danh</th>
            <th className="px-12 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center" style={{ width: '110px' }}>Bài tập</th>
            <th className="px-16 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Mocktest</th>
            <th className="px-12 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center" style={{ width: '130px', minWidth: '130px' }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
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
                    {student.attendanceCount}/{student.totalLessons} buổi
                  </div>
                </div>
              </td>
              <td className="px-12 py-16 text-center">
                <div>
                  <Badge className={`mb-1 ${student.homeworkCompletionRate >= 80 ? 'bg-success-100 text-success-600' : student.homeworkCompletionRate >= 60 ? 'bg-warning-100 text-warning-600' : 'bg-danger-100 text-danger-600'}`}>
                    {student.homeworkCompletionRate}%
                  </Badge>
                  <div className="text-neutral-500 text-11">
                    {student.submittedAssignments}/{student.totalAssignments} bài
                  </div>
                </div>
              </td>
              <td className="px-16 py-16 text-center">
                <div className="d-flex flex-wrap gap-2 justify-content-center">
                  {student.mocktestSessionOrders && student.mocktestSessionOrders.length > 0 ? (
                    student.mocktestSessionOrders.map((sessionOrder, idx) => {
                      const mocktest = student.mocktestScores?.[`mocktest${sessionOrder}`];
                      const skillScores = mocktest?.skillScores;
                      
                      // Calculate total from skill scores
                      let totalScore = skillScores 
                        ? (skillScores.reading || 0) + 
                          (skillScores.listening || 0) + 
                          (skillScores.writing || 0) + 
                          (skillScores.speaking || 0)
                        : null;
                      
                      // Round to 1 decimal place
                      if (totalScore !== null) {
                        totalScore = Math.round(totalScore * 10) / 10;
                      }
                      
                      return (
                        <div key={idx} className="text-center">
                          <div className="mb-1">
                            <Badge 
                              className={`${
                                totalScore >= 700 ? 'bg-success-600' : 
                                totalScore >= 500 ? 'bg-warning-600' : 
                                totalScore ? 'bg-danger-600' : 
                                'bg-neutral-300'
                              } text-white px-10 py-6 text-12 fw-semibold`}
                              style={{ minWidth: '65px' }}
                            >
                              MT{idx + 1}: {totalScore || '-'}
                            </Badge>
                          </div>
                          {skillScores && totalScore && (
                            <div className="d-flex flex-column gap-1" style={{ fontSize: '14px' }}>
                              <div className="d-flex gap-1 justify-content-center">
                                {skillScores.reading > 0 && (
                                  <Badge className="bg-info-100 text-info-700 px-4 py-2">
                                    R: {skillScores.reading}
                                  </Badge>
                                )}
                                {skillScores.listening > 0 && (
                                  <Badge className="bg-purple-100 text-purple-700 px-4 py-2">
                                    L: {skillScores.listening}
                                  </Badge>
                                )}
                              </div>
                              <div className="d-flex gap-1 justify-content-center">
                                {skillScores.writing > 0 && (
                                  <Badge className="bg-warning-100 text-warning-700 px-4 py-2">
                                    W: {skillScores.writing}
                                  </Badge>
                                )}
                                {skillScores.speaking > 0 && (
                                  <Badge className="bg-success-100 text-success-700 px-4 py-2">
                                    S: {skillScores.speaking}
                                  </Badge>
                                )}
                              </div>
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
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default ClassStudents;
