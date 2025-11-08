import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import classScheduleService from "../services/classScheduleService";
import Breadcrumb from "../components/Breadcrumb";
import FooterOne from "../components/FooterOne";
import HeaderOne from "../components/HeaderOne";
import Animation from "../helper/Animation";
import Preloader from "../helper/Preloader";

const ClassSchedulePage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [className, setClassName] = useState('');

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        if (classId) {
          const response = await classScheduleService.getSchedulesByClass(classId);
          setSchedules(response);
          if (response.length > 0 && response[0].class) {
            setClassName(response[0].class.name || 'Lớp học');
          }
        }
      } catch (err) {
        setError(err.message || 'Không thể tải lịch học');
        console.error('Error fetching schedules:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, [classId]);

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

  const getStatusColor = (date, startTime, endTime) => {
    const now = new Date();
    const classDate = new Date(date);
    const classStartTime = new Date(classDate);
    const [startHour, startMinute] = startTime.split(":");
    classStartTime.setHours(startHour, startMinute, 0, 0);
    const classEndTime = new Date(classDate);
    const [endHour, endMinute] = endTime.split(":");
    classEndTime.setHours(endHour, endMinute, 0, 0);
    if (now < classStartTime) return "text-info";
    if (now >= classStartTime && now <= classEndTime) return "text-success";
    return "text-secondary";
  };
  const getStatusText = (date, startTime, endTime) => {
    const now = new Date();
    const classDate = new Date(date);
    const classStartTime = new Date(classDate);
    const [startHour, startMinute] = startTime.split(":");
    classStartTime.setHours(startHour, startMinute, 0, 0);
    const classEndTime = new Date(classDate);
    const [endHour, endMinute] = endTime.split(":");
    classEndTime.setHours(endHour, endMinute, 0, 0);
    if (now < classStartTime) return "Chưa đến giờ";
    if (now >= classStartTime && now <= classEndTime) return "Đang diễn ra";
    return "Đã kết thúc";
  };
  const handleViewAttendance = (scheduleId) => {
    navigate(`/attendance/schedule/${scheduleId}`);
  };

  return (
    <>
      <Preloader />
      <Animation />
      
      <Breadcrumb title={"Lịch học"} />
      {loading ? (
        <div className='blog-page-section py-120'>
          <div className='container'>
            <div className='text-center'>
              <div className='spinner-border text-main-600' role='status'>
                <span className='visually-hidden'>Loading...</span>
              </div>
              <p className='mt-3 text-neutral-500'>Đang tải lịch học...</p>
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
              <button className='btn btn-main-600 mt-3' onClick={() => navigate('/attendance')}>Quay lại danh sách lớp</button>
            </div>
          </div>
        </div>
      ) : (
        <div className='blog-page-section py-120'>
          <div className='container'>
            <div className='flex-between gap-16 flex-wrap mb-40'>
              <div>
                <h2 className='text-neutral-800 mb-2'>Lịch học - {className}</h2>
                <span className='text-neutral-500'>Hiển thị {schedules.length} buổi học</span>
              </div>
              <div className='flex-align gap-16'>
                <button className='btn btn-outline-main-600' onClick={() => navigate('/attendance')}><i className='ph ph-arrow-left me-2'></i>Quay lại</button>
                <div className='flex-align gap-8'>
                  <span className='text-neutral-500 flex-shrink-0'>Sắp xếp theo :</span>
                  <select className='form-select ps-20 pe-28 py-8 fw-medium rounded-pill bg-main-25 border border-neutral-30 text-neutral-700'>
                    <option value="date">Ngày học</option>
                    <option value="session">Số buổi</option>
                    <option value="time">Giờ học</option>
                  </select>
                </div>
              </div>
            </div>
            {schedules.length === 0 ? (
              <div className='text-center py-5'>
                <div className='mb-4'>
                  <i className='ph ph-calendar text-neutral-300' style={{ fontSize: '4rem' }}></i>
                </div>
                <h4 className='text-neutral-500 mb-3'>Chưa có lịch học nào</h4>
                <p className='text-neutral-400'>Lớp này chưa có buổi học nào được lên lịch.</p>
              </div>
            ) : (
              <div className='row gy-4'>
                {schedules.map((schedule, index) => (
                  <div key={schedule._id} className='col-lg-6'>
                    <div className='scale-hover-item bg-main-25 rounded-16 p-12 h-100 border border-neutral-30 d-flex flex-sm-row flex-column'>
                      <div className='course-item__thumb rounded-12 overflow-hidden position-relative max-w-274 w-lg-50'></div>
                      <div className='p-20 position-relative w-lg-50'>
                        <div className='flex-align gap-14 flex-wrap mb-20'>
                          <div className='flex-align gap-8'>
                            <span className='text-neutral-500 text-2xl d-flex'><i className='ph ph-calendar' /></span>
                            <span className='text-neutral-500 text-lg'>{formatDate(schedule.date)}</span>
                          </div>
                          <span className='w-8 h-8 bg-neutral-100 rounded-circle' />
                          <div className='flex-align gap-8'>
                            <span className='text-neutral-500 text-2xl d-flex'><i className='ph ph-clock' /></span>
                            <span className='text-neutral-500 text-lg'>{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</span>
                          </div>
                        </div>
                        <div className='mb-20'>
                          <div className='flex-align gap-8 mb-8'>
                            <span className='text-neutral-500 text-2xl d-flex'><i className='ph ph-map-pin' /></span>
                            <span className='text-neutral-500 text-lg'>{schedule.room?.room_name || 'Chưa xác định phòng'}</span>
                          </div>
                          {schedule.room?.location && (<div className='text-neutral-400 text-sm ms-8'>{schedule.room.location}</div>)}
                        </div>
                        <div className='mb-20'>
                          <span className={`badge ${getStatusColor(schedule.date, schedule.startTime, schedule.endTime).replace('text-', 'bg-')} text-white`}>
                            {getStatusText(schedule.date, schedule.startTime, schedule.endTime)}
                          </span>
                        </div>
                        <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                          <button onClick={() => handleViewAttendance(schedule._id)} className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold btn btn-link p-0'>
                            Xem điểm danh
                            <i className='ph ph-arrow-right' />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      <FooterOne />
    </>
  );
};

export default ClassSchedulePage;
