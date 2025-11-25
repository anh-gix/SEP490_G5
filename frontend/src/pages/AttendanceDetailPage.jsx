import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import classScheduleService from "../services/classScheduleService";
import Breadcrumb from "../components/Breadcrumb";
import FooterOne from "../components/FooterOne";
import HeaderOne from "../components/HeaderOne";
import Animation from "../helper/Animation";
import Preloader from "../helper/Preloader";

const AttendanceDetailPage = () => {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [attendanceList, setAttendanceList] = useState([]);
  const [scheduleInfo, setScheduleInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    const fetchAttendanceList = async () => {
      try {
        setLoading(true);
        if (scheduleId) {
          const response = await classScheduleService.getAttendanceByClassSchedule(scheduleId);
          setAttendanceList(response.list || []);
          if (response.list && response.list.length > 0) {
            setScheduleInfo(response.list[0].classSchedule);
          }
        }
      } catch (err) {
        setError(err.message || 'Không thể tải danh sách điểm danh');
        console.error('Error fetching attendance list:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendanceList();
  }, [scheduleId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  const formatTime = (timeString) => timeString.substring(0, 5);
  const getStatusBadge = (status) => {
    const statusConfig = {
      'present': { class: 'bg-success', text: 'Có mặt', icon: 'ph-check-circle' },
      'absent': { class: 'bg-danger', text: 'Vắng mặt', icon: 'ph-x-circle' },
      'late': { class: 'bg-warning', text: 'Đi muộn', icon: 'ph-clock' },
      'excused': { class: 'bg-info', text: 'Có phép', icon: 'ph-file-text' }
    };
    const config = statusConfig[status] || statusConfig['absent'];
    return <span className={`badge ${config.class} text-white`}><i className={`ph ${config.icon} me-1`}></i>{config.text}</span>;
  };
  const handleMarkAttendance = async (studentScheduleId, status) => {
    try {
      setUpdating(prev => ({ ...prev, [studentScheduleId]: true }));
      await classScheduleService.markAttendance(studentScheduleId, {
        status,
        teacherId: user._id
      });
      setAttendanceList(prev => prev.map(item => item._id === studentScheduleId
        ? { ...item, attendance: { ...item.attendance, status, markedAt: new Date().toISOString(), markedBy: user._id }}
        : item));
    } catch (err) {
      console.error('Error marking attendance:', err);
      alert('Có lỗi khi điểm danh: ' + (err.message || 'Không xác định'));
    } finally {
      setUpdating(prev => ({ ...prev, [studentScheduleId]: false }));
    }
  };
  const canMarkAttendance = (scheduleDate) => {
    const today = new Date().toISOString().split("T")[0];
    const classDate = new Date(scheduleDate).toISOString().split("T")[0];
    return today === classDate;
  };

  return (
    <>
      <Preloader />
      <Animation />
      <Breadcrumb title={"Điểm danh chi tiết"} />
      {loading ? (
        <div className='blog-page-section py-120'>
          <div className='container'>
            <div className='text-center'>
              <div className='spinner-border text-main-600' role='status'>
                <span className='visually-hidden'>Loading...</span>
              </div>
              <p className='mt-3 text-neutral-500'>Đang tải danh sách điểm danh...</p>
            </div>
          </div>
        </div>
      ) : error ? (
        <div className='blog-page-section py-120'>
          <div className='container'>
            <div className='text-center'>
              <div className='alert alert-danger' role='alert'>
                <i className='ph ph-warning-circle text-danger me-2'></i>
                {error}
              </div>
              <button className='btn btn-main-600 mt-3' onClick={() => navigate(-1)}>Quay lại</button>
            </div>
          </div>
        </div>
      ) : (
        <div className='blog-page-section py-120'>
          <div className='container'>
            <div className='flex-between gap-16 flex-wrap mb-40'>
              <div>
                <h2 className='text-neutral-800 mb-2'>Điểm danh buổi học</h2>
                {scheduleInfo && (
                  <div className='text-neutral-500'>
                    <div className='mb-1'>
                      <i className='ph ph-calendar me-2'></i>
                      {formatDate(scheduleInfo.date)} - {formatTime(scheduleInfo.startTime)} - {formatTime(scheduleInfo.endTime)}
                    </div>
                    <div>
                      <i className='ph ph-map-pin me-2'></i>
                      {scheduleInfo.room?.room_name || 'Chưa xác định phòng'}
                    </div>
                  </div>
                )}
              </div>
              <div className='flex-align gap-16'>
                <button className='btn btn-outline-main-600' onClick={() => navigate(-1)}><i className='ph ph-arrow-left me-2'></i>Quay lại</button>
                <div className='text-neutral-500'>Tổng: {attendanceList.length} sinh viên</div>
              </div>
            </div>
            <div className='row mb-40'>
              <div className='col-md-3'><div className='card bg-success text-white'><div className='card-body text-center'><i className='ph ph-check-circle text-4xl mb-2'></i><h4>{attendanceList.filter(item => item.attendance?.status === 'present').length}</h4><p className='mb-0'>Có mặt</p></div></div></div>
              <div className='col-md-3'><div className='card bg-danger text-white'><div className='card-body text-center'><i className='ph ph-x-circle text-4xl mb-2'></i><h4>{attendanceList.filter(item => item.attendance?.status === 'absent').length}</h4><p className='mb-0'>Vắng mặt</p></div></div></div>
              <div className='col-md-3'><div className='card bg-warning text-white'><div className='card-body text-center'><i className='ph ph-clock text-4xl mb-2'></i><h4>{attendanceList.filter(item => item.attendance?.status === 'late').length}</h4><p className='mb-0'>Đi muộn</p></div></div></div>
              <div className='col-md-3'><div className='card bg-info text-white'><div className='card-body text-center'><i className='ph ph-file-text text-4xl mb-2'></i><h4>{attendanceList.filter(item => item.attendance?.status === 'excused').length}</h4><p className='mb-0'>Có phép</p></div></div></div>
            </div>
            {attendanceList.length === 0 ? (
              <div className='text-center py-5'>
                <div className='mb-4'><i className='ph ph-users text-neutral-300' style={{ fontSize: '4rem' }}></i></div>
                <h4 className='text-neutral-500 mb-3'>Chưa có sinh viên nào</h4>
                <p className='text-neutral-400'>Lớp này chưa có sinh viên nào được đăng ký.</p>
              </div>
            ) : (
              <div className='card'>
                <div className='card-body p-0'>
                  <div className='table-responsive'>
                    <table className='table table-hover mb-0'>
                      <thead className='bg-main-25'>
                        <tr>
                          <th className='border-0 py-16 px-20 fw-semibold'>STT</th>
                          <th className='border-0 py-16 px-20 fw-semibold'>Tên sinh viên</th>
                          <th className='border-0 py-16 px-20 fw-semibold'>Trạng thái</th>
                          <th className='border-0 py-16 px-20 fw-semibold'>Thời gian điểm danh</th>
                          <th className='border-0 py-16 px-20 fw-semibold'>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceList.map((item, index) => {
                          const canMark = scheduleInfo ? canMarkAttendance(scheduleInfo.date) : false;
                          const isUpdating = updating[item._id];
                          return (
                            <tr key={item._id}>
                              <td className='py-16 px-20'>{index + 1}</td>
                              <td className='py-16 px-20'>
                                <div className='d-flex align-items-center'>
                                  <div className='avatar-sm bg-main-100 text-main-600 rounded-circle d-flex align-items-center justify-content-center me-3'><i className='ph ph-user'></i></div>
                                  <div>
                                    <div className='fw-semibold'>{item.student?.username || 'Chưa có tên'}</div>
                                    <small className='text-neutral-500'>ID: {item.student?._id}</small>
                                  </div>
                                </div>
                              </td>
                              <td className='py-16 px-20'>{getStatusBadge(item.attendance?.status || 'absent')}</td>
                              <td className='py-16 px-20'>
                                {item.attendance?.markedAt ? (
                                  <div>
                                    <div className='text-sm'>{new Date(item.attendance.markedAt).toLocaleString('vi-VN')}</div>
                                    {item.attendance.markedBy && (<small className='text-neutral-500'>Bởi giáo viên</small>)}
                                  </div>) : <span className='text-neutral-400'>Chưa điểm danh</span>}
                              </td>
                              <td className='py-16 px-20'>
                                {canMark ? (
                                  <div className='btn-group' role='group'>
                                    <button className={`btn btn-sm ${item.attendance?.status === 'present' ? 'btn-success' : 'btn-outline-success'}`} onClick={() => handleMarkAttendance(item._id, 'present')} disabled={isUpdating}>{isUpdating ? (<span className='spinner-border spinner-border-sm me-1'></span>) : (<i className='ph ph-check me-1'></i>)}Có mặt</button>
                                    <button className={`btn btn-sm ${item.attendance?.status === 'absent' ? 'btn-danger' : 'btn-outline-danger'}`} onClick={() => handleMarkAttendance(item._id, 'absent')} disabled={isUpdating}>{isUpdating ? (<span className='spinner-border spinner-border-sm me-1'></span>) : (<i className='ph ph-x me-1'></i>)}Vắng</button>
                                    <button className={`btn btn-sm ${item.attendance?.status === 'late' ? 'btn-warning' : 'btn-outline-warning'}`} onClick={() => handleMarkAttendance(item._id, 'late')} disabled={isUpdating}>{isUpdating ? (<span className='spinner-border spinner-border-sm me-1'></span>) : (<i className='ph ph-clock me-1'></i>)}Muộn</button>
                                    <button className={`btn btn-sm ${item.attendance?.status === 'excused' ? 'btn-info' : 'btn-outline-info'}`} onClick={() => handleMarkAttendance(item._id, 'excused')} disabled={isUpdating}>{isUpdating ? (<span className='spinner-border spinner-border-sm me-1'></span>) : (<i className='ph ph-file-text me-1'></i>)}Phép</button>
                                  </div>
                                ) : (<span className='text-neutral-400 text-sm'>{scheduleInfo ? 'Không thể điểm danh' : 'Chưa có thông tin lịch học'}</span>)}
                              </td>
                            </tr>);
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <FooterOne />
    </>
  );
};

export default AttendanceDetailPage;
