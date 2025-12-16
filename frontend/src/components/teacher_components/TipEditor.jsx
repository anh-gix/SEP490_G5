import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Badge, Nav, Tab } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import tipService from '../../services/tipService';

/**
 * Tip Editor - Full Page Edit
 * Chỉnh sửa tips cho một section cụ thể
 */
const TipEditor = () => {
  const { section } = useParams();
  const navigate = useNavigate();

  const [tip, setTip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [alert, setAlert] = useState(null);

  // Available categories for each section
  const availableCategories = {
    General: ['Listening', 'Reading', 'Speaking', 'Writing', 'Grammar', 'Vocabulary', 'General'],
    Toeic: ['General', 'Listening', 'Reading', 'Grammar', 'Vocabulary'],
    Ielts: ['General', 'Listening', 'Reading', 'Speaking', 'Writing', 'Vocabulary']
  };

  useEffect(() => {
    fetchTipData();
  }, [section]);

  const fetchTipData = async () => {
    try {
      setLoading(true);
      const response = await tipService.getTipsBySection(section);

      if (response.success) {
        setTip(response.tip);
        // Set active category to first one
        if (response.tip.categories.length > 0) {
          setActiveCategory(response.tip.categories[0].name);
        }
      }
    } catch (error) {
      console.error('Error fetching tip data:', error);
      setAlert({ type: 'danger', message: 'Không thể tải dữ liệu tips' });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      Listening: 'info',
      Reading: 'warning',
      Writing: 'success',
      Speaking: 'danger',
      Grammar: 'main',
      Vocabulary: 'secondary',
      General: 'neutral'
    };
    return colors[category] || 'neutral';
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

  const getCurrentCategory = () => {
    return tip?.categories.find(cat => cat.name === activeCategory);
  };

  const handleAddVideo = () => {
    if (!tip || !activeCategory) return;

    const updatedCategories = tip.categories.map(cat => {
      if (cat.name === activeCategory) {
        const maxOrder = cat.items.length > 0
          ? Math.max(...cat.items.map(item => item.order))
          : 0;

        return {
          ...cat,
          items: [
            ...cat.items,
            {
              _id: `temp-${Date.now()}`,
              title: '',
              url: '',
              order: maxOrder + 1
            }
          ]
        };
      }
      return cat;
    });

    setTip({ ...tip, categories: updatedCategories });
    setHasChanges(true);
  };

  const handleVideoChange = (videoId, field, value) => {
    const updatedCategories = tip.categories.map(cat => {
      if (cat.name === activeCategory) {
        return {
          ...cat,
          items: cat.items.map(item =>
            item._id === videoId ? { ...item, [field]: value } : item
          )
        };
      }
      return cat;
    });

    setTip({ ...tip, categories: updatedCategories });
    setHasChanges(true);
  };

  const handleDeleteVideo = (videoId) => {
    if (!window.confirm('Bạn có chắc muốn xóa video này?')) return;

    const updatedCategories = tip.categories.map(cat => {
      if (cat.name === activeCategory) {
        return {
          ...cat,
          items: cat.items.filter(item => item._id !== videoId)
        };
      }
      return cat;
    });

    setTip({ ...tip, categories: updatedCategories });
    setHasChanges(true);
  };

  const handleMoveVideo = (videoId, direction) => {
    const category = getCurrentCategory();
    const currentIndex = category.items.findIndex(item => item._id === videoId);

    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === category.items.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const updatedItems = [...category.items];
    [updatedItems[currentIndex], updatedItems[newIndex]] = [updatedItems[newIndex], updatedItems[currentIndex]];

    // Update order
    updatedItems.forEach((item, idx) => {
      item.order = idx + 1;
    });

    const updatedCategories = tip.categories.map(cat => {
      if (cat.name === activeCategory) {
        return { ...cat, items: updatedItems };
      }
      return cat;
    });

    setTip({ ...tip, categories: updatedCategories });
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setAlert(null);

      // Validate
      for (const cat of tip.categories) {
        for (const item of cat.items) {
          if (!item.title.trim() || !item.url.trim()) {
            setAlert({
              type: 'warning',
              message: `Vui lòng điền đầy đủ thông tin video trong category "${cat.name}"`
            });
            setSaving(false);
            return;
          }

          // Validate YouTube URL
          if (!item.url.includes('youtube.com') && !item.url.includes('youtu.be')) {
            setAlert({
              type: 'warning',
              message: `URL không hợp lệ trong category "${cat.name}". Chỉ chấp nhận YouTube links.`
            });
            setSaving(false);
            return;
          }
        }
      }

      const response = await tipService.updateTip(tip._id, { categories: tip.categories });

      if (response.success) {
        setAlert({ type: 'success', message: 'Lưu thay đổi thành công!' });
        setHasChanges(false);

        // Reload data
        setTimeout(() => {
          fetchTipData();
        }, 1000);
      }
    } catch (error) {
      console.error('Error saving tip:', error);
      setAlert({ type: 'danger', message: error.message || 'Có lỗi xảy ra khi lưu' });
    } finally {
      setSaving(false);
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

  if (!tip) {
    return (
      <Container fluid className="py-24 px-24" style={{ backgroundColor: '#F5F7FA', minHeight: '100vh' }}>
        <Alert variant="danger">
          <Alert.Heading>Không tìm thấy dữ liệu</Alert.Heading>
          <p>Không tìm thấy tips cho section: {section}</p>
          <Link to="/teacher/tips" className="btn btn-danger">
            <i className="ph ph-arrow-left me-2"></i>Quay lại
          </Link>
        </Alert>
      </Container>
    );
  }

  const currentCategory = getCurrentCategory();
  const totalVideos = tip.categories.reduce((sum, cat) => sum + cat.items.length, 0);

  return (
    <Container fluid className="py-24 px-24" style={{ backgroundColor: '#F5F7FA', minHeight: '100vh' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-24">
        <div>
          <div className="d-flex align-items-center gap-3 mb-2">
            <Link to="/teacher/tips" className="text-neutral-600 hover-text-main-600">
              <i className="ph ph-arrow-left"></i>
            </Link>
            <h3 className="mb-0">
              <i className={`ph-bold ph-${getCategoryIcon(section)} me-2`}></i>
              Quản lý Tips - {section}
            </h3>
            {hasChanges && (
              <Badge bg="warning-50" className="text-warning-600">
                <i className="ph-bold ph-warning-circle me-1"></i>
                Có thay đổi chưa lưu
              </Badge>
            )}
          </div>
          <p className="text-neutral-600 mb-0">
            Tổng: {tip.categories.length} categories, {totalVideos} videos
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/teacher/tips" className="btn btn-neutral-200 rounded-pill">
            <i className="ph ph-x me-2"></i>Hủy
          </Link>
          <Button
            variant="main-600"
            className="rounded-pill"
            onClick={handleSave}
            disabled={!hasChanges || saving}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Đang lưu...
              </>
            ) : (
              <>
                <i className="ph-bold ph-floppy-disk me-2"></i>Lưu thay đổi
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Alert */}
      {alert && (
        <Alert
          variant={alert.type}
          dismissible
          onClose={() => setAlert(null)}
          className="mb-24"
        >
          {alert.message}
        </Alert>
      )}

      {/* Main Content */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <Tab.Container activeKey={activeCategory} onSelect={(k) => setActiveCategory(k)}>
            {/* Category Tabs */}
            <div className="border-bottom border-neutral-100 p-20 bg-neutral-25">
              <Nav variant="pills" className="gap-2">
                {tip.categories.map((cat) => {
                  const color = getCategoryColor(cat.name);
                  const icon = getCategoryIcon(cat.name);
                  const isActive = activeCategory === cat.name;

                  return (
                    <Nav.Item key={cat.name}>
                      <Nav.Link
                        eventKey={cat.name}
                        className={`rounded-pill ${isActive ? `bg-${color}-600 text-white` : `bg-white text-${color}-600 border border-${color}-200`}`}
                      >
                        <i className={`ph-bold ph-${icon} me-2`}></i>
                        {cat.name}
                        <Badge
                          bg={isActive ? 'white' : `${color}-100`}
                          className={`ms-2 ${isActive ? `text-${color}-600` : `text-${color}-700`}`}
                        >
                          {cat.items.length}
                        </Badge>
                      </Nav.Link>
                    </Nav.Item>
                  );
                })}
              </Nav>
            </div>

            {/* Category Content */}
            <div className="p-24">
              {currentCategory && (
                <>
                  {/* Category Header */}
                  <div className="d-flex justify-content-between align-items-center mb-24">
                    <div>
                      <h5 className="mb-1">
                        <i className={`ph-bold ph-${getCategoryIcon(currentCategory.name)} me-2 text-${getCategoryColor(currentCategory.name)}-600`}></i>
                        {currentCategory.name}
                      </h5>
                      <p className="text-neutral-600 mb-0">
                        {currentCategory.items.length} video(s)
                      </p>
                    </div>
                    <Button
                      variant={`${getCategoryColor(currentCategory.name)}-600`}
                      size="sm"
                      className="rounded-pill"
                      onClick={handleAddVideo}
                    >
                      <i className="ph-bold ph-plus me-2"></i>
                      Thêm Video
                    </Button>
                  </div>

                  {/* Videos List */}
                  {currentCategory.items.length > 0 ? (
                    <div className="d-flex flex-column gap-3">
                      {currentCategory.items.map((video, index) => {
                        const thumbnail = getYouTubeThumbnail(video.url);

                        return (
                          <Card key={video._id} className="border border-neutral-200">
                            <Card.Body className="p-20">
                              <Row className="align-items-start g-3">
                                {/* Thumbnail */}
                                <Col md={2}>
                                  <div className="position-relative">
                                    {thumbnail ? (
                                      <img
                                        src={thumbnail}
                                        alt={video.title}
                                        className="w-100 rounded-8"
                                        style={{ aspectRatio: '16/9', objectFit: 'cover' }}
                                      />
                                    ) : (
                                      <div
                                        className="w-100 bg-neutral-100 rounded-8 d-flex align-items-center justify-content-center"
                                        style={{ aspectRatio: '16/9' }}
                                      >
                                        <i className="ph ph-video-camera text-neutral-400" style={{ fontSize: '32px' }}></i>
                                      </div>
                                    )}
                                    <Badge
                                      bg="dark"
                                      className="position-absolute top-0 start-0 m-2"
                                      style={{ opacity: 0.8 }}
                                    >
                                      #{video.order}
                                    </Badge>
                                  </div>
                                </Col>

                                {/* Form Fields */}
                                <Col md={8}>
                                  <Form.Group className="mb-3">
                                    <Form.Label className="text-sm fw-medium">Tiêu đề video</Form.Label>
                                    <Form.Control
                                      type="text"
                                      placeholder="Nhập tiêu đề video..."
                                      value={video.title}
                                      onChange={(e) => handleVideoChange(video._id, 'title', e.target.value)}
                                      className="rounded-8"
                                    />
                                  </Form.Group>
                                  <Form.Group>
                                    <Form.Label className="text-sm fw-medium">YouTube URL</Form.Label>
                                    <Form.Control
                                      type="text"
                                      placeholder="https://www.youtube.com/watch?v=..."
                                      value={video.url}
                                      onChange={(e) => handleVideoChange(video._id, 'url', e.target.value)}
                                      className="rounded-8"
                                    />
                                  </Form.Group>
                                </Col>

                                {/* Actions */}
                                <Col md={2}>
                                  <div className="d-flex flex-column gap-2">
                                    <Button
                                      variant="neutral-100"
                                      size="sm"
                                      className="w-100"
                                      onClick={() => handleMoveVideo(video._id, 'up')}
                                      disabled={index === 0}
                                    >
                                      <i className="ph-bold ph-arrow-up"></i>
                                    </Button>
                                    <Button
                                      variant="neutral-100"
                                      size="sm"
                                      className="w-100"
                                      onClick={() => handleMoveVideo(video._id, 'down')}
                                      disabled={index === currentCategory.items.length - 1}
                                    >
                                      <i className="ph-bold ph-arrow-down"></i>
                                    </Button>
                                    {video.url && (
                                      <a
                                        href={video.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-info-100 btn-sm w-100"
                                      >
                                        <i className="ph-bold ph-play-circle"></i>
                                      </a>
                                    )}
                                    <Button
                                      variant="danger-100"
                                      size="sm"
                                      className="w-100"
                                      onClick={() => handleDeleteVideo(video._id)}
                                    >
                                      <i className="ph-bold ph-trash"></i>
                                    </Button>
                                  </div>
                                </Col>
                              </Row>
                            </Card.Body>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-60 bg-neutral-25 rounded-12">
                      <i className="ph ph-video-camera text-neutral-300" style={{ fontSize: '64px' }}></i>
                      <p className="text-neutral-600 mt-3 mb-0">
                        Chưa có video nào trong category này
                      </p>
                      <Button
                        variant={`${getCategoryColor(currentCategory.name)}-600`}
                        size="sm"
                        className="rounded-pill mt-3"
                        onClick={handleAddVideo}
                      >
                        <i className="ph-bold ph-plus me-2"></i>
                        Thêm Video Đầu Tiên
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </Tab.Container>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TipEditor;
