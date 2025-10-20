import React from "react";
import { Link } from "react-router-dom";

const FooterFour = () => {
  return (
    <section className='bg-neutral-800 z-1'>
      <div className='py-120'>
        <div className='container max-w-1536-px'>
          <div className='d-flex flex-xl-row gap-154 flex-column'>
            <div className='row gy-4'>
              <div
                className='col-lg-3 col-md-4 col-sm-2'
                data-aos='fade-up'
                data-aos-duration={600}
              >
                <h4 className='text-white mb-24'>Contact</h4>
                <div className='mb-16'>
                  <div className='d-flex align-items-center gap-16'>
                    <span className='w-40 h-40 border-main-600 border rounded-circle text-white justify-content-center align-items-center d-flex flex-shrink-0'>
                      <i className='ph-bold ph-phone' />
                    </span>
                    <a
                      href='tel:(207)555-0119'
                      className='text-neutral-30 hover-text-warning-800'
                    >
                      (252) 555-0126
                    </a>
                  </div>
                </div>
                <div className='mb-16'>
                  <div className='d-flex align-items-center gap-16'>
                    <span className='w-40 h-40 border-main-600 border rounded-circle text-white justify-content-center align-items-center d-flex flex-shrink-0'>
                      <i className='ph-bold ph-envelope-open' />
                    </span>
                    <a
                      href='tel:info@example.com'
                      className='text-neutral-30 hover-text-warning-800'
                    >
                      info@example.com
                    </a>
                  </div>
                </div>
                <div>
                  <div className='d-flex align-items-center gap-16'>
                    <span className='w-40 h-40 border-main-600 border rounded-circle text-white justify-content-center align-items-center d-flex flex-shrink-0'>
                      <i className='ph-bold ph-map-pin' />
                    </span>
                    <Link
                      to='#'
                      className='text-neutral-30 hover-text-warning-800'
                    >
                      8502 Preston Rd. Inglewood.
                    </Link>
                  </div>
                </div>
              </div>
              <div
                className='col-lg-3 col-md-4 col-sm-2'
                data-aos='fade-up'
                data-aos-duration={700}
              >
                <h4 className='text-white mb-24'>Quick Link</h4>
                <div>
                  <ul>
                    <li className='item-hover position-relative mb-16'>
                      <Link
                        to='/about'
                        className='hover-margin-left d-flex align-items-center text-white text-16 fw-semibold hover-text-warning-600'
                      >
                        <span className='position-absolute top-50 start-0 translate-middle w-8 h-8 bg-warning-600 rounded-circle transition-03 hidden group-hover-visible' />
                        About us
                      </Link>
                    </li>
                    <li className='item-hover position-relative mb-16'>
                      <Link
                        to='/courses'
                        className='hover-margin-left d-flex align-items-center text-white text-16 fw-semibold hover-text-warning-600'
                      >
                        <span className='position-absolute top-50 start-0 translate-middle w-8 h-8 bg-warning-600 rounded-circle transition-03 hidden group-hover-visible' />
                        Courses
                      </Link>
                    </li>
                    <li className='item-hover position-relative mb-16'>
                      <Link
                        to='/instructor'
                        className='hover-margin-left d-flex align-items-center text-white text-16 fw-semibold hover-text-warning-600'
                      >
                        <span className='position-absolute top-50 start-0 translate-middle w-8 h-8 bg-warning-600 rounded-circle transition-03 hidden group-hover-visible' />
                        Instructor
                      </Link>
                    </li>
                    <li className='item-hover position-relative mb-16'>
                      <Link
                        to='/faqs'
                        className='hover-margin-left d-flex align-items-center text-white text-16 fw-semibold hover-text-warning-600'
                      >
                        <span className='position-absolute top-50 start-0 translate-middle w-8 h-8 bg-warning-600 rounded-circle transition-03 hidden group-hover-visible' />
                        FAQs
                      </Link>
                    </li>
                    <li className='item-hover position-relative mb-16'>
                      <Link
                        to='/blog'
                        className='hover-margin-left d-flex align-items-center text-white text-16 fw-semibold hover-text-warning-600'
                      >
                        <span className='position-absolute top-50 start-0 translate-middle w-8 h-8 bg-warning-600 rounded-circle transition-03 hidden group-hover-visible' />
                        Blog
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div
                className='col-lg-3 col-md-4 col-sm-2'
                data-aos='fade-up'
                data-aos-duration={800}
              >
                <h4 className='text-white mb-24'>Category</h4>
                <div>
                  <ul>
                    <li className='item-hover position-relative mb-16'>
                      <Link
                        to='#'
                        className='hover-margin-left d-flex align-items-center text-white text-16 fw-semibold hover-text-warning-600'
                      >
                        <span className='position-absolute top-50 start-0 translate-middle w-8 h-8 bg-warning-600 rounded-circle transition-03 hidden group-hover-visible' />
                        UI/UX Design
                      </Link>
                    </li>
                    <li className='item-hover position-relative mb-16'>
                      <Link
                        to='#'
                        className='hover-margin-left d-flex align-items-center text-white text-16 fw-semibold hover-text-warning-600'
                      >
                        <span className='position-absolute top-50 start-0 translate-middle w-8 h-8 bg-warning-600 rounded-circle transition-03 hidden group-hover-visible' />
                        Web Development
                      </Link>
                    </li>
                    <li className='item-hover position-relative mb-16'>
                      <Link
                        to='#'
                        className='hover-margin-left d-flex align-items-center text-white text-16 fw-semibold hover-text-warning-600'
                      >
                        <span className='position-absolute top-50 start-0 translate-middle w-8 h-8 bg-warning-600 rounded-circle transition-03 hidden group-hover-visible' />
                        Python Development
                      </Link>
                    </li>
                    <li className='item-hover position-relative mb-16'>
                      <Link
                        to='#'
                        className='hover-margin-left d-flex align-items-center text-white text-16 fw-semibold hover-text-warning-600'
                      >
                        <span className='position-absolute top-50 start-0 translate-middle w-8 h-8 bg-warning-600 rounded-circle transition-03 hidden group-hover-visible' />
                        Digital Marketing
                      </Link>
                    </li>
                    <li className='item-hover position-relative mb-16'>
                      <Link
                        to='#'
                        className='hover-margin-left d-flex align-items-center text-white text-16 fw-semibold hover-text-warning-600'
                      >
                        <span className='position-absolute top-50 start-0 translate-middle w-8 h-8 bg-warning-600 rounded-circle transition-03 hidden group-hover-visible' />
                        Graphic Design
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div
                className='col-lg-3 col-md-4 col-sm-2'
                data-aos='fade-up'
                data-aos-duration={900}
              >
                <h4 className='text-white mb-24'>Contact</h4>
                <p className='text-neutral-30 mb-32'>
                  Subscribe our newsletter to get our latest update &amp; news
                </p>
                <div>
                  <form action='#' className='position-relative'>
                    <input
                      type='email'
                      className='text-14 text-neutral-30 py-22 ps-24 pe-104 bg-neutral-800 border-main-600 border rounded-pill w-100 h-64 focus-border-main-500 focus-visible-outline'
                      placeholder='Email address'
                    />
                    <button
                      type='button'
                      className='px-24 py-12 bg-main-600 rounded-pill justify-content-center align-items-center d-flex text-white position-absolute top-8-percent right-8-percent'
                    >
                      <i className='ph-bold ph-paper-plane-tilt' />
                    </button>
                  </form>
                </div>
              </div>
            </div>
            <div
              className='px-40 py-40 bg-neutral-700 rounded-12 d-inline-block max-w-366-px justify-content-center text-center'
              data-aos='fade-up'
              data-aos-duration={1000}
            >
              <div className='max-w-286-px'>
                <img
                  src='assets/images/logo/logo-white.png'
                  alt=''
                  className='mb-24'
                />
                <p className='mb-24 text-neutral-30'>
                  EduAll exceeded all my expectations! The instructors were not
                  only experts.
                </p>
                <ul className='d-flex align-items-center gap-12 justify-content-center'>
                  <li>
                    <a
                      href='https://www.facebook.com'
                      className='text-16 w-32 h-32 border-main-600 border rounded-circle justify-content-center text-center align-items-center d-flex hover-bg-main-600 text-white bg-neutral-800 flex-shrink-0'
                    >
                      <i className='ph-fill ph-facebook-logo' />
                    </a>
                  </li>
                  <li>
                    <a
                      href='https://www.pinterest.com'
                      className='text-16 w-32 h-32 border-main-600 border rounded-circle justify-content-center text-center align-items-center d-flex hover-bg-main-600 text-white bg-neutral-800 flex-shrink-0'
                    >
                      <i className='ph-fill ph-pinterest-logo' />
                    </a>
                  </li>
                  <li>
                    <a
                      href='https://www.twitch.com'
                      className='text-16 w-32 h-32 border-main-600 border rounded-circle justify-content-center text-center align-items-center d-flex hover-bg-main-600 text-white bg-neutral-800 flex-shrink-0'
                    >
                      <i className='ph-fill ph-twitch-logo' />
                    </a>
                  </li>
                  <li>
                    <a
                      href='https://www.skype.com'
                      className='text-16 w-32 h-32 border-main-600 border rounded-circle justify-content-center text-center align-items-center d-flex hover-bg-main-600 text-white bg-neutral-800 flex-shrink-0'
                    >
                      <i className='ph-fill ph-skype-logo' />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ========footer bottom section start ===========*/}
      <div className='container max-w-1536-px'>
        <div className='py-32 border-top border-neutral-500'>
          <div className='d-flex align-items-center justify-content-between flex-wrap gap-24'>
            <div data-aos='fade-right'>
              <p className='text-md text-white'>
                Copyright ©2025
                <span className='text-warning-600'>Eduall</span>. Designed By
                Wowtheme7
              </p>
            </div>
            <div data-aos='fade-left'>
              <ul className='d-flex align-items-center gap-24 flex-wrap'>
                <li>
                  <Link
                    to='#'
                    className='text-white text-md fw-normal hover-text-warning-800'
                  >
                    Help &amp; Support
                  </Link>
                </li>
                <li>
                  <Link
                    to='#'
                    className='text-white text-md fw-normal hover-text-warning-800'
                  >
                    Privacy policy
                  </Link>
                </li>
                <li>
                  <Link
                    to='#'
                    className='text-white text-md fw-normal hover-text-warning-800'
                  >
                    Terms &amp; Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* ========footer bottom section end============= */}
    </section>
  );
};

export default FooterFour;
