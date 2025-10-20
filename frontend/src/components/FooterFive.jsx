import { Link } from "react-router-dom";

const FooterFive = () => {
  return (
    <section className='bg-white z-5'>
      <div className='pb-120'>
        <div className='container max-w-1536-px'>
          <div className='row row-cols-xxl-5 row-cols-lg-3 row-cols-sm-2 row-cols-1 gy-4'>
            <div className='col' data-aos='fade-up' data-aos-duration={600}>
              <img src='assets/images/logo/logo.png' alt='' className='mb-24' />
              <div>
                <p className='text-neutral-700 text-14 fw-normal mb-24 max-w-240-px'>
                  EduAll exceeded all my expectations! The instructors were not
                  only experts.
                </p>
                <ul className='d-flex align-items-center gap-12'>
                  <li>
                    <a
                      href='https://www.facebook.com'
                      className='w-32 h-32 border-main-600 border rounded-circle text-16 hover-bg-main-600 hover-text-white transition-04 align-items-center justify-content-center d-flex'
                    >
                      <i className='ph ph-facebook-logo' />
                    </a>
                  </li>
                  <li>
                    <a
                      href='https://www.pinterest.com'
                      className='w-32 h-32 border-main-600 border rounded-circle text-16 hover-bg-main-600 hover-text-white transition-04 align-items-center justify-content-center d-flex'
                    >
                      <i className='ph ph-pinterest-logo' />
                    </a>
                  </li>
                  <li>
                    <a
                      href='https://www.twitch.com'
                      className='w-32 h-32 border-main-600 border rounded-circle text-16 hover-bg-main-600 hover-text-white transition-04 align-items-center justify-content-center d-flex'
                    >
                      <i className='ph ph-twitch-logo' />
                    </a>
                  </li>
                  <li>
                    <a
                      href='https://www.skype.com'
                      className='w-32 h-32 border-main-600 border rounded-circle text-16 hover-bg-main-600 hover-text-white transition-04 align-items-center justify-content-center d-flex'
                    >
                      <i className='ph ph-skype-logo' />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className='col' data-aos='fade-up' data-aos-duration={700}>
              <h4 className='text-black mb-24'>Quick Link</h4>
              <div>
                <ul>
                  <li className='item-hover position-relative mb-16'>
                    <Link
                      to='/about'
                      className='hover-margin-left d-flex align-items-center text-neutral-700 text-16 fw-normal hover-text-warning-600'
                    >
                      <span className='position-absolute top-50 start-0 translate-middle w-8 h-8 bg-warning-600 rounded-circle transition-03 hidden group-hover-visible' />
                      About us
                    </Link>
                  </li>
                  <li className='item-hover position-relative mb-16'>
                    <Link
                      to='/courses'
                      className='hover-margin-left d-flex align-items-center text-neutral-700 text-16 fw-normal hover-text-warning-600'
                    >
                      <span className='position-absolute top-50 start-0 translate-middle w-8 h-8 bg-warning-600 rounded-circle transition-03 hidden group-hover-visible' />
                      Courses
                    </Link>
                  </li>
                  <li className='item-hover position-relative mb-16'>
                    <Link
                      to='/instructor'
                      className='hover-margin-left d-flex align-items-center text-neutral-700 text-16 fw-normal hover-text-warning-600'
                    >
                      <span className='position-absolute top-50 start-0 translate-middle w-8 h-8 bg-warning-600 rounded-circle transition-03 hidden group-hover-visible' />
                      Instructor
                    </Link>
                  </li>
                  <li className='item-hover position-relative mb-16'>
                    <Link
                      to='/faqs'
                      className='hover-margin-left d-flex align-items-center text-neutral-700 text-16 fw-normal hover-text-warning-600'
                    >
                      <span className='position-absolute top-50 start-0 translate-middle w-8 h-8 bg-warning-600 rounded-circle transition-03 hidden group-hover-visible' />
                      FAQs
                    </Link>
                  </li>
                  <li className='item-hover position-relative'>
                    <Link
                      to='/blog'
                      className='hover-margin-left d-flex align-items-center text-neutral-700 text-16 fw-normal hover-text-warning-600'
                    >
                      <span className='position-absolute top-50 start-0 translate-middle w-8 h-8 bg-warning-600 rounded-circle transition-03 hidden group-hover-visible' />
                      Blog
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className='col' data-aos='fade-up' data-aos-duration={800}>
              <h4 className='text-black mb-24'>Category</h4>
              <div>
                <ul>
                  <li className='item-hover position-relative mb-16'>
                    <Link
                      to='#'
                      className='hover-margin-left d-flex align-items-center text-neutral-700 text-16 fw-normal hover-text-warning-600'
                    >
                      <span className='position-absolute top-50 start-0 translate-middle w-8 h-8 bg-warning-600 rounded-circle transition-03 hidden group-hover-visible' />
                      UI/UX Design
                    </Link>
                  </li>
                  <li className='item-hover position-relative mb-16'>
                    <Link
                      to='#'
                      className='hover-margin-left d-flex align-items-center text-neutral-700 text-16 fw-normal hover-text-warning-600'
                    >
                      <span className='position-absolute top-50 start-0 translate-middle w-8 h-8 bg-warning-600 rounded-circle transition-03 hidden group-hover-visible' />
                      Web Development
                    </Link>
                  </li>
                  <li className='item-hover position-relative mb-16'>
                    <Link
                      to='#'
                      className='hover-margin-left d-flex align-items-center text-neutral-700 text-16 fw-normal hover-text-warning-600'
                    >
                      <span className='position-absolute top-50 start-0 translate-middle w-8 h-8 bg-warning-600 rounded-circle transition-03 hidden group-hover-visible' />
                      Python Development
                    </Link>
                  </li>
                  <li className='item-hover position-relative mb-16'>
                    <Link
                      to='#'
                      className='hover-margin-left d-flex align-items-center text-neutral-700 text-16 fw-normal hover-text-warning-600'
                    >
                      <span className='position-absolute top-50 start-0 translate-middle w-8 h-8 bg-warning-600 rounded-circle transition-03 hidden group-hover-visible' />
                      Digital Marketing
                    </Link>
                  </li>
                  <li className='item-hover position-relative'>
                    <Link
                      to='#'
                      className='hover-margin-left d-flex align-items-center text-neutral-700 text-16 fw-normal hover-text-warning-600'
                    >
                      <span className='position-absolute top-50 start-0 translate-middle w-8 h-8 bg-warning-600 rounded-circle transition-03 hidden group-hover-visible' />
                      Graphic Design
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className='col' data-aos='fade-up' data-aos-duration={900}>
              <h4 className='text-black mb-24 text-24 fw-semibold'>
                Newsletter
              </h4>
              <p className='text-neutral-700 text-16 fw-normal mb-32'>
                Subscribe our newsletter to get our latest update &amp; news
              </p>
              <div>
                <form action='#' className='position-relative'>
                  <input
                    type='email'
                    className='text-14 text-neutral-700 py-20 ps-24 pe-104 bg-white border-main-600 border rounded-pill w-100 h-64 focus-border-main-500 focus-visible-outline'
                    placeholder='Email address'
                  />
                  <button
                    type='button'
                    className='w-72 h-48 bg-main-600 rounded-pill justify-content-center align-items-center d-flex text-white position-absolute top-50-percent translate-middle-y inset-inline-end-0-px me-8'
                  >
                    <i className='ph-bold ph-paper-plane-tilt' />
                  </button>
                </form>
              </div>
            </div>
            <div className='col' data-aos='fade-up' data-aos-duration={1000}>
              <h4 className='text-black mb-24'>Contact</h4>
              <div className='mb-16'>
                <div className='d-flex align-items-center gap-16'>
                  <span className='w-40 h-40 border-main-600 border rounded-circle text-neutral-700 justify-content-center align-items-center d-flex flex-shrink-0'>
                    <i className='ph-bold ph-phone' />
                  </span>
                  <a
                    href='tel:(207)555-0119'
                    className='text-neutral-700 hover-text-warning-800'
                  >
                    (252) 555-0126
                  </a>
                </div>
              </div>
              <div className='mb-16'>
                <div className='d-flex align-items-center gap-16'>
                  <span className='w-40 h-40 border-main-600 border rounded-circle text-neutral-700 justify-content-center align-items-center d-flex flex-shrink-0'>
                    <i className='ph-bold ph-envelope-open' />
                  </span>
                  <a
                    href='tel:info@example.com'
                    className='text-neutral-700 hover-text-warning-800'
                  >
                    info@example.com
                  </a>
                </div>
              </div>
              <div>
                <div className='d-flex align-items-center gap-16'>
                  <span className='w-40 h-40 border-main-600 border rounded-circle text-neutral-700 justify-content-center align-items-center d-flex flex-shrink-0'>
                    <i className='ph-bold ph-map-pin' />
                  </span>
                  <Link
                    to='#'
                    className='text-neutral-700 hover-text-warning-800'
                  >
                    8502 Preston Rd. Inglewood.
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ========footer bottom section start ===========*/}
      <div className='container max-w-1536-px position-relative z-2'>
        <div className='py-32 border-top border-white'>
          <p className='text-16 fw-semibold text-neutral-700 text-center'>
            Copyright ©2025 Eduall. Designed By Wowtheme7
          </p>
        </div>
      </div>
      {/* ========footer bottom section end============= */}
      <div className='position-absolute bottom-0 start-0 w-100 z-1'>
        <img
          src='assets/images/shapes/cloud-shap-img5.png'
          alt=''
          className='w-100'
        />
      </div>
    </section>
  );
};

export default FooterFive;
