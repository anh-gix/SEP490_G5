import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { courseService } from '../../services/courseService';

/**
 * CourseMaterialsManager - Component quản lý tài liệu khóa học
 * Cho phép CRUD materials bất kể trạng thái course
 *
 * @param {string} courseId - ID của khóa học
 * @param {string} courseName - Tên khóa học (optional, để hiển thị)
 * @param {boolean} readOnly - Chế độ chỉ xem (không cho phép edit/delete)
 */
const CourseMaterialsManager = ({ courseId, courseName = '', readOnly = false }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [urlType, setUrlType] = useState('link'); // 'link' or 'file'
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    description: '',
    author: '',
    publisher: '',
    publishedDate: '',
    onlineUrl: '',
    note: ''
  });

  // Fetch materials on mount
  useEffect(() => {
    if (courseId) {
      fetchMaterials();
    }
  }, [courseId]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await courseService.getCourseMaterials(courseId);
      if (response.success) {
        setMaterials(response.materials || []);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast.error('Không thể tải danh sách tài liệu');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      author: '',
      publisher: '',
      publishedDate: '',
      onlineUrl: '',
      note: ''
    });
    setEditingMaterial(null);
    setUrlType('link');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEditModal = (material) => {
    setFormData({
      description: material.description || '',
      author: material.author || '',
      publisher: material.publisher || '',
      publishedDate: material.publishedDate || '',
      onlineUrl: material.onlineUrl || '',
      note: material.note || ''
    });
    setEditingMaterial(material);
    // Check if URL is a file upload
    if (material.onlineUrl && material.onlineUrl.includes('/uploads/course-materials/')) {
      setUrlType('file');
    } else {
      setUrlType('link');
    }
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const handleSave = async () => {
    // Validate
    if (!formData.description.trim()) {
      toast.error('Vui lòng nhập mô tả tài liệu!');
      return;
    }

    try {
      setSaving(true);
      let finalUrl = formData.onlineUrl;

      // Upload file if needed
      if (urlType === 'file' && selectedFile) {
        finalUrl = await handleUploadFile();
      }

      const materialData = {
        ...formData,
        onlineUrl: finalUrl
      };

      if (editingMaterial) {
        // Update existing
        const response = await courseService.updateCourseMaterial(
          courseId,
          editingMaterial._id,
          materialData
        );
        if (response.success) {
          toast.success('Cập nhật tài liệu thành công!');
          fetchMaterials();
          handleCloseModal();
        }
      } else {
        // Add new
        const response = await courseService.addCourseMaterial(courseId, materialData);
        if (response.success) {
          toast.success('Thêm tài liệu thành công!');
          fetchMaterials();
          handleCloseModal();
        }
      }
    } catch (error) {
      console.error('Error saving material:', error);
      toast.error(error.message || 'Lỗi khi lưu tài liệu!');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (material) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa',
      text: `Bạn có chắc muốn xóa tài liệu "${material.description}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (!result.isConfirmed) return;

    try {
      const response = await courseService.deleteCourseMaterial(courseId, material._id);
      if (response.success) {
        toast.success('Xóa tài liệu thành công!');
        fetchMaterials();
      }
    } catch (error) {
      console.error('Error deleting material:', error);
      toast.error(error.message || 'Lỗi khi xóa tài liệu!');
    }
  };

  const getFileIcon = (url) => {
    if (!url) return 'ph ph-file';
    const ext = url.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return 'ph ph-file-pdf text-danger';
      case 'doc':
      case 'docx':
        return 'ph ph-file-doc text-primary';
      case 'xls':
      case 'xlsx':
        return 'ph ph-file-xls text-success';
      case 'ppt':
      case 'pptx':
        return 'ph ph-file-ppt text-warning';
      case 'zip':
      case 'rar':
        return 'ph ph-file-zip text-secondary';
      default:
        return 'ph ph-file text-neutral-600';
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="course-materials-manager">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h6 className="mb-1 fw-bold text-neutral-900">
            <i className="ph ph-books me-2 text-primary"></i>
            Tài liệu khóa học
          </h6>
          <p className="text-sm text-neutral-600 mb-0">
            {materials.length} tài liệu
            {courseName && <span className="ms-2">• {courseName}</span>}
          </p>
        </div>
        {!readOnly && (
          <button
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={handleOpenAddModal}
          >
            <i className="ph ph-plus"></i>
            Thêm tài liệu
          </button>
        )}
      </div>

      {/* Materials List */}
      {materials.length === 0 ? (
        <div className="text-center py-5 bg-neutral-50 rounded-3">
          <i className="ph ph-books text-neutral-400" style={{ fontSize: '64px' }}></i>
          <p className="text-neutral-600 mt-3 mb-0">Chưa có tài liệu nào</p>
          {!readOnly && (
            <button
              className="btn btn-outline-primary mt-3"
              onClick={handleOpenAddModal}
            >
              <i className="ph ph-plus me-2"></i>
              Thêm tài liệu đầu tiên
            </button>
          )}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle border">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-3 py-3" style={{ width: '5%' }}>#</th>
                <th className="px-3 py-3" style={{ width: '30%' }}>Mô tả</th>
                <th className="px-3 py-3" style={{ width: '15%' }}>Tác giả</th>
                <th className="px-3 py-3" style={{ width: '15%' }}>Nhà xuất bản</th>
                <th className="px-3 py-3" style={{ width: '10%' }}>Năm XB</th>
                <th className="px-3 py-3" style={{ width: '10%' }}>Link/File</th>
                {!readOnly && <th className="px-3 py-3 text-center" style={{ width: '15%' }}>Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {materials.map((material, index) => (
                <tr key={material._id || index}>
                  <td className="px-3 py-3 text-neutral-600">{index + 1}</td>
                  <td className="px-3 py-3">
                    <div className="fw-semibold text-neutral-900">{material.description}</div>
                    {material.note && (
                      <small className="text-neutral-500 d-block mt-1">
                        <i className="ph ph-note me-1"></i>
                        {material.note}
                      </small>
                    )}
                  </td>
                  <td className="px-3 py-3 text-neutral-700">{material.author || '-'}</td>
                  <td className="px-3 py-3 text-neutral-700">{material.publisher || '-'}</td>
                  <td className="px-3 py-3 text-neutral-700">{material.publishedDate || '-'}</td>
                  <td className="px-3 py-3">
                    {material.onlineUrl ? (
                      <a
                        href={material.onlineUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                        title={material.onlineUrl}
                      >
                        <i className={getFileIcon(material.onlineUrl)}></i>
                        Xem
                      </a>
                    ) : (
                      <span className="text-neutral-400">-</span>
                    )}
                  </td>
                  {!readOnly && (
                    <td className="px-3 py-3 text-center">
                      <div className="d-flex gap-2 justify-content-center">
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() => handleOpenEditModal(material)}
                          title="Chỉnh sửa"
                        >
                          <i className="ph ph-pencil"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(material)}
                          title="Xóa"
                        >
                          <i className="ph ph-trash"></i>
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  <i className={`ph ${editingMaterial ? 'ph-pencil' : 'ph-plus'} me-2 text-primary`}></i>
                  {editingMaterial ? 'Chỉnh sửa tài liệu' : 'Thêm tài liệu mới'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                  disabled={saving || uploading}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  {/* Description */}
                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      Mô tả tài liệu <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="VD: Sách giáo khoa IELTS Foundation"
                    />
                  </div>

                  {/* Author & Publisher */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Tác giả</label>
                    <input
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="VD: Cambridge"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Nhà xuất bản</label>
                    <input
                      type="text"
                      name="publisher"
                      value={formData.publisher}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="VD: Cambridge University Press"
                    />
                  </div>

                  {/* Published Date */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Năm xuất bản</label>
                    <input
                      type="text"
                      name="publishedDate"
                      value={formData.publishedDate}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="VD: 2024"
                    />
                  </div>

                  {/* URL Type Selection */}
                  <div className="col-12">
                    <label className="form-label fw-semibold">Tài liệu trực tuyến</label>
                    <div className="d-flex gap-4 mb-3">
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
                        value={formData.onlineUrl}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="https://example.com/document.pdf"
                      />
                    ) : (
                      <div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="form-control"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                        />
                        <small className="text-neutral-500 d-block mt-1">
                          Hỗ trợ: PDF, Word, Excel, PowerPoint, TXT, ZIP, RAR (tối đa 50MB)
                        </small>
                        {selectedFile && (
                          <div className="mt-2 p-2 bg-primary-50 rounded d-flex align-items-center gap-2">
                            <i className="ph ph-file text-primary"></i>
                            <span className="text-sm">{selectedFile.name}</span>
                            <span className="badge bg-secondary ms-auto">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        )}
                        {formData.onlineUrl && formData.onlineUrl.includes('/uploads/course-materials/') && !selectedFile && (
                          <div className="mt-2 p-2 bg-success-50 rounded d-flex align-items-center gap-2">
                            <i className="ph ph-check-circle text-success"></i>
                            <span className="text-sm text-success">Đã có file tải lên</span>
                            <a
                              href={formData.onlineUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ms-auto btn btn-sm btn-outline-success"
                            >
                              <i className="ph ph-eye me-1"></i>Xem
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Note */}
                  <div className="col-12">
                    <label className="form-label fw-semibold">Ghi chú</label>
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={handleInputChange}
                      className="form-control"
                      rows="2"
                      placeholder="Ghi chú thêm về tài liệu..."
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                  disabled={saving || uploading}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-primary d-flex align-items-center gap-2"
                  onClick={handleSave}
                  disabled={saving || uploading}
                >
                  {(saving || uploading) && (
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                  )}
                  {uploading ? 'Đang tải lên...' : saving ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseMaterialsManager;
