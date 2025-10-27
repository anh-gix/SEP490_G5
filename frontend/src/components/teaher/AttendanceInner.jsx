import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import classScheduleService from "../../services/classScheduleService";

const AttendanceInner = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        if (user && user._id) {
          const hardcodedUserId = "670fd02e7e1b8b4a3fcd9b22";
          const response = await classScheduleService.getClassesByTeacher(hardcodedUserId);
          setClasses(response);
        }
      } catch (err) {
        setError(err.message || 'Không thể tải danh sách lớp');
        console.error('Error fetching classes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [user]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className='blog-page-section py-120'>
        <div className='container'>
          <div className='text-center'>
            <div className='spinner-border text-main-600' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </div>
            <p className='mt-3 text-neutral-500'>Đang tải danh sách lớp...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='blog-page-section py-120'>
        <div className='container'>
          <div className='text-center'>
            <div className='alert alert-danger' role='alert'>
              <i className='ph ph-warning-circle text-danger me-2'></i>
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='blog-page-section py-120'>
      <div className='container'>
        <div className='flex-between gap-16 flex-wrap mb-40'>
          <span className='text-neutral-500'>
            Hiển thị {classes.length} lớp học của bạn
          </span>
          <div className='flex-align gap-16'>
            <div className='flex-align gap-8'>
              <span className='text-neutral-500 flex-shrink-0'>Sắp xếp theo :</span>
              <select className='form-select ps-20 pe-28 py-8 fw-medium rounded-pill bg-main-25 border border-neutral-30 text-neutral-700'>
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="name">Tên lớp</option>  
              </select>
            </div>
            <button
              type='button'
              className='list-bar-btn text-xl w-40 h-40 bg-main-600 text-white rounded-8 flex-center d-lg-none'
            >
              <i className='ph-bold ph-funnel' />
            </button>
          </div>
        </div>
        
        {classes.length === 0 ? (
          <div className='text-center py-5'>
            <div className='mb-4'>
              <i className='ph ph-book-open text-neutral-300' style={{ fontSize: '4rem' }}></i>
            </div>
            <h4 className='text-neutral-500 mb-3'>Chưa có lớp học nào</h4>
            <p className='text-neutral-400'>Bạn chưa được phân công dạy lớp nào.</p>
          </div>
        ) : (
          <div className='row gy-4'>
            {classes.map((classItem, index) => (
              <div key={classItem._id} className='col-lg-6'>
                <div className='scale-hover-item bg-main-25 rounded-16 p-12 h-100 border border-neutral-30 d-flex flex-sm-row flex-column'>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative max-w-274 w-lg-50'>
                  </div>
                  <div className='p-20 position-relative w-lg-50'>
                    <div className='flex-align gap-14 flex-wrap mb-20'>
                      <div className='flex-align gap-8'>
                        <span className='text-neutral-500 text-2xl d-flex'>
                          <i className='ph ph-book' />
                        </span>
                        <span className='text-neutral-500 text-lg'>{classItem.subject || 'Chưa có môn học'}</span>
                      </div>
                      <span className='w-8 h-8 bg-neutral-100 rounded-circle' />
                      <div className='flex-align gap-8'>
                        <span className='text-neutral-500 text-2xl d-flex'>
                          <i className='ph ph-calendar' />
                        </span>
                        Ngày Tạo lớp: <span className='text-neutral-500 text-lg'>{formatDate(classItem.createdAt)}</span>
                      </div>
                    </div>
                    <h4 className='mb-28'>
                      <span className='text-line-3 fw-semibold text-neutral-800'>
                        {classItem.name || 'Lớp học chưa có tên'}
                      </span>
                    </h4>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <Link
                        to={`/attendance/class/${classItem._id}`}
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Xem lịch học
                        <i className='ph ph-arrow-right' />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceInner;
