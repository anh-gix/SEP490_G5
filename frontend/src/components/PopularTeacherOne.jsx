import { useRef } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";

const PopularTeacherOne = () => {
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
    <section
      className='tutor-two py-120 position-relative z-1 background-img'
      data-background-image='assets/images/bg/gradient-bg-2.png'
    >
      <div className='container'>
        <div className='section-heading text-center'>
          <div className='flex-align d-inline-flex gap-8 mb-16 wow bounceInDown'>
            <span className='text-main-600 text-2xl d-flex'>
              <i className='ph-bold ph-book-open' />
            </span>
            <h5 className='text-main-600 mb-0'>Our Popular Tutors</h5>
          </div>
          <h2 className='mb-24 wow bounceIn'>
            Here are few of the Verified Teachers
          </h2>
          <p className=' wow bounceInUp'>
            Our tutoring sessions are interactive and engaging, focusing on the
            student's specific needs.
          </p>
        </div>
        <Slider ref={sliderRef} {...settings} className='tutor-slider'>
          <div
            className='scale-hover-item bg-white rounded-16 p-12 h-100 border border-neutral-20'
            data-aos='fade-up'
            data-aos-duration={200}
          >
            <div className='course-item__thumb rounded-12 bg-main-25 overflow-hidden position-relative'>
              <Link to='/tutor-details' className='w-100 h-100'>
                <img
                  src='assets/images/thumbs/instructor-img1.png'
                  alt='Course'
                  className='scale-hover-item__img rounded-12 cover-img transition-2'
                />
              </Link>
            </div>
            <div className='pt-32 pb-24 px-16 position-relative'>
              <div className=''>
                <h4 className='mb-16'>
                  <Link to='/tutor-details' className='link text-line-2'>
                    Ronald Richards
                  </Link>
                </h4>
                <div className='flex-between gap-8 flex-wrap'>
                  <div className='flex-align gap-12'>
                    <span className='text-2xl text-main-600 d-flex'>
                      <i className='ph-bold ph-graduation-cap' />
                    </span>
                    <span className=''>Global University</span>
                  </div>
                  <div className='flex-align gap-4'>
                    <span className='text-2xl fw-medium text-warning-600 d-flex'>
                      <i className='ph-fill ph-star' />
                    </span>
                    <span className='text-lg text-neutral-700'>
                      4.7
                      <span className='text-neutral-100'>(6.4k)</span>
                    </span>
                  </div>
                </div>
                <div className='mt-24 flex-between gap-16 flex-wrap'>
                  <h4 className='mb-0 text-main-two-600'>
                    $155{" "}
                    <span className='text-inherit text-neutral-200 fw-normal'>
                      per/hr
                    </span>
                  </h4>
                  <div className='flex-align gap-8 py-10 px-14 border border-main-100 rounded-8 bg-main-25'>
                    <span className='text-xl d-flex text-main-600'>
                      <i className='ph-bold ph-map-pin' />
                    </span>
                    <span className='text-sm fw-medium text-neutral-500'>
                      New York
                    </span>
                  </div>
                </div>
              </div>
              <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-24 border-dashed border-0'>
                <Link
                  to='/contact'
                  className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                  tabIndex={0}
                >
                  Apply Now
                  <i className='ph ph-arrow-right' />
                </Link>
              </div>
            </div>
          </div>
          <div
            className='scale-hover-item bg-white rounded-16 p-12 h-100 border border-neutral-20'
            data-aos='fade-up'
            data-aos-duration={400}
          >
            <div className='course-item__thumb rounded-12 bg-main-25 overflow-hidden position-relative'>
              <Link to='/tutor-details' className='w-100 h-100'>
                <img
                  src='assets/images/thumbs/instructor-img2.png'
                  alt='Course'
                  className='scale-hover-item__img rounded-12 cover-img transition-2'
                />
              </Link>
            </div>
            <div className='pt-32 pb-24 px-16 position-relative'>
              <div className=''>
                <h4 className='mb-16'>
                  <Link to='/tutor-details' className='link text-line-2'>
                    Jacob Jones
                  </Link>
                </h4>
                <div className='flex-between gap-8 flex-wrap'>
                  <div className='flex-align gap-12'>
                    <span className='text-2xl text-main-600 d-flex'>
                      <i className='ph-bold ph-graduation-cap' />
                    </span>
                    <span className=''>LKS University</span>
                  </div>
                  <div className='flex-align gap-4'>
                    <span className='text-2xl fw-medium text-warning-600 d-flex'>
                      <i className='ph-fill ph-star' />
                    </span>
                    <span className='text-lg text-neutral-700'>
                      4.7
                      <span className='text-neutral-100'>(6.4k)</span>
                    </span>
                  </div>
                </div>
                <div className='mt-24 flex-between gap-16 flex-wrap'>
                  <h4 className='mb-0 text-main-two-600'>
                    $155{" "}
                    <span className='text-inherit text-neutral-200 fw-normal'>
                      per/hr
                    </span>
                  </h4>
                  <div className='flex-align gap-8 py-10 px-14 border border-main-100 rounded-8 bg-main-25'>
                    <span className='text-xl d-flex text-main-600'>
                      <i className='ph-bold ph-map-pin' />
                    </span>
                    <span className='text-sm fw-medium text-neutral-500'>
                      Phoenix
                    </span>
                  </div>
                </div>
              </div>
              <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-24 border-dashed border-0'>
                <Link
                  to='/contact'
                  className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                  tabIndex={0}
                >
                  Apply Now
                  <i className='ph ph-arrow-right' />
                </Link>
              </div>
            </div>
          </div>
          <div
            className='scale-hover-item bg-white rounded-16 p-12 h-100 border border-neutral-20'
            data-aos='fade-up'
            data-aos-duration={600}
          >
            <div className='course-item__thumb rounded-12 bg-main-25 overflow-hidden position-relative'>
              <Link to='/tutor-details' className='w-100 h-100'>
                <img
                  src='assets/images/thumbs/instructor-img3.png'
                  alt='Course'
                  className='scale-hover-item__img rounded-12 cover-img transition-2'
                />
              </Link>
            </div>
            <div className='pt-32 pb-24 px-16 position-relative'>
              <div className=''>
                <h4 className='mb-16'>
                  <Link to='/tutor-details' className='link text-line-2'>
                    Darlene Robertson
                  </Link>
                </h4>
                <div className='flex-between gap-8 flex-wrap'>
                  <div className='flex-align gap-12'>
                    <span className='text-2xl text-main-600 d-flex'>
                      <i className='ph-bold ph-graduation-cap' />
                    </span>
                    <span className=''>Notware</span>
                  </div>
                  <div className='flex-align gap-4'>
                    <span className='text-2xl fw-medium text-warning-600 d-flex'>
                      <i className='ph-fill ph-star' />
                    </span>
                    <span className='text-lg text-neutral-700'>
                      4.7
                      <span className='text-neutral-100'>(6.4k)</span>
                    </span>
                  </div>
                </div>
                <div className='mt-24 flex-between gap-16 flex-wrap'>
                  <h4 className='mb-0 text-main-two-600'>
                    $155{" "}
                    <span className='text-inherit text-neutral-200 fw-normal'>
                      per/hr
                    </span>
                  </h4>
                  <div className='flex-align gap-8 py-10 px-14 border border-main-100 rounded-8 bg-main-25'>
                    <span className='text-xl d-flex text-main-600'>
                      <i className='ph-bold ph-map-pin' />
                    </span>
                    <span className='text-sm fw-medium text-neutral-500'>
                      Chicago
                    </span>
                  </div>
                </div>
              </div>
              <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-24 border-dashed border-0'>
                <Link
                  to='/contact'
                  className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                  tabIndex={0}
                >
                  Apply Now
                  <i className='ph ph-arrow-right' />
                </Link>
              </div>
            </div>
          </div>
          <div
            className='scale-hover-item bg-white rounded-16 p-12 h-100 border border-neutral-20'
            data-aos='fade-up'
            data-aos-duration={200}
          >
            <div className='course-item__thumb rounded-12 bg-main-25 overflow-hidden position-relative'>
              <Link to='/tutor-details' className='w-100 h-100'>
                <img
                  src='assets/images/thumbs/instructor-img4.png'
                  alt='Course'
                  className='scale-hover-item__img rounded-12 cover-img transition-2'
                />
              </Link>
            </div>
            <div className='pt-32 pb-24 px-16 position-relative'>
              <div className=''>
                <h4 className='mb-16'>
                  <Link to='/tutor-details' className='link text-line-2'>
                    Esther Howard
                  </Link>
                </h4>
                <div className='flex-between gap-8 flex-wrap'>
                  <div className='flex-align gap-12'>
                    <span className='text-2xl text-main-600 d-flex'>
                      <i className='ph-bold ph-graduation-cap' />
                    </span>
                    <span className=''>Global University</span>
                  </div>
                  <div className='flex-align gap-4'>
                    <span className='text-2xl fw-medium text-warning-600 d-flex'>
                      <i className='ph-fill ph-star' />
                    </span>
                    <span className='text-lg text-neutral-700'>
                      4.7
                      <span className='text-neutral-100'>(6.4k)</span>
                    </span>
                  </div>
                </div>
                <div className='mt-24 flex-between gap-16 flex-wrap'>
                  <h4 className='mb-0 text-main-two-600'>
                    $155{" "}
                    <span className='text-inherit text-neutral-200 fw-normal'>
                      per/hr
                    </span>
                  </h4>
                  <div className='flex-align gap-8 py-10 px-14 border border-main-100 rounded-8 bg-main-25'>
                    <span className='text-xl d-flex text-main-600'>
                      <i className='ph-bold ph-map-pin' />
                    </span>
                    <span className='text-sm fw-medium text-neutral-500'>
                      Phoenix
                    </span>
                  </div>
                </div>
              </div>
              <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-24 border-dashed border-0'>
                <Link
                  to='/contact'
                  className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                  tabIndex={0}
                >
                  Apply Now
                  <i className='ph ph-arrow-right' />
                </Link>
              </div>
            </div>
          </div>
        </Slider>
        <div className='flex-center gap-16 mt-40'>
          <button
            type='button'
            id='tutor-prev'
            onClick={() => sliderRef.current.slickNext()}
            className=' slick-arrow flex-center rounded-circle border border-gray-100 hover-border-main-600 text-xl hover-bg-main-600 hover-text-white transition-1 w-48 h-48'
            style={{}}
          >
            <i className='ph ph-caret-left' />
          </button>
          <button
            type='button'
            id='tutor-next'
            onClick={() => sliderRef.current.slickPrev()}
            className=' slick-arrow flex-center rounded-circle border border-gray-100 hover-border-main-600 text-xl hover-bg-main-600 hover-text-white transition-1 w-48 h-48'
            style={{}}
          >
            <i className='ph ph-caret-right' />
          </button>
        </div>
      </div>
    </section>
  );
};

export default PopularTeacherOne;
