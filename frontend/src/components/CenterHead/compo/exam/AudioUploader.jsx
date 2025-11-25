import React, { useState, useRef } from 'react';

const AudioUploader = ({ currentAudioUrl, onUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(currentAudioUrl || '');
  const [audioFileName, setAudioFileName] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|m4a)$/i)) {
      alert('Chỉ chấp nhận file audio (MP3, WAV, OGG, M4A)!');
      return;
    }

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      alert('File audio không được vượt quá 100MB!');
      return;
    }

    try {
      setUploading(true);

      // Create a local preview URL
      const localUrl = URL.createObjectURL(file);
      setAudioUrl(localUrl);
      setAudioFileName(file.name);

      // TODO: Upload to server
      // const formData = new FormData();
      // formData.append('file', file);
      // const response = await fetch('/api/upload/audio', {
      //   method: 'POST',
      //   body: formData
      // });
      // const data = await response.json();
      // onUpload(data.fileUrl);

      // For now, just use the local URL
      onUpload(localUrl);

      setUploading(false);
    } catch (error) {
      console.error('Error uploading audio file:', error);
      alert('Có lỗi xảy ra khi tải file audio lên!');
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setAudioUrl('');
    setAudioFileName('');
    onUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // const formatFileSize = (bytes) => {
  //   if (bytes === 0) return '0 Bytes';
  //   const k = 1024;
  //   const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  //   const i = Math.floor(Math.log(bytes) / Math.log(k));
  //   return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  // };

  return (
    <div>
      {!audioUrl ? (
        <div
          className="border border-neutral-300 border-dashed rounded-12 p-24 text-center cursor-pointer bg-neutral-25 hover-bg-neutral-50 transition-all"
          onClick={handleClick}
        >
          <div className="d-flex flex-column align-items-center justify-content-center py-20">
            <div className="w-64 h-64 d-flex align-items-center justify-content-center rounded-circle bg-main-50 mb-16">
              <i className="fas fa-music text-main-600 text-28"></i>
            </div>

            <p className="text-neutral-900 fw-medium mb-8 text-sm">
              {uploading ? 'Đang tải lên...' : 'Kéo thả file audio hoặc click để chọn'}
            </p>
            <p className="text-neutral-500 text-xs mb-0">
              MP3, WAV, OGG, M4A dưới 100MB
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/m4a,.mp3,.wav,.ogg,.m4a"
            onChange={handleFileSelect}
            className="d-none"
          />
        </div>
      ) : (
        <div className="border border-neutral-200 rounded-12 p-20">
          <div className="d-flex align-items-start gap-16">
            {/* Audio Icon */}
            <div className="w-48 h-48 d-flex align-items-center justify-content-center rounded-8 bg-main-50 flex-shrink-0">
              <i className="fas fa-headphones text-main-600 text-24"></i>
            </div>

            {/* File Info */}
            <div className="flex-grow-1">
              <p className="text-neutral-900 fw-medium mb-4 text-sm">{audioFileName || 'File audio đã tải lên'}</p>
              <p className="text-neutral-500 mb-0 text-xs">Nhấn nút bên phải để xóa file</p>
            </div>

            {/* Actions */}
            <div className="d-flex gap-8 flex-shrink-0">
              <button
                className="w-36 h-36 d-flex align-items-center justify-content-center border border-danger-600 text-danger-600 rounded-8 hover-bg-danger-50 bg-transparent"
                onClick={handleRemoveFile}
                title="Xóa file"
              >
                <i className="fas fa-trash text-xs"></i>
              </button>
            </div>
          </div>

          {/* Audio Player Preview */}
          <div className="mt-16 border border-neutral-200 rounded-8 p-16 bg-neutral-50">
            <audio controls className="w-100" style={{ height: '40px' }}>
              <source src={audioUrl} type="audio/mpeg" />
              Trình duyệt của bạn không hỗ trợ phát audio.
            </audio>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioUploader;
