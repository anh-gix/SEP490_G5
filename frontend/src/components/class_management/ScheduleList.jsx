import React, { useState } from 'react';
import './ScheduleList.css';

const ScheduleList = ({ 
  schedules, 
  onEditSchedule, 
  onDeleteSchedule, 
  onCreateMakeup 
}) => {
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedSchedules, setSelectedSchedules] = useState([]);

  // Sort schedules
  const sortedSchedules = [...schedules].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'date':
        comparison = new Date(a.date) - new Date(b.date);
        if (comparison === 0) {
          comparison = a.startTime.localeCompare(b.startTime);
        }
        break;
      case 'className':
        comparison = a.className.localeCompare(b.className);
        break;
      case 'teacherName':
        comparison = a.teacherName.localeCompare(b.teacherName);
        break;
      case 'roomName':
        comparison = a.roomName.localeCompare(b.roomName);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      default:
        break;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectSchedule = (scheduleId) => {
    setSelectedSchedules(prev => {
      if (prev.includes(scheduleId)) {
        return prev.filter(id => id !== scheduleId);
      } else {
        return [...prev, scheduleId];
      }
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedSchedules(schedules.map(s => s.id));
    } else {
      setSelectedSchedules([]);
    }
  };

  const handleBulkDelete = () => {
    if (selectedSchedules.length === 0) return;
    
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedSchedules.length} lịch học đã chọn?`)) {
      selectedSchedules.forEach(id => onDeleteSchedule(id));
      setSelectedSchedules([]);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      scheduled: 'Đã lên lịch',
      completed: 'Đã hoàn thành',
      cancelled: 'Đã hủy',
      makeup: 'Học bù'
    };
    return statusMap[status] || status;
  };

  const getTypeText = (type) => {
    const typeMap = {
      regular: 'Học chính',
      makeup: 'Học bù'
    };
    return typeMap[type] || type;
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return <i className="fas fa-sort"></i>;
    }
    return sortDirection === 'asc' ? 
      <i className="fas fa-sort-up"></i> : 
      <i className="fas fa-sort-down"></i>;
  };

  return (
    <div className="schedule-list">
      {/* Bulk actions */}
      {selectedSchedules.length > 0 && (
        <div className="bulk-actions">
          <span>{selectedSchedules.length} lịch học đã chọn</span>
          <button className="btn btn-danger" onClick={handleBulkDelete}>
            <i className="fas fa-trash"></i> Xóa đã chọn
          </button>
        </div>
      )}

      {/* Table */}
      <div className="table-container">
        <table className="schedule-table">
          <thead>
            <tr>
              <th className="checkbox-col">
                <input
                  type="checkbox"
                  checked={selectedSchedules.length === schedules.length && schedules.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th onClick={() => handleSort('date')} className="sortable">
                Ngày học <SortIcon field="date" />
              </th>
              <th>Thời gian</th>
              <th onClick={() => handleSort('className')} className="sortable">
                Lớp học <SortIcon field="className" />
              </th>
              <th>Buổi học</th>
              <th onClick={() => handleSort('teacherName')} className="sortable">
                Giảng viên <SortIcon field="teacherName" />
              </th>
              <th onClick={() => handleSort('roomName')} className="sortable">
                Phòng học <SortIcon field="roomName" />
              </th>
              <th>Loại</th>
              <th onClick={() => handleSort('status')} className="sortable">
                Trạng thái <SortIcon field="status" />
              </th>
              <th className="actions-col">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {sortedSchedules.length > 0 ? (
              sortedSchedules.map(schedule => (
                <tr key={schedule.id} className={selectedSchedules.includes(schedule.id) ? 'selected' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedSchedules.includes(schedule.id)}
                      onChange={() => handleSelectSchedule(schedule.id)}
                    />
                  </td>
                  <td>
                    {new Date(schedule.date).toLocaleDateString('vi-VN', {
                      weekday: 'short',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </td>
                  <td>{schedule.startTime} - {schedule.endTime}</td>
                  <td>
                    <strong>{schedule.className}</strong>
                  </td>
                  <td>
                    <div className="lesson-info">
                      <span className="lesson-number">Buổi {schedule.lessonNumber}</span>
                      <span className="lesson-topic">{schedule.lessonTopic}</span>
                    </div>
                  </td>
                  <td>{schedule.teacherName}</td>
                  <td>{schedule.roomName}</td>
                  <td>
                    <span className={`type-badge type-${schedule.type}`}>
                      {getTypeText(schedule.type)}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${schedule.status}`}>
                      {getStatusText(schedule.status)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn edit"
                        onClick={() => onEditSchedule(schedule)}
                        title="Chỉnh sửa"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="action-btn makeup"
                        onClick={() => onCreateMakeup(schedule)}
                        title="Tạo lịch học bù"
                      >
                        <i className="fas fa-calendar-plus"></i>
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => onDeleteSchedule(schedule.id)}
                        title="Xóa"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="no-data">
                  <i className="fas fa-inbox"></i>
                  <p>Không có lịch học nào</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      {schedules.length > 0 && (
        <div className="schedule-summary">
          <div className="summary-item">
            <span className="summary-label">Tổng số lịch:</span>
            <span className="summary-value">{schedules.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Đã lên lịch:</span>
            <span className="summary-value">
              {schedules.filter(s => s.status === 'scheduled').length}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Đã hoàn thành:</span>
            <span className="summary-value">
              {schedules.filter(s => s.status === 'completed').length}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Học bù:</span>
            <span className="summary-value">
              {schedules.filter(s => s.type === 'makeup').length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleList;
