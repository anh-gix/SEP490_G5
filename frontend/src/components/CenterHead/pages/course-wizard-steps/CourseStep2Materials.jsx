import { useState } from 'react';
import Button from '../../compo/Button';
import Badge from '../../compo/Badge';
import Modal from '../../compo/Modal';
import courseService from '../../../../services/courseService';

const CourseStep2Materials = ({ courseData, setCourseData, onNext, onPrevious }) => {
  const [loading, setLoading] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [materialForm, setMaterialForm] = useState({
    description: '',
    author: '',
    publisher: '',
    publishedDate: '',
    onlineUrl: '',
    note: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMaterialForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddMaterial = () => {
    setMaterialForm({ description: '', author: '', publisher: '', publishedDate: '', onlineUrl: '', note: '' });
    setEditingIndex(null);
    setShowMaterialModal(true);
  };

  const handleEditMaterial = (index) => {
    setMaterialForm(courseData.materials[index]);
    setEditingIndex(index);
    setShowMaterialModal(true);
  };

  const handleSaveMaterial = () => {
    if (!materialForm.description) {
      alert('Vui lòng nhập mô tả tài liệu!');
      return;
    }

    const newMaterials = [...courseData.materials];
    if (editingIndex !== null) {
      newMaterials[editingIndex] = materialForm;
    } else {
      newMaterials.push(materialForm);
    }

    setCourseData(prev => ({ ...prev, materials: newMaterials }));
    setShowMaterialModal(false);
  };

  const handleDeleteMaterial = (index) => {
    if (window.confirm('Bạn có chắc muốn xóa tài liệu này?')) {
      setCourseData(prev => ({
        ...prev,
        materials: prev.materials.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSaveAndNext = async () => {
    try {
      setLoading(true);
      await courseService.updateCourse(courseData._id, {
        materials: courseData.materials
      });
      alert('Lưu tài liệu thành công!');
      onNext();
    } catch (error) {
      console.error('Error saving materials:', error);
      alert('Lỗi khi lưu tài liệu!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-24">
        <div className="d-flex justify-content-between align-items-center mb-16">
          <h6 className="text-md fw-semibold mb-0">Danh sách tài liệu ({courseData.materials.length})</h6>
          <Button variant="primary" size="sm" onClick={handleAddMaterial} icon="ph ph-plus">
            Thêm tài liệu
          </Button>
        </div>

        {courseData.materials.length === 0 ? (
          <div className="text-center py-32 bg-neutral-50 radius-8">
            <i className="ph ph-books text-neutral-400" style={{ fontSize: '48px' }}></i>
            <p className="text-neutral-600 mt-3 mb-0">Chưa có tài liệu nào (Có thể bỏ qua)</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-16 py-12">#</th>
                  <th className="px-16 py-12">Mô tả</th>
                  <th className="px-16 py-12">Tác giả</th>
                  <th className="px-16 py-12">Nhà xuất bản</th>
                  <th className="px-16 py-12 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {courseData.materials.map((material, index) => (
                  <tr key={index}>
                    <td className="px-16 py-12">{index + 1}</td>
                    <td className="px-16 py-12 fw-semibold">{material.description}</td>
                    <td className="px-16 py-12">{material.author || 'N/A'}</td>
                    <td className="px-16 py-12">{material.publisher || 'N/A'}</td>
                    <td className="px-16 py-12 text-center">
                      <div className="d-flex gap-1 justify-content-center">
                        <Button variant="warning" size="sm" onClick={() => handleEditMaterial(index)} icon="ph ph-pencil" />
                        <Button variant="danger" size="sm" onClick={() => handleDeleteMaterial(index)} icon="ph ph-trash" />
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
        <Button variant="primary" onClick={handleSaveAndNext} disabled={loading} icon="ph ph-arrow-right" iconPosition="right">
          {loading ? 'Đang lưu...' : 'Lưu & Tiếp tục'}
        </Button>
      </div>

      {showMaterialModal && (
        <Modal title={editingIndex !== null ? "Chỉnh sửa tài liệu" : "Thêm tài liệu"} show={showMaterialModal} onClose={() => setShowMaterialModal(false)}>
          <div className="row gy-3">
            <div className="col-12">
              <label className="form-label fw-semibold">Mô tả *</label>
              <input type="text" name="description" value={materialForm.description} onChange={handleInputChange} className="form-control radius-8" />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Tác giả</label>
              <input type="text" name="author" value={materialForm.author} onChange={handleInputChange} className="form-control radius-8" />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Nhà xuất bản</label>
              <input type="text" name="publisher" value={materialForm.publisher} onChange={handleInputChange} className="form-control radius-8" />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Ngày phát hành</label>
              <input type="text" name="publishedDate" value={materialForm.publishedDate} onChange={handleInputChange} className="form-control radius-8" placeholder="2024" />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">URL</label>
              <input type="text" name="onlineUrl" value={materialForm.onlineUrl} onChange={handleInputChange} className="form-control radius-8" placeholder="https://..." />
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold">Ghi chú</label>
              <textarea name="note" value={materialForm.note} onChange={handleInputChange} className="form-control radius-8" rows="2" />
            </div>
          </div>
          <div className="d-flex justify-content-end gap-2 mt-16">
            <Button variant="outline" onClick={() => setShowMaterialModal(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSaveMaterial}>Lưu</Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CourseStep2Materials;