const InfoSectionOne = () => {
  return (
    <section className='info py-40 bg-main-600'>
      <div className='container'>
        <div className='row gy-4'>
          <div
            className='col-xl-3 col-sm-6'
            data-aos='fade-up'
            data-aos-duration={200}
          >
            <div className='info-item animation-item flex-align gap-20'>
              <span className='w-60 h-60 flex-center bg-white text-main-600 text-28 rounded-circle flex-shrink-0'>
                <i className='animate__heartBeat ph-bold ph-video-camera' />
              </span>
              <div className='flex-grow-1'>
                <h5 className='mb-8 text-white fw-medium'>
                  50,000 Khóa Học Trực Tuyến
                </h5>
                <span className='text-sm text-white'>
                  Trải nghiệm đa dạng các chủ đề mới mẻ
                </span>
              </div>
            </div>
          </div>
          <div
            className='col-xl-3 col-sm-6'
            data-aos='fade-up'
            data-aos-duration={400}
          >
            <div className='info-item animation-item flex-align gap-20'>
              <span className='w-60 h-60 flex-center bg-white text-main-600 text-28 rounded-circle flex-shrink-0'>
                <i className='animate__heartBeat ph-bold ph-users' />
              </span>
              <div className='flex-grow-1'>
                <h5 className='mb-8 text-white fw-medium'>
                  Giảng Viên Chuyên Gia
                </h5>
                <span className='text-sm text-white'>
                  Tìm giảng viên phù hợp với bạn
                </span>
              </div>
            </div>
          </div>
          <div
            className='col-xl-3 col-sm-6'
            data-aos='fade-up'
            data-aos-duration={600}
          >
            <div className='info-item animation-item flex-align gap-20'>
              <span className='w-60 h-60 flex-center bg-white text-main-600 text-28 rounded-circle flex-shrink-0'>
                <i className='animate__heartBeat ph-bold ph-clock' />
              </span>
              <div className='flex-grow-1'>
                <h5 className='mb-8 text-white fw-medium'>Truy Cập Trọn Đời</h5>
                <span className='text-sm text-white'>
                  Học theo lịch trình của bạn
                </span>
              </div>
            </div>
          </div>
          <div
            className='col-xl-3 col-sm-6'
            data-aos='fade-up'
            data-aos-duration={800}
          >
            <div className='info-item animation-item flex-align gap-20'>
              <span className='w-60 h-60 flex-center bg-white text-main-600 text-28 rounded-circle flex-shrink-0'>
                <i className='animate__heartBeat ph-bold ph-certificate' />
              </span>
              <div className='flex-grow-1'>
                <h5 className='mb-8 text-white fw-medium'>Nhận Chứng Chỉ</h5>
                <span className='text-sm text-white'>
                  Khi hoàn thành khóa học
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InfoSectionOne;
