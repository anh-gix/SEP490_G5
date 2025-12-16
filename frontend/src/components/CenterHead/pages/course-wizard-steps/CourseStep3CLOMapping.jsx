import { useState, useEffect } from 'react';
import Button from '../../compo/Button';
import Badge from '../../compo/Badge';
import courseService from '../../../../services/courseService';

const CourseStep3CLOMapping = ({ courseData, setCourseData, program, onNext, onPrevious }) => {
  const [loading, setLoading] = useState(false);
<<<<<<< HEAD
  const [showCLOForm, setShowCLOForm] = useState(false);
  const [cloForm, setCLOForm] = useState({ code: '', name: '', detail: '', mappedPLOs: [] });
  const [clos, setCLOs] = useState([]);

=======
  const [activeTab, setActiveTab] = useState('manage'); // 'manage' or 'mapping'
  const [showCLOForm, setShowCLOForm] = useState(false);
  const [editingCLO, setEditingCLO] = useState(null);
  const [cloForm, setCLOForm] = useState({ code: '', name: '', detail: '', mappedPLOs: [] });
  const [clos, setCLOs] = useState([]);

  // Load CLOs whenever component mounts or courseData._id changes
>>>>>>> origin/Namvv-teacher-class-management
  useEffect(() => {
    if (courseData._id) {
      fetchCourseCLOs();
    }
<<<<<<< HEAD
  }, [courseData._id]);
=======
  }, [courseData._id]); // This will trigger on mount and when courseData._id changes

  // Also initialize from courseData.clos on mount
  useEffect(() => {
    if (courseData.clos && courseData.clos.length > 0) {
      setCLOs(courseData.clos);
    }
  }, []);
>>>>>>> origin/Namvv-teacher-class-management

  const fetchCourseCLOs = async () => {
    try {
      const response = await courseService.getCourseById(courseData._id);
<<<<<<< HEAD
      setCLOs(response.data.clos || []);
=======
      const fetchedCLOs = response.data.clos || [];
      setCLOs(fetchedCLOs);

      // Also update parent courseData to keep it in sync
      setCourseData(prev => ({
        ...prev,
        clos: fetchedCLOs
      }));
>>>>>>> origin/Namvv-teacher-class-management
    } catch (error) {
      console.error('Error loading CLOs:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCLOForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePLOCheckbox = (ploId) => {
    setCLOForm(prev => ({
      ...prev,
      mappedPLOs: prev.mappedPLOs.includes(ploId)
        ? prev.mappedPLOs.filter(id => id !== ploId)
        : [...prev.mappedPLOs, ploId]
    }));
  };

<<<<<<< HEAD
  const handleSaveCLO = async () => {
    if (!cloForm.code || !cloForm.name || !cloForm.detail) {
      alert('Vui lòng điền đầy đủ thông tin CLO!');
      return;
    }

    // Check for duplicate CLO code
    const isDuplicate = clos.some(clo => clo.code === cloForm.code);
    if (isDuplicate) {
      alert(`Mã CLO "${cloForm.code}" đã tồn tại trong giáo trình này!`);
      return;
    }

    // Add CLO with temporary ID to local state
    const cloWithId = {
      ...cloForm,
      _id: `temp_${Date.now()}`
    };

    try {
      setLoading(true);

      // Update course with embedded CLOs (send full objects)
      const updatedCLOs = [...clos, cloWithId].map(c => ({
=======
  // Toggle mapping trong ma trận
  const handleToggleMapping = async (cloId, ploId) => {
    try {
      const updatedCLOs = clos.map(c => {
        if (c._id === cloId) {
          const mappedPLOs = c.mappedPLOs || [];
          const isCurrentlyMapped = mappedPLOs.some(id => {
            const compareId = typeof id === 'object' ? id._id : id;
            const targetId = typeof ploId === 'object' ? ploId._id : ploId;
            return compareId === targetId;
          });

          return {
            ...c,
            mappedPLOs: isCurrentlyMapped
              ? mappedPLOs.filter(id => {
                  const compareId = typeof id === 'object' ? id._id : id;
                  const targetId = typeof ploId === 'object' ? ploId._id : ploId;
                  return compareId !== targetId;
                })
              : [...mappedPLOs, ploId]
          };
        }
        return c;
      });

      const savedCLOs = updatedCLOs.map(c => ({
>>>>>>> origin/Namvv-teacher-class-management
        code: c.code,
        name: c.name,
        detail: c.detail,
        mappedPLOs: c.mappedPLOs || []
      }));

      await courseService.updateCourse(courseData._id, {
<<<<<<< HEAD
        clos: updatedCLOs
      });

      await fetchCourseCLOs();
      setCLOForm({ code: '', name: '', detail: '', mappedPLOs: [] });
      setShowCLOForm(false);
      alert('Tạo CLO thành công!');
    } catch (error) {
      console.error('Error creating CLO:', error);
      alert(error.response?.data?.message || 'Lỗi khi tạo CLO!');
=======
        clos: savedCLOs
      });

      // Update both local and parent state
      setCLOs(updatedCLOs);
      setCourseData(prev => ({
        ...prev,
        clos: updatedCLOs
      }));
    } catch (error) {
      console.error('Error updating mapping:', error);
      alert('Lỗi khi cập nhật mapping!');
    }
  };

  const isMapped = (clo, ploId) => {
    const mappedPLOs = clo.mappedPLOs || [];
    return mappedPLOs.some(id => {
      const compareId = typeof id === 'object' ? id._id : id;
      const targetId = typeof ploId === 'object' ? ploId._id : ploId;
      return compareId === targetId;
    });
  };

  const handleAddCLO = () => {
    setEditingCLO(null);
    setCLOForm({ code: '', name: '', detail: '', mappedPLOs: [] });
    setShowCLOForm(true);
  };

  const handleEditCLO = (clo) => {
    setEditingCLO(clo);
    setCLOForm({
      code: clo.code,
      name: clo.name,
      detail: clo.detail,
      mappedPLOs: clo.mappedPLOs || []
    });
    setShowCLOForm(true);
  };

  const handleSaveCLO = async () => {
    if (!cloForm.code || !cloForm.name || !cloForm.detail) {
      alert('Vui lòng điền đầy đủ thông tin CLO!');
      return;
    }

    if (!editingCLO) {
      const isDuplicate = clos.some(clo => clo.code === cloForm.code);
      if (isDuplicate) {
        alert(`Mã CLO "${cloForm.code}" đã tồn tại!`);
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
        mappedPLOs: c.mappedPLOs || []
      }));

      await courseService.updateCourse(courseData._id, {
        clos: savedCLOs
      });

      // Update both local and parent state
      await fetchCourseCLOs();

      setCLOForm({ code: '', name: '', detail: '', mappedPLOs: [] });
      setShowCLOForm(false);
      setEditingCLO(null);
      alert(editingCLO ? 'Cập nhật CLO thành công!' : 'Tạo CLO thành công!');
    } catch (error) {
      console.error('Error saving CLO:', error);
      alert(error.response?.data?.message || 'Lỗi khi lưu CLO!');
>>>>>>> origin/Namvv-teacher-class-management
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCLO = async (cloId) => {
<<<<<<< HEAD
    if (!window.confirm('Bạn có chắc muốn xóa CLO này?')) return;
=======
    if (!window.confirm('Bạn có chắc muốn xóa CLO này? Tất cả mapping sẽ bị xóa.')) return;
>>>>>>> origin/Namvv-teacher-class-management

    try {
      const updatedCLOs = clos.filter(c => c._id !== cloId).map(c => ({
        code: c.code,
        name: c.name,
        detail: c.detail,
        mappedPLOs: c.mappedPLOs || []
      }));

      await courseService.updateCourse(courseData._id, {
        clos: updatedCLOs
      });

      await fetchCourseCLOs();
      alert('Xóa CLO thành công!');
    } catch (error) {
      console.error('Error deleting CLO:', error);
      alert('Lỗi khi xóa CLO!');
    }
  };

  const handleSaveAndNext = async () => {
    if (clos.length === 0) {
      alert('Vui lòng thêm ít nhất 1 CLO!');
<<<<<<< HEAD
      return;
    }

    try {
      // Update lastCompletedStep to mark step 4 as completed
=======
      setActiveTab('manage');
      return;
    }

    const unmappedCLOs = clos.filter(c => !c.mappedPLOs || c.mappedPLOs.length === 0);
    if (unmappedCLOs.length > 0) {
      const confirm = window.confirm(
        `Có ${unmappedCLOs.length} CLO chưa được ánh xạ với PLO nào. Bạn có muốn tiếp tục?`
      );
      if (!confirm) {
        setActiveTab('mapping');
        return;
      }
    }

    try {
>>>>>>> origin/Namvv-teacher-class-management
      await courseService.updateCourse(courseData._id, {
        lastCompletedStep: 4
      });

<<<<<<< HEAD
      // Update local state
=======
>>>>>>> origin/Namvv-teacher-class-management
      setCourseData(prev => ({
        ...prev,
        lastCompletedStep: 4
      }));

      onNext();
    } catch (error) {
      console.error('Error updating lastCompletedStep:', error);
<<<<<<< HEAD
      // Continue to next step even if update fails
=======
>>>>>>> origin/Namvv-teacher-class-management
      onNext();
    }
  };

  const getPLODetails = (ploId) => {
    if (!program?.plos) return null;
<<<<<<< HEAD
    return program.plos.find(p => (p._id || p) === ploId);
  };

  return (
    <div>
      <div className="mb-24">
        <div className="d-flex justify-content-between align-items-center mb-16">
          <h6 className="text-md fw-semibold mb-0">Danh sách CLO ({clos.length})</h6>
          <Button variant="primary" size="sm" onClick={() => setShowCLOForm(true)} icon="ph ph-plus">
            Thêm CLO
          </Button>
        </div>

        {clos.length === 0 ? (
          <div className="text-center py-32 bg-neutral-50 radius-8">
            <i className="ph ph-list-dashes text-neutral-400" style={{ fontSize: '48px' }}></i>
            <p className="text-neutral-600 mt-3 mb-0">Chưa có CLO nào</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-16 py-12">#</th>
                  <th className="px-16 py-12">Mã CLO</th>
                  <th className="px-16 py-12">Tên CLO</th>
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
                    <td className="px-16 py-12">
                      {(clo.mappedPLOs || []).map(ploId => {
                        const plo = getPLODetails(ploId);
                        return plo ? <Badge key={ploId} variant="primary" className="me-1">{plo.code || ploId}</Badge> : null;
                      })}
                    </td>
                    <td className="px-16 py-12 text-center">
                      <Button variant="danger" size="sm" onClick={() => handleDeleteCLO(clo._id)} icon="ph ph-trash" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCLOForm && (
        <div className="border border-success-300 radius-8 p-24 mb-24 bg-success-50">
          <h6 className="text-md fw-semibold mb-16">Thông tin CLO</h6>
          <div className="row gy-3">
            <div className="col-md-4">
              <label className="form-label fw-semibold">Mã CLO *</label>
              <input type="text" name="code" value={cloForm.code} onChange={handleInputChange} className="form-control radius-8" placeholder="CLO1" />
            </div>
            <div className="col-md-8">
              <label className="form-label fw-semibold">Tên CLO *</label>
              <input type="text" name="name" value={cloForm.name} onChange={handleInputChange} className="form-control radius-8" />
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold">Chi tiết *</label>
              <textarea name="detail" value={cloForm.detail} onChange={handleInputChange} className="form-control radius-8" rows="3" />
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold">Ánh xạ với PLO</label>
              <div className="d-flex flex-wrap gap-2">
                {program?.plos?.map(plo => {
                  const ploData = typeof plo === 'object' ? plo : getPLODetails(plo);
                  return (
                    <div key={ploData?._id || plo} className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id={`plo-${ploData?._id || plo}`}
                        checked={cloForm.mappedPLOs.includes(ploData?._id || plo)}
                        onChange={() => handlePLOCheckbox(ploData?._id || plo)}
                      />
                      <label className="form-check-label" htmlFor={`plo-${ploData?._id || plo}`}>
                        {ploData?.code || plo}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="col-12">
              <div className="d-flex justify-content-end gap-2">
                <Button variant="outline" onClick={() => setShowCLOForm(false)}>Hủy</Button>
                <Button variant="primary" onClick={handleSaveCLO} disabled={loading}>
                  {loading ? 'Đang lưu...' : 'Lưu CLO'}
=======
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
      {/* Tabs Navigation */}
      <ul className="nav nav-tabs mb-24">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            <i className="ph ph-list-bullets me-2"></i>
            Quản lý CLO
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'mapping' ? 'active' : ''}`}
            onClick={() => setActiveTab('mapping')}
            disabled={clos.length === 0}
          >
            <i className="ph ph-grid-four me-2"></i>
            Ma trận Mapping
            {clos.length === 0 && <small className="ms-2 text-muted">(Tạo CLO trước)</small>}
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      {activeTab === 'manage' ? (
        /* ========== TAB 1: QUẢN LÝ CLO ========== */
        <div>
          <div className="d-flex justify-content-between align-items-center mb-16">
            <h6 className="text-md fw-semibold mb-0">Danh sách CLO ({clos.length})</h6>
            <Button variant="primary" size="sm" onClick={handleAddCLO} icon="ph ph-plus">
              Thêm CLO
            </Button>
          </div>

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
        </div>
      ) : (
        /* ========== TAB 2: MA TRẬN MAPPING ========== */
        <div>
          <div className="mb-16">
            <h6 className="text-md fw-semibold mb-1">Ma trận CLO - PLO Mapping</h6>
            <p className="text-sm text-muted mb-0">
              Tick vào ô giao nhau để ánh xạ CLO với PLO
            </p>
          </div>

          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="table table-bordered align-middle" style={{ minWidth: '700px' }}>
              <thead className="bg-primary-50">
                <tr>
                  <th className="px-8 py-8 text-center" style={{ width: '140px', position: 'sticky', left: 0, backgroundColor: '#f0f7ff', zIndex: 10 }}>
                    <div className="fw-bold text-primary-600 text-xs">PLO</div>
                    <div className="text-xxs text-muted mt-1">CLO →</div>
                  </th>
                  {clos.map((clo) => (
                    <th key={clo._id} className="px-6 py-8 text-center bg-success-50" style={{ minWidth: '100px' }}>
                      <div className="d-flex flex-column gap-1">
                        <span className="badge bg-success text-white fw-bold text-xs">{clo.code}</span>
                        <div className="text-xxs text-dark" style={{ wordBreak: 'break-word' }}>
                          {clo.name.length > 30 ? clo.name.substring(0, 30) + '...' : clo.name}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {program?.plos && program.plos.length > 0 ? (
                  program.plos.map((plo) => {
                    const ploData = typeof plo === 'object' ? plo : getPLODetails(plo);
                    const ploId = ploData?._id || plo;

                    return (
                      <tr key={ploId}>
                        <td className="px-8 py-8 bg-light" style={{ position: 'sticky', left: 0, backgroundColor: '#f8f9fa', zIndex: 5 }}>
                          <div>
                            <span className="badge bg-primary fw-bold text-xs mb-1 d-block">
                              {ploData?.code || ploId}
                            </span>
                            <div className="text-xxs text-dark fw-semibold">
                              {ploData?.name ? (ploData.name.length > 40 ? ploData.name.substring(0, 40) + '...' : ploData.name) : 'N/A'}
                            </div>
                          </div>
                        </td>
                        {clos.map((clo) => (
                          <td key={`${ploId}-${clo._id}`} className="px-6 py-8 text-center" style={{ verticalAlign: 'middle' }}>
                            <div className="form-check d-flex justify-content-center align-items-center" style={{ minHeight: '20px' }}>
                              <input
                                type="checkbox"
                                className="form-check-input"
                                style={{
                                  width: '18px',
                                  height: '18px',
                                  cursor: 'pointer',
                                  margin: 0
                                }}
                                checked={isMapped(clo, ploId)}
                                onChange={() => handleToggleMapping(clo._id, ploId)}
                              />
                            </div>
                          </td>
                        ))}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={clos.length + 1} className="text-center py-32">
                      <i className="ph ph-warning text-warning" style={{ fontSize: '32px' }}></i>
                      <p className="text-muted mb-0 mt-2">Chương trình chưa có PLO nào</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
                    <label className="form-label fw-semibold mb-3">Ánh xạ với PLO (Tùy chọn)</label>
                    {program?.plos && program.plos.length > 0 ? (
                      <div className="border rounded p-3 bg-light">
                        <div className="row g-3">
                          {program.plos.map(plo => {
                            const ploData = typeof plo === 'object' ? plo : getPLODetails(plo);
                            return (
                              <div key={ploData?._id || plo} className="col-md-6">
                                <div className="form-check">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id={`plo-${ploData?._id || plo}`}
                                    checked={cloForm.mappedPLOs.includes(ploData?._id || plo)}
                                    onChange={() => handlePLOCheckbox(ploData?._id || plo)}
                                  />
                                  <label className="form-check-label" htmlFor={`plo-${ploData?._id || plo}`}>
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
                    <small className="text-muted d-block mt-2">
                      Bạn cũng có thể mapping sau trong tab "Ma trận Mapping"
                    </small>
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
>>>>>>> origin/Namvv-teacher-class-management
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

<<<<<<< HEAD
      <div className="d-flex justify-content-between gap-3">
        <Button variant="outline" onClick={onPrevious} icon="ph ph-arrow-left">Quay lại</Button>
        <Button variant="primary" onClick={handleSaveAndNext} icon="ph ph-arrow-right" iconPosition="right">
=======
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
>>>>>>> origin/Namvv-teacher-class-management
          Lưu & Tiếp tục
        </Button>
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default CourseStep3CLOMapping;
=======
export default CourseStep3CLOMapping;
>>>>>>> origin/Namvv-teacher-class-management
