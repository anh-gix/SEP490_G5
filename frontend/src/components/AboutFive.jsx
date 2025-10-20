import React from "react";
import { Link } from "react-router-dom";

const AboutFive = () => {
  return (
    <section className='bg-white position-relative z-1 overflow-hidden'>
      <img
        src='assets/images/shapes/shape1.png'
        alt=''
        className='animation-rotation d-sm-block d-none left-15-percent top-0 position-absolute'
      />
      <img
        src='assets/images/shapes/curve-arrow.png'
        alt=''
        className='animate__wobble__two d-sm-block d-none inset-inline-start-63-percent top-25-percent position-absolute z-n1'
      />
      <img
        src='assets/images/shapes/shape3.png'
        alt=''
        className='animation-walking d-sm-block d-none inset-inline-end-7-percent top-0 position-absolute'
      />
      <img
        src='assets/images/shapes/shape5.png'
        alt=''
        className='animation-walking d-sm-block d-none inset-inline-end-32-percent inset-block-end-0 position-absolute z-1'
      />
      <div className='container'>
        <div className='row gy-4 flex-wrap'>
          <div className='col-xl-6'>
            <div className='choose-us__content'>
              <div className='mb-40'>
                <div className='flex-align gap-8 mb-16 wow bounceInDown'>
                  <span className='text-16 text-main-600'>
                    <i className='ph-bold ph-book' />
                  </span>
                  <h5 className='mb-0 text-main-600'>About Us</h5>
                </div>
                <h2 className='mb-24 wow bounceIn'>
                  The Creating lifelong learners, pioneering a better future
                </h2>
                <p className='text-neutral-500 text-line-2  wow bounceInUp'>
                  We are dedicated to shaping the leaders of tomorrow by
                  delivering innovative and impactful learning experiences.
                </p>
              </div>
              <div className='mb-40'>
                <div className='mb-16'>
                  <span className='text-neutral-700 text-20 fw-medium'>
                    Course Loading
                  </span>
                </div>
                <div className='progress-wrapper d-flex align-items-center flex-column gap-4'>
                  <div className='h-50-px position-relative w-100 d-flex'>
                    <span
                      className='floating-label position-absolute text-xl text-main-600 fw-normal radius-8 w-50-px h-32-px z-1 d-flex justify-content-center align-items-center'
                      style={{
                        "--left-percentage": "85%",
                        animationName: "animateFloatingLabel",
                        left: "85%",
                        bottom: "30px",
                      }}
                    >
                      85%
                    </span>

                    <div
                      className='progress mt-auto h-8-px w-100 bg-primary-50 rounded-pill'
                      role='progressbar'
                      aria-label='Basic example'
                      aria-valuenow={85}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className='progress-bar animated-bar rounded-pill bg-primary-gradien overflow-visible'
                        style={{ width: "85%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='d-flex gap-24 flex-wrap'>
                <div className='max-w-306'>
                  <div className='d-flex gap-12' data-aos='fade-right'>
                    <span>
                      <img
                        src='assets/images/icons/about-us-five-checkbox.png'
                        alt=''
                      />
                    </span>
                    <h5>Our Mission</h5>
                  </div>
                  <p className='text-14 fw-normal wow bounceIn'>
                    There are many variations of passages of Lorem Ipsum
                    available.
                  </p>
                </div>
                <div className='max-w-306'>
                  <div className='d-flex gap-12' data-aos='fade-left'>
                    <span>
                      <img
                        src='assets/images/icons/about-us-five-checkbox.png'
                        alt=''
                      />
                    </span>
                    <h5>Our Mission</h5>
                  </div>
                  <p className='text-14 fw-normal wow bounceIn'>
                    There are many variations of passages of Lorem Ipsum
                    available.
                  </p>
                </div>
              </div>
              <div className='d-flex gap-24 flex-wrap mt-40'>
                <div>
                  <Link
                    to='/about'
                    className='btn btn-main rounded-pill flex-align d-inline-flex gap-8'
                    data-aos='fade-right'
                  >
                    Read More
                    <i className='ph-bold ph-arrow-up-right d-flex text-lg' />
                  </Link>
                </div>
                <div>
                  <div
                    className='d-flex align-content-center gap-16'
                    data-aos='fade-left'
                  >
                    <span className='bg-warning-800 w-54 h-54 rounded-circle justify-content-center text-center align-items-center d-flex text-white'>
                      <img
                        src='assets/images/icons/about-us-five-headset.png'
                        alt=''
                      />
                    </span>
                    <div>
                      <span className='text-16 d-inline-flex mb-4'>
                        Support us
                      </span>
                      <h6 className='text-neutral-700'>(704) 555-0127</h6>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='col-lg-6'>
            <div className='margin-left-137-px position-md-absolute w-100 h-100 z-1'>
              <img
                src='assets/images/thumbs/about-us-six-img1.png'
                alt='w-100 h-100'
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutFive;
