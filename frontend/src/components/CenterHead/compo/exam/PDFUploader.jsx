import React, { useState, useRef } from 'react';

const PDFUploader = ({ currentFileUrl, onUpload, sectionType }) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentFileUrl || '');
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      alert('Chỉ chấp nhận file PDF!');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert('File không được vượt quá 50MB!');
      return;
    }

    try {
      setUploading(true);

      // Create a local preview URL
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);

      // TODO: Upload to server
      // const formData = new FormData();
      // formData.append('file', file);
      // const response = await fetch('/api/upload/pdf', {
      //   method: 'POST',
      //   body: formData
      // });
      // const data = await response.json();
      // onUpload(data.fileUrl);

      // For now, just use the local URL
      onUpload(localUrl);

      setUploading(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Có lỗi xảy ra khi tải file lên!');
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setPreviewUrl('');
    onUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      {!previewUrl ? (
        <div
          className="border border-neutral-300 border-dashed rounded-12 p-24 text-center cursor-pointer bg-neutral-25 hover-bg-neutral-50 transition-all"
          onClick={handleClick}
        >
          <div className="d-flex flex-column align-items-center justify-content-center py-20">
            <div className="w-64 h-64 d-flex align-items-center justify-content-center rounded-circle bg-main-50 mb-16">
              <i className="fas fa-cloud-upload-alt text-main-600 text-28"></i>
            </div>

            <p className="text-neutral-900 fw-medium mb-8 text-sm">
              {uploading ? 'Đang tải lên...' : 'Kéo thả file PDF hoặc click để chọn'}
            </p>
            <p className="text-neutral-500 text-xs mb-0">
              PDF dưới 50MB
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileSelect}
            className="d-none"
          />
        </div>
      ) : (
        <div className="border border-neutral-200 rounded-12 p-20">
          <div className="d-flex align-items-start gap-16">
            {/* PDF Icon */}
            <div className="w-48 h-48 d-flex align-items-center justify-content-center rounded-8 bg-danger-50 flex-shrink-0">
              <i className="fas fa-file-pdf text-danger-600 text-24"></i>
            </div>

            {/* File Info */}
            <div className="flex-grow-1">
              <p className="text-neutral-900 fw-medium mb-4 text-sm">Đã tải lên file PDF</p>
              <p className="text-neutral-500 mb-0 text-xs">Nhấn nút bên phải để xem hoặc xóa file</p>
            </div>

            {/* Actions */}
            <div className="d-flex gap-8 flex-shrink-0">
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-36 h-36 d-flex align-items-center justify-content-center border border-main-600 text-main-600 rounded-8 hover-bg-main-50"
                title="Xem PDF"
              >
                
              </a>
              <button
                className="w-36 h-36 d-flex align-items-center justify-content-center border border-danger-600 text-danger-600 rounded-8 hover-bg-danger-50 bg-transparent"
                onClick={handleRemoveFile}
                title="Xóa file"
              >
                <i className="fas fa-trash text-xs"></i>
              </button>
            </div>
          </div>

          {/* PDF Preview */}
          <div className="mt-16 border border-neutral-200 rounded-8 overflow-hidden h-300">
            <iframe
              src={previewUrl}
              title="PDF Preview"
              width="100%"
              height="100%"
              className="border-0"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFUploader;
