import { useRef } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";

const BlogTwo = () => {
  const sliderRef = useRef(null);
  const settings = {
    slidesToShow: 3,
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
        breakpoint: 1299,
        settings: {
          slidesToShow: 2,
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
    <section className='blog-two py-120 bg-main-25'>
      <div className='container'>
        <div className='section-heading text-center'>
          <div className='flex-align d-inline-flex gap-8 mb-16 wow bounceInDown'>
            <span className='text-main-600 text-2xl d-flex'>
              <i className='ph-bold ph-book-open' />
            </span>
            <h5 className='text-main-600 mb-0'>Latest News</h5>
          </div>
          <h2 className='mb-24 wow bounceIn'>Stay Informed, Stay Inspired</h2>
          <p className=' wow bounceInUp'>
            Welcome to our blog, where we share insights, stories, and updates
            on topics ranging from education
          </p>
        </div>
        <Slider ref={sliderRef} {...settings} className='blog-two-slider'>
          <div
            className='scale-hover-item bg-white rounded-16 p-12 h-100'
            data-aos='fade-up'
            data-aos-duration={200}
          >
            <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
              <Link to='/blog-details' className='w-100 h-100'>
                <img
                  src='assets/images/thumbs/blog-two-img1.png'
                  alt='Course'
                  className='scale-hover-item__img rounded-12 cover-img transition-2'
                />
              </Link>
              <div className='position-absolute inset-inline-end-0 inset-block-end-0 me-16 mb-16 py-12 px-24 rounded-8 bg-main-three-600 text-white fw-medium'>
                <h3 className='mb-0 text-white fw-medium'>21</h3>
                DEC
              </div>
            </div>
            <div className='pt-32 pb-24 px-16 position-relative'>
              <h4 className='mb-28'>
                <Link to='/blog-details' className='link text-line-2'>
                  Navigating the Job Market: Advice for Graduates
                </Link>
              </h4>
              <div className='flex-align gap-14 flex-wrap my-20'>
                <div className='flex-align gap-8'>
                  <span className='text-neutral-500 text-2xl d-flex'>
                    <i className='ph ph-user-circle' />
                  </span>
                  <span className='text-neutral-500 text-lg'>By Admin</span>
                </div>
                <span className='w-8 h-8 bg-neutral-100 rounded-circle' />
                <div className='flex-align gap-8'>
                  <span className='text-neutral-500 text-2xl d-flex'>
                    <i className='ph-bold ph-eye' />
                  </span>
                  <span className='text-neutral-500 text-lg'>1.6k</span>
                </div>
                <span className='w-8 h-8 bg-neutral-100 rounded-circle' />
                <div className='flex-align gap-8'>
                  <span className='text-neutral-500 text-2xl d-flex'>
                    <i className='ph ph-chat-dots' />
                  </span>
                  <span className='text-neutral-500 text-lg'>24</span>
                </div>
              </div>
              <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                <Link
                  to='/blog-details'
                  className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                  tabIndex={0}
                >
                  Read More
                  <i className='ph ph-arrow-right' />
                </Link>
              </div>
            </div>
          </div>
          <div
            className='scale-hover-item bg-white rounded-16 p-12 h-100'
            data-aos='fade-up'
            data-aos-duration={400}
          >
            <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
              <Link to='/blog-details' className='w-100 h-100'>
                <img
                  src='assets/images/thumbs/blog-two-img2.png'
                  alt='Course'
                  className='scale-hover-item__img rounded-12 cover-img transition-2'
                />
              </Link>
              <div className='position-absolute inset-inline-end-0 inset-block-end-0 me-16 mb-16 py-12 px-24 rounded-8 bg-main-three-600 text-white fw-medium'>
                <h3 className='mb-0 text-white fw-medium'>21</h3>
                DEC
              </div>
            </div>
            <div className='pt-32 pb-24 px-16 position-relative'>
              <h4 className='mb-28'>
                <Link to='/blog-details' className='link text-line-2'>
                  The Importance of Diversity in Higher Education
                </Link>
              </h4>
              <div className='flex-align gap-14 flex-wrap my-20'>
                <div className='flex-align gap-8'>
                  <span className='text-neutral-500 text-2xl d-flex'>
                    <i className='ph ph-user-circle' />
                  </span>
                  <span className='text-neutral-500 text-lg'>By Admin</span>
                </div>
                <span className='w-8 h-8 bg-neutral-100 rounded-circle' />
                <div className='flex-align gap-8'>
                  <span className='text-neutral-500 text-2xl d-flex'>
                    <i className='ph-bold ph-eye' />
                  </span>
                  <span className='text-neutral-500 text-lg'>1.6k</span>
                </div>
                <span className='w-8 h-8 bg-neutral-100 rounded-circle' />
                <div className='flex-align gap-8'>
                  <span className='text-neutral-500 text-2xl d-flex'>
                    <i className='ph ph-chat-dots' />
                  </span>
                  <span className='text-neutral-500 text-lg'>24</span>
                </div>
              </div>
              <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                <Link
                  to='/blog-details'
                  className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                  tabIndex={0}
                >
                  Read More
                  <i className='ph ph-arrow-right' />
                </Link>
              </div>
            </div>
          </div>
          <div
            className='scale-hover-item bg-white rounded-16 p-12 h-100'
            data-aos='fade-up'
            data-aos-duration={600}
          >
            <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
              <Link to='/blog-details' className='w-100 h-100'>
                <img
                  src='assets/images/thumbs/blog-two-img3.png'
                  alt='Course'
                  className='scale-hover-item__img rounded-12 cover-img transition-2'
                />
              </Link>
              <div className='position-absolute inset-inline-end-0 inset-block-end-0 me-16 mb-16 py-12 px-24 rounded-8 bg-main-three-600 text-white fw-medium'>
                <h3 className='mb-0 text-white fw-medium'>21</h3>
                DEC
              </div>
            </div>
            <div className='pt-32 pb-24 px-16 position-relative'>
              <h4 className='mb-28'>
                <Link to='/blog-details' className='link text-line-2'>
                  10 Tips for Successful Online Learning
                </Link>
              </h4>
              <div className='flex-align gap-14 flex-wrap my-20'>
                <div className='flex-align gap-8'>
                  <span className='text-neutral-500 text-2xl d-flex'>
                    <i className='ph ph-user-circle' />
                  </span>
                  <span className='text-neutral-500 text-lg'>By Admin</span>
                </div>
                <span className='w-8 h-8 bg-neutral-100 rounded-circle' />
                <div className='flex-align gap-8'>
                  <span className='text-neutral-500 text-2xl d-flex'>
                    <i className='ph-bold ph-eye' />
                  </span>
                  <span className='text-neutral-500 text-lg'>1.6k</span>
                </div>
                <span className='w-8 h-8 bg-neutral-100 rounded-circle' />
                <div className='flex-align gap-8'>
                  <span className='text-neutral-500 text-2xl d-flex'>
                    <i className='ph ph-chat-dots' />
                  </span>
                  <span className='text-neutral-500 text-lg'>24</span>
                </div>
              </div>
              <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                <Link
                  to='/blog-details'
                  className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                  tabIndex={0}
                >
                  Read More
                  <i className='ph ph-arrow-right' />
                </Link>
              </div>
            </div>
          </div>
          <div
            className='scale-hover-item bg-white rounded-16 p-12 h-100'
            data-aos='fade-up'
            data-aos-duration={800}
          >
            <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
              <Link to='/blog-details' className='w-100 h-100'>
                <img
                  src='assets/images/thumbs/blog-two-img2.png'
                  alt='Course'
                  className='scale-hover-item__img rounded-12 cover-img transition-2'
                />
              </Link>
              <div className='position-absolute inset-inline-end-0 inset-block-end-0 me-16 mb-16 py-12 px-24 rounded-8 bg-main-three-600 text-white fw-medium'>
                <h3 className='mb-0 text-white fw-medium'>21</h3>
                DEC
              </div>
            </div>
            <div className='pt-32 pb-24 px-16 position-relative'>
              <h4 className='mb-28'>
                <Link to='/blog-details' className='link text-line-2'>
                  The Importance of Diversity in Higher Education
                </Link>
              </h4>
              <div className='flex-align gap-14 flex-wrap my-20'>
                <div className='flex-align gap-8'>
                  <span className='text-neutral-500 text-2xl d-flex'>
                    <i className='ph ph-user-circle' />
                  </span>
                  <span className='text-neutral-500 text-lg'>By Admin</span>
                </div>
                <span className='w-8 h-8 bg-neutral-100 rounded-circle' />
                <div className='flex-align gap-8'>
                  <span className='text-neutral-500 text-2xl d-flex'>
                    <i className='ph-bold ph-eye' />
                  </span>
                  <span className='text-neutral-500 text-lg'>1.6k</span>
                </div>
                <span className='w-8 h-8 bg-neutral-100 rounded-circle' />
                <div className='flex-align gap-8'>
                  <span className='text-neutral-500 text-2xl d-flex'>
                    <i className='ph ph-chat-dots' />
                  </span>
                  <span className='text-neutral-500 text-lg'>24</span>
                </div>
              </div>
              <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                <Link
                  to='/blog-details'
                  className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                  tabIndex={0}
                >
                  Read More
                  <i className='ph ph-arrow-right' />
                </Link>
              </div>
            </div>
          </div>
        </Slider>
        <div className='flex-align gap-16 mt-40 justify-content-center'>
          <button
            type='button'
            id='blog-two-prev'
            onClick={() => sliderRef.current.slickPrev()}
            className=' slick-arrow flex-center rounded-circle border border-gray-100 hover-border-main-600 text-xl hover-bg-main-600 hover-text-white transition-1 w-48 h-48'
          >
            <i className='ph ph-caret-left' />
          </button>
          <button
            type='button'
            id='blog-two-next'
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

export default BlogTwo;
