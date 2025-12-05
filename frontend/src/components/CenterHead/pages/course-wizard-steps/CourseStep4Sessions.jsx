import { useState, useEffect } from 'react';
import Button from '../../compo/Button';
import Badge from '../../compo/Badge';
import sessionService from '../../../../services/sessionService';
import courseService from '../../../../services/courseService';

const CourseStep4Sessions = ({ courseData, onPrevious, navigate }) => {
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [clos, setCLOs] = useState([]);
  const [editingSession, setEditingSession] = useState(null);
  const [showAutoGenerateModal, setShowAutoGenerateModal] = useState(false);
  const [showMocktestSelectionModal, setShowMocktestSelectionModal] = useState(false);
  const [mocktestSelections, setMocktestSelections] = useState({});
  const [generatedSessions, setGeneratedSessions] = useState([]);

  useEffect(() => {
    if (courseData._id) {
      fetchCourseSessions();
      fetchCourseCLOs();
    }
  }, [courseData._id]);

  // Check if should show auto-generate modal when entering step 4 for the first time
  useEffect(() => {
    if (courseData._id && sessions.length === 0 && courseData.numberOfSessions > 0 && courseData.lastCompletedStep >= 3) {
      // Only show modal if sessions array is empty and numberOfSessions is set
      // and user has completed step 3 (meaning they went through basic info step)
      setShowAutoGenerateModal(true);
    }
  }, [sessions.length, courseData.numberOfSessions, courseData.lastCompletedStep, courseData._id]);

  const fetchCourseSessions = async () => {
    try {
      const response = await courseService.getCourseById(courseData._id);
      setSessions(response.data.sessions || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const fetchCourseCLOs = async () => {
    try {
      const response = await courseService.getCourseById(courseData._id);
      setCLOs(response.data.clos || []);
    } catch (error) {
      console.error('Error loading CLOs:', error);
    }
  };

  const handleGenerateSessions = async () => {
    const maxSessions = courseData.numberOfSessions || 30;
    const numberOfSessions = parseInt(prompt(`Nhập số lượng buổi học (tối đa ${maxSessions} buổi):`, maxSessions));

    if (!numberOfSessions || numberOfSessions <= 0) {
      alert('Số lượng buổi học phải lớn hơn 0');
      return;
    }

    // Validate number of sessions does not exceed the defined limit
    if (numberOfSessions > maxSessions) {
      alert(`Số lượng buổi học không được vượt quá ${maxSessions} buổi (đã định trong thông tin cơ bản)`);
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
      alert(`Đã tạo ${numberOfSessions} buổi học thành công!`);
    } catch (error) {
      console.error('Error generating sessions:', error);
      const errorMsg = error.response?.data?.message || 'Lỗi khi tạo sessions!';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCLOCheckbox = (sessionId, cloId) => {
    setSessions(prev => prev.map(session => {
      if (session._id === sessionId) {
        const cloIds = session.clos.map(c => c._id || c);
        const newClos = cloIds.includes(cloId)
          ? cloIds.filter(id => id !== cloId)
          : [...cloIds, cloId];
        return { ...session, clos: newClos };
      }
      return session;
    }));
  };

  const handleSaveSession = async (session) => {
    try {
      await sessionService.updateSession(session._id, {
        title: session.title,
        content: session.content,
        clos: session.clos.map(c => c._id || c)
      });
      alert('Lưu session thành công!');
      setEditingSession(null);
    } catch (error) {
      console.error('Error saving session:', error);
      alert('Lỗi khi lưu session!');
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
      alert(errorMsg);
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
        .filter(([order, isSelected]) => isSelected)
        .map(([order]) => parseInt(order));

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
      alert(`Đã cập nhật buổi học thành công! ${mocktestOrders.length} buổi Mock Test được thiết lập.`);
    } catch (error) {
      console.error('Error updating mocktest sessions:', error);
      const errorMsg = error.response?.data?.message || 'Lỗi khi cập nhật buổi học!';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    try {
      setLoading(true);

      // Update course status to 'completed' and mark all steps as done
      await courseService.updateCourse(courseData._id, {
        status: 'completed',
        lastCompletedStep: 5
      });

      alert('Hoàn thành tạo học phần! Bạn có thể chỉnh sửa học phần này bằng form.');

      // Extract program ID from object or string
      const programId = typeof courseData.program === 'object'
        ? (courseData.program._id || courseData.program.id)
        : courseData.program;
      navigate(`/center-head/programs/${programId}`);
    } catch (error) {
      console.error('Error updating course status:', error);
      alert('Lỗi khi hoàn thành học phần!');
    } finally {
      setLoading(false);
    }
  };

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
          <Button variant="primary" size="sm" onClick={handleGenerateSessions} icon="ph ph-plus" disabled={loading}>
            Tạo tự động
          </Button>
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
                      {editingSession === session._id ? (
                        <div className="d-flex flex-wrap gap-2">
                          {clos.map(clo => (
                            <div key={clo._id} className="form-check form-check-inline">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id={`clo-${session._id}-${clo._id}`}
                                checked={(session.clos || []).some(c => (c._id || c) === clo._id)}
                                onChange={() => handleCLOCheckbox(session._id, clo._id)}
                              />
                              <label className="form-check-label" htmlFor={`clo-${session._id}-${clo._id}`}>
                                {clo.code}
                              </label>
                            </div>
                          ))}
                        </div>
                      ) : (
                        (session.clos || []).map(cloId => {
                          const clo = clos.find(c => c._id === (cloId._id || cloId));
                          return clo ? <Badge key={clo._id} variant="success" className="me-1">{clo.code}</Badge> : null;
                        })
                      )}
                    </td>
                    <td className="px-16 py-12 text-center">
                      {editingSession === session._id ? (
                        <div className="d-flex gap-1 justify-content-center">
                          <Button variant="primary" size="sm" onClick={() => handleSaveSession(session)} icon="ph ph-check" />
                          <Button variant="outline" size="sm" onClick={() => setEditingSession(null)} icon="ph ph-x" />
                        </div>
                      ) : (
                        <Button variant="warning" size="sm" onClick={() => setEditingSession(session._id)} icon="ph ph-pencil" />
                      )}
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
        <Button variant="primary" onClick={handleFinish} icon="ph ph-check-circle" iconPosition="right">
          Hoàn thành
        </Button>
      </div>
    </div>
  );
};

export default CourseStep4Sessions;