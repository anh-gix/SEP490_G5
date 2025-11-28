import { useRef } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";

const CategoryOne = () => {
  const sliderRef = useRef(null);
  const settings = {
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 2000,
    speed: 900,
    dots: false,
    pauseOnHover: true,
    arrows: false,
    draggable: true,

    responsive: [
      {
        breakpoint: 1199,
        settings: {
          slidesToShow: 3,
          arrows: false,
        },
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 2,
          arrows: false,
        },
      },
      {
        breakpoint: 575,
        settings: {
          slidesToShow: 1,
          arrows: false,
        },
      },
    ],
  };
  return (
    <section className='category py-120 position-relative z-1 mash-bg-main mash-bg-main-two mash-reverse'>
      <div className='container'>
        <div className='section-heading text-center'>
          <div className='flex-align d-inline-flex gap-8 mb-16 wow bounceInDown'>
            <span className='text-main-600 text-2xl d-flex'>
              <i className='ph-bold ph-book' />
            </span>
            <h5 className='text-main-600 mb-0'>Danh Mục</h5>
          </div>
          <h2 className='mb-24 wow bounceIn'>
            Nâng Tầm Trải Nghiệm Học Tập Của Bạn
          </h2>
          <p className=' wow bounceInUp'>
            Nền tảng của chúng tôi được xây dựng trên các nguyên tắc đổi mới, chất lượng và
            toàn diện, nhằm cung cấp trải nghiệm học tập liền mạch
          </p>
        </div>
        <Slider ref={sliderRef} {...settings} className='category-item-slider'>
          <div
            className='category-item animation-item h-100 text-center px-16 py-32 rounded-12 bg-main-25 border border-neutral-30 hover-border-main-600 transition-2'
            data-aos='fade-up'
            data-aos-duration={200}
          >
            <span className='w-96 h-96 flex-center d-inline-flex bg-white text-main-600 text-40 rounded-circle box-shadow-md mb-24'>
              <img
                src='assets/images/icons/category-icon1.png'
                className='animate__flipInY'
                alt=''
              />
            </span>
            <h4 className='display-four mb-16 text-neutral-700'>
              Nghệ Thuật &amp; Thiết Kế
            </h4>
            <p className='text-neutral-500 text-lg text-line-2'>
              Các khóa học về dinh dưỡng, thể dục, yoga...
            </p>
            <Link
              to='/courses'
              className='py-12 px-24 bg-white rounded-8 border border-neutral-30 mt-28 fw-semibold text-main-600 hover-bg-main-600 hover-text-white hover-border-main-600'
            >
              14 Khóa học
            </Link>
          </div>
          <div
            className='category-item animation-item h-100 text-center px-16 py-32 rounded-12 bg-main-two-25 border border-neutral-30 hover-border-main-two-600 transition-2'
            data-aos='fade-up'
            data-aos-duration={400}
          >
            <span className='w-96 h-96 flex-center d-inline-flex bg-white text-main-600 text-40 rounded-circle box-shadow-md mb-24'>
              <img
                src='assets/images/icons/category-icon2.png'
                className='animate__flipInY'
                alt=''
              />
            </span>
            <h4 className='display-four mb-16 text-neutral-700'>Thiết Kế Nghệ Thuật</h4>
            <p className='text-neutral-500 text-lg text-line-2'>
              Các khóa học về dinh dưỡng, thể dục, yoga...
            </p>
            <Link
              to='/courses'
              className='py-12 px-24 bg-white rounded-8 border border-neutral-30 mt-28 fw-semibold text-main-two-600 hover-bg-main-two-600 hover-text-white hover-border-main-two-600'
            >
              15 Khóa học
            </Link>
          </div>
          <div
            className='category-item animation-item h-100 text-center px-16 py-32 rounded-12 bg-main-three-25 border border-neutral-30 hover-border-main-three-600 transition-2'
            data-aos='fade-up'
            data-aos-duration={600}
          >
            <span className='w-96 h-96 flex-center d-inline-flex bg-white text-main-three-600 text-40 rounded-circle box-shadow-md mb-24'>
              <img
                src='assets/images/icons/category-icon3.png'
                className='animate__flipInY'
                alt=''
              />
            </span>
            <h4 className='display-four mb-16 text-neutral-700'>
              Khoa Học Dữ Liệu
            </h4>
            <p className='text-neutral-500 text-lg text-line-2'>
              Các khóa học về dinh dưỡng, thể dục, yoga...
            </p>
            <Link
              to='/courses'
              className='py-12 px-24 bg-white rounded-8 border border-neutral-30 mt-28 fw-semibold text-main-three-600 hover-bg-main-three-600 hover-text-white hover-border-main-three-600'
            >
              14 Khóa học
            </Link>
          </div>
          <div
            className='category-item animation-item h-100 text-center px-16 py-32 rounded-12 bg-main-two-25 border border-neutral-30 hover-border-main-two-600 transition-2'
            data-aos='fade-up'
            data-aos-duration={800}
          >
            <span className='w-96 h-96 flex-center d-inline-flex bg-white text-main-600 text-40 rounded-circle box-shadow-md mb-24'>
              <img
                src='assets/images/icons/category-icon4.png'
                className='animate__flipInY'
                alt=''
              />
            </span>
            <h4 className='display-four mb-16 text-neutral-700'>
              Kinh Doanh &amp; Tài Chính
            </h4>
            <p className='text-neutral-500 text-lg text-line-2'>
              Các khóa học về dinh dưỡng, thể dục, yoga...
            </p>
            <Link
              to='/courses'
              className='py-12 px-24 bg-white rounded-8 border border-neutral-30 mt-28 fw-semibold text-main-two-600 hover-bg-main-two-600 hover-text-white hover-border-main-two-600'
            >
              21 Khóa học
            </Link>
          </div>
          <div
            className='category-item animation-item h-100 text-center px-16 py-32 rounded-12 bg-main-three-25 border border-neutral-30 hover-border-main-three-600 transition-2'
            data-aos='fade-up'
            data-aos-duration={400}
          >
            <span className='w-96 h-96 flex-center d-inline-flex bg-white text-main-three-600 text-40 rounded-circle box-shadow-md mb-24'>
              <img
                src='assets/images/icons/category-icon3.png'
                className='animate__flipInY'
                alt=''
              />
            </span>
            <h4 className='display-four mb-16 text-neutral-700'>
              Khoa Học Dữ Liệu
            </h4>
            <p className='text-neutral-500 text-lg text-line-2'>
              Các khóa học về dinh dưỡng, thể dục, yoga...
            </p>
            <Link
              to='/courses'
              className='py-12 px-24 bg-white rounded-8 border border-neutral-30 mt-28 fw-semibold text-main-three-600 hover-bg-main-three-600 hover-text-white hover-border-main-three-600'
            >
              14 Khóa học
            </Link>
          </div>
          <div
            className='category-item animation-item h-100 text-center px-16 py-32 rounded-12 bg-main-two-25 border border-neutral-30 hover-border-main-two-600 transition-2'
            data-aos='fade-up'
            data-aos-duration={600}
          >
            <span className='w-96 h-96 flex-center d-inline-flex bg-white text-main-600 text-40 rounded-circle box-shadow-md mb-24'>
              <img
                src='assets/images/icons/category-icon2.png'
                className='animate__flipInY'
                alt=''
              />
            </span>
            <h4 className='display-four mb-16 text-neutral-700'>Thiết Kế Nghệ Thuật</h4>
            <p className='text-neutral-500 text-lg text-line-2'>
              Các khóa học về dinh dưỡng, thể dục, yoga...
            </p>
            <Link
              to='/courses'
              className='py-12 px-24 bg-white rounded-8 border border-neutral-30 mt-28 fw-semibold text-main-two-600 hover-bg-main-two-600 hover-text-white hover-border-main-two-600'
            >
              15 Khóa học
            </Link>
          </div>
        </Slider>
        <div className='flex-align gap-16 mt-40 justify-content-center'>
          <button
            type='button'
            id='category-prev'
            onClick={() => sliderRef.current.slickPrev()}
            className=' slick-arrow flex-center rounded-circle border border-gray-100 hover-border-main-600 text-xl hover-bg-main-600 hover-text-white transition-1 w-48 h-48'
          >
            <i className='ph ph-caret-left' />
          </button>
          <button
            type='button'
            id='category-next'
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

export default CategoryOne;
