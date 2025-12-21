import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup, Table, Modal } from 'react-bootstrap';
import tipService from '../../services/tipService';

// Danh sách tất cả categories
const ALL_CATEGORIES = ['Listening', 'Reading', 'Speaking', 'Writing', 'Grammar', 'Vocabulary', 'General'];

// Tên tiếng Việt cho categories
const CATEGORY_NAMES_VI = {
  Listening: 'Nghe',
  Reading: 'Đọc',
  Speaking: 'Nói',
  Writing: 'Viết',
  Grammar: 'Ngữ pháp',
  Vocabulary: 'Từ vựng',
  General: 'Tổng quát'
};

/**
 * Tips Management - All-in-One Page
 * Quản lý tips với 3 sections, categories sidebar và video table
 */
const TipsManagement = () => {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('General');
  const [activeCategory, setActiveCategory] = useState('Listening'); // Default to first category
  const [searchTerm, setSearchTerm] = useState('');
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [videoForm, setVideoForm] = useState({ title: '', url: '', order: 1 });
  const [videoFile, setVideoFile] = useState(null);
  const [videoSource, setVideoSource] = useState('youtube'); // 'youtube' or 'upload'
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTipsData();
  }, []);

  const fetchTipsData = async () => {
    try {
      setLoading(true);

      const tipsResponse = await tipService.getAllTips();

      if (tipsResponse.success) {
        setTips(tipsResponse.tips);
        // Keep default active category as 'Listening'
      }
    } catch (error) {
      console.error('Error fetching tips data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSectionIcon = (section) => {
    switch (section) {
      case 'General': return 'book';
      case 'Toeic': return 'headphones';
      case 'Ielts': return 'graduation-cap';
      default: return 'lightbulb';
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      Listening: 'headphones',
      Reading: 'book-open',
      Writing: 'pen',
      Speaking: 'microphone',
      Grammar: 'translate',
      Vocabulary: 'text-aa',
      General: 'info'
    };
    return icons[category] || 'video';
  };

  const calculateTotalVideos = (tip) => {
    return tip.categories.reduce((sum, cat) => sum + cat.items.length, 0);
  };

  const getCurrentTip = () => {
    return tips.find(t => t.section === activeSection);
  };

  const getCurrentCategory = () => {
    const tip = getCurrentTip();
    return tip?.categories.find(cat => cat.name === activeCategory);
  };

  const getFilteredVideos = () => {
    const category = getCurrentCategory();
    if (!category) return [];

    if (!searchTerm) return category.items;

    return category.items.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.url.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    // Keep current category or default to first one
    if (!activeCategory) {
      setActiveCategory(ALL_CATEGORIES[0]);
    }
    setSearchTerm('');
  };

  // Get video count for a category in current section
  const getCategoryVideoCount = (categoryName) => {
    const tip = getCurrentTip();
    const category = tip?.categories.find(cat => cat.name === categoryName);
    return category?.items.length || 0;
  };

  const handleAddVideo = () => {
    setEditingVideo(null);
    const category = getCurrentCategory();
    const maxOrder = category?.items.length > 0
      ? Math.max(...category.items.map(item => item.order))
      : 0;
    setVideoForm({ title: '', url: '', order: maxOrder + 1 });
    setVideoFile(null);
    setVideoSource('youtube');
    setShowVideoModal(true);
  };

  const handleEditVideo = (video) => {
    setEditingVideo(video);
    setVideoForm({ title: video.title, url: video.url, order: video.order });
    setVideoFile(null);
    setVideoSource(video.url.includes('youtube') || video.url.includes('youtu.be') ? 'youtube' : 'upload');
    setShowVideoModal(true);
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Bạn có chắc muốn xóa video này?')) return;

    try {
      setSaving(true);
      await tipService.deleteVideo(activeSection, videoId);
      await fetchTipsData();
      alert('Xóa video thành công!');
    } catch (error) {
      console.error('Error deleting video:', error);
      alert(error.message || 'Có lỗi khi xóa video');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveVideo = async () => {
    // Validate required fields
    if (!videoForm.title.trim()) {
      alert('Vui lòng nhập tiêu đề video');
      return;
    }

    // Check if either URL or file is provided
    if (videoSource === 'youtube') {
      if (!videoForm.url.trim()) {
        alert('Vui lòng nhập YouTube URL');
        return;
      }
      if (!videoForm.url.includes('youtube.com') && !videoForm.url.includes('youtu.be')) {
        alert('Chỉ chấp nhận YouTube links');
        return;
      }
    } else if (videoSource === 'upload') {
      if (!videoFile && !editingVideo) {
        alert('Vui lòng chọn file video để upload');
        return;
      }
    }

    try {
      setSaving(true);

      if (editingVideo) {
        // Update existing video
        await tipService.updateVideo(
          activeSection,
          editingVideo._id,
          videoForm,
          videoSource === 'upload' ? videoFile : null
        );
        alert('Cập nhật video thành công!');
      } else {
        // Add new video
        await tipService.addVideoToCategory(
          activeSection,
          activeCategory,
          videoForm,
          videoSource === 'upload' ? videoFile : null
        );
        alert('Thêm video thành công!');
      }

      await fetchTipsData();
      setShowVideoModal(false);
      setVideoFile(null);
    } catch (error) {
      console.error('Error saving video:', error);
      alert(error.message || 'Có lỗi khi lưu video');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm', 'video/x-matroska'];
      if (!allowedTypes.includes(file.type)) {
        alert('Chỉ chấp nhận file video (mp4, avi, mov, wmv, webm, mkv)');
        e.target.value = '';
        return;
      }

      // Validate file size (100MB)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        alert('File video không được vượt quá 100MB');
        e.target.value = '';
        return;
      }

      setVideoFile(file);
    }
  };

  const getYouTubeThumbnail = (url) => {
    try {
      let videoId = '';
      if (url.includes('youtu.be')) {
        videoId = url.split('/').pop().split('?')[0];
      } else if (url.includes('youtube.com')) {
        videoId = url.split('v=')[1]?.split('&')[0];
      }
      return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <Container fluid className="py-24 px-24" style={{ backgroundColor: '#F5F7FA', minHeight: '100vh' }}>
        <div className="text-center py-5">
          <div className="spinner-border text-main-600" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="text-neutral-600 mt-3">Đang tải dữ liệu tips...</p>
        </div>
      </Container>
    );
  }

  const filteredVideos = getFilteredVideos();

  return (
    <Container fluid className="py-24 px-24" style={{ backgroundColor: '#F5F7FA', minHeight: '100vh' }}>
      {/* Header */}
      <div className="mb-24">
        <h4 className="mb-8 fw-semibold text-neutral-700">
          <i className="ph-bold ph-lightbulb me-8 text-main-600"></i>
          Quản lý Tips Học Tập
        </h4>
        <p className="text-neutral-600 mb-0 text-15">
          Quản lý video tips học tập cho các chương trình General, TOEIC và IELTS
        </p>
      </div>

      {/* Section Cards */}
      <Row className="g-20 mb-32">
        {tips.map((tip) => {
          const totalVideos = calculateTotalVideos(tip);
          const isActive = activeSection === tip.section;

          return (
            <Col md={4} key={tip._id}>
              <Card
                className={`h-100 ${isActive ? 'border-main-600 shadow-sm' : 'border-neutral-30'}`}
                style={{
                  cursor: 'pointer',
                  borderWidth: isActive ? '2px' : '1px',
                  backgroundColor: isActive ? 'var(--main-25)' : 'white',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => handleSectionChange(tip.section)}
              >
                <Card.Body className="p-20">
                  <div className="d-flex justify-content-between align-items-start mb-16">
                    <h6 className={`mb-0 fw-semibold ${isActive ? 'text-main-600' : 'text-neutral-700'}`}>
                      {tip.section}
                    </h6>
                    {isActive && (
                      <Badge className="bg-main-600 text-white rounded-pill px-12 py-4 text-11 fw-medium">
                        ACTIVE
                      </Badge>
                    )}
                  </div>
                  <p className="text-neutral-600 text-13 mb-16">
                    {totalVideos} video • {tip.categories.length} danh mục
                  </p>
                  <div className={`fw-bold ${isActive ? 'text-main-600' : 'text-neutral-500'}`} style={{ fontSize: '2.5rem', lineHeight: '1' }}>
                    {totalVideos}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Divider */}
      <div className="mb-24" style={{ height: '1px', backgroundColor: 'var(--neutral-30)' }}></div>

      {/* Section Tabs */}
      <div className="mb-24">
        <div className="d-flex gap-12">
          {tips.map((tip) => {
            const isActive = activeSection === tip.section;

            return (
              <Button
                key={tip.section}
                className={`${isActive ? 'btn-main-600 text-white' : 'btn-outline-neutral-600 text-neutral-700'} px-20 py-8 rounded-8`}
                size="sm"
                onClick={() => handleSectionChange(tip.section)}
                style={{ fontWeight: isActive ? '600' : '400', fontSize: '14px' }}
              >
                <i className={`ph-bold ph-${getSectionIcon(tip.section)} me-8`}></i>
                {tip.section}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <Row className="g-20">
        {/* Categories Sidebar */}
        <Col lg={3}>
          <Card className="border border-neutral-30 rounded-12 shadow-sm">
            <Card.Header className="bg-white border-bottom border-neutral-30 p-16 rounded-top-12">
              <h6 className="mb-0 fw-semibold text-neutral-700 text-15">Danh mục</h6>
            </Card.Header>
            <Card.Body className="p-0">
              {ALL_CATEGORIES.map((categoryName) => {
                const isActive = activeCategory === categoryName;
                const videoCount = getCategoryVideoCount(categoryName);

                return (
                  <div
                    key={categoryName}
                    className={`p-16 border-bottom border-neutral-30 ${isActive ? 'bg-main-25' : ''}`}
                    style={{
                      cursor: 'pointer',
                      borderLeft: isActive ? '3px solid var(--main-600)' : '3px solid transparent',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => setActiveCategory(categoryName)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-8">
                        <i
                          className={`ph-bold ph-${getCategoryIcon(categoryName)}`}
                          style={{
                            fontSize: '16px',
                            color: isActive ? 'var(--main-600)' : 'var(--neutral-600)'
                          }}
                        ></i>
                        <span
                          className={`${isActive ? 'fw-semibold text-main-600' : 'text-neutral-700'} text-14`}
                        >
                          {CATEGORY_NAMES_VI[categoryName]}
                        </span>
                      </div>
                      <Badge
                        className={`${videoCount > 0
                          ? (isActive ? 'bg-main-600 text-white' : 'bg-neutral-100 text-neutral-700')
                          : 'bg-neutral-50 text-neutral-400'} rounded-pill px-10 py-4 text-11`}
                      >
                        {videoCount}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </Card.Body>
          </Card>
        </Col>

        {/* Videos Management */}
        <Col lg={9}>
          <Card className="border border-neutral-30 rounded-12 shadow-sm">
            <Card.Header className="bg-white border-bottom border-neutral-30 p-20 rounded-top-12">
              <Row className="align-items-center g-3">
                <Col md={6}>
                  <h6 className="mb-4 fw-semibold text-neutral-700 text-16">
                    <i className={`ph-bold ph-${getCategoryIcon(activeCategory)} me-8 text-main-600`}></i>
                    Video {CATEGORY_NAMES_VI[activeCategory]}
                  </h6>
                  <small className="text-neutral-600 text-13">
                    Quản lý video trong danh mục {CATEGORY_NAMES_VI[activeCategory]?.toLowerCase()}
                  </small>
                </Col>
                <Col md={6}>
                  <div className="d-flex gap-12 justify-content-end">
                    <InputGroup className="search-input" style={{ maxWidth: '250px' }}>
                      <InputGroup.Text className="bg-white border-neutral-40">
                        <i className="ph ph-magnifying-glass text-neutral-600"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Tìm kiếm video..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border-neutral-40 text-14"
                      />
                    </InputGroup>
                    <Button
                      className="btn-main-600 text-white px-16 py-8 rounded-8"
                      size="sm"
                      onClick={handleAddVideo}
                    >
                      <i className="ph-bold ph-plus me-8"></i>
                      Thêm Video
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body className="p-0">
              {filteredVideos.length > 0 ? (
                <div className="table-responsive">
                  <Table hover className="mb-0 text-14">
                    <thead className="bg-neutral-20">
                      <tr>
                        <th className="px-20 py-16 fw-semibold text-neutral-700 text-13" style={{ width: '60px' }}>STT</th>
                        <th className="px-20 py-16 fw-semibold text-neutral-700 text-13">Tiêu đề</th>
                        <th className="px-20 py-16 fw-semibold text-neutral-700 text-13">Liên kết</th>
                        <th className="px-20 py-16 fw-semibold text-neutral-700 text-13 text-end" style={{ width: '120px' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVideos.map((video) => (
                        <tr key={video._id} className="border-bottom border-neutral-30">
                          <td className="px-20 py-16 align-middle">
                            <Badge
                              className="bg-neutral-100 text-neutral-900 rounded-circle d-flex align-items-center justify-content-center fw-semibold"
                              style={{ width: '32px', height: '32px', fontSize: '13px' }}
                            >
                              {video.order}
                            </Badge>
                          </td>
                          <td className="px-20 py-16 align-middle">
                            <div className="fw-medium text-neutral-700">{video.title}</div>
                          </td>
                          <td className="px-20 py-16 align-middle">
                            <a
                              href={video.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-decoration-none text-main-600 d-flex align-items-center gap-8"
                            >
                              <i className="ph-bold ph-play-circle" style={{ fontSize: '18px' }}></i>
                              <span className="text-13">Xem</span>
                            </a>
                          </td>
                          <td className="px-20 py-16 align-middle text-end">
                            <div className="d-flex gap-8 justify-content-end">
                              <Button
                                className="btn-outline-main text-main-600 border-main-200 p-8 rounded-8"
                                size="sm"
                                onClick={() => handleEditVideo(video)}
                              >
                                <i className="ph-bold ph-pencil-simple"></i>
                              </Button>
                              <Button
                                className="btn-outline-danger text-danger-600 border-danger-200 p-8 rounded-8"
                                size="sm"
                                onClick={() => handleDeleteVideo(video._id)}
                              >
                                <i className="ph-bold ph-trash"></i>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-60">
                  <i className="ph ph-video-camera text-neutral-300" style={{ fontSize: '64px' }}></i>
                  <p className="text-neutral-600 mt-16 mb-0 text-14">
                    {searchTerm ? 'Không tìm thấy video phù hợp' : 'Chưa có video nào trong danh mục này'}
                  </p>
                  {!searchTerm && (
                    <Button
                      className="btn-main-600 text-white px-20 py-10 rounded-pill mt-16"
                      size="sm"
                      onClick={handleAddVideo}
                    >
                      <i className="ph-bold ph-plus me-8"></i>
                      Thêm Video Đầu Tiên
                    </Button>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Video Modal */}
      <Modal show={showVideoModal} onHide={() => setShowVideoModal(false)} size="lg">
        <Modal.Header closeButton className="border-bottom border-neutral-30 p-24">
          <Modal.Title className="text-16 fw-semibold text-neutral-700">
            {editingVideo ? 'Chỉnh Sửa Video' : 'Thêm Video Mới'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-24">
          <Form>
            <Form.Group className="mb-20">
              <Form.Label className="fw-semibold text-neutral-700 text-14 mb-8">Tiêu đề video</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tiêu đề video..."
                value={videoForm.title}
                onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                className="border-neutral-40 rounded-8 px-16 py-12 text-14"
              />
            </Form.Group>

            <Form.Group className="mb-20">
              <Form.Label className="fw-semibold text-neutral-700 text-14 mb-8">Nguồn video</Form.Label>
              <div className="d-flex gap-12 mb-16">
                <Button
                  className={`${videoSource === 'youtube' ? 'btn-main-600 text-white' : 'btn-outline-neutral-600 text-neutral-700'} px-16 py-8 rounded-8`}
                  size="sm"
                  onClick={() => setVideoSource('youtube')}
                >
                  <i className="ph-bold ph-youtube-logo me-8"></i>
                  Liên kết YouTube
                </Button>
                <Button
                  className={`${videoSource === 'upload' ? 'btn-main-600 text-white' : 'btn-outline-neutral-600 text-neutral-700'} px-16 py-8 rounded-8`}
                  size="sm"
                  onClick={() => setVideoSource('upload')}
                >
                  <i className="ph-bold ph-upload me-8"></i>
                  Tải lên Video
                </Button>
              </div>

              {videoSource === 'youtube' ? (
                <>
                  <Form.Control
                    type="text"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={videoForm.url}
                    onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })}
                    className="border-neutral-40 rounded-8 px-16 py-12 text-14"
                  />
                  {videoForm.url && getYouTubeThumbnail(videoForm.url) && (
                    <div className="mt-16 p-16 bg-neutral-20 rounded-8">
                      <small className="text-neutral-600 text-12 d-block mb-8">Xem trước:</small>
                      <img
                        src={getYouTubeThumbnail(videoForm.url)}
                        alt="Preview"
                        className="img-fluid rounded-8"
                        style={{ maxHeight: '180px' }}
                      />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Form.Control
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="border-neutral-40 rounded-8 px-16 py-12 text-14"
                  />
                  <Form.Text className="text-neutral-600 text-12 d-block mt-8">
                    Định dạng cho phép: MP4, AVI, MOV, WMV, WEBM, MKV (Tối đa: 100MB)
                  </Form.Text>
                  {videoFile && (
                    <div className="mt-16 p-16 bg-neutral-20 rounded-8">
                      <small className="text-neutral-600 text-12 d-block mb-8">File đã chọn:</small>
                      <div className="d-flex align-items-center gap-8">
                        <i className="ph-bold ph-file-video text-main-600" style={{ fontSize: '24px' }}></i>
                        <div>
                          <div className="text-neutral-700 text-13 fw-medium">{videoFile.name}</div>
                          <div className="text-neutral-600 text-12">
                            {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </Form.Group>

            <Form.Group className="mb-0">
              <Form.Label className="fw-semibold text-neutral-700 text-14 mb-8">Thứ tự</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={videoForm.order}
                onChange={(e) => setVideoForm({ ...videoForm, order: parseInt(e.target.value) })}
                className="border-neutral-40 rounded-8 px-16 py-12 text-14"
                style={{ maxWidth: '120px' }}
                disabled
              />
              <Form.Text className="text-neutral-600 text-12">
                Thứ tự được gán tự động
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-top border-neutral-30 p-24">
          <Button
            className="btn-neutral-200 text-neutral-700 px-20 py-10 rounded-8"
            onClick={() => setShowVideoModal(false)}
          >
            Hủy
          </Button>
          <Button
            className="btn-main-600 text-white px-20 py-10 rounded-8"
            onClick={handleSaveVideo}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-8"></span>
                Đang lưu...
              </>
            ) : (
              <>
                <i className="ph-bold ph-floppy-disk me-8"></i>
                Lưu Video
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TipsManagement;
