import { Link } from "react-router-dom";

const FooterTwo = () => {
  return (
    <footer className='footer bg-neutral-900 position-relative z-1'>
      <img
        src='assets/images/shapes/shape2.png'
        alt=''
        className='shape five animation-scalation'
      />
      <img
        src='assets/images/shapes/shape6.png'
        alt=''
        className='shape one animation-scalation'
      />
      <div className='py-120 '>
        <div className='container container-two'>
          <div className='row gy-5'>
            <div
              className='col-lg-3 col-sm-6 col-xs-6'
              data-aos='fade-up'
              data-aos-duration={400}
            >
              <div className='footer-item'>
                <h4 className='footer-item__title fw-medium text-white mb-32'>
                  Quick Link
                </h4>
                <ul className='footer-menu'>
                  <li className='mb-16'>
                    <Link
                      to='/about'
                      className='text-white hover-text-main-600 hover-text-decoration-underline'
                    >
                      About us
                    </Link>
                  </li>
                  <li className='mb-16'>
                    <Link
                      to='/courses'
                      className='text-white hover-text-main-600 hover-text-decoration-underline'
                    >
                      Courses
                    </Link>
                  </li>
                  <li className='mb-16'>
                    <Link
                      to='/instructor'
                      className='text-white hover-text-main-600 hover-text-decoration-underline'
                    >
                      Instructor
                    </Link>
                  </li>
                  <li className='mb-16'>
                    <Link
                      to='/faq'
                      className='text-white hover-text-main-600 hover-text-decoration-underline'
                    >
                      FAQs
                    </Link>
                  </li>
                  <li className='mb-0'>
                    <Link
                      to='/blog'
                      className='text-white hover-text-main-600 hover-text-decoration-underline'
                    >
                      Blogs
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div
              className='col-lg-3 col-sm-6 col-xs-6'
              data-aos='fade-up'
              data-aos-duration={600}
            >
              <div className='footer-item'>
                <h4 className='footer-item__title fw-medium text-white mb-32'>
                  Category
                </h4>
                <ul className='footer-menu'>
                  <li className='mb-16'>
                    <Link
                      to='/courses'
                      className='text-white hover-text-main-600 hover-text-decoration-underline'
                    >
                      UI/UX Design
                    </Link>
                  </li>
                  <li className='mb-16'>
                    <Link
                      to='/courses'
                      className='text-white hover-text-main-600 hover-text-decoration-underline'
                    >
                      Web Development
                    </Link>
                  </li>
                  <li className='mb-16'>
                    <Link
                      to='/courses'
                      className='text-white hover-text-main-600 hover-text-decoration-underline'
                    >
                      Python Development
                    </Link>
                  </li>
                  <li className='mb-16'>
                    <Link
                      to='/courses'
                      className='text-white hover-text-main-600 hover-text-decoration-underline'
                    >
                      Digital Marketing
                    </Link>
                  </li>
                  <li className='mb-16'>
                    <Link
                      to='/courses'
                      className='text-white hover-text-main-600 hover-text-decoration-underline'
                    >
                      Graphic Design
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div
              className='col-lg-3 col-sm-6 col-xs-6'
              data-aos='fade-up'
              data-aos-duration={800}
            >
              <div className='footer-item'>
                <h4 className='footer-item__title fw-medium text-white mb-32'>
                  Contact Us
                </h4>
                <div className='flex-align gap-20 mb-24'>
                  <span className='icon d-flex text-32 text-main-600'>
                    <i className='ph ph-phone' />
                  </span>
                  <div className=''>
                    <Link
                      to='/tel:(207)555-0119'
                      className='text-white d-block hover-text-main-600 mb-4'
                    >
                      (207) 555-0119
                    </Link>
                    <Link
                      to='/tel:(704)555-0127'
                      className='text-white d-block hover-text-main-600 mb-0'
                    >
                      (704) 555-0127
                    </Link>
                  </div>
                </div>
                <div className='flex-align gap-20 mb-24'>
                  <span className='icon d-flex text-32 text-main-600'>
                    <i className='ph ph-envelope-open' />
                  </span>
                  <div className=''>
                    <Link
                      to='/mailto:dwallo@gmail.com'
                      className='text-white d-block hover-text-main-600 mb-4'
                    >
                      dwallo@gmail.com
                    </Link>
                    <Link
                      to='/mailto:eduAll@gmail.com'
                      className='text-white d-block hover-text-main-600 mb-0'
                    >
                      eduAll@gmail.com
                    </Link>
                  </div>
                </div>
                <div className='flex-align gap-20 mb-0'>
                  <span className='icon d-flex text-32 text-main-600'>
                    <i className='ph ph-map-trifold' />
                  </span>
                  <div className=''>
                    <span className='text-white d-block mb-4'>
                      5488 srker Rd .
                    </span>
                    <span className='text-white d-block mb-0'>
                      8745 doer Dr.
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div
              className='col-lg-3 col-sm-6 col-xs-6'
              data-aos='fade-up'
              data-aos-duration={1200}
            >
              <div className='footer-item'>
                <h4 className='footer-item__title fw-medium text-white mb-32'>
                  Subscribe Here
                </h4>
                <p className='text-white'>
                  Enter your email address to register to our newsletter
                  subscription
                </p>
                <form action='#' className='mt-24 position-relative'>
                  <input
                    type='email'
                    className='form-control bg-neutral-700 placeholder-white shadow-none border border-neutral-700 text-white rounded-pill h-52 ps-24 pe-48 focus-border-main-600'
                    placeholder='Email...'
                  />
                  <button
                    type='submit'
                    className='w-36 h-36 flex-center rounded-circle bg-main-600 text-white hover-bg-main-800 position-absolute top-50 translate-middle-y inset-inline-end-0 me-8'
                  >
                    <i className='ph ph-paper-plane-tilt' />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='container'>
        {/* bottom Footer */}
        <div className='bottom-footer border-top border-dashed border-neutral-600 border-0 py-32'>
          <div className='container container-two'>
            <div className='bottom-footer__inner flex-between gap-16 flex-wrap'>
              <div className='footer-item__logo mb-0' data-aos='zoom-in-right'>
                <Link to='/'>
                  {" "}
                  <img src='assets/images/logo/logo-white.png' alt='' />
                </Link>
              </div>
              <p
                className='text-white text-line-1 fw-normal'
                data-aos='zoom-in'
              >
                {" "}
                Copyright © 2025 <span className='fw-semibold'>
                  EduAll{" "}
                </span>{" "}
                All Rights Reserved.
              </p>
              <ul
                className='social-list flex-align gap-24'
                data-aos='zoom-in-left'
              >
                <li className='social-list__item'>
                  <Link
                    to='https://www.facebook.com'
                    className='text-white text-2xl hover-text-main-two-600'
                  >
                    <i className='ph-bold ph-facebook-logo' />
                  </Link>
                </li>
                <li className='social-list__item'>
                  <Link
                    to='https://www.twitter.com'
                    className='text-white text-2xl hover-text-main-two-600'
                  >
                    <i className='ph-bold ph-twitter-logo' />
                  </Link>
                </li>
                <li className='social-list__item'>
                  <Link
                    to='https://www.linkedin.com'
                    className='text-white text-2xl hover-text-main-two-600'
                  >
                    <i className='ph-bold ph-instagram-logo' />
                  </Link>
                </li>
                <li className='social-list__item'>
                  <Link
                    to='https://www.pinterest.com'
                    className='text-white text-2xl hover-text-main-two-600'
                  >
                    <i className='ph-bold ph-pinterest-logo' />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterTwo;
