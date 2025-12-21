import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import Button from '../../compo/Button';
import Badge from '../../compo/Badge';
import sessionService from '../../../../services/sessionService';
import courseService from '../../../../services/courseService';

const CourseStep4Sessions = ({ courseData, onPrevious, navigate, basePath = '/center-head' }) => {
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [clos, setCLOs] = useState([]);
  const [showAutoGenerateModal, setShowAutoGenerateModal] = useState(false);
  const [showMocktestSelectionModal, setShowMocktestSelectionModal] = useState(false);
  const [mocktestSelections, setMocktestSelections] = useState({});
  const [generatedSessions, setGeneratedSessions] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSessionData, setEditingSessionData] = useState(null);
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);

  const fetchCourseSessions = useCallback(async () => {
    try {
      const response = await courseService.getCourseById(courseData._id);
      setSessions(response.data.sessions || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  }, [courseData._id]);

  const fetchCourseCLOs = useCallback(async () => {
    try {
      const response = await courseService.getCourseById(courseData._id);
      setCLOs(response.data.clos || []);
    } catch (error) {
      console.error('Error loading CLOs:', error);
    }
  }, [courseData._id]);

  useEffect(() => {
    if (courseData._id) {
      fetchCourseSessions();
      fetchCourseCLOs();
    }
  }, [courseData._id, fetchCourseSessions, fetchCourseCLOs]);

  // Check if should show auto-generate modal when entering step 4 for the first time
  useEffect(() => {
    if (courseData._id && sessions.length === 0 && courseData.numberOfSessions > 0 && courseData.lastCompletedStep >= 3) {
      // Only show modal if sessions array is empty and numberOfSessions is set
      // and user has completed step 3 (meaning they went through basic info step)
      setShowAutoGenerateModal(true);
    }
  }, [sessions.length, courseData.numberOfSessions, courseData.lastCompletedStep, courseData._id]);

  const handleGenerateSessions = async () => {
    const maxSessions = courseData.numberOfSessions || 30;
    const numberOfSessions = parseInt(prompt(`Nhập số lượng buổi học (tối đa ${maxSessions} buổi):`, maxSessions));

    if (!numberOfSessions || numberOfSessions <= 0) {
      toast.error('Số lượng buổi học phải lớn hơn 0');
      return;
    }

    // Validate number of sessions does not exceed the defined limit
    if (numberOfSessions > maxSessions) {
      toast.error(`Số lượng buổi học không được vượt quá ${maxSessions} buổi (đã định trong thông tin cơ bản)`);
      return;
    }

    const mocktestInput = prompt('Nhập các buổi Mock Test (cách nhau bởi dấu phẩy):', '5, 10, 15');
    const mocktestOrders = mocktestInput
      ? mocktestInput.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n))
      : [];

    try {
      setLoading(true);
      const newSessions = [];

      for (let i = 1; i <= numberOfSessions; i++) {
        const isMocktest = mocktestOrders.includes(i);
        const sessionData = {
          title: isMocktest ? `Mock Test ${i}` : `Buổi ${i}`,
          order: i,
          content: isMocktest ? 'Kiểm tra giữa kỳ' : '',
          learningType: isMocktest ? 'mocktest' : 'theory',
          clos: []
        };

        const response = await sessionService.createSession(sessionData);
        newSessions.push(response.data);
      }

      await courseService.updateCourse(courseData._id, {
        sessions: newSessions.map(s => s._id),
        mocktestSessionOrders: mocktestOrders
      });

      await fetchCourseSessions();
      toast.success(`Đã tạo ${numberOfSessions} buổi học thành công!`);
    } catch (error) {
      console.error('Error generating sessions:', error);
      const errorMsg = error.response?.data?.message || 'Lỗi khi tạo sessions!';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };


  const handleEditSession = (session) => {
    setEditingSessionData({
      ...session,
      clos: session.clos || []
    });
    setShowEditModal(true);
  };


  const handleSaveEditSession = async () => {
    try {
      setLoading(true);
      await sessionService.updateSession(editingSessionData._id, {
        title: editingSessionData.title,
        content: editingSessionData.content,
        learningType: editingSessionData.learningType,
        clos: editingSessionData.clos.map(c => c._id || c)
      });
      toast.success('Cập nhật session thành công!');
      setShowEditModal(false);
      setEditingSessionData(null);
      await fetchCourseSessions();
    } catch (error) {
      console.error('Error updating session:', error);
      toast.error('Lỗi khi cập nhật session!');
    } finally {
      setLoading(false);
    }
  };

  const handleEditModalChange = (field, value) => {
    setEditingSessionData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditCLOCheckbox = (cloId) => {
    setEditingSessionData(prev => {
      const cloIds = prev.clos.map(c => c._id || c);
      const newClos = cloIds.includes(cloId)
        ? cloIds.filter(id => id !== cloId)
        : [...cloIds, cloId];
      return { ...prev, clos: newClos };
    });
  };

  const handleClearSessionContent = async (session) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa nội dung của buổi học "${session.title}" không?`)) {
      return;
    }

    try {
      setLoading(true);
      await sessionService.updateSession(session._id, {
        content: ''
      });
      await fetchCourseSessions();
      toast.success('Đã xóa nội dung buổi học thành công!');
    } catch (error) {
      console.error('Error clearing session content:', error);
      toast.error('Lỗi khi xóa nội dung buổi học!');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoGenerateSessions = async () => {
    const numberOfSessions = courseData.numberOfSessions;

    try {
      setLoading(true);
      const newSessions = [];

      for (let i = 1; i <= numberOfSessions; i++) {
        const sessionData = {
          title: `Buổi ${i}`,
          order: i,
          content: '',
          learningType: 'theory',
          clos: []
        };

        const response = await sessionService.createSession(sessionData);
        newSessions.push(response.data);
      }

      await courseService.updateCourse(courseData._id, {
        sessions: newSessions.map(s => s._id),
        mocktestSessionOrders: []
      });

      setGeneratedSessions(newSessions);
      // Initialize mocktest selections (all false by default)
      const selections = {};
      newSessions.forEach(session => {
        selections[session.order] = false;
      });
      setMocktestSelections(selections);

      await fetchCourseSessions();
      setShowAutoGenerateModal(false);
      setShowMocktestSelectionModal(true);
    } catch (error) {
      console.error('Error auto generating sessions:', error);
      const errorMsg = error.response?.data?.message || 'Lỗi khi tạo sessions!';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleMocktestSelectionChange = (order, isSelected) => {
    setMocktestSelections(prev => ({
      ...prev,
      [order]: isSelected
    }));
  };

  const handleConfirmMocktestSelection = async () => {
    try {
      setLoading(true);

      // Get selected mocktest orders
      const mocktestOrders = Object.entries(mocktestSelections)
        .filter(([, isSelected]) => isSelected)
        .map(([orderStr]) => parseInt(orderStr));

      // Update sessions that are selected as mocktest
      const updatePromises = generatedSessions
        .filter(session => mocktestSelections[session.order])
        .map(session =>
          sessionService.updateSession(session._id, {
            title: `Mock Test ${session.order}`,
            content: 'Kiểm tra giữa kỳ',
            learningType: 'mocktest'
          })
        );

      // Update sessions that are not mocktest (ensure they have correct title)
      const nonMocktestPromises = generatedSessions
        .filter(session => !mocktestSelections[session.order])
        .map(session =>
          sessionService.updateSession(session._id, {
            title: `Buổi ${session.order}`,
            content: '',
            learningType: 'theory'
          })
        );

      await Promise.all([...updatePromises, ...nonMocktestPromises]);

      // Update course with mocktest orders
      await courseService.updateCourse(courseData._id, {
        mocktestSessionOrders: mocktestOrders
      });

      await fetchCourseSessions();
      setShowMocktestSelectionModal(false);
      setGeneratedSessions([]);
      setMocktestSelections({});
      toast.success(`Đã cập nhật buổi học thành công! ${mocktestOrders.length} buổi Mock Test được thiết lập.`);
    } catch (error) {
      console.error('Error updating mocktest sessions:', error);
      const errorMsg = error.response?.data?.message || 'Lỗi khi cập nhật buổi học!';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const checkSessionsCompleteness = () => {
    return sessions.every(session => {
      const hasContent = session.content && session.content.trim().length > 0;
      const hasCLOs = session.clos && session.clos.length > 0;
      return hasContent && hasCLOs;
    });
  };


  const handleFinish = async () => {
    const isComplete = checkSessionsCompleteness();

    if (!isComplete) {
      setShowIncompleteModal(true);
      return;
    }

    try {
      setLoading(true);

      // Update course status to 'completed' and mark all steps as done
      await courseService.updateCourse(courseData._id, {
        status: 'completed',
        lastCompletedStep: 5
      });

      toast.success('Hoàn thành tạo học phần! Bạn có thể chỉnh sửa học phần này bằng form.');

      // Extract program ID from object or string
      const programId = typeof courseData.program === 'object'
        ? (courseData.program._id || courseData.program.id)
        : courseData.program;
      navigate(`${basePath}/programs/${programId}`);
    } catch (error) {
      console.error('Error updating course status:', error);
      toast.error('Lỗi khi hoàn thành học phần!');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setLoading(true);
      // Just save current state without completing the course
      toast.success('Đã lưu tạm thời! Bạn có thể tiếp tục chỉnh sửa sau.');

      // Extract program ID from object or string
      const programId = typeof courseData.program === 'object'
        ? (courseData.program._id || courseData.program.id)
        : courseData.program;
      navigate(`${basePath}/programs/${programId}`);
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Lỗi khi lưu tạm thời!');
    } finally {
      setLoading(false);
    }
  };

  // Protection: Course must be created first
  if (!courseData._id) {
    return (
      <div className="alert alert-warning">
        <i className="ph ph-warning me-2"></i>
        Vui lòng hoàn thành Bước 1 (Thông tin cơ bản) trước khi tạo Sessions.
      </div>
    );
  }

  return (
    <div>
      {/* Auto Generate Sessions Modal */}
      {showAutoGenerateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Tự động tạo buổi học</h5>
              </div>
              <div className="modal-body">
                <p>Chúng tôi phát hiện bạn chưa tạo buổi học nào cho học phần này.</p>
                <p><strong>Học phần "{courseData.name}"</strong> có <strong>{courseData.numberOfSessions} buổi học</strong>.</p>
                <p>Bạn có muốn hệ thống tự động tạo <strong>{courseData.numberOfSessions} buổi học mẫu</strong> không?</p>
                <div className="alert alert-info">
                  <small>
                    <i className="ph ph-info me-1"></i>
                    Hệ thống sẽ tạo các buổi học với tên "Buổi 1", "Buổi 2", ... Sau đó bạn có thể chọn những buổi nào là Mock Test.
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <Button
                  variant="outline"
                  onClick={() => setShowAutoGenerateModal(false)}
                  disabled={loading}
                >
                  Không, tôi sẽ tạo thủ công
                </Button>
                <Button
                  variant="primary"
                  onClick={handleAutoGenerateSessions}
                  disabled={loading}
                  icon={loading ? 'ph ph-spinner-gap spinner' : 'ph ph-magic-wand'}
                >
                  {loading ? 'Đang tạo...' : 'Có, tạo tự động'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mocktest Selection Modal */}
      {showMocktestSelectionModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chọn buổi Mock Test</h5>
              </div>
              <div className="modal-body">
                <p>Đã tạo thành công <strong>{courseData.numberOfSessions} buổi học</strong>.</p>
                <p>Vui lòng chọn những buổi nào là Mock Test:</p>

                <div className="row g-3 mt-3">
                  {generatedSessions.map(session => (
                    <div key={session._id} className="col-md-3 col-sm-4">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`mocktest-${session.order}`}
                          checked={mocktestSelections[session.order] || false}
                          onChange={(e) => handleMocktestSelectionChange(session.order, e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor={`mocktest-${session.order}`}>
                          Buổi {session.order}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="alert alert-info mt-3">
                  <small>
                    <i className="ph ph-info me-1"></i>
                    Buổi được chọn sẽ có tên "Mock Test X" và loại "Mock Test". Bạn có thể chỉnh sửa chi tiết sau.
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowMocktestSelectionModal(false);
                    setGeneratedSessions([]);
                    setMocktestSelections({});
                  }}
                  disabled={loading}
                >
                  Bỏ qua, chỉnh sửa sau
                </Button>
                <Button
                  variant="primary"
                  onClick={handleConfirmMocktestSelection}
                  disabled={loading}
                  icon={loading ? 'ph ph-spinner-gap spinner' : 'ph ph-check'}
                >
                  {loading ? 'Đang lưu...' : 'Xác nhận'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Session Modal */}
      {showEditModal && editingSessionData && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chỉnh sửa buổi học</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Tiêu đề buổi học</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingSessionData.title || ''}
                      onChange={(e) => handleEditModalChange('title', e.target.value)}
                      placeholder="Nhập tiêu đề buổi học"
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Loại buổi học</label>
                    <select
                      className="form-select"
                      value={editingSessionData.learningType || 'theory'}
                      onChange={(e) => handleEditModalChange('learningType', e.target.value)}
                    >
                      <option value="theory">Theory (Lý thuyết)</option>
                      <option value="mocktest">Mock Test (Kiểm tra)</option>
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label">Nội dung buổi học</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={editingSessionData.content || ''}
                      onChange={(e) => handleEditModalChange('content', e.target.value)}
                      placeholder="Nhập nội dung buổi học"
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Ánh xạ CLO (Course Learning Outcomes)</label>
                    <div className="border rounded p-3 bg-light">
                      <p className="mb-3 text-muted small">
                        Chọn các CLO mà buổi học này sẽ đạt được:
                      </p>
                      <div className="row g-2">
                        {clos.map(clo => (
                          <div key={clo._id} className="col-md-6 col-lg-4">
                            <div className="form-check">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id={`edit-clo-${clo._id}`}
                                checked={(editingSessionData.clos || []).some(c => (c._id || c) === clo._id)}
                                onChange={() => handleEditCLOCheckbox(clo._id)}
                              />
                              <label className="form-check-label" htmlFor={`edit-clo-${clo._id}`}>
                                <div className="d-flex flex-column">
                                  <strong className="text-primary">{clo.code}</strong>
                                  <span className="text-muted small mt-1" style={{ fontSize: '0.75rem', lineHeight: '1.2' }}>
                                    {clo.name || clo.description || 'Không có mô tả'}
                                  </span>
                                </div>
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                      {clos.length === 0 && (
                        <div className="text-center text-muted py-3">
                          <i className="ph ph-info me-2"></i>
                          Chưa có CLO nào được tạo cho học phần này
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  disabled={loading}
                >
                  Hủy
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveEditSession}
                  disabled={loading}
                  icon={loading ? 'ph ph-spinner-gap spinner' : 'ph ph-check'}
                >
                  {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Incomplete Sessions Modal */}
      {showIncompleteModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Không thể hoàn thành</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowIncompleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="text-center mb-3">
                  <i className="ph ph-warning-circle text-warning" style={{ fontSize: '48px' }}></i>
                </div>
                <div className="alert alert-warning text-center">
                  <h5 className="mb-2">Chưa thể hoàn thành học phần</h5>
                  <p className="mb-0">
                    <strong>Đã hoàn thiện: {sessions.filter(session => {
                      const hasContent = session.content && session.content.trim().length > 0;
                      const hasCLOs = session.clos && session.clos.length > 0;
                      return hasContent && hasCLOs;
                    }).length} / {sessions.length} buổi học</strong>
                  </p>
                </div>
                <div className="alert alert-info">
                  <i className="ph ph-info me-2"></i>
                  Để hoàn thành học phần, tất cả buổi học cần có nội dung và được mapping với ít nhất một CLO.
                  Bạn có thể <strong>lưu tạm</strong> và tiếp tục chỉnh sửa sau.
                </div>
              </div>
              <div className="modal-footer">
                <Button
                  variant="outline"
                  onClick={() => setShowIncompleteModal(false)}
                >
                  Tiếp tục chỉnh sửa
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowIncompleteModal(false);
                    handleSaveDraft();
                  }}
                  disabled={loading}
                  icon="ph ph-floppy-disk"
                >
                  {loading ? 'Đang lưu...' : 'Lưu tạm'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Alert */}
      <div className={`alert ${sessions.length > courseData.numberOfSessions ? 'alert-danger' : 'alert-info'} mb-24`}>
        <div className="d-flex align-items-start">
          <i className={`ph ${sessions.length > courseData.numberOfSessions ? 'ph-warning-circle' : 'ph-info'} me-2`} style={{ fontSize: '20px' }}></i>
          <div>
            <strong>Số lượng buổi học:</strong> {sessions.length} / {courseData.numberOfSessions || 0} buổi
            {sessions.length > courseData.numberOfSessions && (
              <div className="mt-2 text-danger">
                <i className="ph ph-warning me-1"></i>
                Cảnh báo: Số lượng buổi học đã vượt quá giới hạn đã định!
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-24">
        <div className="d-flex justify-content-between align-items-center mb-16">
          <h6 className="text-md fw-semibold mb-0">Danh sách buổi học ({sessions.length})</h6>
          {sessions.length < (courseData.numberOfSessions || 0) && (
            <Button variant="primary" size="sm" onClick={handleGenerateSessions} icon="ph ph-plus" disabled={loading}>
              Tạo tự động
            </Button>
          )}
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-32 bg-neutral-50 radius-8">
            <i className="ph ph-calendar-blank text-neutral-400" style={{ fontSize: '48px' }}></i>
            <p className="text-neutral-600 mt-3 mb-0">Chưa có buổi học nào</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-16 py-12">Buổi</th>
                  <th className="px-16 py-12">Tiêu đề</th>
                  <th className="px-16 py-12">Loại</th>
                  <th className="px-16 py-12">Nội dung</th>
                  <th className="px-16 py-12">CLO ánh xạ</th>
                  <th className="px-16 py-12 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session, index) => (
                  <tr key={session._id}>
                    <td className="px-16 py-12"><Badge variant="secondary">{session.order || index + 1}</Badge></td>
                    <td className="px-16 py-12 fw-semibold">{session.title}</td>
                    <td className="px-16 py-12">
                      <Badge variant={session.learningType === 'mocktest' ? 'danger' : 'primary'}>
                        {session.learningType === 'mocktest' ? 'Mock Test' : 'Theory'}
                      </Badge>
                    </td>
                    <td className="px-16 py-12">
                      <div className="text-truncate" style={{ maxWidth: '200px' }} title={session.content || 'Chưa có nội dung'}>
                        {session.content || <span className="text-muted">Chưa có nội dung</span>}
                      </div>
                    </td>
                    <td className="px-16 py-12">
                      {(session.clos || []).map(cloId => {
                        const clo = clos.find(c => c._id === (cloId._id || cloId));
                        return clo ? <Badge key={clo._id} variant="success" className="me-1">{clo.code}</Badge> : null;
                      })}
                    </td>
                    <td className="px-16 py-12 text-center">
                      <div className="d-flex gap-1 justify-content-center">
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => handleEditSession(session)}
                          icon="ph ph-pencil"
                          className="px-1 py-0"
                          style={{ fontSize: '0.7rem', minWidth: 'auto' }}
                          title="Chỉnh sửa buổi học"
                        >
                          <span className="d-none d-lg-inline ms-1">Sửa</span>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleClearSessionContent(session)}
                          icon="ph ph-eraser"
                          className="px-1 py-0"
                          style={{ fontSize: '0.7rem', minWidth: 'auto' }}
                          disabled={loading}
                          title="Xóa nội dung"
                        >
                          <span className="d-none d-lg-inline ms-1">Xóa</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="d-flex justify-content-between gap-3">
        <Button variant="outline" onClick={onPrevious} icon="ph ph-arrow-left">Quay lại</Button>
        <div className="d-flex gap-2">
          <Button
            variant="outline-secondary"
            onClick={handleSaveDraft}
            disabled={loading}
            icon="ph ph-floppy-disk"
          >
            Lưu tạm
          </Button>
          <Button
            variant="primary"
            onClick={handleFinish}
            disabled={loading}
            icon="ph ph-check-circle"
            iconPosition="right"
          >
            Hoàn thành
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CourseStep4Sessions;