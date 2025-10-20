import { Link } from "react-router-dom";

const InstructorAllTwo = () => {
  return (
    <section className='instructor py-120 position-relative z-1'>
      <img
        src='assets/images/shapes/shape2.png'
        alt=''
        className='shape one animation-scalation'
      />
      <img
        src='assets/images/shapes/shape6.png'
        alt=''
        className='shape six animation-scalation'
      />
      <div className='container'>
        <div className='section-heading text-center'>
          <h2 className='mb-24'>Course Instructors</h2>
          <p className=''>
            Join us on this journey of discovery, growth, and transformation.
            Together, let's shape a brighter future
          </p>
        </div>
        <div className='row gy-4'>
          <div className='col-xl-3 col-lg-4 col-sm-6'>
            <div className='instructor-item-two scale-hover-item social-hover'>
              <div className='instructor-item-two__thumb text-center rounded-circle aspect-ratio-1 p-12 border border-neutral-30 position-relative'>
                <div className='instructor-item-two__thumb-inner w-100 h-100 d-block bg-main-25 rounded-circle overflow-hidden position-relative'>
                  <img
                    src='assets/images/thumbs/instructor-img1.png'
                    alt=''
                    className='cover-img'
                  />
                  <ul className='social-list flex-center gap-12 d-flex position-absolute start-50 top-50 w-100 h-100 translate-middle'>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.facebook.com'
                        className='flex-center border border-white text-white w-44 h-44 rounded-circle text-xl text-main-600 bg-white hover-bg-main-600 hover-text-white hover-border-main-600'
                      >
                        <i className='ph-bold ph-facebook-logo' />
                      </Link>
                    </li>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.twitter.com'
                        className='flex-center border border-white text-white w-44 h-44 rounded-circle text-xl text-main-600 bg-white hover-bg-main-600 hover-text-white hover-border-main-600'
                      >
                        <i className='ph-bold ph-twitter-logo' />
                      </Link>
                    </li>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.linkedin.com'
                        className='flex-center border border-white text-white w-44 h-44 rounded-circle text-xl text-main-600 bg-white hover-bg-main-600 hover-text-white hover-border-main-600'
                      >
                        <i className='ph-bold ph-instagram-logo' />
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className='text-center mt-24'>
                <h4 className='mb-12'>
                  <Link
                    to='/instructor-details'
                    className='text-neutral-700 hover-text-main-600'
                  >
                    Esther Howard
                  </Link>
                </h4>
                <span className='text-neutral-500'>Web Developer</span>
              </div>
            </div>
          </div>
          <div className='col-xl-3 col-lg-4 col-sm-6'>
            <div className='instructor-item-two scale-hover-item social-hover'>
              <div className='instructor-item-two__thumb text-center rounded-circle aspect-ratio-1 p-12 border border-neutral-30 position-relative'>
                <div className='instructor-item-two__thumb-inner w-100 h-100 d-block bg-main-25 rounded-circle overflow-hidden position-relative'>
                  <img
                    src='assets/images/thumbs/instructor-img2.png'
                    alt=''
                    className='cover-img'
                  />
                  <ul className='social-list flex-center gap-12 d-flex position-absolute start-50 top-50 w-100 h-100 translate-middle'>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.facebook.com'
                        className='flex-center border border-white text-white w-44 h-44 rounded-circle text-xl text-main-600 bg-white hover-bg-main-600 hover-text-white hover-border-main-600'
                      >
                        <i className='ph-bold ph-facebook-logo' />
                      </Link>
                    </li>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.twitter.com'
                        className='flex-center border border-white text-white w-44 h-44 rounded-circle text-xl text-main-600 bg-white hover-bg-main-600 hover-text-white hover-border-main-600'
                      >
                        <i className='ph-bold ph-twitter-logo' />
                      </Link>
                    </li>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.linkedin.com'
                        className='flex-center border border-white text-white w-44 h-44 rounded-circle text-xl text-main-600 bg-white hover-bg-main-600 hover-text-white hover-border-main-600'
                      >
                        <i className='ph-bold ph-instagram-logo' />
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className='text-center mt-24'>
                <h4 className='mb-12'>
                  <Link
                    to='/instructor-details'
                    className='text-neutral-700 hover-text-main-600'
                  >
                    Jerome Bell
                  </Link>
                </h4>
                <span className='text-neutral-500'>UI Designer</span>
              </div>
            </div>
          </div>
          <div className='col-xl-3 col-lg-4 col-sm-6'>
            <div className='instructor-item-two scale-hover-item social-hover'>
              <div className='instructor-item-two__thumb text-center rounded-circle aspect-ratio-1 p-12 border border-neutral-30 position-relative'>
                <div className='instructor-item-two__thumb-inner w-100 h-100 d-block bg-main-25 rounded-circle overflow-hidden position-relative'>
                  <img
                    src='assets/images/thumbs/instructor-img3.png'
                    alt=''
                    className='cover-img'
                  />
                  <ul className='social-list flex-center gap-12 d-flex position-absolute start-50 top-50 w-100 h-100 translate-middle'>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.facebook.com'
                        className='flex-center border border-white text-white w-44 h-44 rounded-circle text-xl text-main-600 bg-white hover-bg-main-600 hover-text-white hover-border-main-600'
                      >
                        <i className='ph-bold ph-facebook-logo' />
                      </Link>
                    </li>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.twitter.com'
                        className='flex-center border border-white text-white w-44 h-44 rounded-circle text-xl text-main-600 bg-white hover-bg-main-600 hover-text-white hover-border-main-600'
                      >
                        <i className='ph-bold ph-twitter-logo' />
                      </Link>
                    </li>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.linkedin.com'
                        className='flex-center border border-white text-white w-44 h-44 rounded-circle text-xl text-main-600 bg-white hover-bg-main-600 hover-text-white hover-border-main-600'
                      >
                        <i className='ph-bold ph-instagram-logo' />
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className='text-center mt-24'>
                <h4 className='mb-12'>
                  <Link
                    to='/instructor-details'
                    className='text-neutral-700 hover-text-main-600'
                  >
                    Savannah Nguyen
                  </Link>
                </h4>
                <span className='text-neutral-500'>Digital Marketer</span>
              </div>
            </div>
          </div>
          <div className='col-xl-3 col-lg-4 col-sm-6'>
            <div className='instructor-item-two scale-hover-item social-hover'>
              <div className='instructor-item-two__thumb text-center rounded-circle aspect-ratio-1 p-12 border border-neutral-30 position-relative'>
                <div className='instructor-item-two__thumb-inner w-100 h-100 d-block bg-main-25 rounded-circle overflow-hidden position-relative'>
                  <img
                    src='assets/images/thumbs/instructor-img4.png'
                    alt=''
                    className='cover-img'
                  />
                  <ul className='social-list flex-center gap-12 d-flex position-absolute start-50 top-50 w-100 h-100 translate-middle'>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.facebook.com'
                        className='flex-center border border-white text-white w-44 h-44 rounded-circle text-xl text-main-600 bg-white hover-bg-main-600 hover-text-white hover-border-main-600'
                      >
                        <i className='ph-bold ph-facebook-logo' />
                      </Link>
                    </li>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.twitter.com'
                        className='flex-center border border-white text-white w-44 h-44 rounded-circle text-xl text-main-600 bg-white hover-bg-main-600 hover-text-white hover-border-main-600'
                      >
                        <i className='ph-bold ph-twitter-logo' />
                      </Link>
                    </li>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.linkedin.com'
                        className='flex-center border border-white text-white w-44 h-44 rounded-circle text-xl text-main-600 bg-white hover-bg-main-600 hover-text-white hover-border-main-600'
                      >
                        <i className='ph-bold ph-instagram-logo' />
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className='text-center mt-24'>
                <h4 className='mb-12'>
                  <Link
                    to='/instructor-details'
                    className='text-neutral-700 hover-text-main-600'
                  >
                    Jenny Wilson
                  </Link>
                </h4>
                <span className='text-neutral-500'>WordPress Expert</span>
              </div>
            </div>
          </div>
          <div className='col-xl-3 col-lg-4 col-sm-6'>
            <div className='instructor-item-two scale-hover-item social-hover'>
              <div className='instructor-item-two__thumb text-center rounded-circle aspect-ratio-1 p-12 border border-neutral-30 position-relative'>
                <div className='instructor-item-two__thumb-inner w-100 h-100 d-block bg-main-25 rounded-circle overflow-hidden position-relative'>
                  <img
                    src='assets/images/thumbs/instructor-img5.png'
                    alt=''
                    className='cover-img'
                  />
                  <ul className='social-list flex-center gap-12 d-flex position-absolute start-50 top-50 w-100 h-100 translate-middle'>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.facebook.com'
                        className='flex-center border border-white text-white w-44 h-44 rounded-circle text-xl text-main-600 bg-white hover-bg-main-600 hover-text-white hover-border-main-600'
                      >
                        <i className='ph-bold ph-facebook-logo' />
                      </Link>
                    </li>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.twitter.com'
                        className='flex-center border border-white text-white w-44 h-44 rounded-circle text-xl text-main-600 bg-white hover-bg-main-600 hover-text-white hover-border-main-600'
                      >
                        <i className='ph-bold ph-twitter-logo' />
                      </Link>
                    </li>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.linkedin.com'
                        className='flex-center border border-white text-white w-44 h-44 rounded-circle text-xl text-main-600 bg-white hover-bg-main-600 hover-text-white hover-border-main-600'
                      >
                        <i className='ph-bold ph-instagram-logo' />
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className='text-center mt-24'>
                <h4 className='mb-12'>
                  <Link
                    to='/instructor-details'
                    className='text-neutral-700 hover-text-main-600'
                  >
                    Cameron Williamson
                  </Link>
                </h4>
                <span className='text-neutral-500'>PHP Expert</span>
              </div>
            </div>
          </div>
          <div className='col-xl-3 col-lg-4 col-sm-6'>
            <div className='instructor-item-two scale-hover-item social-hover'>
              <div className='instructor-item-two__thumb text-center rounded-circle aspect-ratio-1 p-12 border border-neutral-30 position-relative'>
                <div className='instructor-item-two__thumb-inner w-100 h-100 d-block bg-main-25 rounded-circle overflow-hidden position-relative'>
                  <img
                    src='assets/images/thumbs/instructor-img6.png'
                    alt=''
                    className='cover-img'
                  />
                  <ul className='social-list flex-center gap-12 d-flex position-absolute start-50 top-50 w-100 h-100 translate-middle'>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.facebook.com'
                        className='flex-center border border-white text-white w-44 h-44 rounded-circle text-xl text-main-600 bg-white hover-bg-main-600 hover-text-white hover-border-main-600'
                      >
                        <i className='ph-bold ph-facebook-logo' />
                      </Link>
                    </li>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.twitter.com'
                        className='flex-center border border-white text-white w-44 h-44 rounded-circle text-xl text-main-600 bg-white hover-bg-main-600 hover-text-white hover-border-main-600'
                      >
                        <i className='ph-bold ph-twitter-logo' />
                      </Link>
                    </li>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.linkedin.com'
                        className='flex-center border border-white text-white w-44 h-44 rounded-circle text-xl text-main-600 bg-white hover-bg-main-600 hover-text-white hover-border-main-600'
                      >
                        <i className='ph-bold ph-instagram-logo' />
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className='text-center mt-24'>
                <h4 className='mb-12'>
                  <Link
                    to='/instructor-details'
                    className='text-neutral-700 hover-text-main-600'
                  >
                    Wade Warren
                  </Link>
                </h4>
                <span className='text-neutral-500'>Python Developer</span>
              </div>
            </div>
          </div>
          <div className='col-xl-3 col-lg-4 col-sm-6'>
            <div className='instructor-item-two scale-hover-item social-hover'>
              <div className='instructor-item-two__thumb text-center rounded-circle aspect-ratio-1 p-12 border border-neutral-30 position-relative'>
                <div className='instructor-item-two__thumb-inner w-100 h-100 d-block bg-main-25 rounded-circle overflow-hidden position-relative'>
                  <img
                    src='assets/images/thumbs/instructor-img1.png'
                    alt=''
                    className='cover-img'
                  />
                  <ul className='social-list flex-center gap-12 d-flex position-absolute start-50 top-50 w-100 h-100 translate-middle'>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.facebook.com'
                        className='flex-center border border-white text-white w-44 h-44 rounded-circle text-xl text-main-600 bg-white hover-bg-main-600 hover-text-white hover-border-main-600'
                      >
                        <i className='ph-bold ph-facebook-logo' />
                      </Link>
                    </li>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.twitter.com'
                        className='flex-center border border-white text-white w-44 h-44 rounded-circle text-xl text-main-600 bg-white hover-bg-main-600 hover-text-white hover-border-main-600'
                      >
                        <i className='ph-bold ph-twitter-logo' />
                      </Link>
                    </li>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.linkedin.com'
                        className='flex-center border border-white text-white w-44 h-44 rounded-circle text-xl text-main-600 bg-white hover-bg-main-600 hover-text-white hover-border-main-600'
                      >
                        <i className='ph-bold ph-instagram-logo' />
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className='text-center mt-24'>
                <h4 className='mb-12'>
                  <Link
                    to='/instructor-details'
                    className='text-neutral-700 hover-text-main-600'
                  >
                    Kathryn Murphy
                  </Link>
                </h4>
                <span className='text-neutral-500'>Java Expert</span>
              </div>
            </div>
          </div>
          <div className='col-xl-3 col-lg-4 col-sm-6'>
            <div className='instructor-item-two scale-hover-item social-hover'>
              <div className='instructor-item-two__thumb text-center rounded-circle aspect-ratio-1 p-12 border border-neutral-30 position-relative'>
                <div className='instructor-item-two__thumb-inner w-100 h-100 d-block bg-main-25 rounded-circle overflow-hidden position-relative'>
                  <img
                    src='assets/images/thumbs/instructor-img3.png'
                    alt=''
                    className='cover-img'
                  />
                  <ul className='social-list flex-center gap-12 d-flex position-absolute start-50 top-50 w-100 h-100 translate-middle'>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.facebook.com'
                        className='flex-center border border-white text-white w-44 h-44 rounded-circle text-xl text-main-600 bg-white hover-bg-main-600 hover-text-white hover-border-main-600'
                      >
                        <i className='ph-bold ph-facebook-logo' />
                      </Link>
                    </li>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.twitter.com'
                        className='flex-center border border-white text-white w-44 h-44 rounded-circle text-xl text-main-600 bg-white hover-bg-main-600 hover-text-white hover-border-main-600'
                      >
                        <i className='ph-bold ph-twitter-logo' />
                      </Link>
                    </li>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.linkedin.com'
                        className='flex-center border border-white text-white w-44 h-44 rounded-circle text-xl text-main-600 bg-white hover-bg-main-600 hover-text-white hover-border-main-600'
                      >
                        <i className='ph-bold ph-instagram-logo' />
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className='text-center mt-24'>
                <h4 className='mb-12'>
                  <Link
                    to='/instructor-details'
                    className='text-neutral-700 hover-text-main-600'
                  >
                    Devon Lane
                  </Link>
                </h4>
                <span className='text-neutral-500'>C++ Expert</span>
              </div>
            </div>
          </div>
        </div>
        <ul className='pagination mt-40 flex-align gap-12 flex-wrap justify-content-center'>
          <li className='page-item'>
            <Link
              className='page-link text-neutral-700 fw-semibold w-40 h-40 bg-main-25 rounded-circle hover-bg-main-600 border-neutral-30 hover-border-main-600 hover-text-white flex-center p-0'
              to='#'
            >
              <i className='ph-bold ph-caret-left' />
            </Link>
          </li>
          <li className='page-item'>
            <Link
              className='page-link text-neutral-700 fw-semibold w-40 h-40 bg-main-25 rounded-circle hover-bg-main-600 border-neutral-30 hover-border-main-600 hover-text-white flex-center p-0'
              to='#'
            >
              1
            </Link>
          </li>
          <li className='page-item'>
            <Link
              className='page-link text-neutral-700 fw-semibold w-40 h-40 bg-main-25 rounded-circle hover-bg-main-600 border-neutral-30 hover-border-main-600 hover-text-white flex-center p-0'
              to='#'
            >
              2
            </Link>
          </li>
          <li className='page-item'>
            <Link
              className='page-link text-neutral-700 fw-semibold w-40 h-40 bg-main-25 rounded-circle hover-bg-main-600 border-neutral-30 hover-border-main-600 hover-text-white flex-center p-0'
              to='#'
            >
              3
            </Link>
          </li>
          <li className='page-item'>
            <Link
              className='page-link text-neutral-700 fw-semibold w-40 h-40 bg-main-25 rounded-circle hover-bg-main-600 border-neutral-30 hover-border-main-600 hover-text-white flex-center p-0'
              to='#'
            >
              ...
            </Link>
          </li>
          <li className='page-item'>
            <Link
              className='page-link text-neutral-700 fw-semibold w-40 h-40 bg-main-25 rounded-circle hover-bg-main-600 border-neutral-30 hover-border-main-600 hover-text-white flex-center p-0'
              to='#'
            >
              <i className='ph-bold ph-caret-right' />
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default InstructorAllTwo;
