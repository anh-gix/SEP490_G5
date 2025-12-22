import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Button from '../../compo/Button';
import Badge from '../../compo/Badge';
import courseService from '../../../../services/courseService';

const CourseStep3CLOMapping = ({ courseData, setCourseData, program, onNext, onPrevious }) => {
  const [loading, setLoading] = useState(false);
  const [showCLOForm, setShowCLOForm] = useState(false);
  const [editingCLO, setEditingCLO] = useState(null);
  const [cloForm, setCLOForm] = useState({ code: '', name: '', detail: '', mappedPLOs: [] });
  const [clos, setCLOs] = useState([]);

  // Load CLOs whenever component mounts or courseData._id changes
  useEffect(() => {
    if (courseData._id) {
      fetchCourseCLOs();
    }
  }, [courseData._id]);

  // Also initialize from courseData.clos on mount
  useEffect(() => {
    if (courseData.clos && courseData.clos.length > 0) {
      setCLOs(courseData.clos);
    }
  }, []);

  const fetchCourseCLOs = async () => {
    try {
      const response = await courseService.getCourseById(courseData._id);
      const fetchedCLOs = response.data.clos || [];
      setCLOs(fetchedCLOs);

      // Also update parent courseData to keep it in sync
      setCourseData(prev => ({
        ...prev,
        clos: fetchedCLOs
      }));
    } catch (error) {
      console.error('Error loading CLOs:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCLOForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePLOCheckbox = (ploId) => {
    setCLOForm(prev => {
      // Check if ploId already exists in mappedPLOs (handle both string and object formats)
      const isAlreadyMapped = prev.mappedPLOs.some(id => {
        const existingId = typeof id === 'object' ? id._id : id;
        return existingId === ploId;
      });

      return {
        ...prev,
        mappedPLOs: isAlreadyMapped
          ? prev.mappedPLOs.filter(id => {
              const existingId = typeof id === 'object' ? id._id : id;
              return existingId !== ploId;
            })
          : [...prev.mappedPLOs, ploId]
      };
    });
  };

  // Helper function to check if a PLO is selected in the form
  const isPLOSelected = (ploId) => {
    return cloForm.mappedPLOs.some(id => {
      const existingId = typeof id === 'object' ? id._id : id;
      return existingId === ploId;
    });
  };

  const handleAddCLO = () => {
    setEditingCLO(null);
    setCLOForm({ code: '', name: '', detail: '', mappedPLOs: [] });
    setShowCLOForm(true);
  };

  const handleEditCLO = (clo) => {
    setEditingCLO(clo);
    // Extract PLO IDs from mappedPLOs (handle both object and string formats)
    const mappedPLOIds = (clo.mappedPLOs || []).map(ploId =>
      typeof ploId === 'object' ? ploId._id : ploId
    );
    setCLOForm({
      code: clo.code,
      name: clo.name,
      detail: clo.detail,
      mappedPLOs: mappedPLOIds
    });
    setShowCLOForm(true);
  };

  const handleSaveCLO = async () => {
    if (!cloForm.code || !cloForm.name || !cloForm.detail) {
      toast.error('Vui lòng điền đầy đủ thông tin CLO!');
      return;
    }

    if (!editingCLO) {
      const isDuplicate = clos.some(clo => clo.code === cloForm.code);
      if (isDuplicate) {
        toast.error(`Mã CLO "${cloForm.code}" đã tồn tại!`);
        return;
      }
    }

    try {
      setLoading(true);

      let updatedCLOs;
      if (editingCLO) {
        updatedCLOs = clos.map(c =>
          c._id === editingCLO._id
            ? { ...c, code: cloForm.code, name: cloForm.name, detail: cloForm.detail, mappedPLOs: cloForm.mappedPLOs }
            : c
        );
      } else {
        const newCLO = {
          ...cloForm,
          _id: `temp_${Date.now()}`
        };
        updatedCLOs = [...clos, newCLO];
      }

      const savedCLOs = updatedCLOs.map(c => ({
        code: c.code,
        name: c.name,
        detail: c.detail,
        mappedPLOs: (c.mappedPLOs || []).map(ploId =>
          typeof ploId === 'object' ? ploId._id : ploId
        )
      }));

      await courseService.updateCourse(courseData._id, {
        clos: savedCLOs
      });

      // Update both local and parent state
      await fetchCourseCLOs();

      setCLOForm({ code: '', name: '', detail: '', mappedPLOs: [] });
      setShowCLOForm(false);
      setEditingCLO(null);
      toast.success(editingCLO ? 'Cập nhật CLO thành công!' : 'Tạo CLO thành công!');
    } catch (error) {
      console.error('Error saving CLO:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi lưu CLO!');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCLO = async (cloId) => {
    if (!window.confirm('Bạn có chắc muốn xóa CLO này? Tất cả mapping sẽ bị xóa.')) return;

    try {
      const updatedCLOs = clos.filter(c => c._id !== cloId).map(c => ({
        code: c.code,
        name: c.name,
        detail: c.detail,
        mappedPLOs: (c.mappedPLOs || []).map(ploId =>
          typeof ploId === 'object' ? ploId._id : ploId
        )
      }));

      await courseService.updateCourse(courseData._id, {
        clos: updatedCLOs
      });

      await fetchCourseCLOs();
      toast.success('Xóa CLO thành công!');
    } catch (error) {
      console.error('Error deleting CLO:', error);
      toast.error('Lỗi khi xóa CLO!');
    }
  };

  const handleSaveAndNext = async () => {
    if (clos.length === 0) {
      toast.error('Vui lòng thêm ít nhất 1 CLO!');
      return;
    }

    const unmappedCLOs = clos.filter(c => !c.mappedPLOs || c.mappedPLOs.length === 0);
    if (unmappedCLOs.length > 0) {
      const confirm = window.confirm(
        `Có ${unmappedCLOs.length} CLO chưa được ánh xạ với PLO nào. Bạn có muốn tiếp tục?`
      );
      if (!confirm) {
        return;
      }
    }

    try {
      await courseService.updateCourse(courseData._id, {
        lastCompletedStep: 4
      });

      setCourseData(prev => ({
        ...prev,
        lastCompletedStep: 4
      }));

      onNext();
    } catch (error) {
      console.error('Error updating lastCompletedStep:', error);
      onNext();
    }
  };

  const getPLODetails = (ploId) => {
    if (!program?.plos) return null;
    const searchId = typeof ploId === 'object' ? ploId._id : ploId;
    return program.plos.find(p => {
      const pId = typeof p === 'object' ? (p._id || p.id) : p;
      return pId === searchId || pId === ploId || (typeof p === 'object' && p === ploId);
    });
  };

  // Protection: Course must be created first
  if (!courseData._id) {
    return (
      <div className="alert alert-warning">
        <i className="ph ph-warning me-2"></i>
        Vui lòng hoàn thành Bước 1 (Thông tin cơ bản) trước khi tạo CLO.
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-16">
        <h6 className="text-md fw-semibold mb-0">
          <i className="ph ph-list-bullets me-2"></i>
          Danh sách CLO ({clos.length})
        </h6>
        <Button variant="primary" size="sm" onClick={handleAddCLO} icon="ph ph-plus">
          Thêm CLO
        </Button>
      </div>

      {/* CLO List */}
      {clos.length === 0 ? (
        <div className="text-center py-32 bg-neutral-50 radius-8">
          <i className="ph ph-list-dashes text-neutral-400" style={{ fontSize: '48px' }}></i>
          <p className="text-neutral-600 mt-3 mb-0">Chưa có CLO nào. Hãy tạo CLO để bắt đầu.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-16 py-12">#</th>
                <th className="px-16 py-12">Mã CLO</th>
                <th className="px-16 py-12">Tên CLO</th>
                <th className="px-16 py-12">Chi tiết</th>
                <th className="px-16 py-12">PLO đã ánh xạ</th>
                <th className="px-16 py-12 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {clos.map((clo, index) => (
                <tr key={clo._id}>
                  <td className="px-16 py-12">{index + 1}</td>
                  <td className="px-16 py-12"><Badge variant="success">{clo.code}</Badge></td>
                  <td className="px-16 py-12 fw-semibold">{clo.name}</td>
                  <td className="px-16 py-12 text-sm" style={{ maxWidth: '300px' }}>
                    {clo.detail.length > 80 ? clo.detail.substring(0, 80) + '...' : clo.detail}
                  </td>
                  <td className="px-16 py-12">
                    {(clo.mappedPLOs || []).length > 0 ? (
                      (clo.mappedPLOs || []).map((ploId, idx) => {
                        const plo = getPLODetails(ploId);
                        const displayId = typeof ploId === 'object' ? ploId._id : ploId;
                        return plo ? (
                          <Badge key={displayId || idx} variant="primary" className="me-1">
                            {plo.code || displayId}
                          </Badge>
                        ) : (
                          <Badge key={displayId || idx} variant="secondary" className="me-1">
                            {displayId}
                          </Badge>
                        );
                      })
                    ) : (
                      <span className="text-muted">Chưa mapping</span>
                    )}
                  </td>
                  <td className="px-16 py-12 text-center">
                    <div className="d-flex gap-1 justify-content-center">
                      <Button variant="outline-primary" size="sm" onClick={() => handleEditCLO(clo)} icon="ph ph-pencil" />
                      <Button variant="outline-danger" size="sm" onClick={() => handleDeleteCLO(clo._id)} icon="ph ph-trash" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CLO Form Modal */}
      {showCLOForm && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary-50">
                <h5 className="modal-title">
                  <i className="ph ph-plus-circle me-2"></i>
                  {editingCLO ? 'Chỉnh sửa CLO' : 'Tạo CLO mới'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowCLOForm(false);
                    setCLOForm({ code: '', name: '', detail: '', mappedPLOs: [] });
                    setEditingCLO(null);
                  }}
                  disabled={loading}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row gy-3">
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">
                      Mã CLO <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={cloForm.code}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="VD: CLO1"
                      disabled={!!editingCLO}
                    />
                    {editingCLO && (
                      <small className="text-muted">Không thể thay đổi mã CLO</small>
                    )}
                  </div>
                  <div className="col-md-9">
                    <label className="form-label fw-semibold">
                      Tên CLO <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={cloForm.name}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="VD: Critical Thinking"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      Mô tả chi tiết <span className="text-danger">*</span>
                    </label>
                    <textarea
                      name="detail"
                      value={cloForm.detail}
                      onChange={handleInputChange}
                      className="form-control"
                      rows="4"
                      placeholder="Nhập mô tả chi tiết về CLO này..."
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold mb-3">
                      Ánh xạ với PLO <span className="text-danger">*</span>
                    </label>
                    {program?.plos && program.plos.length > 0 ? (
                      <div className="border rounded p-3 bg-light">
                        <div className="row g-3">
                          {program.plos.map(plo => {
                            const ploData = typeof plo === 'object' ? plo : getPLODetails(plo);
                            const ploId = ploData?._id || plo;
                            return (
                              <div key={ploId} className="col-md-6">
                                <div className="form-check">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id={`plo-${ploId}`}
                                    checked={isPLOSelected(ploId)}
                                    onChange={() => handlePLOCheckbox(ploId)}
                                  />
                                  <label className="form-check-label" htmlFor={`plo-${ploId}`}>
                                    <strong>{ploData?.code || plo}</strong>
                                    {ploData?.name && <div className="text-muted small">{ploData.name}</div>}
                                  </label>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="alert alert-warning mb-0">
                        <i className="ph ph-warning-circle me-2"></i>
                        Chương trình chưa có PLO nào
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCLOForm(false);
                    setCLOForm({ code: '', name: '', detail: '', mappedPLOs: [] });
                    setEditingCLO(null);
                  }}
                  disabled={loading}
                >
                  Hủy
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveCLO}
                  disabled={loading}
                  icon="ph ph-check"
                >
                  {loading ? 'Đang lưu...' : (editingCLO ? 'Cập nhật' : 'Tạo CLO')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="d-flex justify-content-between gap-3 mt-24 pt-24 border-top">
        <Button variant="outline" onClick={onPrevious} icon="ph ph-arrow-left">
          Quay lại
        </Button>
        <Button
          variant="primary"
          onClick={handleSaveAndNext}
          icon="ph ph-arrow-right"
          iconPosition="right"
        >
          Lưu & Tiếp tục
        </Button>
      </div>
    </div>
  );
};

export default CourseStep3CLOMapping;
