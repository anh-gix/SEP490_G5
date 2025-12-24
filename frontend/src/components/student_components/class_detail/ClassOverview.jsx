import React from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Class Overview Component for Student
 * Hiển thị thông tin tổng quan về lớp học
 */
const ClassOverview = ({ classInfo, students = [], lessons = [] }) => {

  // Export class info to Excel
  const exportClassInfoToExcel = () => {
    const workbook = XLSX.utils.book_new();

    // Helper function to auto-fit columns
    const autoFitColumns = (data) => {
      const colWidths = [];
      data.forEach(row => {
        row.forEach((cell, colIndex) => {
          const cellValue = String(cell || '');
          const currentWidth = colWidths[colIndex] || 0;
          // Minimum width 10, maximum width 50
          const cellWidth = Math.min(Math.max(cellValue.length * 1.2, 10), 50);
          colWidths[colIndex] = Math.max(currentWidth, cellWidth);
        });
      });
      return colWidths.map(width => ({ width }));
    };

    // Helper function to add borders to all cells in sheet
    const addSheetStyling = (sheet) => {
      if (!sheet['!merges']) sheet['!merges'] = [];
      if (!sheet['!cols']) sheet['!cols'] = [];

      // Get all cell references and add borders to each
      Object.keys(sheet).forEach(cellRef => {
        if (cellRef.startsWith('!')) return; // Skip metadata keys

        if (!sheet[cellRef].s) sheet[cellRef].s = {};
        sheet[cellRef].s.border = {
          top: { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } }
        };
      });
    };

    // Sheet 1: Thông tin tổng quát
    const generalInfoData = [
      ['THÔNG TIN TỔNG QUÁT'],
      [''],
      ['Tên lớp', classInfo.name || 'N/A'],
      ['Khóa học', classInfo.course?.name || 'N/A'],
      ['Số buổi học', classInfo.totalLessons || 0],
      ['Số học sinh', students.length || 0],
      ['Lịch học', classInfo.schedulePattern || 'N/A'],
      ['Ngày bắt đầu', classInfo.startDate ? new Date(classInfo.startDate).toLocaleDateString('vi-VN') : 'N/A'],
      ['Ngày kết thúc', classInfo.endDate ? new Date(classInfo.endDate).toLocaleDateString('vi-VN') : 'N/A'],
      ['Giáo viên', classInfo.teacher?.username || 'N/A']
    ];

    const generalInfoSheet = XLSX.utils.aoa_to_sheet(generalInfoData);
    generalInfoSheet['!cols'] = autoFitColumns(generalInfoData);
    addSheetStyling(generalInfoSheet);

    // Merge cells for title
    generalInfoSheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];
    XLSX.utils.book_append_sheet(workbook, generalInfoSheet, 'Thông tin tổng quát');

    // Sheet 2: Danh sách học viên
    const studentsData = [
      ['STT', 'Họ và tên', 'Email', 'SĐT']
    ];

    students.forEach((student, index) => {
      studentsData.push([
        index + 1,
        student.name || student.username || 'N/A',
        student.email || 'N/A',
        student.phone || 'N/A'
      ]);
    });

    const studentsSheet = XLSX.utils.aoa_to_sheet(studentsData);
    studentsSheet['!cols'] = autoFitColumns(studentsData);
    addSheetStyling(studentsSheet);
    XLSX.utils.book_append_sheet(workbook, studentsSheet, 'Danh sách học viên');

    // Sheet 3: Lịch trình
    const scheduleData = [
      ['Buổi', 'Thứ', 'Ngày học', 'Thời gian']
    ];

    lessons.forEach((lesson) => {
      const lessonDate = lesson.date ? new Date(lesson.date) : null;
      const dayOfWeek = lessonDate ? lessonDate.toLocaleDateString('vi-VN', { weekday: 'long' }) : 'N/A';

      scheduleData.push([
        lesson.lessonNumber || lesson._id,
        dayOfWeek,
        lessonDate ? lessonDate.toLocaleDateString('vi-VN') : 'N/A',
        lesson.time || 'N/A'
      ]);
    });

    const scheduleSheet = XLSX.utils.aoa_to_sheet(scheduleData);
    scheduleSheet['!cols'] = autoFitColumns(scheduleData);
    addSheetStyling(scheduleSheet);
    XLSX.utils.book_append_sheet(workbook, scheduleSheet, 'Lịch trình');

    // Generate file and download
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `ThongTinLopHoc_${classInfo.name || 'Unknown'}.xlsx`);
  };

  if (!classInfo) {
    return (
      <div className="text-center py-5">
        <p className="text-neutral-500">Đang tải thông tin lớp học...</p>
      </div>
    );
  }

  return (
    <Row className="g-3">
      <Col lg={8}>
        {/* Course Description */}
        <Card className="bg-white border-0 rounded-12 mb-24" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
          <Card.Header className="border-0 p-20" style={{ background: 'linear-gradient(135deg, #F0F7FF 0%, #E6F2FF 100%)' }}>
            <h5 className="text-neutral-900 fw-semibold mb-0">Giới thiệu khóa học</h5>
          </Card.Header>
          <Card.Body className="p-24">
            <p className="text-neutral-700 text-14 mb-20">
              {classInfo.course?.description || 'Chưa có mô tả khóa học'}
            </p>
          </Card.Body>
        </Card>

        {/* Schedule Info */}
        <Card className="bg-white border-0 rounded-12" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
          <Card.Header className="border-0 p-20" style={{ background: 'linear-gradient(135deg, #F0F7FF 0%, #E6F2FF 100%)' }}>
            <h5 className="text-neutral-900 fw-semibold mb-0">Thông tin lịch học</h5>
          </Card.Header>
          <Card.Body className="p-24">
            <Row className="g-3">
              <Col md={6}>
                <div className="d-flex align-items-start gap-12 mb-16">
                  <div className="bg-main-600 text-white rounded-circle d-flex align-items-center justify-content-center"
                       style={{ width: '40px', height: '40px', minWidth: '40px' }}>
                    <i className="fas fa-calendar-alt"></i>
                  </div>
                  <div>
                    <div className="text-neutral-500 text-13 mb-4">Lịch học</div>
                    <div className="text-neutral-900 fw-medium text-14">
                      {classInfo.schedulePattern || 'Đang cập nhật'}
                    </div>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="d-flex align-items-start gap-12 mb-16">
                  <div className="bg-info-500 text-white rounded-circle d-flex align-items-center justify-content-center"
                       style={{ width: '40px', height: '40px', minWidth: '40px' }}>
                    <i className="fas fa-door-open"></i>
                  </div>
                  <div>
                    <div className="text-neutral-500 text-13 mb-4">Phòng học</div>
                    <div className="text-neutral-900 fw-medium text-14">
                      {classInfo.room?.room_name || 'Chưa có phòng'}
                    </div>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="d-flex align-items-start gap-12">
                  <div className="bg-success-600 text-white rounded-circle d-flex align-items-center justify-content-center"
                       style={{ width: '40px', height: '40px', minWidth: '40px' }}>
                    <i className="fas fa-calendar-check"></i>
                  </div>
                  <div>
                    <div className="text-neutral-500 text-13 mb-4">Ngày bắt đầu</div>
                    <div className="text-neutral-900 fw-medium text-14">
                      {new Date(classInfo.startDate).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="d-flex align-items-start gap-12">
                  <div className="bg-warning-600 text-white rounded-circle d-flex align-items-center justify-content-center"
                       style={{ width: '40px', height: '40px', minWidth: '40px' }}>
                    <i className="fas fa-calendar-times"></i>
                  </div>
                  <div>
                    <div className="text-neutral-500 text-13 mb-4">Ngày kết thúc</div>
                    <div className="text-neutral-900 fw-medium text-14">
                      {new Date(classInfo.endDate).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Export Class Info Button */}
        <div className="mt-16">
          <Button
            onClick={exportClassInfoToExcel}
            className="btn-main text-14 fw-medium py-12 px-16 radius-8 d-flex align-items-center gap-8"
            style={{
              background: 'linear-gradient(135deg, var(--main-600) 0%, var(--main-700) 100%)',
              border: 'none',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
            }}
          >
            <i className="fas fa-file-export"></i>
            Xuất thông tin lớp học
          </Button>
        </div>
      </Col>

      <Col lg={4}>
        {/* Teacher Info */}
        <Card className="bg-white border-0 rounded-12 mb-24" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
          <Card.Header className="border-0 p-20" style={{ background: 'linear-gradient(135deg, #F0F7FF 0%, #E6F2FF 100%)' }}>
            <h5 className="text-neutral-900 fw-semibold mb-0">Giảng viên</h5>
          </Card.Header>
          <Card.Body className="p-20">
            <div className="text-center mb-16">
              <div className="bg-main-600 text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-12"
                   style={{ width: '80px', height: '80px' }}>
                <i className="fas fa-user fa-2x"></i>
              </div>
              <h6 className="text-neutral-900 fw-bold mb-4">
                {classInfo.teacher?.username || 'Chưa có giảng viên'}
              </h6>
            </div>
            <div className="d-flex flex-column gap-12">
              <div className="d-flex align-items-center gap-8">
                <i className="fas fa-envelope text-neutral-500"></i>
                <span className="text-neutral-700 text-13">
                  {classInfo.teacher?.email || 'N/A'}
                </span>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Quick Stats */}
        <Card className="bg-white border-0 rounded-12" style={{
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
        }}>
          <Card.Body className="p-20">
            <h6 className="text-neutral-900 fw-semibold mb-16">Thống kê nhanh</h6>
            <div className="d-flex flex-column gap-12">
              <div className="d-flex justify-content-between align-items-center pb-12 border-bottom border-neutral-200">
                <span className="text-neutral-700 text-14">Tổng số buổi</span>
                <span className="fw-bold text-16 text-neutral-900">{classInfo.totalLessons || 0}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center pb-12 border-bottom border-neutral-200">
                <span className="text-neutral-700 text-14">Đã học</span>
                <span className="fw-bold text-16 text-neutral-900">{classInfo.completedLessons || 0}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-neutral-700 text-14">Còn lại</span>
                <span className="fw-bold text-16 text-neutral-900">
                  {(classInfo.totalLessons || 0) - (classInfo.completedLessons || 0)}
                </span>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default ClassOverview;
