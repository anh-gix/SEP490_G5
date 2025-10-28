import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ScheduleCalendar from './ScheduleCalendar';
import ScheduleList from './ScheduleList';
import CreateScheduleModal from './CreateScheduleModal';
import EditScheduleModal from './EditScheduleModal';
import MakeupClassModal from './MakeupClassModal';
import RoomManagement from './RoomManagement';
import './ScheduleManagement.css';

const ScheduleManagement = () => {
  const [viewMode, setViewMode] = useState('calendar'); // calendar or list
  const [schedules, setSchedules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMakeupModal, setShowMakeupModal] = useState(false);
  const [showRoomManagement, setShowRoomManagement] = useState(false);
  const [filters, setFilters] = useState({
    classId: '',
    teacherId: '',
    roomId: '',
    startDate: '',
    endDate: '',
    status: ''
  });

  const fetchSchedules = async () => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/schedules?' + new URLSearchParams(filters));
      const data = await response.json();
      setSchedules(data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      // Mock data for development
      setSchedules([
        {
          id: 1,
          classId: 1,
          className: 'A1-Morning-01',
          teacherId: 1,
          teacherName: 'Nguyễn Văn A',
          roomId: 1,
          roomName: 'Room 101',
          date: '2025-10-29',
          startTime: '08:00',
          endTime: '10:00',
          lessonNumber: 1,
          lessonTopic: 'Introduction to English',
          status: 'scheduled',
          type: 'regular'
        },
        {
          id: 2,
          classId: 1,
          className: 'A1-Morning-01',
          teacherId: 1,
          teacherName: 'Nguyễn Văn A',
          roomId: 1,
          roomName: 'Room 101',
          date: '2025-10-31',
          startTime: '08:00',
          endTime: '10:00',
          lessonNumber: 2,
          lessonTopic: 'Basic Grammar',
          status: 'scheduled',
          type: 'regular'
        }
      ]);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes');
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      // Mock data
      setClasses([
        { id: 1, name: 'A1-Morning-01', level: 'A1', students: 20 },
        { id: 2, name: 'A2-Evening-01', level: 'A2', students: 18 },
        { id: 3, name: 'B1-Weekend-01', level: 'B1', students: 15 }
      ]);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/teachers');
      const data = await response.json();
      setTeachers(data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      // Mock data
      setTeachers([
        { id: 1, name: 'Nguyễn Văn A', email: 'teachera@example.com' },
        { id: 2, name: 'Trần Thị B', email: 'teacherb@example.com' },
        { id: 3, name: 'Lê Văn C', email: 'teacherc@example.com' }
      ]);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms');
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      // Mock data
      setRooms([
        { id: 1, name: 'Room 101', capacity: 25, equipment: ['Projector', 'Whiteboard'] },
        { id: 2, name: 'Room 102', capacity: 30, equipment: ['Projector', 'Whiteboard', 'Computer'] },
        { id: 3, name: 'Room 201', capacity: 20, equipment: ['Whiteboard'] }
      ]);
    }
  };

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      await fetchSchedules();
      await fetchClasses();
      await fetchTeachers();
      await fetchRooms();
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleCreateSchedule = async (scheduleData) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData)
      });
      const newSchedule = await response.json();
      setSchedules([...schedules, newSchedule]);
      setShowCreateModal(false);
      alert('Tạo lịch học thành công!');
      fetchSchedules();
    } catch (error) {
      console.error('Error creating schedule:', error);
      alert('Có lỗi xảy ra khi tạo lịch học!');
    }
  };

  const handleEditSchedule = async (scheduleData) => {
    try {
      const response = await fetch(`/api/schedules/${scheduleData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData)
      });
      const updatedSchedule = await response.json();
      setSchedules(schedules.map(s => s.id === updatedSchedule.id ? updatedSchedule : s));
      setShowEditModal(false);
      setSelectedSchedule(null);
      alert('Cập nhật lịch học thành công!');
      fetchSchedules();
    } catch (error) {
      console.error('Error updating schedule:', error);
      alert('Có lỗi xảy ra khi cập nhật lịch học!');
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lịch học này?')) return;
    
    try {
      await fetch(`/api/schedules/${scheduleId}`, { method: 'DELETE' });
      setSchedules(schedules.filter(s => s.id !== scheduleId));
      alert('Xóa lịch học thành công!');
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('Có lỗi xảy ra khi xóa lịch học!');
    }
  };

  const handleCreateMakeupClass = async (makeupData) => {
    try {
      const response = await fetch('/api/schedules/makeup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(makeupData)
      });
      const newSchedule = await response.json();
      setSchedules([...schedules, newSchedule]);
      setShowMakeupModal(false);
      alert('Tạo lịch học bù thành công!');
      fetchSchedules();
    } catch (error) {
      console.error('Error creating makeup class:', error);
      alert('Có lỗi xảy ra khi tạo lịch học bù!');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      classId: '',
      teacherId: '',
      roomId: '',
      startDate: '',
      endDate: '',
      status: ''
    });
  };

  const handleExportSchedule = () => {
    // TODO: Implement export functionality (Excel/PDF)
    alert('Chức năng xuất lịch học sẽ được triển khai sau!');
  };

  return (
    <div className="schedule-management-container">
      {/* Header */}
      <div className="schedule-header">
        <div className="header-left">
          <h2>Quản lý lịch học</h2>
          <p>Sắp xếp và quản lý lịch học cho các lớp</p>
        </div>
        <div className="header-right">
          <button 
            className="btn btn-outline"
            onClick={() => setShowRoomManagement(true)}
          >
            <i className="fas fa-door-open"></i> Quản lý phòng học
          </button>
          <button 
            className="btn btn-outline"
            onClick={handleExportSchedule}
          >
            <i className="fas fa-download"></i> Xuất lịch học
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <i className="fas fa-plus"></i> Tạo lịch học
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="schedule-filters">
        <div className="filter-group">
          <label>Lớp học</label>
          <select name="classId" value={filters.classId} onChange={handleFilterChange}>
            <option value="">Tất cả lớp</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Giảng viên</label>
          <select name="teacherId" value={filters.teacherId} onChange={handleFilterChange}>
            <option value="">Tất cả giảng viên</option>
            {teachers.map(teacher => (
              <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Phòng học</label>
          <select name="roomId" value={filters.roomId} onChange={handleFilterChange}>
            <option value="">Tất cả phòng</option>
            {rooms.map(room => (
              <option key={room.id} value={room.id}>{room.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Từ ngày</label>
          <input 
            type="date" 
            name="startDate" 
            value={filters.startDate} 
            onChange={handleFilterChange}
          />
        </div>

        <div className="filter-group">
          <label>Đến ngày</label>
          <input 
            type="date" 
            name="endDate" 
            value={filters.endDate} 
            onChange={handleFilterChange}
          />
        </div>

        <div className="filter-group">
          <label>Trạng thái</label>
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">Tất cả</option>
            <option value="scheduled">Đã lên lịch</option>
            <option value="completed">Đã hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
            <option value="makeup">Học bù</option>
          </select>
        </div>

        <div className="filter-actions">
          <button className="btn btn-secondary" onClick={handleResetFilters}>
            <i className="fas fa-redo"></i> Đặt lại
          </button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="view-toggle">
        <button 
          className={`toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
          onClick={() => setViewMode('calendar')}
        >
          <i className="fas fa-calendar"></i> Lịch
        </button>
        <button 
          className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => setViewMode('list')}
        >
          <i className="fas fa-list"></i> Danh sách
        </button>
      </div>

      {/* Content */}
      <div className="schedule-content">
        {viewMode === 'calendar' ? (
          <ScheduleCalendar 
            schedules={schedules}
            onEditSchedule={(schedule) => {
              setSelectedSchedule(schedule);
              setShowEditModal(true);
            }}
            onDeleteSchedule={handleDeleteSchedule}
            onCreateMakeup={(schedule) => {
              setSelectedSchedule(schedule);
              setShowMakeupModal(true);
            }}
          />
        ) : (
          <ScheduleList 
            schedules={schedules}
            onEditSchedule={(schedule) => {
              setSelectedSchedule(schedule);
              setShowEditModal(true);
            }}
            onDeleteSchedule={handleDeleteSchedule}
            onCreateMakeup={(schedule) => {
              setSelectedSchedule(schedule);
              setShowMakeupModal(true);
            }}
          />
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateScheduleModal
          classes={classes}
          teachers={teachers}
          rooms={rooms}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateSchedule}
          existingSchedules={schedules}
        />
      )}

      {showEditModal && selectedSchedule && (
        <EditScheduleModal
          schedule={selectedSchedule}
          classes={classes}
          teachers={teachers}
          rooms={rooms}
          onClose={() => {
            setShowEditModal(false);
            setSelectedSchedule(null);
          }}
          onSubmit={handleEditSchedule}
          existingSchedules={schedules}
        />
      )}

      {showMakeupModal && selectedSchedule && (
        <MakeupClassModal
          originalSchedule={selectedSchedule}
          classes={classes}
          teachers={teachers}
          rooms={rooms}
          onClose={() => {
            setShowMakeupModal(false);
            setSelectedSchedule(null);
          }}
          onSubmit={handleCreateMakeupClass}
          existingSchedules={schedules}
        />
      )}

      {showRoomManagement && (
        <RoomManagement
          rooms={rooms}
          onClose={() => setShowRoomManagement(false)}
          onUpdate={fetchRooms}
        />
      )}
    </div>
  );
};

export default ScheduleManagement;
