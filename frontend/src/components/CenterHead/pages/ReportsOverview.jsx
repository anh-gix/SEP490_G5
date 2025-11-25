import { useEffect, useState } from 'react';
import Breadcrumb from '../compo/Breadcrumb';
import Card from '../compo/Card';
import Button from '../compo/Button';
import Tabs from '../compo/Tabs';
import {
  mockReportStudents,
  mockReportCourses,
  mockReportClasses,
  mockReportRooms,
  mockReportExams,
  mockReportEffectiveness,
  simulateApiDelay
} from '../../../helper/mockdataExtended';

const ReportsOverview = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      await simulateApiDelay(600);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/center-head/dashboard' },
    { label: 'Báo cáo & Thống kê', path: '/center-head/reports' },
  ];

  const tabs = [
    { key: 'students', label: 'Học viên' },
    { key: 'courses', label: 'Giáo trình' },
    { key: 'classes', label: 'Lớp học' },
    { key: 'rooms', label: 'Phòng học' },
    { key: 'exams', label: 'Thi cử' },
    { key: 'effectiveness', label: 'Hiệu quả đào tạo' },
  ];

  const renderStudentReport = () => (
    <div className="row g-4">
      <div className="col-md-6">
        <Card>
          <h6 className="text-neutral-900 fw-bold mb-16">Tổng quan học viên</h6>
          <div className="d-flex justify-content-between mb-12">
            <span className="text-neutral-600">Tổng số:</span>
            <span className="fw-bold text-neutral-900">{mockReportStudents.total}</span>
          </div>
          <div className="d-flex justify-content-between mb-12">
            <span className="text-neutral-600">Đang hoạt động:</span>
            <span className="fw-bold text-success-600">{mockReportStudents.active}</span>
          </div>
          <div className="d-flex justify-content-between mb-12">
            <span className="text-neutral-600">Tạm ngưng:</span>
            <span className="fw-bold text-warning-600">{mockReportStudents.inactive}</span>
          </div>
          <div className="d-flex justify-content-between">
            <span className="text-neutral-600">Tỷ lệ tăng trưởng:</span>
            <span className="fw-bold text-main-600">{mockReportStudents.growthRate}</span>
          </div>
        </Card>
      </div>

      <div className="col-md-6">
        <Card>
          <h6 className="text-neutral-900 fw-bold mb-16">Phân bố theo chương trình</h6>
          {mockReportStudents.byProgram.map(item => (
            <div key={item.program} className="mb-12">
              <div className="d-flex justify-content-between mb-4">
                <span className="text-neutral-700">{item.program}</span>
                <span className="fw-semibold text-neutral-900">{item.count}</span>
              </div>
              <div className="progress" style={{ height: '6px' }}>
                <div
                  className="progress-bar bg-main-600"
                  style={{ width: `${(item.count / mockReportStudents.total) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </Card>
      </div>

      <div className="col-md-12">
        <Card>
          <h6 className="text-neutral-900 fw-bold mb-16">Top học viên nghỉ nhiều</h6>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Học viên</th>
                  <th>Số buổi vắng</th>
                  <th>Tỷ lệ tham gia</th>
                </tr>
              </thead>
              <tbody>
                {mockReportStudents.topAbsentees.map((student, index) => (
                  <tr key={index}>
                    <td>{student.student}</td>
                    <td>{student.absences}</td>
                    <td>{student.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderCourseReport = () => (
    <div className="row g-4">
      <div className="col-md-4">
        <Card>
          <h6 className="text-neutral-600 mb-8">Tổng Programs</h6>
          <h4 className="text-neutral-900 fw-bold mb-0">{mockReportCourses.totalPrograms}</h4>
        </Card>
      </div>
      <div className="col-md-4">
        <Card>
          <h6 className="text-neutral-600 mb-8">Tổng Courses</h6>
          <h4 className="text-neutral-900 fw-bold mb-0">{mockReportCourses.totalCourses}</h4>
        </Card>
      </div>
      <div className="col-md-4">
        <Card>
          <h6 className="text-neutral-600 mb-8">Chờ duyệt</h6>
          <h4 className="text-warning-600 fw-bold mb-0">{mockReportCourses.pendingApproval}</h4>
        </Card>
      </div>
      <div className="col-md-12">
        <Card>
          <h6 className="text-neutral-900 fw-bold mb-16">Mẫu giáo trình được sử dụng nhiều nhất</h6>
          {mockReportCourses.topTemplates.map((template, index) => (
            <div key={index} className="d-flex justify-content-between mb-12">
              <span className="text-neutral-700">{template.name}</span>
              <span className="fw-semibold text-neutral-900">{template.uses} lần</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );

  const renderClassReport = () => (
    <div className="row g-4">
      <div className="col-md-4">
        <Card>
          <h6 className="text-neutral-600 mb-8">Lớp đang hoạt động</h6>
          <h4 className="text-neutral-900 fw-bold mb-0">{mockReportClasses.activeClasses}</h4>
        </Card>
      </div>
      <div className="col-md-4">
        <Card>
          <h6 className="text-neutral-600 mb-8">Tỷ lệ lấp đầy</h6>
          <h4 className="text-success-600 fw-bold mb-0">{mockReportClasses.fillRate}</h4>
        </Card>
      </div>
      <div className="col-md-4">
        <Card>
          <h6 className="text-neutral-600 mb-8">Lịch chờ duyệt</h6>
          <h4 className="text-warning-600 fw-bold mb-0">{mockReportClasses.pendingSchedules}</h4>
        </Card>
      </div>
    </div>
  );

  const renderRoomReport = () => (
    <div className="row g-4">
      <div className="col-md-6">
        <Card>
          <h6 className="text-neutral-600 mb-8">Tổng phòng</h6>
          <h4 className="text-neutral-900 fw-bold mb-0">{mockReportRooms.totalRooms}</h4>
        </Card>
      </div>
      <div className="col-md-6">
        <Card>
          <h6 className="text-neutral-600 mb-8">Tỷ lệ sử dụng</h6>
          <h4 className="text-main-600 fw-bold mb-0">{mockReportRooms.utilizationRate}</h4>
        </Card>
      </div>
      <div className="col-md-6">
        <Card>
          <h6 className="text-neutral-900 fw-bold mb-12">Phòng sử dụng nhiều nhất</h6>
          <p className="text-success-600 mb-0 h5">{mockReportRooms.mostUsed}</p>
        </Card>
      </div>
      <div className="col-md-6">
        <Card>
          <h6 className="text-neutral-900 fw-bold mb-12">Phòng sử dụng ít nhất</h6>
          <p className="text-warning-600 mb-0 h5">{mockReportRooms.leastUsed}</p>
        </Card>
      </div>
    </div>
  );

  const renderExamReport = () => (
    <div className="row g-4">
      <div className="col-md-4">
        <Card>
          <h6 className="text-neutral-600 mb-8">Tổng đề thi</h6>
          <h4 className="text-neutral-900 fw-bold mb-0">{mockReportExams.totalExams}</h4>
        </Card>
      </div>
      <div className="col-md-4">
        <Card>
          <h6 className="text-neutral-600 mb-8">Tổng bài làm</h6>
          <h4 className="text-neutral-900 fw-bold mb-0">{mockReportExams.totalSubmissions}</h4>
        </Card>
      </div>
      <div className="col-md-4">
        <Card>
          <h6 className="text-neutral-600 mb-8">Bài chờ chấm</h6>
          <h4 className="text-warning-600 fw-bold mb-0">{mockReportExams.pendingGrading}</h4>
        </Card>
      </div>
      <div className="col-md-12">
        <Card>
          <h6 className="text-neutral-900 fw-bold mb-16">Phân bố band score</h6>
          {mockReportExams.bandScoreDistribution.map((item, index) => (
            <div key={index} className="mb-12">
              <div className="d-flex justify-content-between mb-4">
                <span className="text-neutral-700">Band {item.band}</span>
                <span className="fw-semibold text-neutral-900">{item.count} bài</span>
              </div>
              <div className="progress" style={{ height: '6px' }}>
                <div
                  className="progress-bar bg-main-600"
                  style={{ width: `${(item.count / mockReportExams.totalSubmissions) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );

  const renderEffectivenessReport = () => (
    <div className="row g-4">
      <div className="col-md-4">
        <Card>
          <h6 className="text-neutral-600 mb-8">Đạt chuẩn PLO</h6>
          <h4 className="text-success-600 fw-bold mb-0">{mockReportEffectiveness.ploAchievement}</h4>
        </Card>
      </div>
      <div className="col-md-4">
        <Card>
          <h6 className="text-neutral-600 mb-8">Hoàn thành khóa học</h6>
          <h4 className="text-success-600 fw-bold mb-0">{mockReportEffectiveness.courseCompletion}</h4>
        </Card>
      </div>
      <div className="col-md-4">
        <Card>
          <h6 className="text-neutral-600 mb-8">Hài lòng học viên</h6>
          <h4 className="text-main-600 fw-bold mb-0">{mockReportEffectiveness.studentSatisfaction}</h4>
        </Card>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'students':
        return renderStudentReport();
      case 'courses':
        return renderCourseReport();
      case 'classes':
        return renderClassReport();
      case 'rooms':
        return renderRoomReport();
      case 'exams':
        return renderExamReport();
      case 'effectiveness':
        return renderEffectivenessReport();
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-main-600" role="status" />
      </div>
    );
  }

  return (
    <div className="reports-overview-container">
      <Breadcrumb items={breadcrumbItems} />

      <div className="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h4 className="mb-8 text-neutral-900 fw-bold">Báo cáo & Thống kê</h4>
          <p className="text-neutral-600 mb-0">
            Tổng hợp các báo cáo về hoạt động trung tâm
          </p>
        </div>
        <Button variant="outline" icon="ph ph-download-simple">
          Xuất báo cáo
        </Button>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mt-24">{renderTabContent()}</div>
    </div>
  );
};

export default ReportsOverview;
