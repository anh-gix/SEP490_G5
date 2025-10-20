import React, { useRef } from "react";
import Slider from "react-slick";

const TestimonialsFive = () => {
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
    draggable: false,
    infinite: true,
    centerMode: true,
    centerPadding: "0px",

    responsive: [
      {
        breakpoint: 992,
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
    <section className='position-relative z-4 bg-main-25 w-100 h-100'>
      <div className='position-absolute w-100  top-0 start-0'>
        <img
          src='assets/images/shapes/cloud-shap-img3.png'
          alt=''
          className='w-100'
        />
      </div>
      <div className='py-120 position-relative z-3'>
        <div className='container'>
          <div className='max-w-611 text-center mx-auto mb-60'>
            <div
              className='text-main-600 fw-semibold text-xl d-flex align-items-center gap-8 mb-16 justify-content-center flex-wrap'
              data-aos='fade-down'
            >
              <span>
                <i className='ph-bold ph-book' />
              </span>
              <span>Testimonials</span>
            </div>
            <h2 className='mb-24 wow bounceIn'>Building a Brighter Future</h2>
            <p className='max-w-557-px text-md text-neutral-700 fw-normal wow bounceInUp'>
              Our platform is built on the principles of innovation, quality,
              and inclusivity, aiming to provide a seamless learning
            </p>
          </div>
          <Slider
            ref={sliderRef}
            {...settings}
            className='tastimonial-six-slider d-flex align-items-center gap-24 mb-40'
          >
            <div className=''>
              <div className='triangle-shape z-2 text-center px-28 pt-32 pb-32 mb-64 bg-main-200 rounded-pill position-relative'>
                <ul className='mb-16 d-flex align-items-center gap-8 text-center justify-content-center'>
                  <li className='text-24 text-warning-500'>
                    <img
                      src='assets/images/icons/testimonials-six-icon-start-img1.png'
                      alt=''
                    />
                  </li>
                  <li className='text-24 text-warning-500'>
                    <img
                      src='assets/images/icons/testimonials-six-icon-start-img1.png'
                      alt=''
                    />
                  </li>
                  <li className='text-24 text-warning-500'>
                    <img
                      src='assets/images/icons/testimonials-six-icon-start-img1.png'
                      alt=''
                    />
                  </li>
                  <li className='text-24 text-warning-500'>
                    <img
                      src='assets/images/icons/testimonials-six-icon-start-img1.png'
                      alt=''
                    />
                  </li>
                  <li className='text-24 text-warning-500'>
                    <img
                      src='assets/images/icons/testimonials-six-icon-start-img2.png'
                      alt=''
                    />
                  </li>
                </ul>
                <p className='text-center justify-content-center align-items-center d-flex text-neutral-700 fw-medium text-18'>
                  "I was initially skeptical about online learning, but changed
                  my perspective completely. The courses are well-designed."
                </p>
              </div>
              <div className='text-center pt-24'>
                <img
                  src='assets/images/thumbs/testimonial-five-img2.png'
                  alt=''
                  className='mb-16 justify-content-center mx-auto w-72 h-72'
                />
                <h5 className='fw-semibold mb-4'>Marvin McKinney</h5>
                <span className='text-neutral-500 fw-normal text-16'>
                  Ethical Hacker
                </span>
              </div>
            </div>
            <div className=''>
              <div className='triangle-shape shape-bg-red-light z-2 text-center px-28 pt-32 pb-32 mb-64 bg-danger-200 rounded-pill position-relative'>
                <ul className='mb-16 d-flex align-items-center gap-8 text-center justify-content-center'>
                  <li className='text-24 text-warning-500'>
                    <img
                      src='assets/images/icons/testimonials-six-icon-start-img1.png'
                      alt=''
                    />
                  </li>
                  <li className='text-24 text-warning-500'>
                    <img
                      src='assets/images/icons/testimonials-six-icon-start-img1.png'
                      alt=''
                    />
                  </li>
                  <li className='text-24 text-warning-500'>
                    <img
                      src='assets/images/icons/testimonials-six-icon-start-img1.png'
                      alt=''
                    />
                  </li>
                  <li className='text-24 text-warning-500'>
                    <img
                      src='assets/images/icons/testimonials-six-icon-start-img1.png'
                      alt=''
                    />
                  </li>
                  <li className='text-24 text-warning-500'>
                    <img
                      src='assets/images/icons/testimonials-six-icon-start-img2.png'
                      alt=''
                    />
                  </li>
                </ul>
                <p className='text-center justify-content-center align-items-center d-flex text-neutral-700 fw-medium text-18'>
                  "I was initially skeptical about online learning, but changed
                  my perspective completely. The courses are well-designed."
                </p>
              </div>
              <div className='text-center pt-24'>
                <img
                  src='assets/images/thumbs/testimonials-six-img1.png'
                  alt=''
                  className='mb-16 justify-content-center mx-auto w-72 h-72'
                />
                <h5 className='fw-semibold mb-4'>Marvin McKinney</h5>
                <span className='text-neutral-500 fw-normal text-16'>
                  Ethical Hacker
                </span>
              </div>
            </div>
            <div className=''>
              <div className='triangle-shape shape-bg-green-light z-2 text-center px-28 pt-32 pb-32 mb-64 bg-success-200 rounded-pill position-relative'>
                <ul className='mb-16 d-flex align-items-center gap-8 text-center justify-content-center'>
                  <li className='text-24 text-warning-500'>
                    <img
                      src='assets/images/icons/testimonials-six-icon-start-img1.png'
                      alt=''
                    />
                  </li>
                  <li className='text-24 text-warning-500'>
                    <img
                      src='assets/images/icons/testimonials-six-icon-start-img1.png'
                      alt=''
                    />
                  </li>
                  <li className='text-24 text-warning-500'>
                    <img
                      src='assets/images/icons/testimonials-six-icon-start-img1.png'
                      alt=''
                    />
                  </li>
                  <li className='text-24 text-warning-500'>
                    <img
                      src='assets/images/icons/testimonials-six-icon-start-img1.png'
                      alt=''
                    />
                  </li>
                  <li className='text-24 text-warning-500'>
                    <img
                      src='assets/images/icons/testimonials-six-icon-start-img2.png'
                      alt=''
                    />
                  </li>
                </ul>
                <p className='text-center justify-content-center align-items-center d-flex text-neutral-700 fw-medium text-18'>
                  "I was initially skeptical about online learning, but changed
                  my perspective completely. The courses are well-designed."
                </p>
              </div>
              <div className='text-center pt-24'>
                <img
                  src='assets/images/thumbs/testimonials-six-img2.png'
                  alt=''
                  className='mb-16 justify-content-center mx-auto w-72 h-72'
                />
                <h5 className='fw-semibold mb-4'>Marvin McKinney</h5>
                <span className='text-neutral-500 fw-normal text-16'>
                  Ethical Hacker
                </span>
              </div>
            </div>
            <div className=''>
              <div className='triangle-shape shape-bg-red-light z-2 text-center px-28 pt-32 pb-32 mb-64 bg-danger-200 rounded-pill position-relative'>
                <ul className='mb-16 d-flex align-items-center gap-8 text-center justify-content-center'>
                  <li className='text-24 text-warning-500'>
                    <img
                      src='assets/images/icons/testimonials-six-icon-start-img1.png'
                      alt=''
                    />
                  </li>
                  <li className='text-24 text-warning-500'>
                    <img
                      src='assets/images/icons/testimonials-six-icon-start-img1.png'
                      alt=''
                    />
                  </li>
                  <li className='text-24 text-warning-500'>
                    <img
                      src='assets/images/icons/testimonials-six-icon-start-img1.png'
                      alt=''
                    />
                  </li>
                  <li className='text-24 text-warning-500'>
                    <img
                      src='assets/images/icons/testimonials-six-icon-start-img1.png'
                      alt=''
                    />
                  </li>
                  <li className='text-24 text-warning-500'>
                    <img
                      src='assets/images/icons/testimonials-six-icon-start-img2.png'
                      alt=''
                    />
                  </li>
                </ul>
                <p className='text-center justify-content-center align-items-center d-flex text-neutral-700 fw-medium text-18'>
                  "I was initially skeptical about online learning, but changed
                  my perspective completely. The courses are well-designed."
                </p>
              </div>
              <div className='text-center pt-24'>
                <img
                  src='assets/images/thumbs/testimonials-six-img1.png'
                  alt=''
                  className='mb-16 justify-content-center mx-auto w-72 h-72'
                />
                <h5 className='fw-semibold mb-4'>Marvin McKinney</h5>
                <span className='text-neutral-500 fw-normal text-16'>
                  Ethical Hacker
                </span>
              </div>
            </div>
          </Slider>
          <div className=' d-flex align-items-center gap-16 text-center justify-content-center'>
            <button
              type='button'
              id='tastimonial-six-prev'
              onClick={() => sliderRef.current.slickPrev()}
              className=' w-48 h-48 border-main-600 border text-main-600 rounded-circle text-24 align-items-center justify-content-center d-flex hover-bg-main-600 hover-text-white transition-04'
            >
              <i className='ph ph-caret-left' />
            </button>
            <button
              type='button'
              id='tastimonial-six-next'
              onClick={() => sliderRef.current.slickNext()}
              className=' w-48 h-48 border-main-600 border text-main-600 rounded-circle text-24 align-items-center justify-content-center d-flex hover-bg-main-600 hover-text-white transition-04'
            >
              <i className='ph ph-caret-right' />
            </button>
          </div>
        </div>
      </div>
      <div className='position-absolute w-100 z-0 bottom-0 start-0'>
        <img
          src='assets/images/shapes/cloud-shap-img4.png'
          alt=''
          className='w-100'
        />
      </div>
    </section>
  );
};

export default TestimonialsFive;
