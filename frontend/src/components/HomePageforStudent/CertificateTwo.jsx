import certificateImage from "../../assets/Homepage_img/khoa-hoc-inflex.png";

const CertificateTwo = () => {
  return (
    <section className='certificate-two py-120 position-relative z-1 mash-bg-main mash-bg-main-two mash-reverse'>
      <div className='section-heading text-center'>
        <h2 className='mb-24 wow bounceIn'>
          Chứng Chỉ Kỹ Năng Từ EduAll
        </h2>
        <p className=' wow bounceInUp'>
          Phần chứng nhận khóa học trực tuyến được thiết kế để giới thiệu
          các tính năng chương trình chứng chỉ của bạn.
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
                  <h5 className='mb-0'>Học Từ Chuyên Gia Ngành</h5>
                </div>
                <p className='text-neutral-700 text-line-2'>
                  Được hướng dẫn bởi các chuyên gia hàng đầu trong lĩnh vực,
                  nâng cao kiến thức chuyên môn của bạn.
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
                  Linh hoạt học tập theo thời gian và địa điểm phù hợp,
                  không giới hạn bởi không gian.
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
                  Truy cập vào kho tài nguyên học tập phong phú,
                  hỗ trợ quá trình học tập của bạn.
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
                  Tập trung vào phát triển kỹ năng thực tế,
                  áp dụng ngay vào công việc và cuộc sống.
                </p>
              </div>
            </div>
            <div className='col-lg-6'>
              <div className='certificate-two__thumb'>
                <img
                  src={certificateImage}
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
