import { Link } from "react-router-dom";

const InstructorAll = () => {
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
          <div className='col-lg-4 col-sm-6'>
            <div className='instructor-item scale-hover-item bg-white rounded-16 p-12 h-100 border border-neutral-30'>
              <div className='rounded-12 overflow-hidden position-relative bg-dark-yellow'>
                <Link
                  to='/instructor-details'
                  className='w-100 h-100 d-flex align-items-end'
                >
                  <img
                    src='assets/images/thumbs/instructor-img4.png'
                    alt='Course'
                    className='scale-hover-item__img rounded-12 cover-img transition-2'
                  />
                </Link>
              </div>
              <div className='p-24 position-relative'>
                <div className='social-infos'>
                  <ul className='social-list flex-align flex-column gap-12 mb-12'>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.facebook.com'
                        className=' flex-center border border-white text-white w-44 h-44 rounded-circle text-xl hover-text-main hover-bg-white'
                      >
                        <i className='ph-bold ph-facebook-logo' />
                      </Link>
                    </li>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.twitter.com'
                        className=' flex-center border border-white text-white w-44 h-44 rounded-circle text-xl hover-text-main hover-bg-white'
                      >
                        <i className='ph-bold ph-twitter-logo' />
                      </Link>
                    </li>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.linkedin.com'
                        className=' flex-center border border-white text-white w-44 h-44 rounded-circle text-xl hover-text-main hover-bg-white'
                      >
                        <i className='ph-bold ph-instagram-logo' />
                      </Link>
                    </li>
                  </ul>
                  <button className='social-infos__button flex-center w-44 h-44 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                    <i className='ph-bold ph-plus' />
                  </button>
                </div>
                <div className=''>
                  <h4 className='mb-28 pb-24 border-bottom border-neutral-50 mb-24 border-dashed border-0'>
                    <Link to='/instructor-details' className='link text-line-2'>
                      Devon Lane
                    </Link>
                  </h4>
                  <div className='flex-between gap-8 flex-wrap mb-16'>
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-700 text-2xl d-flex'>
                        <i className='ph-bold ph-lightbulb' />
                      </span>
                      <span className='text-neutral-700 text-lg fw-medium'>
                        Web Developer
                      </span>
                    </div>
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-700 text-2xl d-flex'>
                        <i className='ph-bold ph-watch' />
                      </span>
                      <span className='text-neutral-700 text-lg fw-medium'>
                        7 Course
                      </span>
                    </div>
                  </div>
                  <div className='flex-between gap-8 flex-wrap'>
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-700 text-2xl d-flex'>
                        <i className='ph-bold ph-users' />
                      </span>
                      <span className='text-neutral-700 text-lg fw-medium'>
                        15k Students
                      </span>
                    </div>
                    <div className='flex-align gap-4'>
                      <span className='text-2xl fw-medium text-warning-600 d-flex'>
                        <i className='ph-fill ph-star' />
                      </span>
                      <span className='text-lg text-neutral-700'>
                        4.6
                        <span className='text-neutral-100'>(2.4k)</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className='pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                  <Link
                    to='/instructor-details'
                    className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                    tabIndex={0}
                  >
                    View Profile
                    <i className='ph ph-arrow-right' />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className='col-lg-4 col-sm-6'>
            <div className='instructor-item scale-hover-item bg-white rounded-16 p-12 h-100 border border-neutral-30'>
              <div className='rounded-12 overflow-hidden position-relative bg-dark-yellow'>
                <Link
                  to='/instructor-details'
                  className='w-100 h-100 d-flex align-items-end'
                >
                  <img
                    src='assets/images/thumbs/instructor-img2.png'
                    alt='Course'
                    className='scale-hover-item__img rounded-12 cover-img transition-2'
                  />
                </Link>
              </div>
              <div className='p-24 position-relative'>
                <div className='social-infos'>
                  <ul className='social-list flex-align flex-column gap-12 mb-12'>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.facebook.com'
                        className=' flex-center border border-white text-white w-44 h-44 rounded-circle text-xl hover-text-main hover-bg-white'
                      >
                        <i className='ph-bold ph-facebook-logo' />
                      </Link>
                    </li>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.twitter.com'
                        className=' flex-center border border-white text-white w-44 h-44 rounded-circle text-xl hover-text-main hover-bg-white'
                      >
                        <i className='ph-bold ph-twitter-logo' />
                      </Link>
                    </li>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.linkedin.com'
                        className=' flex-center border border-white text-white w-44 h-44 rounded-circle text-xl hover-text-main hover-bg-white'
                      >
                        <i className='ph-bold ph-instagram-logo' />
                      </Link>
                    </li>
                  </ul>
                  <button className='social-infos__button flex-center w-44 h-44 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                    <i className='ph-bold ph-plus' />
                  </button>
                </div>
                <div className=''>
                  <h4 className='mb-28 pb-24 border-bottom border-neutral-50 mb-24 border-dashed border-0'>
                    <Link to='/instructor-details' className='link text-line-2'>
                      John Doe
                    </Link>
                  </h4>
                  <div className='flex-between gap-8 flex-wrap mb-16'>
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-700 text-2xl d-flex'>
                        <i className='ph-bold ph-lightbulb' />
                      </span>
                      <span className='text-neutral-700 text-lg fw-medium'>
                        WordPress Expert
                      </span>
                    </div>
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-700 text-2xl d-flex'>
                        <i className='ph-bold ph-watch' />
                      </span>
                      <span className='text-neutral-700 text-lg fw-medium'>
                        6 Course
                      </span>
                    </div>
                  </div>
                  <div className='flex-between gap-8 flex-wrap'>
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-700 text-2xl d-flex'>
                        <i className='ph-bold ph-users' />
                      </span>
                      <span className='text-neutral-700 text-lg fw-medium'>
                        55k Students
                      </span>
                    </div>
                    <div className='flex-align gap-4'>
                      <span className='text-2xl fw-medium text-warning-600 d-flex'>
                        <i className='ph-fill ph-star' />
                      </span>
                      <span className='text-lg text-neutral-700'>
                        4.6
                        <span className='text-neutral-100'>(2.4k)</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className='pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                  <Link
                    to='/instructor-details'
                    className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                    tabIndex={0}
                  >
                    View Profile
                    <i className='ph ph-arrow-right' />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className='col-lg-4 col-sm-6'>
            <div className='instructor-item scale-hover-item bg-white rounded-16 p-12 h-100 border border-neutral-30'>
              <div className='rounded-12 overflow-hidden position-relative bg-dark-yellow'>
                <Link
                  to='/instructor-details'
                  className='w-100 h-100 d-flex align-items-end'
                >
                  <img
                    src='assets/images/thumbs/instructor-img3.png'
                    alt='Course'
                    className='scale-hover-item__img rounded-12 cover-img transition-2'
                  />
                </Link>
              </div>
              <div className='p-24 position-relative'>
                <div className='social-infos'>
                  <ul className='social-list flex-align flex-column gap-12 mb-12'>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.facebook.com'
                        className=' flex-center border border-white text-white w-44 h-44 rounded-circle text-xl hover-text-main hover-bg-white'
                      >
                        <i className='ph-bold ph-facebook-logo' />
                      </Link>
                    </li>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.twitter.com'
                        className=' flex-center border border-white text-white w-44 h-44 rounded-circle text-xl hover-text-main hover-bg-white'
                      >
                        <i className='ph-bold ph-twitter-logo' />
                      </Link>
                    </li>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.linkedin.com'
                        className=' flex-center border border-white text-white w-44 h-44 rounded-circle text-xl hover-text-main hover-bg-white'
                      >
                        <i className='ph-bold ph-instagram-logo' />
                      </Link>
                    </li>
                  </ul>
                  <button className='social-infos__button flex-center w-44 h-44 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                    <i className='ph-bold ph-plus' />
                  </button>
                </div>
                <div className=''>
                  <h4 className='mb-28 pb-24 border-bottom border-neutral-50 mb-24 border-dashed border-0'>
                    <Link to='/instructor-details' className='link text-line-2'>
                      Alexandar
                    </Link>
                  </h4>
                  <div className='flex-between gap-8 flex-wrap mb-16'>
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-700 text-2xl d-flex'>
                        <i className='ph-bold ph-lightbulb' />
                      </span>
                      <span className='text-neutral-700 text-lg fw-medium'>
                        UI/UX Designer
                      </span>
                    </div>
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-700 text-2xl d-flex'>
                        <i className='ph-bold ph-watch' />
                      </span>
                      <span className='text-neutral-700 text-lg fw-medium'>
                        12 Course
                      </span>
                    </div>
                  </div>
                  <div className='flex-between gap-8 flex-wrap'>
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-700 text-2xl d-flex'>
                        <i className='ph-bold ph-users' />
                      </span>
                      <span className='text-neutral-700 text-lg fw-medium'>
                        36k Students
                      </span>
                    </div>
                    <div className='flex-align gap-4'>
                      <span className='text-2xl fw-medium text-warning-600 d-flex'>
                        <i className='ph-fill ph-star' />
                      </span>
                      <span className='text-lg text-neutral-700'>
                        4.6
                        <span className='text-neutral-100'>(2.4k)</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className='pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                  <Link
                    to='/instructor-details'
                    className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                    tabIndex={0}
                  >
                    View Profile
                    <i className='ph ph-arrow-right' />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className='col-lg-4 col-sm-6'>
            <div className='instructor-item scale-hover-item bg-white rounded-16 p-12 h-100 border border-neutral-30'>
              <div className='rounded-12 overflow-hidden position-relative bg-dark-yellow'>
                <Link
                  to='/instructor-details'
                  className='w-100 h-100 d-flex align-items-end'
                >
                  <img
                    src='assets/images/thumbs/instructor-img1.png'
                    alt='Course'
                    className='scale-hover-item__img rounded-12 cover-img transition-2'
                  />
                </Link>
              </div>
              <div className='p-24 position-relative'>
                <div className='social-infos'>
                  <ul className='social-list flex-align flex-column gap-12 mb-12'>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.facebook.com'
                        className=' flex-center border border-white text-white w-44 h-44 rounded-circle text-xl hover-text-main hover-bg-white'
                      >
                        <i className='ph-bold ph-facebook-logo' />
                      </Link>
                    </li>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.twitter.com'
                        className=' flex-center border border-white text-white w-44 h-44 rounded-circle text-xl hover-text-main hover-bg-white'
                      >
                        <i className='ph-bold ph-twitter-logo' />
                      </Link>
                    </li>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.linkedin.com'
                        className=' flex-center border border-white text-white w-44 h-44 rounded-circle text-xl hover-text-main hover-bg-white'
                      >
                        <i className='ph-bold ph-instagram-logo' />
                      </Link>
                    </li>
                  </ul>
                  <button className='social-infos__button flex-center w-44 h-44 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                    <i className='ph-bold ph-plus' />
                  </button>
                </div>
                <div className=''>
                  <h4 className='mb-28 pb-24 border-bottom border-neutral-50 mb-24 border-dashed border-0'>
                    <Link to='/instructor-details' className='link text-line-2'>
                      Arlene McCoy
                    </Link>
                  </h4>
                  <div className='flex-between gap-8 flex-wrap mb-16'>
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-700 text-2xl d-flex'>
                        <i className='ph-bold ph-lightbulb' />
                      </span>
                      <span className='text-neutral-700 text-lg fw-medium'>
                        Web Development
                      </span>
                    </div>
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-700 text-2xl d-flex'>
                        <i className='ph-bold ph-watch' />
                      </span>
                      <span className='text-neutral-700 text-lg fw-medium'>
                        6 Course
                      </span>
                    </div>
                  </div>
                  <div className='flex-between gap-8 flex-wrap'>
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-700 text-2xl d-flex'>
                        <i className='ph-bold ph-users' />
                      </span>
                      <span className='text-neutral-700 text-lg fw-medium'>
                        55k Students
                      </span>
                    </div>
                    <div className='flex-align gap-4'>
                      <span className='text-2xl fw-medium text-warning-600 d-flex'>
                        <i className='ph-fill ph-star' />
                      </span>
                      <span className='text-lg text-neutral-700'>
                        4.6
                        <span className='text-neutral-100'>(2.4k)</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className='pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                  <Link
                    to='/instructor-details'
                    className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                    tabIndex={0}
                  >
                    View Profile
                    <i className='ph ph-arrow-right' />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className='col-lg-4 col-sm-6'>
            <div className='instructor-item scale-hover-item bg-white rounded-16 p-12 h-100 border border-neutral-30'>
              <div className='rounded-12 overflow-hidden position-relative bg-dark-yellow'>
                <Link
                  to='/instructor-details'
                  className='w-100 h-100 d-flex align-items-end'
                >
                  <img
                    src='assets/images/thumbs/instructor-img5.png'
                    alt='Course'
                    className='scale-hover-item__img rounded-12 cover-img transition-2'
                  />
                </Link>
              </div>
              <div className='p-24 position-relative'>
                <div className='social-infos'>
                  <ul className='social-list flex-align flex-column gap-12 mb-12'>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.facebook.com'
                        className=' flex-center border border-white text-white w-44 h-44 rounded-circle text-xl hover-text-main hover-bg-white'
                      >
                        <i className='ph-bold ph-facebook-logo' />
                      </Link>
                    </li>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.twitter.com'
                        className=' flex-center border border-white text-white w-44 h-44 rounded-circle text-xl hover-text-main hover-bg-white'
                      >
                        <i className='ph-bold ph-twitter-logo' />
                      </Link>
                    </li>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.linkedin.com'
                        className=' flex-center border border-white text-white w-44 h-44 rounded-circle text-xl hover-text-main hover-bg-white'
                      >
                        <i className='ph-bold ph-instagram-logo' />
                      </Link>
                    </li>
                  </ul>
                  <button className='social-infos__button flex-center w-44 h-44 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                    <i className='ph-bold ph-plus' />
                  </button>
                </div>
                <div className=''>
                  <h4 className='mb-28 pb-24 border-bottom border-neutral-50 mb-24 border-dashed border-0'>
                    <Link to='/instructor-details' className='link text-line-2'>
                      Albert Flores
                    </Link>
                  </h4>
                  <div className='flex-between gap-8 flex-wrap mb-16'>
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-700 text-2xl d-flex'>
                        <i className='ph-bold ph-lightbulb' />
                      </span>
                      <span className='text-neutral-700 text-lg fw-medium'>
                        Digital Marketing
                      </span>
                    </div>
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-700 text-2xl d-flex'>
                        <i className='ph-bold ph-watch' />
                      </span>
                      <span className='text-neutral-700 text-lg fw-medium'>
                        12 Course
                      </span>
                    </div>
                  </div>
                  <div className='flex-between gap-8 flex-wrap'>
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-700 text-2xl d-flex'>
                        <i className='ph-bold ph-users' />
                      </span>
                      <span className='text-neutral-700 text-lg fw-medium'>
                        26k Students
                      </span>
                    </div>
                    <div className='flex-align gap-4'>
                      <span className='text-2xl fw-medium text-warning-600 d-flex'>
                        <i className='ph-fill ph-star' />
                      </span>
                      <span className='text-lg text-neutral-700'>
                        4.6
                        <span className='text-neutral-100'>(2.4k)</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className='pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                  <Link
                    to='/instructor-details'
                    className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                    tabIndex={0}
                  >
                    View Profile
                    <i className='ph ph-arrow-right' />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className='col-lg-4 col-sm-6'>
            <div className='instructor-item scale-hover-item bg-white rounded-16 p-12 h-100 border border-neutral-30'>
              <div className='rounded-12 overflow-hidden position-relative bg-dark-yellow'>
                <Link
                  to='/instructor-details'
                  className='w-100 h-100 d-flex align-items-end'
                >
                  <img
                    src='assets/images/thumbs/instructor-img6.png'
                    alt='Course'
                    className='scale-hover-item__img rounded-12 cover-img transition-2'
                  />
                </Link>
              </div>
              <div className='p-24 position-relative'>
                <div className='social-infos'>
                  <ul className='social-list flex-align flex-column gap-12 mb-12'>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.facebook.com'
                        className=' flex-center border border-white text-white w-44 h-44 rounded-circle text-xl hover-text-main hover-bg-white'
                      >
                        <i className='ph-bold ph-facebook-logo' />
                      </Link>
                    </li>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.twitter.com'
                        className=' flex-center border border-white text-white w-44 h-44 rounded-circle text-xl hover-text-main hover-bg-white'
                      >
                        <i className='ph-bold ph-twitter-logo' />
                      </Link>
                    </li>
                    <li className='social-list__item'>
                      <Link
                        to='https://www.linkedin.com'
                        className=' flex-center border border-white text-white w-44 h-44 rounded-circle text-xl hover-text-main hover-bg-white'
                      >
                        <i className='ph-bold ph-instagram-logo' />
                      </Link>
                    </li>
                  </ul>
                  <button className='social-infos__button flex-center w-44 h-44 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                    <i className='ph-bold ph-plus' />
                  </button>
                </div>
                <div className=''>
                  <h4 className='mb-28 pb-24 border-bottom border-neutral-50 mb-24 border-dashed border-0'>
                    <Link to='/instructor-details' className='link text-line-2'>
                      Kathryn Murphy
                    </Link>
                  </h4>
                  <div className='flex-between gap-8 flex-wrap mb-16'>
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-700 text-2xl d-flex'>
                        <i className='ph-bold ph-lightbulb' />
                      </span>
                      <span className='text-neutral-700 text-lg fw-medium'>
                        Graphic Design
                      </span>
                    </div>
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-700 text-2xl d-flex'>
                        <i className='ph-bold ph-watch' />
                      </span>
                      <span className='text-neutral-700 text-lg fw-medium'>
                        5 Course
                      </span>
                    </div>
                  </div>
                  <div className='flex-between gap-8 flex-wrap'>
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-700 text-2xl d-flex'>
                        <i className='ph-bold ph-users' />
                      </span>
                      <span className='text-neutral-700 text-lg fw-medium'>
                        9k Students
                      </span>
                    </div>
                    <div className='flex-align gap-4'>
                      <span className='text-2xl fw-medium text-warning-600 d-flex'>
                        <i className='ph-fill ph-star' />
                      </span>
                      <span className='text-lg text-neutral-700'>
                        4.6
                        <span className='text-neutral-100'>(2.4k)</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className='pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                  <Link
                    to='/instructor-details'
                    className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                    tabIndex={0}
                  >
                    View Profile
                    <i className='ph ph-arrow-right' />
                  </Link>
                </div>
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

export default InstructorAll;
