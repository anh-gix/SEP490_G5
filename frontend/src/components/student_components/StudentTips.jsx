import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import tipService from '../../services/tipService';

/**
 * Student Tips Page - Video hướng dẫn học tập
 * Hiển thị tips theo section: General, TOEIC, IELTS
 * Design inspired by LessonDetails
 */
const StudentTips = () => {
  const [tips, setTips] = useState([]);
  const [activeSection, setActiveSection] = useState('General');
  const [activeTip, setActiveTip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);

  useEffect(() => {
    // Auto-select first video when section changes
    if (activeTip && activeTip.categories.length > 0) {
      const firstCategory = activeTip.categories[0];
      if (firstCategory.items.length > 0) {
        setSelectedVideo({
          ...firstCategory.items[0],
          categoryName: firstCategory.name
        });
        setExpandedCategory(0); // Expand first category
      }
    }
  }, [activeTip]);

  const fetchTips = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tipService.getAllTips();
      
      if (response.success) {
        setTips(response.tips);
        // Set active tip based on default section
        const defaultTip = response.tips.find(t => t.section === activeSection);
        setActiveTip(defaultTip);
      }
    } catch (error) {
      console.error('Error fetching tips:', error);
      setError(error.message || 'Không thể tải dữ liệu tips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSectionChange = (section) => {
    setActiveSection(section);
    const tip = tips.find(t => t.section === section);
    setActiveTip(tip);
  };

  const handleVideoSelect = (video, categoryName) => {
    setSelectedVideo({
      ...video,
      categoryName
    });
  };

  const toggleCategory = (index) => {
    setExpandedCategory(expandedCategory === index ? null : index);
  };

  const getYouTubeEmbedUrl = (url) => {
    // Convert YouTube URL to embed URL
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be') 
        ? url.split('/').pop()
        : url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const getSectionIcon = (section) => {
    switch (section) {
      case 'General':
        return 'book';
      case 'Toeic':
        return 'headphones';
      case 'Ielts':
        return 'graduation-cap';
      default:
        return 'lightbulb';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Listening':
        return 'headphones';
      case 'Reading':
        return 'book-open';
      case 'Writing':
        return 'pen';
      case 'Speaking':
        return 'microphone';
      case 'Grammar':
        return 'translate';
      case 'Vocabulary':
        return 'text-aa';
      case 'General':
        return 'info';
      default:
        return 'video';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Listening':
        return 'info';
      case 'Reading':
        return 'warning';
      case 'Writing':
        return 'success';
      case 'Speaking':
        return 'danger';
      case 'Grammar':
        return 'main';
      case 'Vocabulary':
        return 'secondary';
      default:
        return 'neutral';
    }
  };

  if (loading) {
    return (
      <Container fluid className="py-24 px-24" style={{ backgroundColor: '#F5F7FA', minHeight: '100vh' }}>
        <div className='text-center py-5'>
          <div className='spinner-border text-main-600' role='status'>
            <span className='visually-hidden'>Đang tải...</span>
          </div>
          <p className='mt-3 text-neutral-700'>Đang tải tips học tập...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-24 px-24" style={{ backgroundColor: '#F5F7FA', minHeight: '100vh' }}>
        <Alert variant='danger' className='rounded-12'>
          <Alert.Heading>Lỗi tải dữ liệu</Alert.Heading>
          <p>{error}</p>
          <button onClick={fetchTips} className='btn btn-danger-600 rounded-pill'>
            <i className='ph ph-arrow-clockwise me-2'></i>Thử lại
          </button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-24 px-24" style={{ backgroundColor: '#F5F7FA', minHeight: '100vh' }}>
      <Row className="g-4">
        {/* Main Video Player - 8 columns */}
        <Col xl={8}>
          <div className='border border-neutral-30 rounded-12 bg-white p-12'>
            {selectedVideo ? (
              <>
                <div className='ratio ratio-16x9'>
                  <iframe
                    src={getYouTubeEmbedUrl(selectedVideo.url)}
                    title={selectedVideo.title}
                    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                    allowFullScreen
                    className='rounded-12'
                  ></iframe>
                </div>
                <div className='p-20'>
                  <h3 className='mt-24 mb-16'>{selectedVideo.title}</h3>
                  <div className='flex-align gap-16 flex-wrap'>
                    <span className={`badge bg-${getCategoryColor(selectedVideo.categoryName)}-600 text-white px-16 py-8 text-15 fw-medium rounded-pill`}>
                      <i className={`ph-bold ph-${getCategoryIcon(selectedVideo.categoryName)} me-1`}></i>
                      {selectedVideo.categoryName}
                    </span>
                    <span className='text-neutral-600'>
                      <i className='ph-bold ph-play-circle me-1'></i>
                      Video #{selectedVideo.order}
                    </span>
                    <span className='text-neutral-600'>
                      <i className='ph-fill ph-youtube-logo me-1 text-danger'></i>
                      YouTube
                    </span>
                  </div>
                  <span className='d-block border-bottom border-neutral-30 my-24' />
                  <p className='text-neutral-700'>
                    Xem video hướng dẫn chi tiết để nắm vững kiến thức và kỹ thuật làm bài hiệu quả.
                    Nhấn vào các video khác trong danh sách bên phải để tiếp tục học tập.
                  </p>
                </div>
              </>
            ) : (
              <div className='text-center py-80'>
                <i className='ph ph-video text-neutral-300' style={{ fontSize: '80px' }}></i>
                <p className='text-neutral-600 mt-3 mb-0'>Chọn một video để xem</p>
              </div>
            )}
          </div>
        </Col>

        {/* Sidebar - Video List - 4 columns */}
        <Col xl={4}>
          <div className='border border-neutral-30 rounded-12 bg-white' style={{ height: 'calc(100vh - 140px)', position: 'sticky', top: '24px' }}>
            {/* Header with Section Filters */}
            <div className='p-20 border-bottom border-neutral-30'>
              <h5 className='mb-16'>
                <i className='ph-bold ph-lightbulb me-2'></i>
                Tips học tập
              </h5>
              
              {/* Section Filter Buttons */}
              <div className='d-flex gap-2 flex-wrap'>
                {tips.map(tip => (
                  <button
                    key={tip.section}
                    className={`btn btn-sm ${activeSection === tip.section ? 'btn-main-600' : 'btn-outline-main'} rounded-pill`}
                    onClick={() => handleSectionChange(tip.section)}
                  >
                    <i className={`ph-bold ph-${getSectionIcon(tip.section)} me-1`}></i>
                    {tip.section}
                    <span className='badge bg-white text-main-600 ms-1' style={{ fontSize: '10px' }}>
                      {tip.categories.reduce((sum, cat) => sum + cat.items.length, 0)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Scrollable Video List */}
            <div style={{ overflowY: 'auto', height: 'calc(100% - 120px)' }}>
              {activeTip && activeTip.categories.length > 0 ? (
                <div className='accordion common-accordion style-three' id='tipsAccordion'>
                  {activeTip.categories.map((category, catIndex) => (
                    <div className='accordion-item' key={catIndex}>
                      <h2 className='accordion-header bg-main-25'>
                        <button
                          className={`accordion-button bg-main-25 ${expandedCategory === catIndex ? '' : 'collapsed'}`}
                          type='button'
                          onClick={() => toggleCategory(catIndex)}
                          aria-expanded={expandedCategory === catIndex}
                        >
                          <i className={`ph-bold ph-${getCategoryIcon(category.name)} me-2`}></i>
                          {category.name}
                          <span className={`badge bg-${getCategoryColor(category.name)}-600 text-white ms-auto`}>
                            {category.items.length}
                          </span>
                        </button>
                      </h2>
                      <div
                        className={`accordion-collapse collapse ${expandedCategory === catIndex ? 'show' : ''}`}
                      >
                        <div className='accordion-body p-0 bg-main-25'>
                          {category.items.map((item, itemIndex) => (
                            <div 
                              key={itemIndex}
                              className={`curriculam-item ${selectedVideo?.url === item.url ? 'active' : ''}`}
                              style={{ 
                                cursor: 'pointer',
                                backgroundColor: selectedVideo?.url === item.url ? '#FEF3C7' : 'transparent'
                              }}
                              onClick={() => handleVideoSelect(item, category.name)}
                            >
                              <div className='text-neutral-700 fw-medium hover-text-main-600 d-block'>
                                <span className='flex-align gap-12'>
                                  <i className='text-xl d-flex ph-bold ph-video-camera' />
                                  <span className='text-line-1'>{item.title}</span>
                                </span>
                              </div>
                              <div className='flex-between gap-8 mt-16'>
                                <span className='flex-align gap-8 text-main-600 fw-semibold'>
                                  <i className='ph ph-youtube-logo' />
                                  Video #{item.order}
                                </span>
                                {selectedVideo?.url === item.url && (
                                  <span className='flex-align gap-8 text-warning-600'>
                                    <i className='ph-fill ph-play-circle' />
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-40'>
                  <i className='ph ph-folder-open text-neutral-300' style={{ fontSize: '48px' }}></i>
                  <p className='text-neutral-500 mt-3 mb-0'>Chưa có video nào</p>
                </div>
              )}
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default StudentTips;
