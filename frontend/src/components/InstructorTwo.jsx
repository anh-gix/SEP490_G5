import React, { useRef } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";

const InstructorTwo = () => {
  const instructorSliderRef = useRef(null);
  const settings = {
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    speed: 1500,
    dots: false,
    pauseOnHover: true,
    arrows: false,
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
    <section className='instructor py-120 bg-main-25 position-relative z-1'>
      <div className='container'>
        <div className='max-w-535-px text-center mx-auto mb-60'>
          <div
            className='text-20 fw-semibold text-main-600 d-flex gap-8 mb-16 justify-content-center'
            data-aos='fade-down'
          >
            <span>
              <i className='ph-bold ph-book-open' />
            </span>
            <span>Our Popular Tutors</span>
          </div>
          <h2 className='text-neutral-700 mb-24 wow bounceIn'>
            Here are few of the Verified Teachers
          </h2>
          <p className='text-16 fw-normal wow bounceInUp'>
            Our tutoring sessions are interactive and engaging, focusing on the
            student's specific needs.
          </p>
        </div>
        <Slider
          className='our-popular-slider'
          {...settings}
          ref={instructorSliderRef}
        >
          <div data-aos='fade-up' data-aos-duration={600}>
            <div className='instructor-item scale-hover-item bg-white rounded-16 transition-03 p-12 h-100 border border-neutral-30 hover-border-main-600 border'>
              <div className='rounded-12 overflow-hidden position-relative bg-dark-yellow'>
                <Link
                  to='/instructor-details'
                  className='w-100 h-100 d-flex align-items-end'
                >
                  <img
                    src='assets/images/thumbs/our-popular-img-1.png'
                    alt='Course '
                    className='scale-hover-item__img rounded-12 cover-img transition-2'
                  />
                </Link>
                <div className=''>
                  <div className='our-popular-five'>
                    <button className='our-popular-five__button flex-center w-44 h-44 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                      <i className='ph-bold ph-plus' />
                    </button>
                    <ul className='social-list flex-align flex-column gap-12 mt-12'>
                      <li className='social-list__item'>
                        <Link
                          href='https://www.facebook.com'
                          className=' flex-center border border-white text-white w-44 h-44 rounded-circle text-xl hover-text-main hover-bg-white'
                        >
                          <i className='ph-bold ph-facebook-logo' />
                        </Link>
                      </li>
                      <li className='social-list__item'>
                        <Link
                          href='https://www.twitter.com'
                          className=' flex-center border border-white text-white w-44 h-44 rounded-circle text-xl hover-text-main hover-bg-white'
                        >
                          <i className='ph-bold ph-twitter-logo' />
                        </Link>
                      </li>
                      <li className='social-list__item'>
                        <Link
                          href='https://www.linkedin.com'
                          className=' flex-center border border-white text-white w-44 h-44 rounded-circle text-xl hover-text-main hover-bg-white'
                        >
                          <i className='ph-bold ph-instagram-logo' />
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className='p-24'>
                <div className='text-center'>
                  <h4 className='mb-4'>
                    <Link to='/instructor-details' className='link text-line-2'>
                      Albert Flores
                    </Link>
                  </h4>
                  <span>English Expert</span>
                </div>
              </div>
            </div>
          </div>
          <div data-aos='fade-up' data-aos-duration={700}>
            <div className='instructor-item scale-hover-item bg-white rounded-16 transition-03 p-12 h-100 border border-neutral-30 hover-border-main-600 border'>
              <div className='rounded-12 overflow-hidden position-relative bg-dark-yellow'>
                <Link
                  to='/instructor-details'
                  className='w-100 h-100 d-flex align-items-end'
                >
                  <img
                    src='assets/images/thumbs/our-popular-img-2.png'
                    alt='Course'
                    className='scale-hover-item__img rounded-12 cover-img transition-2'
                  />
                </Link>
                <div className=''>
                  <div className='our-popular-five'>
                    <button className='our-popular-five__button flex-center w-44 h-44 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                      <i className='ph-bold ph-plus' />
                    </button>
                    <ul className='social-list flex-align flex-column gap-12 mt-12'>
                      <li className='social-list__item'>
                        <Link
                          href='https://www.facebook.com'
                          className=' flex-center border border-white text-white w-44 h-44 rounded-circle text-xl hover-text-main hover-bg-white'
                        >
                          <i className='ph-bold ph-facebook-logo' />
                        </Link>
                      </li>
                      <li className='social-list__item'>
                        <Link
                          href='https://www.twitter.com'
                          className=' flex-center border border-white text-white w-44 h-44 rounded-circle text-xl hover-text-main hover-bg-white'
                        >
                          <i className='ph-bold ph-twitter-logo' />
                        </Link>
                      </li>
                      <li className='social-list__item'>
                        <Link
                          href='https://www.linkedin.com'
                          className=' flex-center border border-white text-white w-44 h-44 rounded-circle text-xl hover-text-main hover-bg-white'
                        >
                          <i className='ph-bold ph-instagram-logo' />
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className='p-24'>
                <div className='text-center'>
                  <h4 className='mb-4'>
                    <Link to='/instructor-details' className='link text-line-2'>
                      Theresa Webb
                    </Link>
                  </h4>
                  <span>Data And Science</span>
                </div>
              </div>
            </div>
          </div>
          <div data-aos='fade-up' data-aos-duration={800}>
            <div className='instructor-item scale-hover-item bg-white rounded-16 transition-03 p-12 h-100 border border-neutral-30 hover-border-main-600 border'>
              <div className='rounded-12 overflow-hidden position-relative bg-dark-yellow'>
                <Link
                  to='/instructor-details'
                  className='w-100 h-100 d-flex align-items-end'
                >
                  <img
                    src='assets/images/thumbs/our-popular-img-3.png'
                    alt='Course'
                    className='scale-hover-item__img rounded-12 cover-img transition-2'
                  />
                </Link>
                <div className=''>
                  <div className='our-popular-five'>
                    <button className='our-popular-five__button flex-center w-44 h-44 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                      <i className='ph-bold ph-plus' />
                    </button>
                    <ul className='social-list flex-align flex-column gap-12 mt-12'>
                      <li className='social-list__item'>
                        <Link
                          href='https://www.facebook.com'
                          className=' flex-center border border-white text-white w-44 h-44 rounded-circle text-xl hover-text-main hover-bg-white'
                        >
                          <i className='ph-bold ph-facebook-logo' />
                        </Link>
                      </li>
                      <li className='social-list__item'>
                        <Link
                          href='https://www.twitter.com'
                          className=' flex-center border border-white text-white w-44 h-44 rounded-circle text-xl hover-text-main hover-bg-white'
                        >
                          <i className='ph-bold ph-twitter-logo' />
                        </Link>
                      </li>
                      <li className='social-list__item'>
                        <Link
                          href='https://www.linkedin.com'
                          className=' flex-center border border-white text-white w-44 h-44 rounded-circle text-xl hover-text-main hover-bg-white'
                        >
                          <i className='ph-bold ph-instagram-logo' />
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className='p-24'>
                <div className='text-center'>
                  <h4 className='mb-4'>
                    <Link to='/instructor-details' className='link text-line-2'>
                      Jacob Jones
                    </Link>
                  </h4>
                  <span>Social Science</span>
                </div>
              </div>
            </div>
          </div>
          <div data-aos='fade-up' data-aos-duration={900}>
            <div className='instructor-item scale-hover-item bg-white rounded-16 transition-03 p-12 h-100 border border-neutral-30 hover-border-main-600 border'>
              <div className='rounded-12 overflow-hidden position-relative bg-dark-yellow'>
                <Link
                  to='/instructor-details'
                  className='w-100 h-100 d-flex align-items-end'
                >
                  <img
                    src='assets/images/thumbs/our-popular-img-4.png'
                    alt='Course'
                    className='scale-hover-item__img rounded-12 cover-img transition-2'
                  />
                </Link>
                <div className=''>
                  <div className='our-popular-five'>
                    <button className='our-popular-five__button flex-center w-44 h-44 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                      <i className='ph-bold ph-plus' />
                    </button>
                    <ul className='social-list flex-align flex-column gap-12 mt-12'>
                      <li className='social-list__item'>
                        <Link
                          href='https://www.facebook.com'
                          className=' flex-center border border-white text-white w-44 h-44 rounded-circle text-xl hover-text-main hover-bg-white'
                        >
                          <i className='ph-bold ph-facebook-logo' />
                        </Link>
                      </li>
                      <li className='social-list__item'>
                        <Link
                          href='https://www.twitter.com'
                          className=' flex-center border border-white text-white w-44 h-44 rounded-circle text-xl hover-text-main hover-bg-white'
                        >
                          <i className='ph-bold ph-twitter-logo' />
                        </Link>
                      </li>
                      <li className='social-list__item'>
                        <Link
                          href='https://www.linkedin.com'
                          className=' flex-center border border-white text-white w-44 h-44 rounded-circle text-xl hover-text-main hover-bg-white'
                        >
                          <i className='ph-bold ph-instagram-logo' />
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className='p-24'>
                <div className='text-center'>
                  <h4 className='mb-4'>
                    <Link to='/instructor-details' className='link text-line-2'>
                      Cody Fisher
                    </Link>
                  </h4>
                  <span>IT Specialist</span>
                </div>
              </div>
            </div>
          </div>
          <div data-aos='fade-up' data-aos-duration={700}>
            <div className='instructor-item scale-hover-item bg-white rounded-16 transition-03 p-12 h-100 border border-neutral-30 hover-border-main-600 border'>
              <div className='rounded-12 overflow-hidden position-relative bg-dark-yellow'>
                <Link
                  to='/instructor-details'
                  className='w-100 h-100 d-flex align-items-end'
                >
                  <img
                    src='assets/images/thumbs/our-popular-img-2.png'
                    alt='Course'
                    className='scale-hover-item__img rounded-12 cover-img transition-2'
                  />
                </Link>
                <div className=''>
                  <div className='our-popular-five'>
                    <button className='our-popular-five__button flex-center w-44 h-44 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                      <i className='ph-bold ph-plus' />
                    </button>
                    <ul className='social-list flex-align flex-column gap-12 mt-12'>
                      <li className='social-list__item'>
                        <Link
                          href='https://www.facebook.com'
                          className=' flex-center border border-white text-white w-44 h-44 rounded-circle text-xl hover-text-main hover-bg-white'
                        >
                          <i className='ph-bold ph-facebook-logo' />
                        </Link>
                      </li>
                      <li className='social-list__item'>
                        <Link
                          href='https://www.twitter.com'
                          className=' flex-center border border-white text-white w-44 h-44 rounded-circle text-xl hover-text-main hover-bg-white'
                        >
                          <i className='ph-bold ph-twitter-logo' />
                        </Link>
                      </li>
                      <li className='social-list__item'>
                        <Link
                          href='https://www.linkedin.com'
                          className=' flex-center border border-white text-white w-44 h-44 rounded-circle text-xl hover-text-main hover-bg-white'
                        >
                          <i className='ph-bold ph-instagram-logo' />
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className='p-24'>
                <div className='text-center'>
                  <h4 className='mb-4'>
                    <Link to='/instructor-details' className='link text-line-2'>
                      Theresa Webb
                    </Link>
                  </h4>
                  <span>Data And Science</span>
                </div>
              </div>
            </div>
          </div>
        </Slider>
        <div className='flex-align gap-16 mt-40 justify-content-center'>
          <button
            onClick={() => instructorSliderRef.current.slickPrev()}
            type='button'
            id='our-popular-prev'
            className=' slick-arrow flex-center rounded-circle border border-gray-100 hover-border-main-600 text-xl hover-bg-main-600 hover-text-white transition-1 w-48 h-48'
            data-aos='fade-right'
          >
            <i className='ph ph-caret-left' />
          </button>
          <button
            onClick={() => instructorSliderRef.current.slickNext()}
            type='button'
            id='our-popular-next'
            className=' slick-arrow flex-center rounded-circle border border-gray-100 hover-border-main-600 text-xl hover-bg-main-600 hover-text-white transition-1 w-48 h-48'
            data-aos='fade-left'
          >
            <i className='ph ph-caret-right' />
          </button>
        </div>
      </div>
    </section>
  );
};

export default InstructorTwo;
