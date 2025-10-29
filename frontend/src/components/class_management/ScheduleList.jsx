import React, { useState } from 'react';
import { Table, Badge, Button, ButtonGroup, Dropdown } from 'react-bootstrap';

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
    <div>
      {/* Bulk actions */}
      {selectedSchedules.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mb-16 p-16 bg-main-25 rounded-12 border border-main-100">
          <span className="text-neutral-900 fw-semibold">{selectedSchedules.length} lịch học đã chọn</span>
          <Button 
            className="btn-danger text-13 fw-medium px-16 py-8 radius-8"
            onClick={handleBulkDelete}
          >
            <i className="fas fa-trash me-2"></i> Xóa đã chọn
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-neutral-30 rounded-12 overflow-hidden">
        <Table className="mb-0" hover responsive>
          <thead style={{ backgroundColor: 'var(--main-25)' }}>
            <tr>
              <th style={{ width: '50px', padding: '16px' }}>
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={selectedSchedules.length === schedules.length && schedules.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th 
                onClick={() => handleSort('date')} 
                style={{ cursor: 'pointer', padding: '16px' }}
                className="text-neutral-900 fw-semibold"
              >
                Ngày học <SortIcon field="date" />
              </th>
              <th className="text-neutral-900 fw-semibold" style={{ padding: '16px' }}>Thời gian</th>
              <th 
                onClick={() => handleSort('className')} 
                style={{ cursor: 'pointer', padding: '16px' }}
                className="text-neutral-900 fw-semibold"
              >
                Lớp học <SortIcon field="className" />
              </th>
              <th className="text-neutral-900 fw-semibold" style={{ padding: '16px' }}>Buổi học</th>
              <th 
                onClick={() => handleSort('teacherName')} 
                style={{ cursor: 'pointer', padding: '16px' }}
                className="text-neutral-900 fw-semibold"
              >
                Giảng viên <SortIcon field="teacherName" />
              </th>
              <th 
                onClick={() => handleSort('roomName')} 
                style={{ cursor: 'pointer', padding: '16px' }}
                className="text-neutral-900 fw-semibold"
              >
                Phòng học <SortIcon field="roomName" />
              </th>
              <th className="text-neutral-900 fw-semibold" style={{ padding: '16px' }}>Loại</th>
              <th 
                onClick={() => handleSort('status')} 
                style={{ cursor: 'pointer', padding: '16px' }}
                className="text-neutral-900 fw-semibold"
              >
                Trạng thái <SortIcon field="status" />
              </th>
              <th style={{ width: '180px', padding: '16px' }} className="text-neutral-900 fw-semibold">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {sortedSchedules.length > 0 ? (
              sortedSchedules.map(schedule => (
                <tr key={schedule.id} className={selectedSchedules.includes(schedule.id) ? 'bg-main-25' : ''}>
                  <td style={{ padding: '16px' }}>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selectedSchedules.includes(schedule.id)}
                      onChange={() => handleSelectSchedule(schedule.id)}
                    />
                  </td>
                  <td className="text-neutral-700" style={{ padding: '16px' }}>
                    {new Date(schedule.date).toLocaleDateString('vi-VN', {
                      weekday: 'short',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="text-nowrap text-neutral-700" style={{ padding: '16px' }}>{schedule.startTime} - {schedule.endTime}</td>
                  <td style={{ padding: '16px' }}>
                    <strong className="text-neutral-900">{schedule.className}</strong>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div>
                      <Badge className="bg-neutral-600 text-white px-10 py-4 text-12">Buổi {schedule.lessonNumber}</Badge>
                      <div className="text-13 text-neutral-500 mt-8">{schedule.lessonTopic}</div>
                    </div>
                  </td>
                  <td className="text-neutral-700" style={{ padding: '16px' }}>{schedule.teacherName}</td>
                  <td className="text-neutral-700" style={{ padding: '16px' }}>{schedule.roomName}</td>
                  <td style={{ padding: '16px' }}>
                    <Badge className={schedule.type === 'makeup' ? 'bg-warning-600 text-white' : 'bg-info-500 text-white'}>
                      {getTypeText(schedule.type)}
                    </Badge>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <Badge 
                      className={
                        schedule.status === 'scheduled' ? 'bg-success-600 text-white px-12 py-6' :
                        schedule.status === 'completed' ? 'bg-main-600 text-white px-12 py-6' :
                        schedule.status === 'cancelled' ? 'bg-danger-600 text-white px-12 py-6' : 'bg-warning-600 text-white px-12 py-6'
                      }
                    >
                      {getStatusText(schedule.status)}
                    </Badge>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <ButtonGroup size="sm">
                      <Button
                        className="btn-outline-main text-13 px-10 py-6"
                        onClick={() => onEditSchedule(schedule)}
                        title="Sửa"
                      >
                        <i className="fas fa-edit"></i>
                      </Button>
                      <Button
                        className="btn-outline-warning text-13 px-10 py-6"
                        onClick={() => onCreateMakeup(schedule)}
                        title="Học bù"
                      >
                        <i className="fas fa-calendar-plus"></i>
                      </Button>
                      <Button
                        className="btn-outline-danger text-13 px-10 py-6"
                        onClick={() => onDeleteSchedule(schedule.id)}
                        title="Xóa"
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </ButtonGroup>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center py-40" style={{ padding: '40px' }}>
                  <i className="fas fa-inbox fa-3x text-neutral-400 mb-16 d-block"></i>
                  <p className="mb-0 text-neutral-500">Không có lịch học nào</p>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Summary */}
      {schedules.length > 0 && (
        <div className="d-flex justify-content-around p-20 bg-main-25 rounded-12 mt-24 border border-main-100">
          <div className="text-center">
            <div className="text-neutral-500 text-13 mb-8">Tổng số lịch</div>
            <div className="text-neutral-900 fw-bold text-20">{schedules.length}</div>
          </div>
          <div className="text-center">
            <div className="text-neutral-500 text-13 mb-8">Đã lên lịch</div>
            <div className="text-success-600 fw-bold text-20">
              {schedules.filter(s => s.status === 'scheduled').length}
            </div>
          </div>
          <div className="text-center">
            <div className="text-neutral-500 text-13 mb-8">Đã hoàn thành</div>
            <div className="text-main-600 fw-bold text-20">
              {schedules.filter(s => s.status === 'completed').length}
            </div>
          </div>
          <div className="text-center">
            <div className="text-neutral-500 text-13 mb-8">Học bù</div>
            <div className="text-warning-600 fw-bold text-20">
              {schedules.filter(s => s.type === 'makeup').length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleList;
