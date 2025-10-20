import React, { useRef } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";

const PopularTeacherTwo = () => {
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
    <section className='explore-course py-120 bg-main-25 position-relative z-0'>
      <div className='position-absolute start-0 top-0 w-100 z-index-n9'>
        <img
          src='assets/images/shapes/cloud-shap-img3.png'
          alt=''
          className='w-100'
        />
      </div>
      <div className='container'>
        <div className='max-w-611 text-center mx-auto mb-60'>
          <div
            className='text-main-600 fw-semibold text-xl d-flex align-items-center gap-8 mb-16 justify-content-center flex-wrap'
            data-aos='fade-down'
          >
            <span>
              <i className='ph-bold ph-book' />
            </span>
            <span>Our Popular Tutors</span>
          </div>
          <h2 className='mb-24 wow bounceIn'>
            Here are few of the Verified Teachers
          </h2>
          <p className='max-w-557-px text-md text-neutral-700 fw-normal wow bounceInUp'>
            Our tutoring sessions are interactive and engaging, focusing on the
            student's specific needs.
          </p>
        </div>
        <div>
          <Slider
            ref={sliderRef}
            {...settings}
            className='our-popular-tutors-six-slider d-flex align-items-center gap-24 mb-40'
          >
            <div className='' data-aos='fade-up' data-aos-duration={600}>
              <div className='mb-64 text-center position-relative'>
                <img
                  src='assets/images/thumbs/our-popular-tutors-six-img1.png'
                  alt=''
                  className='align-items-center justify-content-center d-flex m-auto'
                />
                <ul className='triangle-shape-right triangle-shape-left max-w-220-px py-11 ps-32 pe-32 bg-warning-800 d-flex align-items-center gap-12 justify-content-center text-center position-absolute inset-block-end-90-persent inset-inline-start-50-percent translate-middle-x line-height-1'>
                  <li>
                    <Link
                      to='/sign-in'
                      className='text-28 text-white hover-text-main-500 transition-04'
                    >
                      <i className='ph ph-facebook-logo' />
                    </Link>
                  </li>
                  <li>
                    <Link
                      to='/sign-in'
                      className='text-28 text-white hover-text-main-500 transition-04'
                    >
                      <i className='ph ph-twitter-logo' />
                    </Link>
                  </li>
                  <li>
                    <Link
                      to='/sign-in'
                      className='text-28 text-white hover-text-main-500 transition-04'
                    >
                      <i className='ph ph-instagram-logo' />
                    </Link>
                  </li>
                  <li>
                    <Link
                      to='/sign-in'
                      className='text-28 text-white hover-text-main-500 transition-04'
                    >
                      <i className='ph ph-pinterest-logo' />
                    </Link>
                  </li>
                </ul>
              </div>
              <div className='text-center'>
                <h6 className='text-24 fw-semibold text-neutral-700 mb-4'>
                  Albert Flores
                </h6>
                <span className='text-neutral-500 fw-normal text-14'>
                  English Expert
                </span>
              </div>
            </div>
            <div className='' data-aos='fade-up' data-aos-duration={700}>
              <div className='mb-64 text-center position-relative'>
                <img
                  src='assets/images/thumbs/our-popular-tutors-six-img2.png'
                  alt=''
                  className='align-items-center justify-content-center d-flex m-auto'
                />
                <ul className='triangle-shape-right triangle-shape-left max-w-220-px py-11 ps-32 pe-32 bg-warning-800 d-flex align-items-center gap-12 justify-content-center text-center position-absolute inset-block-end-90-persent inset-inline-start-50-percent line-height-1 translate-middle-x'>
                  <li>
                    <Link
                      to='/sign-in'
                      className='text-28 text-white hover-text-main-500 transition-04'
                    >
                      <i className='ph ph-facebook-logo' />
                    </Link>
                  </li>
                  <li>
                    <Link
                      to='/sign-in'
                      className='text-28 text-white hover-text-main-500 transition-04'
                    >
                      <i className='ph ph-twitter-logo' />
                    </Link>
                  </li>
                  <li>
                    <Link
                      to='/sign-in'
                      className='text-28 text-white hover-text-main-500 transition-04'
                    >
                      <i className='ph ph-instagram-logo' />
                    </Link>
                  </li>
                  <li>
                    <Link
                      to='/sign-in'
                      className='text-28 text-white hover-text-main-500 transition-04'
                    >
                      <i className='ph ph-pinterest-logo' />
                    </Link>
                  </li>
                </ul>
              </div>
              <div className='text-center'>
                <h6 className='text-24 fw-semibold text-neutral-700 mb-4'>
                  Albert Flores
                </h6>
                <span className='text-neutral-500 fw-normal text-14'>
                  English Expert
                </span>
              </div>
            </div>
            <div className='' data-aos='fade-up' data-aos-duration={800}>
              <div className='mb-64 text-center position-relative'>
                <img
                  src='assets/images/thumbs/our-popular-tutors-six-img3.png'
                  alt=''
                  className='align-items-center justify-content-center d-flex m-auto'
                />
                <ul className='triangle-shape-right triangle-shape-left max-w-220-px py-11 ps-32 pe-32 bg-warning-800 d-flex align-items-center gap-12 justify-content-center text-center position-absolute inset-block-end-90-persent inset-inline-start-50-percent line-height-1 translate-middle-x'>
                  <li>
                    <Link
                      to='/sign-in'
                      className='text-28 text-white hover-text-main-500 transition-04'
                    >
                      <i className='ph ph-facebook-logo' />
                    </Link>
                  </li>
                  <li>
                    <Link
                      to='/sign-in'
                      className='text-28 text-white hover-text-main-500 transition-04'
                    >
                      <i className='ph ph-twitter-logo' />
                    </Link>
                  </li>
                  <li>
                    <Link
                      to='/sign-in'
                      className='text-28 text-white hover-text-main-500 transition-04'
                    >
                      <i className='ph ph-instagram-logo' />
                    </Link>
                  </li>
                  <li>
                    <Link
                      to='/sign-in'
                      className='text-28 text-white hover-text-main-500 transition-04'
                    >
                      <i className='ph ph-pinterest-logo' />
                    </Link>
                  </li>
                </ul>
              </div>
              <div className='text-center'>
                <h6 className='text-24 fw-semibold text-neutral-700 mb-4'>
                  Albert Flores
                </h6>
                <span className='text-neutral-500 fw-normal text-14'>
                  English Expert
                </span>
              </div>
            </div>
            <div className='' data-aos='fade-up' data-aos-duration={900}>
              <div className='mb-64 text-center position-relative'>
                <img
                  src='assets/images/thumbs/our-popular-tutors-six-img4.png'
                  alt=''
                  className='align-items-center justify-content-center d-flex m-auto'
                />
                <ul className='triangle-shape-right triangle-shape-left max-w-220-px py-11 ps-32 pe-32 bg-warning-800 d-flex align-items-center gap-12 justify-content-center text-center position-absolute inset-block-end-90-persent inset-inline-start-50-percent line-height-1 translate-middle-x'>
                  <li>
                    <Link
                      to='/sign-in'
                      className='text-28 text-white hover-text-main-500 transition-04'
                    >
                      <i className='ph ph-facebook-logo' />
                    </Link>
                  </li>
                  <li>
                    <Link
                      to='/sign-in'
                      className='text-28 text-white hover-text-main-500 transition-04'
                    >
                      <i className='ph ph-twitter-logo' />
                    </Link>
                  </li>
                  <li>
                    <Link
                      to='/sign-in'
                      className='text-28 text-white hover-text-main-500 transition-04'
                    >
                      <i className='ph ph-instagram-logo' />
                    </Link>
                  </li>
                  <li>
                    <Link
                      to='/sign-in'
                      className='text-28 text-white hover-text-main-500 transition-04'
                    >
                      <i className='ph ph-pinterest-logo' />
                    </Link>
                  </li>
                </ul>
              </div>
              <div className='text-center'>
                <h6 className='text-24 fw-semibold text-neutral-700 mb-4'>
                  Albert Flores
                </h6>
                <span className='text-neutral-500 fw-normal text-14'>
                  English Expert
                </span>
              </div>
            </div>
            <div className='' data-aos='fade-up' data-aos-duration={700}>
              <div className='mb-64 text-center position-relative'>
                <img
                  src='assets/images/thumbs/our-popular-tutors-six-img2.png'
                  alt=''
                  className='align-items-center justify-content-center d-flex m-auto'
                />
                <ul className='triangle-shape-right triangle-shape-left max-w-220-px py-11 ps-32 pe-32 bg-warning-800 d-flex align-items-center gap-12 justify-content-center text-center position-absolute inset-block-end-90-persent inset-inline-start-50-percent line-height-1 translate-middle-x'>
                  <li>
                    <Link
                      to='/sign-in'
                      className='text-28 text-white hover-text-main-500 transition-04'
                    >
                      <i className='ph ph-facebook-logo' />
                    </Link>
                  </li>
                  <li>
                    <Link
                      to='/sign-in'
                      className='text-28 text-white hover-text-main-500 transition-04'
                    >
                      <i className='ph ph-twitter-logo' />
                    </Link>
                  </li>
                  <li>
                    <Link
                      to='/sign-in'
                      className='text-28 text-white hover-text-main-500 transition-04'
                    >
                      <i className='ph ph-instagram-logo' />
                    </Link>
                  </li>
                  <li>
                    <Link
                      to='/sign-in'
                      className='text-28 text-white hover-text-main-500 transition-04'
                    >
                      <i className='ph ph-pinterest-logo' />
                    </Link>
                  </li>
                </ul>
              </div>
              <div className='text-center'>
                <h6 className='text-24 fw-semibold text-neutral-700 mb-4'>
                  Albert Flores
                </h6>
                <span className='text-neutral-500 fw-normal text-14'>
                  English Expert
                </span>
              </div>
            </div>
          </Slider>
          <div className=' d-flex align-items-center gap-16 text-center justify-content-center'>
            <button
              type='button'
              id='our-popular-tutors-six-prev'
              onClick={() => sliderRef.current.slickPrev()}
              className=' w-48 h-48 border-main-600 border text-main-600 rounded-circle text-24 align-items-center justify-content-center d-flex hover-bg-main-600 hover-text-white transition-04'
            >
              <i className='ph ph-caret-left' />
            </button>
            <button
              type='button'
              id='our-popular-tutors-six-next'
              onClick={() => sliderRef.current.slickNext()}
              className=' w-48 h-48 border-main-600 border text-main-600 rounded-circle text-24 align-items-center justify-content-center d-flex hover-bg-main-600 hover-text-white transition-04'
            >
              <i className='ph ph-caret-right' />
            </button>
          </div>
        </div>
      </div>
      <div className='position-absolute start-0 bottom-0 w-100 z-index-n9'>
        <img
          src='assets/images/shapes/cloud-shap-img4.png'
          alt=''
          className='w-100'
        />
      </div>
    </section>
  );
};

export default PopularTeacherTwo;
