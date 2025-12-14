import { Link } from "react-router-dom";

const FeaturesTwo = () => {
  return (
    <section className='features-two half-bg py-120 position-relative overflow-hidden'>
      <img
        src='assets/images/shapes/shape2.png'
        alt=''
        className='shape two animation-scalation'
      />
      <img
        src='assets/images/shapes/shape4.png'
        alt=''
        className='shape six animation-walking'
      />
      <div className='container'>
        <div className='section-heading style-flex'>
          <div className='section-heading__inner'>
            <h2 className='mb-24 wow bounceInLeft'>
              Xây dựng kỹ năng phát triển tốt hơn, nhanh hơn. Khơi Dậy Hành Trình Học Tập Của Bạn
            </h2>
          </div>
          <div className='section-heading__content wow bounceInRight'>
            <p className='text-line-2'>
              Khám phá kỹ năng mới, đào sâu đam mê hiện tại và đắm chìm trong
              sự sáng tạo. Những gì bạn tìm thấy có thể...
            </p>
            <Link
              to='/course-list-view'
              className='item-hover__text flex-align d-inline-flex gap-8 text-main-600 mt-24 hover-text-decoration-underline transition-1 fw-semibold'
            >
              Đọc Thêm
              <i className='ph ph-arrow-right' />
            </Link>
          </div>
        </div>
        <div className='row gy-4'>
          <div
            className='col-lg-4 col-sm-6 col-xs-6'
            data-aos='fade-up'
            data-aos-duration={200}
          >
            <div className='text-center features-item item-hover animation-item bg-white border border-neutral-30 rounded-16 transition-1 hover-bg-main-600 hover-border-main-600'>
              <span className='mb-32 w-110 h-110 flex-center d-inline-flex bg-main-25 rounded-circle'>
                <img
                  src='assets/images/icons/features-two-icon1.png'
                  className='animate__bounce'
                  alt=''
                />
              </span>
              <h4 className='mb-16 transition-1 item-hover__text'>
                Học các kỹ năng mới nhất
              </h4>
              <p className='transition-1 item-hover__text text-line-2'>
                Giáo dục chất lượng không nên quá đắt đỏ. Chúng tôi cung cấp
                giá cả cạnh tranh và các tùy chọn thanh toán
              </p>
              <span className='item-hover__bg w-48 h-1 bg-neutral-500 mt-32' />
            </div>
          </div>
          <div
            className='col-lg-4 col-sm-6 col-xs-6'
            data-aos='fade-up'
            data-aos-duration={400}
          >
            <div className='text-center features-item item-hover animation-item bg-white border border-neutral-30 rounded-16 transition-1 hover-bg-main-600 hover-border-main-600'>
              <span className='mb-32 w-110 h-110 flex-center d-inline-flex bg-main-25 rounded-circle'>
                <img
                  src='assets/images/icons/features-two-icon2.png'
                  className='animate__bounce'
                  alt=''
                />
              </span>
              <h4 className='mb-16 transition-1 item-hover__text'>
                Chuẩn bị cho sự nghiệp
              </h4>
              <p className='transition-1 item-hover__text text-line-2'>
                Tham gia vào các trải nghiệm học tập năng động và tương tác. Các
                khóa học của chúng tôi được thiết kế
              </p>
              <span className='item-hover__bg w-48 h-1 bg-neutral-500 mt-32' />
            </div>
          </div>
          <div
            className='col-lg-4 col-sm-6 col-xs-6'
            data-aos='fade-up'
            data-aos-duration={600}
          >
            <div className='text-center features-item item-hover animation-item bg-white border border-neutral-30 rounded-16 transition-1 hover-bg-main-600 hover-border-main-600'>
              <span className='mb-32 w-110 h-110 flex-center d-inline-flex bg-main-25 rounded-circle'>
                <img
                  src='assets/images/icons/features-two-icon3.png'
                  className='animate__bounce'
                  alt=''
                />
              </span>
              <h4 className='mb-16 transition-1 item-hover__text'>
                Nhận Chứng Chỉ
              </h4>
              <p className='transition-1 item-hover__text text-line-2'>
                Tham gia cộng đồng học tập sôi động và hỗ trợ. Kết nối với
                các học viên khác
              </p>
              <span className='item-hover__bg w-48 h-1 bg-neutral-500 mt-32' />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesTwo;
