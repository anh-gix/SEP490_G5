import { useState, useEffect } from 'react';
import Button from '../../compo/Button';
import Badge from '../../compo/Badge';
import courseService from '../../../../services/courseService';

const CourseStep3CLOMapping = ({ courseData, setCourseData, program, onNext, onPrevious }) => {
  const [loading, setLoading] = useState(false);
  const [showCLOForm, setShowCLOForm] = useState(false);
  const [cloForm, setCLOForm] = useState({ code: '', name: '', detail: '', mappedPLOs: [] });
  const [clos, setCLOs] = useState([]);

  useEffect(() => {
    if (courseData._id) {
      fetchCourseCLOs();
    }
  }, [courseData._id]);

  const fetchCourseCLOs = async () => {
    try {
      const response = await courseService.getCourseById(courseData._id);
      setCLOs(response.data.clos || []);
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
        code: c.code,
        name: c.name,
        detail: c.detail,
        mappedPLOs: c.mappedPLOs || []
      }));

      await courseService.updateCourse(courseData._id, {
        clos: updatedCLOs
      });

      await fetchCourseCLOs();
      setCLOForm({ code: '', name: '', detail: '', mappedPLOs: [] });
      setShowCLOForm(false);
      alert('Tạo CLO thành công!');
    } catch (error) {
      console.error('Error creating CLO:', error);
      alert(error.response?.data?.message || 'Lỗi khi tạo CLO!');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCLO = async (cloId) => {
    if (!window.confirm('Bạn có chắc muốn xóa CLO này?')) return;

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
      return;
    }

    try {
      // Update lastCompletedStep to mark step 4 as completed
      await courseService.updateCourse(courseData._id, {
        lastCompletedStep: 4
      });

      // Update local state
      setCourseData(prev => ({
        ...prev,
        lastCompletedStep: 4
      }));

      onNext();
    } catch (error) {
      console.error('Error updating lastCompletedStep:', error);
      // Continue to next step even if update fails
      onNext();
    }
  };

  const getPLODetails = (ploId) => {
    if (!program?.plos) return null;
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
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="d-flex justify-content-between gap-3">
        <Button variant="outline" onClick={onPrevious} icon="ph ph-arrow-left">Quay lại</Button>
        <Button variant="primary" onClick={handleSaveAndNext} icon="ph ph-arrow-right" iconPosition="right">
          Lưu & Tiếp tục
        </Button>
      </div>
    </div>
  );
};

export default CourseStep3CLOMapping;