const CertificateTwo = () => {
  return (
    <section className='certificate-two py-120 position-relative z-1 mash-bg-main mash-bg-main-two mash-reverse'>
      <div className='section-heading text-center'>
        <h2 className='mb-24 wow bounceIn'>
          Chứng Chỉ Kỹ Năng Từ EduAll
        </h2>
        <p className=' wow bounceInUp'>
          Phần thiết kế chứng nhận khóa học trực tuyến để giới thiệu các
          tính năng chương trình chứng chỉ của bạn.
        </p>
      </div>
      <div className='position-relative'>
        <div className='container'>
          <div className='row align-items-center gy-4'>
            <div className='col-lg-6 pe-lg-5'>
              <div
                className='certificate-two-item animation-item border-bottom border-neutral-50 border-dashed border-0 mb-28 pb-28'
                data-aos='fade-up'
                data-aos-duration={200}
              >
                <div className='flex-align gap-20 mb-12'>
                  <span className='w-52 h-52 flex-center d-inline-flex bg-main-25 rounded-circle text-main-600 text-2xl'>
                    <i className='animate__wobble ph-bold ph-medal' />
                  </span>
                  <h5 className='mb-0'>Học Từ Chuyên Gia Trong Ngành</h5>
                </div>
                <p className='text-neutral-700 text-line-2'>
                  Học từ các chuyên gia hàng đầu trong lĩnh vực với kinh nghiệm thực tế.
                </p>
              </div>
              <div
                className='certificate-two-item animation-item border-bottom border-neutral-50 border-dashed border-0 mb-28 pb-28'
                data-aos='fade-up'
                data-aos-duration={400}
              >
                <div className='flex-align gap-20 mb-12'>
                  <span className='w-52 h-52 flex-center d-inline-flex bg-main-25 rounded-circle text-main-600 text-2xl'>
                    <i className='animate__wobble ph-bold ph-clock' />
                  </span>
                  <h5 className='mb-0'>Học Mọi Lúc, Mọi Nơi</h5>
                </div>
                <p className='text-neutral-700 text-line-2'>
                  Linh hoạt về thời gian và địa điểm, học bất cứ khi nào bạn muốn.
                </p>
              </div>
              <div
                className='certificate-two-item animation-item border-bottom border-neutral-50 border-dashed border-0 mb-28 pb-28'
                data-aos='fade-up'
                data-aos-duration={600}
              >
                <div className='flex-align gap-20 mb-12'>
                  <span className='w-52 h-52 flex-center d-inline-flex bg-main-25 rounded-circle text-main-600 text-2xl'>
                    <i className='animate__wobble ph-bold ph-star' />
                  </span>
                  <h5 className='mb-0'>Tài Nguyên Miễn Phí</h5>
                </div>
                <p className='text-neutral-700 text-line-2'>
                  Truy cập vào nhiều tài liệu và tài nguyên học tập miễn phí.
                </p>
              </div>
              <div
                className='certificate-two-item animation-item'
                data-aos='fade-up'
                data-aos-duration={800}
              >
                <div className='flex-align gap-20 mb-12'>
                  <span className='w-52 h-52 flex-center d-inline-flex bg-main-25 rounded-circle text-main-600 text-2xl'>
                    <i className='animate__wobble ph-bold ph-chart-line-up' />
                  </span>
                  <h5 className='mb-0'>Học Tập Dựa Trên Kỹ Năng</h5>
                </div>
                <p className='text-neutral-700 text-line-2'>
                  Phương pháp học tập tập trung vào việc phát triển kỹ năng thực tế.
                </p>
              </div>
            </div>
            <div className='col-lg-6'>
              <div className='certificate-two__thumb'>
                <img
                  src='assets/images/thumbs/certificate-two-img.png'
                  alt=''
                  data-tilt=''
                  data-tilt-max={10}
                  data-tilt-speed={500}
                  data-tilt-perspective={5000}
                  data-tilt-full-page-listening=''
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CertificateTwo;
