import React from 'react';
import { Table, Badge, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';

const ClassLessons = ({ lessons, getLessonStatusBadge }) => {
  const { classId } = useParams();
  const navigate = useNavigate();
  
  return (
    <div className="p-0">
      <Table hover className="mb-0">
        <thead>
          <tr className="bg-neutral-25">
            <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Buổi</th>
            <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Ngày học</th>
            <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Thời gian</th>
            <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Chủ đề</th>
            <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Điểm danh</th>
            <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Trạng thái</th>
            <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {lessons.map(lesson => (
            <tr key={lesson._id}>
              <td className="px-20 py-16">
                <Badge className="bg-neutral-100 text-neutral-900 px-10 py-6">
                  Buổi {lesson.lessonNumber}
                </Badge>
              </td>
              <td className="px-20 py-16 text-neutral-900 fw-medium text-13">
                {new Date(lesson.date).toLocaleDateString('vi-VN', { 
                  weekday: 'short', 
                  day: '2-digit', 
                  month: '2-digit',
                  year: 'numeric'
                })}
              </td>
              <td className="px-20 py-16 text-neutral-700 text-13">{lesson.time}</td>
              <td className="px-20 py-16">
                <div className="text-neutral-900 text-14">{lesson.topic}</div>
              </td>
              <td className="px-20 py-16 text-center">
                {lesson.hasAttendance ? (
                  <div>
                    <span className="text-neutral-900 fw-medium text-13">
                      {lesson.attendanceCount}/{lesson.totalStudents}
                    </span>
                    <div className="text-neutral-500 text-11">
                      {Math.round((lesson.attendanceCount / lesson.totalStudents) * 100)}%
                    </div>
                  </div>
                ) : (
                  <span className="text-neutral-400 text-12">Chưa điểm danh</span>
                )}
              </td>
              <td className="px-20 py-16 text-center">
                {getLessonStatusBadge(lesson.status)}
              </td>
              <td className="px-20 py-16 text-center">
                <Button 
                  className="btn-outline-main text-12 px-12 py-6 radius-6"
                  onClick={() => navigate(`/teacher/lessons/${lesson._id}`, { 
                    state: { from: 'class', classId: classId } 
                  })}
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

export default ClassLessons;
