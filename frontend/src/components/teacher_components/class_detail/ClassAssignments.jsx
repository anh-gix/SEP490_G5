import React from 'react';
import { Table, Button } from 'react-bootstrap';

const ClassAssignments = ({ 
  assignments, 
  handleViewAssignment, 
  handleDeleteHomework,
  handleAddHomeworkClick 
}) => {
  return (
    <div className="p-0">
      <div className="p-20 border-bottom">
        <Button 
          className="btn-main px-16 py-8 radius-8"
          onClick={handleAddHomeworkClick}
        >
          <i className="fas fa-plus me-2"></i>
          Thêm bài tập mới
        </Button>
      </div>
      <Table hover className="mb-0">
        <thead>
          <tr className="bg-neutral-25">
            <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Bài tập</th>
            <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Buổi học</th>
            <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Hạn nộp</th>
            <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Đã nộp</th>
            <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Nộp muộn</th>
            <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Chưa nộp</th>
            <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map(assignment => (
            <tr key={assignment._id}>
              <td className="px-20 py-16">
                <div className="text-neutral-900 fw-semibold text-14">{assignment.title}</div>
                {assignment.files && assignment.files.length > 0 && (
                  <div className="text-main-600 text-11">
                    <i className="fas fa-file-download me-1"></i>
                    {assignment.files.length} file đề bài
                  </div>
                )}
              </td>
              <td className="px-20 py-16">
                <div className="text-neutral-700 text-13">
                  {assignment.sessionTitle || `Buổi ${assignment.sessionOrder}`}
                </div>
                <div className="text-neutral-500 text-11">
                  {new Date(assignment.lessonDate).toLocaleDateString('vi-VN')}
                </div>
              </td>
              <td className="px-20 py-16">
                <div className="text-neutral-700 text-13">
                  {new Date(assignment.dueDate).toLocaleDateString('vi-VN')}
                </div>
                <div className="text-neutral-500 text-11">
                  {new Date(assignment.dueDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </td>
              <td className="px-20 py-16 text-center">
                <div className="text-success-600 fw-semibold text-14">
                  {assignment.submitted}/{assignment.total}
                </div>
                <div className="text-neutral-500 text-11">
                  {assignment.submissionRate}%
                </div>
              </td>
              <td className="px-20 py-16 text-center">
                {assignment.late > 0 ? (
                  <span className="text-warning-600 fw-medium text-13">
                    {assignment.late}
                  </span>
                ) : (
                  <span className="text-neutral-400 text-13">0</span>
                )}
              </td>
              <td className="px-20 py-16 text-center">
                {assignment.notSubmitted > 0 ? (
                  <span className="text-danger-600 fw-medium text-13">
                    {assignment.notSubmitted}
                  </span>
                ) : (
                  <span className="text-neutral-400 text-13">0</span>
                )}
              </td>
              <td className="px-20 py-16 text-center">
                <div className="d-flex gap-2 justify-content-center">
                  <Button 
                    className="btn-outline-main text-12 px-12 py-6 radius-6"
                    onClick={() => handleViewAssignment(assignment)}
                  >
                    <i className="fas fa-eye me-1"></i>
                    Chi tiết
                  </Button>
                  <Button 
                    className="btn-outline-danger text-12 px-12 py-6 radius-6"
                    onClick={() => handleDeleteHomework(assignment)}
                  >
                    <i className="fas fa-trash"></i>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default ClassAssignments;
