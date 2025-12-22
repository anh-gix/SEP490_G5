import { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import Button from '../../compo/Button';
import Badge from '../../compo/Badge';
import Modal from '../../compo/Modal';
import courseService from '../../../../services/courseService';

const CourseStep2Materials = ({ courseData, setCourseData, onNext, onPrevious }) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [urlType, setUrlType] = useState('link'); // 'link' or 'file'
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
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
    setUrlType('link');
    setSelectedFile(null);
    setShowMaterialModal(true);
  };

  const handleEditMaterial = (index) => {
    const material = courseData.materials[index];
    setMaterialForm(material);
    setEditingIndex(index);
    // Check if it's a file URL (contains /uploads/course-materials/)
    if (material.onlineUrl && material.onlineUrl.includes('/uploads/course-materials/')) {
      setUrlType('file');
    } else {
      setUrlType('link');
    }
    setSelectedFile(null);
    setShowMaterialModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadFile = async () => {
    if (!selectedFile) return null;

    try {
      setUploading(true);
      const result = await courseService.uploadMaterialFile(selectedFile);
      return result.url;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSaveMaterial = async () => {
    if (!materialForm.description) {
      toast.error('Vui lòng nhập mô tả tài liệu!');
      return;
    }

    try {
      let finalUrl = materialForm.onlineUrl;

      // If file upload mode and file selected, upload first
      if (urlType === 'file' && selectedFile) {
        finalUrl = await handleUploadFile();
      }

      const materialData = {
        ...materialForm,
        onlineUrl: finalUrl
      };

      const newMaterials = [...courseData.materials];
      if (editingIndex !== null) {
        newMaterials[editingIndex] = materialData;
      } else {
        newMaterials.push(materialData);
      }

      // Save to database immediately
      await courseService.updateCourse(courseData._id, {
        materials: newMaterials
      });

      setCourseData(prev => ({ ...prev, materials: newMaterials }));
      setShowMaterialModal(false);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error saving material:', error);
      toast.error('Lỗi khi lưu tài liệu!');
    }
  };

  const handleDeleteMaterial = async (index) => {
    if (!window.confirm('Bạn có chắc muốn xóa tài liệu này?')) return;

    const newMaterials = courseData.materials.filter((_, i) => i !== index);

    try {
      // Save to database immediately
      await courseService.updateCourse(courseData._id, {
        materials: newMaterials
      });

      setCourseData(prev => ({
        ...prev,
        materials: newMaterials
      }));
    } catch (error) {
      console.error('Error deleting material:', error);
      toast.error('Lỗi khi xóa tài liệu!');
    }
  };

  const handleSaveAndNext = async () => {
    try {
      setLoading(true);
      await courseService.updateCourse(courseData._id, {
        materials: courseData.materials,
        lastCompletedStep: 3 // Mark step 3 as completed
      });

      // Update local state
      setCourseData(prev => ({
        ...prev,
        lastCompletedStep: 3
      }));

      toast.success('Lưu tài liệu thành công!');
      onNext();
    } catch (error) {
      console.error('Error saving materials:', error);
      toast.error('Lỗi khi lưu tài liệu!');
    } finally {
      setLoading(false);
    }
  };

  // Protection: Course must be created first
  if (!courseData._id) {
    return (
      <div className="alert alert-warning">
        <i className="ph ph-warning me-2"></i>
        Vui lòng hoàn thành Bước 1 (Thông tin cơ bản) trước khi thêm tài liệu.
      </div>
    );
  }

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
            <div className="col-12">
              <label className="form-label fw-semibold">Tài liệu trực tuyến</label>
              <div className="d-flex gap-3 mb-2">
                <div className="form-check">
                  <input
                    type="radio"
                    id="urlTypeLink"
                    name="urlType"
                    className="form-check-input"
                    checked={urlType === 'link'}
                    onChange={() => setUrlType('link')}
                  />
                  <label htmlFor="urlTypeLink" className="form-check-label">
                    <i className="ph ph-link me-1"></i> Nhập URL
                  </label>
                </div>
                <div className="form-check">
                  <input
                    type="radio"
                    id="urlTypeFile"
                    name="urlType"
                    className="form-check-input"
                    checked={urlType === 'file'}
                    onChange={() => setUrlType('file')}
                  />
                  <label htmlFor="urlTypeFile" className="form-check-label">
                    <i className="ph ph-upload me-1"></i> Upload file
                  </label>
                </div>
              </div>

              {urlType === 'link' ? (
                <input
                  type="text"
                  name="onlineUrl"
                  value={materialForm.onlineUrl}
                  onChange={handleInputChange}
                  className="form-control radius-8"
                  placeholder="https://..."
                />
              ) : (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="form-control radius-8"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                  />
                  <small className="text-neutral-500">
                    Hỗ trợ: PDF, Word, Excel, PowerPoint, TXT, ZIP, RAR (tối đa 50MB)
                  </small>
                  {selectedFile && (
                    <div className="mt-2 p-2 bg-neutral-50 radius-8 d-flex align-items-center gap-2">
                      <i className="ph ph-file text-primary"></i>
                      <span className="text-sm">{selectedFile.name}</span>
                      <Badge variant="secondary" className="ms-auto">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</Badge>
                    </div>
                  )}
                  {materialForm.onlineUrl && materialForm.onlineUrl.includes('/uploads/course-materials/') && !selectedFile && (
                    <div className="mt-2 p-2 bg-success-50 radius-8 d-flex align-items-center gap-2">
                      <i className="ph ph-check-circle text-success"></i>
                      <span className="text-sm text-success">Đã có file tải lên</span>
                      <a href={materialForm.onlineUrl} target="_blank" rel="noopener noreferrer" className="ms-auto text-sm">
                        <i className="ph ph-eye me-1"></i>Xem
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold">Ghi chú</label>
              <textarea name="note" value={materialForm.note} onChange={handleInputChange} className="form-control radius-8" rows="2" />
            </div>
          </div>
          <div className="d-flex justify-content-end gap-2 mt-16">
            <Button variant="outline" onClick={() => setShowMaterialModal(false)} disabled={uploading}>Hủy</Button>
            <Button variant="primary" onClick={handleSaveMaterial} disabled={uploading}>
              {uploading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Đang tải lên...
                </>
              ) : 'Lưu'}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CourseStep2Materials;