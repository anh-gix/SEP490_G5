import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../compo/Badge';
import Button from '../compo/Button';
import camSessionService from '../../../services/camSessionService';
import courseService from '../../../services/courseService';

<<<<<<< HEAD
const CamSession = ({ courseData }) => {
=======
const CamSession = ({ courseData, viewMode = 'center-head' }) => {
>>>>>>> origin/Namvv-teacher-class-management
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [camSessions, setCamSessions] = useState([]);

<<<<<<< HEAD
=======
  // Determine base path and permissions
  const basePath = viewMode === 'teacher' ? '/teacher' : '/center-head';
  const canEdit = viewMode === 'teacher'; // Only teacher can edit/delete

>>>>>>> origin/Namvv-teacher-class-management
  useEffect(() => {
    if (courseData?._id) {
      ensureCamSessions();
    }
  }, [courseData?._id, courseData?.sessions?.length, courseData?.numberOfSessions]);

  const ensureCamSessions = async () => {
    try {
      setLoading(true);
      const existingResponse = await camSessionService.getCamSessionsByCourseId(courseData._id);
      const existing = Array.isArray(existingResponse)
        ? existingResponse
        : existingResponse.data || [];

<<<<<<< HEAD
      const targetOrdersFromSessions =
        (courseData.sessions || [])
          .map((session) => session?.order)
          .filter((order) => typeof order === 'number' && order > 0);

      const fallbackCount = courseData.numberOfSessions || targetOrdersFromSessions.length || 0;
      const fallbackOrders = Array.from({ length: fallbackCount }, (_, idx) => idx + 1);
      const targetOrders = targetOrdersFromSessions.length ? targetOrdersFromSessions : fallbackOrders;

      const missingOrders = targetOrders.filter(
        (order) => !existing.some((camSession) => camSession.order === order)
      );

      const createdCamSessions = [];
      for (const order of missingOrders) {
        const payload = {
          course: courseData._id,
          title: `CAM Session ${order}`,
          order,
        };

        const created = await camSessionService.createCamSession(payload);
        createdCamSessions.push(created.data || created);
      }

      if (createdCamSessions.length) {
        await courseService.updateCourse(courseData._id, {
          camSessions: [...existing, ...createdCamSessions].map((camSession) => camSession._id),
        });
      }

      const nextSessions = [...existing, ...createdCamSessions].sort(
        (a, b) => (a.order || 0) - (b.order || 0)
      );
      setCamSessions(nextSessions);
    } catch (error) {
      console.error('Error ensuring cam sessions:', error);
      alert(error.response?.data?.message || 'Lỗi khi tự động tạo CAM Session');
=======
      // Only auto-create CAM sessions for teacher
      if (canEdit) {
        const targetOrdersFromSessions =
          (courseData.sessions || [])
            .map((session) => session?.order)
            .filter((order) => typeof order === 'number' && order > 0);

        const fallbackCount = courseData.numberOfSessions || targetOrdersFromSessions.length || 0;
        const fallbackOrders = Array.from({ length: fallbackCount }, (_, idx) => idx + 1);
        const targetOrders = targetOrdersFromSessions.length ? targetOrdersFromSessions : fallbackOrders;

        const missingOrders = targetOrders.filter(
          (order) => !existing.some((camSession) => camSession.order === order)
        );

        const createdCamSessions = [];
        for (const order of missingOrders) {
          const payload = {
            course: courseData._id,
            title: `CAM Session ${order}`,
            order,
          };

          const created = await camSessionService.createCamSession(payload);
          createdCamSessions.push(created.data || created);
        }

        if (createdCamSessions.length) {
          await courseService.updateCourse(courseData._id, {
            camSessions: [...existing, ...createdCamSessions].map((camSession) => camSession._id),
          });
        }

        const nextSessions = [...existing, ...createdCamSessions].sort(
          (a, b) => (a.order || 0) - (b.order || 0)
        );
        setCamSessions(nextSessions);
      } else {
        // Center head only views existing sessions
        setCamSessions(existing.sort((a, b) => (a.order || 0) - (b.order || 0)));
      }
    } catch (error) {
      console.error('Error ensuring cam sessions:', error);
      alert(error.response?.data?.message || 'Lỗi khi tải CAM Session');
>>>>>>> origin/Namvv-teacher-class-management
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (camSession) => {
    if (!camSession?._id) return;
    const params = new URLSearchParams();
    if (courseData?._id) {
      params.set('courseId', courseData._id);
    }

<<<<<<< HEAD
    const basePath = `/center-head/cam-sessions/${camSession._id}/edit`;
    navigate(params.toString() ? `${basePath}?${params.toString()}` : basePath);
=======
    const editPath = `${basePath}/cam-sessions/${camSession._id}/edit`;
    navigate(params.toString() ? `${editPath}?${params.toString()}` : editPath);
>>>>>>> origin/Namvv-teacher-class-management
  };

  const handleDelete = async (camSessionId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa CAM Session này?')) return;
    try {
      setLoading(true);
      await camSessionService.deleteCamSession(camSessionId);
      const remaining = camSessions.filter((cs) => cs._id !== camSessionId);
      setCamSessions(remaining);

      await courseService.updateCourse(courseData._id, {
        camSessions: remaining.map((cs) => cs._id),
      });

      alert('Xóa CAM Session thành công');
    } catch (error) {
      console.error('Error deleting cam session:', error);
      alert(error.response?.data?.message || 'Lỗi khi xóa CAM Session');
    } finally {
      setLoading(false);
    }
  };

  if (!courseData?._id) {
    return (
      <div className="alert alert-warning">
        <i className="ph ph-warning me-2"></i>
        Vui lòng chọn hoặc lưu học phần trước khi quản lý CAM Session.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-24">
        <div className="d-flex justify-content-between align-items-center mb-16">
          <h6 className="text-md fw-semibold mb-0">
            Danh sách CAM Session ({camSessions.length})
          </h6>
          {loading && <span className="text-neutral-500 text-sm">Đang đồng bộ...</span>}
        </div>

        {camSessions.length === 0 ? (
          <div className="text-center py-32 bg-neutral-50 radius-8">
            <i
              className="ph ph-calendar-blank text-neutral-400"
              style={{ fontSize: '48px' }}
            ></i>
            <p className="text-neutral-600 mt-3 mb-0">Chưa có CAM Session nào</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-16 py-12">STT</th>
                  <th className="px-16 py-12">Tiêu đề</th>
                  <th className="px-16 py-12">Loại</th>
                  <th className="px-16 py-12">Mô tả</th>
                  <th className="px-16 py-12">Video URL</th>
                  <th className="px-16 py-12 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {camSessions.map((camSession, index) => (
                  <tr key={camSession._id || index}>
                    <td className="px-16 py-12">
                      <Badge variant="secondary">{camSession.order || index + 1}</Badge>
                    </td>
                    <td className="px-16 py-12 fw-semibold">{camSession.title}</td>
                    <td className="px-16 py-12">{camSession.sessionType || '-'}</td>
                    <td className="px-16 py-12">{camSession.description || '-'}</td>
                    <td className="px-16 py-12">
                      {camSession.videoURL ? (
                        <a href={camSession.videoURL} target="_blank" rel="noreferrer">
                          Xem video
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-16 py-12 text-center">
                      <div className="d-flex gap-1 justify-content-center">
<<<<<<< HEAD
                        <Button
                          variant="warning"
                          size="sm"
                          icon="ph ph-pencil"
                          onClick={() => handleEditClick(camSession)}
                          disabled={loading}
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          icon="ph ph-trash"
                          onClick={() => handleDelete(camSession._id)}
                          disabled={loading}
                        />
=======
                        {canEdit ? (
                          <>
                            <Button
                              variant="warning"
                              size="sm"
                              icon="ph ph-pencil"
                              onClick={() => handleEditClick(camSession)}
                              disabled={loading}
                            />
                            <Button
                              variant="danger"
                              size="sm"
                              icon="ph ph-trash"
                              onClick={() => handleDelete(camSession._id)}
                              disabled={loading}
                            />
                          </>
                        ) : (
                          <Button
                            variant="info"
                            size="sm"
                            icon="ph ph-eye"
                            onClick={() => handleEditClick(camSession)}
                            disabled={loading}
                          />
                        )}
>>>>>>> origin/Namvv-teacher-class-management
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CamSession;

