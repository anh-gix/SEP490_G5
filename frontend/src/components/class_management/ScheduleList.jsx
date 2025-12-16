import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, ButtonGroup, Pagination } from 'react-bootstrap';

const ScheduleList = ({ 
  schedules
  // Bỏ onCreateMakeup prop
}) => {
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);

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
    setCurrentPage(1); // Reset to first page when sorting changes
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

  // Pagination logic
  const itemsPerPage = 10;
  const totalPages = Math.ceil(sortedSchedules.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSchedules = sortedSchedules.slice(startIndex, endIndex);

  // Reset to page 1 when schedules change
  useEffect(() => {
    setCurrentPage(1);
  }, [schedules.length]);

  return (
    <div>

      {/* Table */}
      <div className="bg-white border border-neutral-30 rounded-12 overflow-hidden">
        <Table className="mb-0" hover responsive>
          <thead style={{ backgroundColor: 'var(--main-25)' }}>
            <tr>
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
            </tr>
          </thead>
          <tbody>
            {paginatedSchedules.length > 0 ? (
              paginatedSchedules.map(schedule => (
                <tr key={schedule.id}>
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
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-40" style={{ padding: '40px' }}>
                  {/* Đổi colSpan từ 8 thành 7 vì đã bỏ 1 cột */}
                  <i className="fas fa-inbox fa-3x text-neutral-400 mb-16 d-block"></i>
                  <p className="mb-0 text-neutral-500">Không có lịch học nào</p>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Pagination */}
      {sortedSchedules.length > itemsPerPage && (
        <div className="d-flex justify-content-center mt-3">
          <Pagination>
            <Pagination.First 
              onClick={() => setCurrentPage(1)} 
              disabled={currentPage === 1}
            />
            <Pagination.Prev 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
              disabled={currentPage === 1}
            />
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              // Show first page, last page, current page, and pages around current
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <Pagination.Item
                    key={page}
                    active={page === currentPage}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Pagination.Item>
                );
              } else if (
                page === currentPage - 2 ||
                page === currentPage + 2
              ) {
                return <Pagination.Ellipsis key={page} />;
              }
              return null;
            })}
            <Pagination.Next 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
              disabled={currentPage === totalPages}
            />
            <Pagination.Last 
              onClick={() => setCurrentPage(totalPages)} 
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      )}

    </div>
  );
};

export default ScheduleList;
