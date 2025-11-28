import { useRef } from "react";
import Slider from "react-slick";

const TestimonialsTwo = () => {
  const sliderRef = useRef(null);
  const settings = {
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 2000,
    speed: 900,
    dots: false,
    pauseOnHover: true,
    arrows: false,
    draggable: true,
    infinite: true,

    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          arrows: false,
        },
      },
    ],
  };
  return (
    <section className='testimonials-two py-120 position-relative z-1'>
      <div className='container'>
        <div className='section-heading text-center'>
          <div className='flex-align d-inline-flex gap-8 mb-16 wow bounceInDown'>
            <span className='text-main-600 text-2xl d-flex'>
              <i className='ph-bold ph-book' />
            </span>
            <h5 className='text-main-600 mb-0'>
              Lời Chứng Thực Từ Học Viên Hài Lòng
            </h5>
          </div>
          <h2 className='mb-24 wow bounceIn'>Học Viên Chúng Tôi Nói Gì</h2>
          <p className=' wow bounceInUp'>
            Câu chuyện thành công của học viên chúng tôi nói lên tất cả. Đây là một số
            lời chứng thực từ các học viên hài lòng của chúng tôi
          </p>
        </div>
        <Slider
          ref={sliderRef}
          {...settings}
          className='testimonials-two-slider'
        >
          <div
            className='testimonials-two-item bg-main-25 rounded-12 p-32'
            data-aos='fade-up'
            data-aos-duration={400}
          >
            <ul className='flex-align gap-8 mb-16'>
              <li className='text-warning-600 text-xl d-flex'>
                <i className='ph-fill ph-star' />
              </li>
              <li className='text-warning-600 text-xl d-flex'>
                <i className='ph-fill ph-star' />
              </li>
              <li className='text-warning-600 text-xl d-flex'>
                <i className='ph-fill ph-star' />
              </li>
              <li className='text-warning-600 text-xl d-flex'>
                <i className='ph-fill ph-star' />
              </li>
              <li className='text-warning-600 text-xl d-flex'>
                <i className='ph-fill ph-star-half' />
              </li>
            </ul>
            <p className='text-neutral-700 text-xl'>
              "Tôi đã tham gia nhiều khóa học, và mỗi khóa học đều vượt quá mong đợi của tôi.
              Tôi đã có được những kỹ năng quý giá giúp tôi phát triển trong sự nghiệp. Rất khuyên dùng!"
            </p>
            <div className='flex-between gap-24 flex-wrap pt-28 mt-28 border-top border-neutral-50 mt-28 border-dashed border-0'>
              <div className='flex-align gap-24 '>
                <img
                  src='assets/images/thumbs/testi-img1.png'
                  alt=''
                  className='w-60 h-60 object-fit-cover rounded-circle'
                />
                <div className=''>
                  <h5 className='mb-8 fw-medium'>John D.</h5>
                  <span className='text-neutral-700'>Nhà Thiết Kế Đồ Họa</span>
                </div>
              </div>
              <span className='quate text-48 d-flex opacity-25'>
                <img src='assets/images/icons/quote-icon.png' alt='' />
              </span>
            </div>
          </div>
          <div
            className='testimonials-two-item bg-main-25 rounded-12 p-32'
            data-aos='fade-up'
            data-aos-duration={600}
          >
            <ul className='flex-align gap-8 mb-16'>
              <li className='text-warning-600 text-xl d-flex'>
                <i className='ph-fill ph-star' />
              </li>
              <li className='text-warning-600 text-xl d-flex'>
                <i className='ph-fill ph-star' />
              </li>
              <li className='text-warning-600 text-xl d-flex'>
                <i className='ph-fill ph-star' />
              </li>
              <li className='text-warning-600 text-xl d-flex'>
                <i className='ph-fill ph-star' />
              </li>
              <li className='text-warning-600 text-xl d-flex'>
                <i className='ph-fill ph-star-half' />
              </li>
            </ul>
            <p className='text-neutral-700 text-xl'>
              "Ban đầu tôi hoài nghi về việc học trực tuyến, nhưng đã thay đổi hoàn toàn
              quan điểm của mình. Các khóa học được thiết kế tốt, và sự linh hoạt
              để học theo tốc độ của riêng tôi là vô giá."
            </p>
            <div className='flex-between gap-24 flex-wrap pt-28 mt-28 border-top border-neutral-50 mt-28 border-dashed border-0'>
              <div className='flex-align gap-24 '>
                <img
                  src='assets/images/thumbs/testi-img2.png'
                  alt=''
                  className='w-60 h-60 object-fit-cover rounded-circle'
                />
                <div className=''>
                  <h5 className='mb-8 fw-medium'>Sarah L.</h5>
                  <span className='text-neutral-700'>Nhà Thiết Kế UI/UX</span>
                </div>
              </div>
              <span className='quate text-48 d-flex opacity-25'>
                <img src='assets/images/icons/quote-icon.png' alt='' />
              </span>
            </div>
          </div>
          <div
            className='testimonials-two-item bg-main-25 rounded-12 p-32'
            data-aos='fade-up'
            data-aos-duration={600}
          >
            <ul className='flex-align gap-8 mb-16'>
              <li className='text-warning-600 text-xl d-flex'>
                <i className='ph-fill ph-star' />
              </li>
              <li className='text-warning-600 text-xl d-flex'>
                <i className='ph-fill ph-star' />
              </li>
              <li className='text-warning-600 text-xl d-flex'>
                <i className='ph-fill ph-star' />
              </li>
              <li className='text-warning-600 text-xl d-flex'>
                <i className='ph-fill ph-star' />
              </li>
              <li className='text-warning-600 text-xl d-flex'>
                <i className='ph-fill ph-star-half' />
              </li>
            </ul>
            <p className='text-neutral-700 text-xl'>
              "Lúc đầu tôi nghi ngờ về việc học trực tuyến, nhưng đã hoàn toàn thay đổi
              quan điểm của mình. Các khóa học được lập kế hoạch rất tốt để học theo
              tốc độ của riêng mình là điều quan trọng."
            </p>
            <div className='flex-between gap-24 flex-wrap pt-28 mt-28 border-top border-neutral-50 mt-28 border-dashed border-0'>
              <div className='flex-align gap-24 '>
                <img
                  src='assets/images/thumbs/user-two-img3.png'
                  alt=''
                  className='w-60 h-60 object-fit-cover rounded-circle'
                />
                <div className=''>
                  <h5 className='mb-8 fw-medium'>John Doe</h5>
                  <span className='text-neutral-700'>Nhà Phát Triển Front End</span>
                </div>
              </div>
              <span className='quate text-48 d-flex opacity-25'>
                <img src='assets/images/icons/quote-icon.png' alt='' />
              </span>
            </div>
          </div>
        </Slider>
        <div className='flex-center gap-16 mt-40'>
          <button
            type='button'
            id='testimonials-two-prev'
            onClick={() => sliderRef.current.slickPrev()}
            className=' slick-arrow flex-center rounded-circle border border-gray-100 hover-border-main-600 text-xl hover-bg-main-600 hover-text-white transition-1 w-48 h-48'
          >
            <i className='ph ph-caret-left' />
          </button>
          <button
            type='button'
            id='testimonials-two-next'
            onClick={() => sliderRef.current.slickNext()}
            className=' slick-arrow flex-center rounded-circle border border-gray-100 hover-border-main-600 text-xl hover-bg-main-600 hover-text-white transition-1 w-48 h-48'
          >
            <i className='ph ph-caret-right' />
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsTwo;
