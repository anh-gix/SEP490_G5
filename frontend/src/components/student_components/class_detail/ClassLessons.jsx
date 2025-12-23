import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import studentService from '../../../services/studentService';

/**
 * Class Lessons Component for Student
 * Danh sách các buổi học của lớp
 */
const ClassLessons = ({ classInfo }) => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (classId) {
      fetchLessons();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  if (!classInfo) {
    return (
      <div className="text-center py-5">
        <p className="text-neutral-500">Đang tải thông tin lớp học...</p>
      </div>
    );
  }

  const fetchLessons = async () => {
    try {
      setLoading(true);
      // TODO: Create API endpoint to get lessons by classId
      // For now, use schedule API
      const response = await studentService.getMySchedule();
      
      if (response.success && response.schedules) {
        // Filter schedules for this class
        const classLessons = response.schedules.filter(
          schedule => schedule.class?._id === classId || schedule.class === classId
        );
        setLessons(classLessons);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceBadge = (attendance) => {
    if (!attendance) return null;

    const attendanceConfig = {
      present: { bg: 'bg-success-600', text: 'Có mặt', icon: 'fa-check' },
      absent: { bg: 'bg-danger-600', text: 'Vắng', icon: 'fa-times' },
      late: { bg: 'bg-warning-600', text: 'Trễ', icon: 'fa-clock' },
      excused: { bg: 'bg-info-500', text: 'Có phép', icon: 'fa-file-alt' }
    };

    const config = attendanceConfig[attendance.status] || attendanceConfig.present;
    return (
      <Badge className={`${config.bg} text-white px-12 py-6 text-12`}>
        <i className={`fas ${config.icon} me-1`}></i>
        {config.text}
      </Badge>
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { bg: 'bg-success-600', text: 'Đã diễn ra' },
      scheduled: { bg: 'bg-neutral-400', text: 'Đã lên lịch' },
      cancelled: { bg: 'bg-danger-600', text: 'Đã hủy' }
    };

    const config = statusConfig[status] || statusConfig.scheduled;
    return (
      <Badge className={`${config.bg} text-white px-12 py-6 text-12`}>
        {config.text}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-white border-0 rounded-12" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
      <Card.Header className="bg-main-25 border-0 p-20">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="text-neutral-900 fw-semibold mb-0">Danh sách buổi học</h5>
          <Badge className="bg-main-600 text-white px-12 py-6">
            {lessons.length} buổi học
          </Badge>
        </div>
      </Card.Header>
      <Card.Body className="p-0">
        {lessons.length > 0 ? (
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead>
                <tr className="bg-main-25">
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Buổi</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Ngày</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Thời gian</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Chủ đề</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Phòng</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Trạng thái</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Chuyên cần</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((lesson, index) => (
                  <tr key={lesson._id} className="transition-2">
                    <td className="px-20 py-16 text-neutral-700 text-13">
                      Buổi {lesson.sessionOrder || index + 1}
                    </td>
                    <td className="px-20 py-16 text-neutral-700 text-13">
                      {new Date(lesson.date).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-20 py-16 text-neutral-700 text-13">
                      {lesson.startTime} - {lesson.endTime}
                    </td>
                    <td className="px-20 py-16 text-neutral-900 fw-medium text-13">
                      {lesson.sessionTitle || 'Chưa có chủ đề'}
                    </td>
                    <td className="px-20 py-16 text-neutral-700 text-13">
                      {lesson.roomName || 'N/A'}
                    </td>
                    <td className="px-20 py-16 text-13">
                      {getStatusBadge(lesson.scheduleStatus || 'upcoming')}
                    </td>
                    <td className="px-20 py-16 text-13">
                      {getAttendanceBadge(lesson.attendance)}
                    </td>
                    <td className="px-20 py-16 text-center">
                      <Button 
                        className="btn-outline-main text-13 fw-medium px-12 py-6 radius-6"
                        onClick={() => navigate(`/student/lessons/${lesson._id}`, { 
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
        ) : (
          <div className="text-center py-60">
            <i className="fas fa-book-open fa-3x text-neutral-400 mb-16"></i>
            <p className="text-neutral-500 mb-0">Chưa có buổi học nào</p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ClassLessons;
