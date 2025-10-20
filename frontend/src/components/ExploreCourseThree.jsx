import { Link } from "react-router-dom";

const ExploreCourseThree = () => {
  return (
    <section className='explore-course py-120 bg-main-25 position-relative z-0'>
      <div className='position-absolute start-0 top-0 w-100 z-index-n9'>
        <img
          src='assets/images/shapes/cloud-shap-img2.png'
          alt=''
          className='w-100 z-n9'
        />
      </div>
      <div className='container '>
        <div className='max-w-611 text-center mx-auto mb-60'>
          <div
            className='text-main-600 fw-semibold text-xl d-flex align-items-center gap-8 mb-16 justify-content-center flex-wrap'
            data-aos='fade-down'
          >
            <span>
              <i className='ph-bold ph-book' />
            </span>
            <span>Popular Kid`s Courses</span>
          </div>
          <h2 className='mb-24 wow bounceIn'>Building a Brighter Future</h2>
          <p className='max-w-557-px text-md text-neutral-700 fw-normal wow bounceInUp'>
            Our platform is built on the principles of innovation, quality, and
            inclusivity, aiming to provide a seamless learning
          </p>
        </div>
        <div className='text-center'>
          <div
            className='nav-tab-wrapper bg-white p-16 mb-40 d-inline-block'
            data-aos='zoom-out'
          >
            <ul
              className='nav nav-pills common-tab gap-16'
              id='pills-tab'
              role='tablist'
            >
              <li className='nav-item' role='presentation'>
                <button
                  className='nav-link rounded-pill bg-main-25 text-md fw-medium text-neutral-500 flex-center w-100 gap-8 active'
                  id='pills-categories-tab'
                  data-bs-toggle='pill'
                  data-bs-target='#pills-categories'
                  type='button'
                  role='tab'
                  aria-controls='pills-categories'
                  aria-selected='true'
                >
                  <i className='text-xl d-flex ph-bold ph-squares-four' />
                  All Categories
                </button>
              </li>
              <li className='nav-item' role='presentation'>
                <button
                  className='nav-link rounded-pill bg-main-25 text-md fw-medium text-neutral-500 flex-center w-100 gap-8'
                  id='pills-Years-tab'
                  data-bs-toggle='pill'
                  data-bs-target='#pills-Years'
                  type='button'
                  role='tab'
                  aria-controls='pills-Years'
                  aria-selected='false'
                >
                  <i className='text-xl d-flex ph-bold ph-magic-wand' />
                  2-3 Years
                </button>
              </li>
              <li className='nav-item' role='presentation'>
                <button
                  className='nav-link rounded-pill bg-main-25 text-md fw-medium text-neutral-500 flex-center w-100 gap-8'
                  id='pills-oldder-tab'
                  data-bs-toggle='pill'
                  data-bs-target='#pills-oldder'
                  type='button'
                  role='tab'
                  aria-controls='pills-oldder'
                  aria-selected='false'
                >
                  <i className='text-xl d-flex ph-bold ph-code' />
                  3-4 Years
                </button>
              </li>
              <li className='nav-item' role='presentation'>
                <button
                  className='nav-link rounded-pill bg-main-25 text-md fw-medium text-neutral-500 flex-center w-100 gap-8'
                  id='pills-webDesign-tab'
                  data-bs-toggle='pill'
                  data-bs-target='#pills-webDesign'
                  type='button'
                  role='tab'
                  aria-controls='pills-webDesign'
                  aria-selected='false'
                >
                  <i className='text-xl d-flex ph-bold ph-code' />
                  4-5 Years
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className='tab-content' id='pills-tabContent'>
          <div
            className='tab-pane fade show active'
            id='pills-categories'
            role='tabpanel'
            aria-labelledby='pills-categories-tab'
            tabIndex={0}
          >
            <div className='row gy-4'>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={600}
              >
                <div className='course-item bg-white rounded-16 p-12 box-shadow-md transition-03 hover-border-main-600 border item-hover'>
                  <div className='px-20 mb-20 d-flex justify-content-between'>
                    <div className='d-flex align-items-center gap-8'>
                      <img
                        src='assets/images/icons/kids-courses-shape-img1.png'
                        alt=''
                      />
                      <span className='text-sm fw-normal'>By Wowtheme7 IT</span>
                    </div>
                    <span className='px-8 py-4 border-warning-600 border text-warning-600 rounded-6'>
                      -25%
                    </span>
                  </div>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/kids-courses-img1.png'
                        alt='Course '
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-4 px-12 rounded-8 flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white border border-success-200'
                        >
                          <span className='md'>Data &amp; Tech</span>
                        </Link>
                      </div>
                      <div className='d-flex gap-24 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            25 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-user-circle' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            2.6K Students
                          </span>
                        </div>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Creative Arts Workshop
                        </Link>
                      </h4>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border border-0'>
                      <div>
                        <div className='flex-align gap-4 mb-8'>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star-half' />
                          </span>
                        </div>
                        <span>4.8/5 (1.5K Reviews)</span>
                      </div>
                      <h4 className='mb-0 text-main-two-600'>$299</h4>
                    </div>
                    <div>
                      <Link
                        to='#'
                        className='fw-semibold text-md border border-main-600 w-100 py-12 text-center rounded-pill hover-bg-main-50 mt-32 d-none group-hover-item'
                      >
                        Preview Course
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={700}
              >
                <div className='course-item bg-white rounded-16 p-12 box-shadow-md hover-border-main-600 transition-03 border item-hover'>
                  <div className='px-20 mb-20 d-flex justify-content-between'>
                    <div className='d-flex align-items-center gap-8'>
                      <img
                        src='assets/images/icons/kids-courses-shape-img1.png'
                        alt=''
                      />
                      <span className='text-sm fw-normal'>By Wowtheme7 IT</span>
                    </div>
                    <span className='px-8 py-4 border-warning-600 border text-warning-600 rounded-6'>
                      -25%
                    </span>
                  </div>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/kids-courses-img2.png'
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-4 px-12 rounded-8 flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white border border-success-200'
                        >
                          <span className='md'>Data &amp; Tech</span>
                        </Link>
                      </div>
                      <div className='d-flex gap-24 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            25 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-user-circle' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            2.6K Students
                          </span>
                        </div>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Math Fun Adventures
                        </Link>
                      </h4>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border border-0'>
                      <div>
                        <div className='flex-align gap-4 mb-8'>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star-half' />
                          </span>
                        </div>
                        <span>4.8/5 (1.5K Reviews)</span>
                      </div>
                      <h4 className='mb-0 text-main-two-600'>$299</h4>
                    </div>
                    <div>
                      <Link
                        to='#'
                        className='fw-semibold text-md border border-main-600 w-100 py-12 text-center rounded-pill hover-bg-main-50 d-none mt-32 group-hover-item'
                      >
                        Preview Course
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={800}
              >
                <div className='course-item bg-white rounded-16 p-12 box-shadow-md hover-border-main-600 transition-03 border item-hover'>
                  <div className='px-20 mb-20 d-flex justify-content-between'>
                    <div className='d-flex align-items-center gap-8'>
                      <img
                        src='assets/images/icons/kids-courses-shape-img1.png'
                        alt=''
                      />
                      <span className='text-sm fw-normal'>By Wowtheme7 IT</span>
                    </div>
                    <span className='px-8 py-4 border-warning-600 border text-warning-600 rounded-6'>
                      -25%
                    </span>
                  </div>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/kids-courses-img3.png'
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-4 px-12 rounded-8 flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white border border-success-200'
                        >
                          <span className='md'>Data &amp; Tech</span>
                        </Link>
                      </div>
                      <div className='d-flex gap-24 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            25 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-user-circle' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            2.6K Students
                          </span>
                        </div>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Melody and Rhythm
                        </Link>
                      </h4>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border border-0'>
                      <div>
                        <div className='flex-align gap-4 mb-8'>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star-half' />
                          </span>
                        </div>
                        <span>4.8/5 (1.5K Reviews)</span>
                      </div>
                      <h4 className='mb-0 text-main-two-600'>$299</h4>
                    </div>
                    <div>
                      <Link
                        to='#'
                        className='fw-semibold text-md border border-main-600 w-100 py-12 text-center rounded-pill hover-bg-main-50 mt-32 d-none group-hover-item'
                      >
                        Preview Course
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={600}
              >
                <div className='course-item bg-white rounded-16 p-12 box-shadow-md hover-border-main-600 transition-03 border item-hover'>
                  <div className='px-20 mb-20 d-flex justify-content-between'>
                    <div className='d-flex align-items-center gap-8'>
                      <img
                        src='assets/images/icons/kids-courses-shape-img1.png'
                        alt=''
                      />
                      <span className='text-sm fw-normal'>By Wowtheme7 IT</span>
                    </div>
                    <span className='px-8 py-4 border-warning-600 border text-warning-600 rounded-6'>
                      -25%
                    </span>
                  </div>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/kids-courses-img4.png'
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-4 px-12 rounded-8 flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white border border-success-200'
                        >
                          <span className='md'>Data &amp; Tech</span>
                        </Link>
                      </div>
                      <div className='d-flex gap-24 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            25 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-user-circle' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            2.6K Students
                          </span>
                        </div>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Storytime and Imagination
                        </Link>
                      </h4>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border border-0'>
                      <div>
                        <div className='flex-align gap-4 mb-8'>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star-half' />
                          </span>
                        </div>
                        <span>4.8/5 (1.5K Reviews)</span>
                      </div>
                      <h4 className='mb-0 text-main-two-600'>$299</h4>
                    </div>
                    <div>
                      <Link
                        to='#'
                        className='fw-semibold text-md border border-main-600 w-100 py-12 text-center rounded-pill hover-bg-main-50 mt-32 d-none group-hover-item'
                      >
                        Preview Course
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={700}
              >
                <div className='course-item bg-white rounded-16 p-12 box-shadow-md hover-border-main-600 transition-03 border item-hover'>
                  <div className='px-20 mb-20 d-flex justify-content-between'>
                    <div className='d-flex align-items-center gap-8'>
                      <img
                        src='assets/images/icons/kids-courses-shape-img1.png'
                        alt=''
                      />
                      <span className='text-sm fw-normal'>By Wowtheme7 IT</span>
                    </div>
                    <span className='px-8 py-4 border-warning-600 border text-warning-600 rounded-6'>
                      -25%
                    </span>
                  </div>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/kids-courses-img5.png'
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-4 px-12 rounded-8 flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white border border-success-200'
                        >
                          <span className='md'>Data &amp; Tech</span>
                        </Link>
                      </div>
                      <div className='d-flex gap-24 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            25 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-user-circle' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            2.6K Students
                          </span>
                        </div>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Coding for Kids
                        </Link>
                      </h4>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border border-0'>
                      <div>
                        <div className='flex-align gap-4 mb-8'>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star-half' />
                          </span>
                        </div>
                        <span>4.8/5 (1.5K Reviews)</span>
                      </div>
                      <h4 className='mb-0 text-main-two-600'>$299</h4>
                    </div>
                    <div>
                      <Link
                        to='#'
                        className='fw-semibold text-md border border-main-600 w-100 py-12 text-center rounded-pill hover-bg-main-50 mt-32 d-none group-hover-item'
                      >
                        Preview Course
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={800}
              >
                <div className='course-item bg-white rounded-16 p-12 box-shadow-md hover-border-main-600 transition-03 border item-hover'>
                  <div className='px-20 mb-20 d-flex justify-content-between'>
                    <div className='d-flex align-items-center gap-8'>
                      <img
                        src='assets/images/icons/kids-courses-shape-img1.png'
                        alt=''
                      />
                      <span className='text-sm fw-normal'>By Wowtheme7 IT</span>
                    </div>
                    <span className='px-8 py-4 border-warning-600 border text-warning-600 rounded-6'>
                      -25%
                    </span>
                  </div>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/kids-courses-img6.png'
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-4 px-12 rounded-8 flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white border border-success-200'
                        >
                          <span className='md'>Data &amp; Tech</span>
                        </Link>
                      </div>
                      <div className='d-flex gap-24 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            25 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-user-circle' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            2.6K Students
                          </span>
                        </div>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Little Science Explorers
                        </Link>
                      </h4>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border border-0'>
                      <div>
                        <div className='flex-align gap-4 mb-8'>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star-half' />
                          </span>
                        </div>
                        <span>4.8/5 (1.5K Reviews)</span>
                      </div>
                      <h4 className='mb-0 text-main-two-600'>$299</h4>
                    </div>
                    <div>
                      <Link
                        to='#'
                        className='fw-semibold text-md border border-main-600 w-100 py-12 text-center rounded-pill hover-bg-main-50 mt-32 d-none group-hover-item'
                      >
                        Preview Course
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='text-center'>
              <Link
                to='/course'
                className='btn btn-outline-main transition-04 rounded-pill fw-semibold flex-align d-inline-flex gap-8 mt-40'
                data-aos='fade-left'
              >
                See All Courses
                <i className='ph-bold ph-arrow-up-right d-flex text-lg' />
              </Link>
            </div>
          </div>
          <div
            className='tab-pane fade'
            id='pills-Years'
            role='tabpanel'
            aria-labelledby='pills-Years-tab'
            tabIndex={0}
          >
            <div className='row gy-4'>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={600}
              >
                <div className='course-item bg-white rounded-16 p-12 box-shadow-md transition-03 hover-border-main-600 border item-hover'>
                  <div className='px-20 mb-20 d-flex justify-content-between'>
                    <div className='d-flex align-items-center gap-8'>
                      <img
                        src='assets/images/icons/kids-courses-shape-img1.png'
                        alt=''
                      />
                      <span className='text-sm fw-normal'>By Wowtheme7 IT</span>
                    </div>
                    <span className='px-8 py-4 border-warning-600 border text-warning-600 rounded-6'>
                      -25%
                    </span>
                  </div>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/kids-courses-img1.png'
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-4 px-12 rounded-8 flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white border border-success-200'
                        >
                          <span className='md'>Data &amp; Tech</span>
                        </Link>
                      </div>
                      <div className='d-flex gap-24 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            25 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-user-circle' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            2.6K Students
                          </span>
                        </div>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Creative Arts Workshop
                        </Link>
                      </h4>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border border-0'>
                      <div>
                        <div className='flex-align gap-4 mb-8'>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star-half' />
                          </span>
                        </div>
                        <span>4.8/5 (1.5K Reviews)</span>
                      </div>
                      <h4 className='mb-0 text-main-two-600'>$299</h4>
                    </div>
                    <div>
                      <Link
                        to='#'
                        className='fw-semibold text-md border border-main-600 w-100 py-12 text-center rounded-pill hover-bg-main-50 mt-32 d-none group-hover-item'
                      >
                        Preview Course
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={700}
              >
                <div className='course-item bg-white rounded-16 p-12 box-shadow-md hover-border-main-600 transition-03 border item-hover'>
                  <div className='px-20 mb-20 d-flex justify-content-between'>
                    <div className='d-flex align-items-center gap-8'>
                      <img
                        src='assets/images/icons/kids-courses-shape-img1.png'
                        alt=''
                      />
                      <span className='text-sm fw-normal'>By Wowtheme7 IT</span>
                    </div>
                    <span className='px-8 py-4 border-warning-600 border text-warning-600 rounded-6'>
                      -25%
                    </span>
                  </div>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/kids-courses-img2.png'
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-4 px-12 rounded-8 flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white border border-success-200'
                        >
                          <span className='md'>Data &amp; Tech</span>
                        </Link>
                      </div>
                      <div className='d-flex gap-24 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            25 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-user-circle' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            2.6K Students
                          </span>
                        </div>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Math Fun Adventures
                        </Link>
                      </h4>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border border-0'>
                      <div>
                        <div className='flex-align gap-4 mb-8'>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star-half' />
                          </span>
                        </div>
                        <span>4.8/5 (1.5K Reviews)</span>
                      </div>
                      <h4 className='mb-0 text-main-two-600'>$299</h4>
                    </div>
                    <div>
                      <Link
                        to='#'
                        className='fw-semibold text-md border border-main-600 w-100 py-12 text-center rounded-pill hover-bg-main-50 d-none mt-32 group-hover-item'
                      >
                        Preview Course
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={800}
              >
                <div className='course-item bg-white rounded-16 p-12 box-shadow-md hover-border-main-600 transition-03 border item-hover'>
                  <div className='px-20 mb-20 d-flex justify-content-between'>
                    <div className='d-flex align-items-center gap-8'>
                      <img
                        src='assets/images/icons/kids-courses-shape-img1.png'
                        alt=''
                      />
                      <span className='text-sm fw-normal'>By Wowtheme7 IT</span>
                    </div>
                    <span className='px-8 py-4 border-warning-600 border text-warning-600 rounded-6'>
                      -25%
                    </span>
                  </div>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/kids-courses-img3.png'
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-4 px-12 rounded-8 flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white border border-success-200'
                        >
                          <span className='md'>Data &amp; Tech</span>
                        </Link>
                      </div>
                      <div className='d-flex gap-24 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            25 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-user-circle' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            2.6K Students
                          </span>
                        </div>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Melody and Rhythm
                        </Link>
                      </h4>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border border-0'>
                      <div>
                        <div className='flex-align gap-4 mb-8'>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star-half' />
                          </span>
                        </div>
                        <span>4.8/5 (1.5K Reviews)</span>
                      </div>
                      <h4 className='mb-0 text-main-two-600'>$299</h4>
                    </div>
                    <div>
                      <Link
                        to='#'
                        className='fw-semibold text-md border border-main-600 w-100 py-12 text-center rounded-pill hover-bg-main-50 mt-32 d-none group-hover-item'
                      >
                        Preview Course
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={600}
              >
                <div className='course-item bg-white rounded-16 p-12 box-shadow-md hover-border-main-600 transition-03 border item-hover'>
                  <div className='px-20 mb-20 d-flex justify-content-between'>
                    <div className='d-flex align-items-center gap-8'>
                      <img
                        src='assets/images/icons/kids-courses-shape-img1.png'
                        alt=''
                      />
                      <span className='text-sm fw-normal'>By Wowtheme7 IT</span>
                    </div>
                    <span className='px-8 py-4 border-warning-600 border text-warning-600 rounded-6'>
                      -25%
                    </span>
                  </div>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/kids-courses-img4.png'
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-4 px-12 rounded-8 flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white border border-success-200'
                        >
                          <span className='md'>Data &amp; Tech</span>
                        </Link>
                      </div>
                      <div className='d-flex gap-24 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            25 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-user-circle' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            2.6K Students
                          </span>
                        </div>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Storytime and Imagination
                        </Link>
                      </h4>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border border-0'>
                      <div>
                        <div className='flex-align gap-4 mb-8'>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star-half' />
                          </span>
                        </div>
                        <span>4.8/5 (1.5K Reviews)</span>
                      </div>
                      <h4 className='mb-0 text-main-two-600'>$299</h4>
                    </div>
                    <div>
                      <Link
                        to='#'
                        className='fw-semibold text-md border border-main-600 w-100 py-12 text-center rounded-pill hover-bg-main-50 mt-32 d-none group-hover-item'
                      >
                        Preview Course
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={700}
              >
                <div className='course-item bg-white rounded-16 p-12 box-shadow-md hover-border-main-600 transition-03 border item-hover'>
                  <div className='px-20 mb-20 d-flex justify-content-between'>
                    <div className='d-flex align-items-center gap-8'>
                      <img
                        src='assets/images/icons/kids-courses-shape-img1.png'
                        alt=''
                      />
                      <span className='text-sm fw-normal'>By Wowtheme7 IT</span>
                    </div>
                    <span className='px-8 py-4 border-warning-600 border text-warning-600 rounded-6'>
                      -25%
                    </span>
                  </div>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/kids-courses-img5.png'
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-4 px-12 rounded-8 flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white border border-success-200'
                        >
                          <span className='md'>Data &amp; Tech</span>
                        </Link>
                      </div>
                      <div className='d-flex gap-24 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            25 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-user-circle' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            2.6K Students
                          </span>
                        </div>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Coding for Kids
                        </Link>
                      </h4>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border border-0'>
                      <div>
                        <div className='flex-align gap-4 mb-8'>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star-half' />
                          </span>
                        </div>
                        <span>4.8/5 (1.5K Reviews)</span>
                      </div>
                      <h4 className='mb-0 text-main-two-600'>$299</h4>
                    </div>
                    <div>
                      <Link
                        to='#'
                        className='fw-semibold text-md border border-main-600 w-100 py-12 text-center rounded-pill hover-bg-main-50 mt-32 d-none group-hover-item'
                      >
                        Preview Course
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={800}
              >
                <div className='course-item bg-white rounded-16 p-12 box-shadow-md hover-border-main-600 transition-03 border item-hover'>
                  <div className='px-20 mb-20 d-flex justify-content-between'>
                    <div className='d-flex align-items-center gap-8'>
                      <img
                        src='assets/images/icons/kids-courses-shape-img1.png'
                        alt=''
                      />
                      <span className='text-sm fw-normal'>By Wowtheme7 IT</span>
                    </div>
                    <span className='px-8 py-4 border-warning-600 border text-warning-600 rounded-6'>
                      -25%
                    </span>
                  </div>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/kids-courses-img6.png'
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-4 px-12 rounded-8 flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white border border-success-200'
                        >
                          <span className='md'>Data &amp; Tech</span>
                        </Link>
                      </div>
                      <div className='d-flex gap-24 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            25 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-user-circle' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            2.6K Students
                          </span>
                        </div>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Little Science Explorers
                        </Link>
                      </h4>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border border-0'>
                      <div>
                        <div className='flex-align gap-4 mb-8'>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star-half' />
                          </span>
                        </div>
                        <span>4.8/5 (1.5K Reviews)</span>
                      </div>
                      <h4 className='mb-0 text-main-two-600'>$299</h4>
                    </div>
                    <div>
                      <Link
                        to='#'
                        className='fw-semibold text-md border border-main-600 w-100 py-12 text-center rounded-pill hover-bg-main-50 mt-32 d-none group-hover-item'
                      >
                        Preview Course
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='text-center'>
              <Link
                to='/course'
                className='btn btn-outline-main transition-04 rounded-pill fw-semibold flex-align d-inline-flex gap-8 mt-40'
                data-aos='fade-left'
              >
                See All Courses
                <i className='ph-bold ph-arrow-up-right d-flex text-lg' />
              </Link>
            </div>
          </div>
          <div
            className='tab-pane fade'
            id='pills-oldder'
            role='tabpanel'
            aria-labelledby='pills-oldder-tab'
            tabIndex={0}
          >
            <div className='row gy-4'>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={600}
              >
                <div className='course-item bg-white rounded-16 p-12 box-shadow-md transition-03 hover-border-main-600 border item-hover'>
                  <div className='px-20 mb-20 d-flex justify-content-between'>
                    <div className='d-flex align-items-center gap-8'>
                      <img
                        src='assets/images/icons/kids-courses-shape-img1.png'
                        alt=''
                      />
                      <span className='text-sm fw-normal'>By Wowtheme7 IT</span>
                    </div>
                    <span className='px-8 py-4 border-warning-600 border text-warning-600 rounded-6'>
                      -25%
                    </span>
                  </div>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/kids-courses-img1.png'
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-4 px-12 rounded-8 flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white border border-success-200'
                        >
                          <span className='md'>Data &amp; Tech</span>
                        </Link>
                      </div>
                      <div className='d-flex gap-24 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            25 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-user-circle' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            2.6K Students
                          </span>
                        </div>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Creative Arts Workshop
                        </Link>
                      </h4>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border border-0'>
                      <div>
                        <div className='flex-align gap-4 mb-8'>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star-half' />
                          </span>
                        </div>
                        <span>4.8/5 (1.5K Reviews)</span>
                      </div>
                      <h4 className='mb-0 text-main-two-600'>$299</h4>
                    </div>
                    <div>
                      <Link
                        to='#'
                        className='fw-semibold text-md border border-main-600 w-100 py-12 text-center rounded-pill hover-bg-main-50 mt-32 d-none group-hover-item'
                      >
                        Preview Course
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={700}
              >
                <div className='course-item bg-white rounded-16 p-12 box-shadow-md hover-border-main-600 transition-03 border item-hover'>
                  <div className='px-20 mb-20 d-flex justify-content-between'>
                    <div className='d-flex align-items-center gap-8'>
                      <img
                        src='assets/images/icons/kids-courses-shape-img1.png'
                        alt=''
                      />
                      <span className='text-sm fw-normal'>By Wowtheme7 IT</span>
                    </div>
                    <span className='px-8 py-4 border-warning-600 border text-warning-600 rounded-6'>
                      -25%
                    </span>
                  </div>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/kids-courses-img2.png'
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-4 px-12 rounded-8 flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white border border-success-200'
                        >
                          <span className='md'>Data &amp; Tech</span>
                        </Link>
                      </div>
                      <div className='d-flex gap-24 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            25 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-user-circle' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            2.6K Students
                          </span>
                        </div>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Math Fun Adventures
                        </Link>
                      </h4>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border border-0'>
                      <div>
                        <div className='flex-align gap-4 mb-8'>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star-half' />
                          </span>
                        </div>
                        <span>4.8/5 (1.5K Reviews)</span>
                      </div>
                      <h4 className='mb-0 text-main-two-600'>$299</h4>
                    </div>
                    <div>
                      <Link
                        to='#'
                        className='fw-semibold text-md border border-main-600 w-100 py-12 text-center rounded-pill hover-bg-main-50 d-none mt-32 group-hover-item'
                      >
                        Preview Course
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={800}
              >
                <div className='course-item bg-white rounded-16 p-12 box-shadow-md hover-border-main-600 transition-03 border item-hover'>
                  <div className='px-20 mb-20 d-flex justify-content-between'>
                    <div className='d-flex align-items-center gap-8'>
                      <img
                        src='assets/images/icons/kids-courses-shape-img1.png'
                        alt=''
                      />
                      <span className='text-sm fw-normal'>By Wowtheme7 IT</span>
                    </div>
                    <span className='px-8 py-4 border-warning-600 border text-warning-600 rounded-6'>
                      -25%
                    </span>
                  </div>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/kids-courses-img3.png'
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-4 px-12 rounded-8 flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white border border-success-200'
                        >
                          <span className='md'>Data &amp; Tech</span>
                        </Link>
                      </div>
                      <div className='d-flex gap-24 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            25 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-user-circle' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            2.6K Students
                          </span>
                        </div>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Melody and Rhythm
                        </Link>
                      </h4>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border border-0'>
                      <div>
                        <div className='flex-align gap-4 mb-8'>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star-half' />
                          </span>
                        </div>
                        <span>4.8/5 (1.5K Reviews)</span>
                      </div>
                      <h4 className='mb-0 text-main-two-600'>$299</h4>
                    </div>
                    <div>
                      <Link
                        to='#'
                        className='fw-semibold text-md border border-main-600 w-100 py-12 text-center rounded-pill hover-bg-main-50 mt-32 d-none group-hover-item'
                      >
                        Preview Course
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={600}
              >
                <div className='course-item bg-white rounded-16 p-12 box-shadow-md hover-border-main-600 transition-03 border item-hover'>
                  <div className='px-20 mb-20 d-flex justify-content-between'>
                    <div className='d-flex align-items-center gap-8'>
                      <img
                        src='assets/images/icons/kids-courses-shape-img1.png'
                        alt=''
                      />
                      <span className='text-sm fw-normal'>By Wowtheme7 IT</span>
                    </div>
                    <span className='px-8 py-4 border-warning-600 border text-warning-600 rounded-6'>
                      -25%
                    </span>
                  </div>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/kids-courses-img4.png'
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-4 px-12 rounded-8 flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white border border-success-200'
                        >
                          <span className='md'>Data &amp; Tech</span>
                        </Link>
                      </div>
                      <div className='d-flex gap-24 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            25 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-user-circle' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            2.6K Students
                          </span>
                        </div>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Storytime and Imagination
                        </Link>
                      </h4>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border border-0'>
                      <div>
                        <div className='flex-align gap-4 mb-8'>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star-half' />
                          </span>
                        </div>
                        <span>4.8/5 (1.5K Reviews)</span>
                      </div>
                      <h4 className='mb-0 text-main-two-600'>$299</h4>
                    </div>
                    <div>
                      <Link
                        to='#'
                        className='fw-semibold text-md border border-main-600 w-100 py-12 text-center rounded-pill hover-bg-main-50 mt-32 d-none group-hover-item'
                      >
                        Preview Course
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={700}
              >
                <div className='course-item bg-white rounded-16 p-12 box-shadow-md hover-border-main-600 transition-03 border item-hover'>
                  <div className='px-20 mb-20 d-flex justify-content-between'>
                    <div className='d-flex align-items-center gap-8'>
                      <img
                        src='assets/images/icons/kids-courses-shape-img1.png'
                        alt=''
                      />
                      <span className='text-sm fw-normal'>By Wowtheme7 IT</span>
                    </div>
                    <span className='px-8 py-4 border-warning-600 border text-warning-600 rounded-6'>
                      -25%
                    </span>
                  </div>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/kids-courses-img5.png'
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-4 px-12 rounded-8 flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white border border-success-200'
                        >
                          <span className='md'>Data &amp; Tech</span>
                        </Link>
                      </div>
                      <div className='d-flex gap-24 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            25 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-user-circle' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            2.6K Students
                          </span>
                        </div>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Coding for Kids
                        </Link>
                      </h4>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border border-0'>
                      <div>
                        <div className='flex-align gap-4 mb-8'>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star-half' />
                          </span>
                        </div>
                        <span>4.8/5 (1.5K Reviews)</span>
                      </div>
                      <h4 className='mb-0 text-main-two-600'>$299</h4>
                    </div>
                    <div>
                      <Link
                        to='#'
                        className='fw-semibold text-md border border-main-600 w-100 py-12 text-center rounded-pill hover-bg-main-50 mt-32 d-none group-hover-item'
                      >
                        Preview Course
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={800}
              >
                <div className='course-item bg-white rounded-16 p-12 box-shadow-md hover-border-main-600 transition-03 border item-hover'>
                  <div className='px-20 mb-20 d-flex justify-content-between'>
                    <div className='d-flex align-items-center gap-8'>
                      <img
                        src='assets/images/icons/kids-courses-shape-img1.png'
                        alt=''
                      />
                      <span className='text-sm fw-normal'>By Wowtheme7 IT</span>
                    </div>
                    <span className='px-8 py-4 border-warning-600 border text-warning-600 rounded-6'>
                      -25%
                    </span>
                  </div>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/kids-courses-img6.png'
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-4 px-12 rounded-8 flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white border border-success-200'
                        >
                          <span className='md'>Data &amp; Tech</span>
                        </Link>
                      </div>
                      <div className='d-flex gap-24 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            25 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-user-circle' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            2.6K Students
                          </span>
                        </div>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Little Science Explorers
                        </Link>
                      </h4>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border border-0'>
                      <div>
                        <div className='flex-align gap-4 mb-8'>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star-half' />
                          </span>
                        </div>
                        <span>4.8/5 (1.5K Reviews)</span>
                      </div>
                      <h4 className='mb-0 text-main-two-600'>$299</h4>
                    </div>
                    <div>
                      <Link
                        to='#'
                        className='fw-semibold text-md border border-main-600 w-100 py-12 text-center rounded-pill hover-bg-main-50 mt-32 d-none group-hover-item'
                      >
                        Preview Course
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='text-center'>
              <Link
                to='/course'
                className='btn btn-outline-main transition-04 rounded-pill fw-semibold flex-align d-inline-flex gap-8 mt-40'
                data-aos='fade-left'
              >
                See All Courses
                <i className='ph-bold ph-arrow-up-right d-flex text-lg' />
              </Link>
            </div>
          </div>
          <div
            className='tab-pane fade'
            id='pills-webDesign'
            role='tabpanel'
            aria-labelledby='pills-webDesign-tab'
            tabIndex={0}
          >
            <div className='row gy-4'>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={600}
              >
                <div className='course-item bg-white rounded-16 p-12 box-shadow-md transition-03 hover-border-main-600 border item-hover'>
                  <div className='px-20 mb-20 d-flex justify-content-between'>
                    <div className='d-flex align-items-center gap-8'>
                      <img
                        src='assets/images/icons/kids-courses-shape-img1.png'
                        alt=''
                      />
                      <span className='text-sm fw-normal'>By Wowtheme7 IT</span>
                    </div>
                    <span className='px-8 py-4 border-warning-600 border text-warning-600 rounded-6'>
                      -25%
                    </span>
                  </div>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/kids-courses-img1.png'
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-4 px-12 rounded-8 flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white border border-success-200'
                        >
                          <span className='md'>Data &amp; Tech</span>
                        </Link>
                      </div>
                      <div className='d-flex gap-24 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            25 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-user-circle' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            2.6K Students
                          </span>
                        </div>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Creative Arts Workshop
                        </Link>
                      </h4>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border border-0'>
                      <div>
                        <div className='flex-align gap-4 mb-8'>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star-half' />
                          </span>
                        </div>
                        <span>4.8/5 (1.5K Reviews)</span>
                      </div>
                      <h4 className='mb-0 text-main-two-600'>$299</h4>
                    </div>
                    <div>
                      <Link
                        to='#'
                        className='fw-semibold text-md border border-main-600 w-100 py-12 text-center rounded-pill hover-bg-main-50 mt-32 d-none group-hover-item'
                      >
                        Preview Course
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={700}
              >
                <div className='course-item bg-white rounded-16 p-12 box-shadow-md hover-border-main-600 transition-03 border item-hover'>
                  <div className='px-20 mb-20 d-flex justify-content-between'>
                    <div className='d-flex align-items-center gap-8'>
                      <img
                        src='assets/images/icons/kids-courses-shape-img1.png'
                        alt=''
                      />
                      <span className='text-sm fw-normal'>By Wowtheme7 IT</span>
                    </div>
                    <span className='px-8 py-4 border-warning-600 border text-warning-600 rounded-6'>
                      -25%
                    </span>
                  </div>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/kids-courses-img2.png'
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-4 px-12 rounded-8 flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white border border-success-200'
                        >
                          <span className='md'>Data &amp; Tech</span>
                        </Link>
                      </div>
                      <div className='d-flex gap-24 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            25 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-user-circle' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            2.6K Students
                          </span>
                        </div>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Math Fun Adventures
                        </Link>
                      </h4>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border border-0'>
                      <div>
                        <div className='flex-align gap-4 mb-8'>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star-half' />
                          </span>
                        </div>
                        <span>4.8/5 (1.5K Reviews)</span>
                      </div>
                      <h4 className='mb-0 text-main-two-600'>$299</h4>
                    </div>
                    <div>
                      <Link
                        to='#'
                        className='fw-semibold text-md border border-main-600 w-100 py-12 text-center rounded-pill hover-bg-main-50 d-none mt-32 group-hover-item'
                      >
                        Preview Course
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={800}
              >
                <div className='course-item bg-white rounded-16 p-12 box-shadow-md hover-border-main-600 transition-03 border item-hover'>
                  <div className='px-20 mb-20 d-flex justify-content-between'>
                    <div className='d-flex align-items-center gap-8'>
                      <img
                        src='assets/images/icons/kids-courses-shape-img1.png'
                        alt=''
                      />
                      <span className='text-sm fw-normal'>By Wowtheme7 IT</span>
                    </div>
                    <span className='px-8 py-4 border-warning-600 border text-warning-600 rounded-6'>
                      -25%
                    </span>
                  </div>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/kids-courses-img3.png'
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-4 px-12 rounded-8 flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white border border-success-200'
                        >
                          <span className='md'>Data &amp; Tech</span>
                        </Link>
                      </div>
                      <div className='d-flex gap-24 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            25 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-user-circle' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            2.6K Students
                          </span>
                        </div>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Melody and Rhythm
                        </Link>
                      </h4>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border border-0'>
                      <div>
                        <div className='flex-align gap-4 mb-8'>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star-half' />
                          </span>
                        </div>
                        <span>4.8/5 (1.5K Reviews)</span>
                      </div>
                      <h4 className='mb-0 text-main-two-600'>$299</h4>
                    </div>
                    <div>
                      <Link
                        to='#'
                        className='fw-semibold text-md border border-main-600 w-100 py-12 text-center rounded-pill hover-bg-main-50 mt-32 d-none group-hover-item'
                      >
                        Preview Course
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={600}
              >
                <div className='course-item bg-white rounded-16 p-12 box-shadow-md hover-border-main-600 transition-03 border item-hover'>
                  <div className='px-20 mb-20 d-flex justify-content-between'>
                    <div className='d-flex align-items-center gap-8'>
                      <img
                        src='assets/images/icons/kids-courses-shape-img1.png'
                        alt=''
                      />
                      <span className='text-sm fw-normal'>By Wowtheme7 IT</span>
                    </div>
                    <span className='px-8 py-4 border-warning-600 border text-warning-600 rounded-6'>
                      -25%
                    </span>
                  </div>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/kids-courses-img4.png'
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-4 px-12 rounded-8 flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white border border-success-200'
                        >
                          <span className='md'>Data &amp; Tech</span>
                        </Link>
                      </div>
                      <div className='d-flex gap-24 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            25 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-user-circle' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            2.6K Students
                          </span>
                        </div>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Storytime and Imagination
                        </Link>
                      </h4>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border border-0'>
                      <div>
                        <div className='flex-align gap-4 mb-8'>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star-half' />
                          </span>
                        </div>
                        <span>4.8/5 (1.5K Reviews)</span>
                      </div>
                      <h4 className='mb-0 text-main-two-600'>$299</h4>
                    </div>
                    <div>
                      <Link
                        to='#'
                        className='fw-semibold text-md border border-main-600 w-100 py-12 text-center rounded-pill hover-bg-main-50 mt-32 d-none group-hover-item'
                      >
                        Preview Course
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={700}
              >
                <div className='course-item bg-white rounded-16 p-12 box-shadow-md hover-border-main-600 transition-03 border item-hover'>
                  <div className='px-20 mb-20 d-flex justify-content-between'>
                    <div className='d-flex align-items-center gap-8'>
                      <img
                        src='assets/images/icons/kids-courses-shape-img1.png'
                        alt=''
                      />
                      <span className='text-sm fw-normal'>By Wowtheme7 IT</span>
                    </div>
                    <span className='px-8 py-4 border-warning-600 border text-warning-600 rounded-6'>
                      -25%
                    </span>
                  </div>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/kids-courses-img5.png'
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-4 px-12 rounded-8 flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white border border-success-200'
                        >
                          <span className='md'>Data &amp; Tech</span>
                        </Link>
                      </div>
                      <div className='d-flex gap-24 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            25 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-user-circle' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            2.6K Students
                          </span>
                        </div>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Coding for Kids
                        </Link>
                      </h4>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border border-0'>
                      <div>
                        <div className='flex-align gap-4 mb-8'>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star-half' />
                          </span>
                        </div>
                        <span>4.8/5 (1.5K Reviews)</span>
                      </div>
                      <h4 className='mb-0 text-main-two-600'>$299</h4>
                    </div>
                    <div>
                      <Link
                        to='#'
                        className='fw-semibold text-md border border-main-600 w-100 py-12 text-center rounded-pill hover-bg-main-50 mt-32 d-none group-hover-item'
                      >
                        Preview Course
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={800}
              >
                <div className='course-item bg-white rounded-16 p-12 box-shadow-md hover-border-main-600 transition-03 border item-hover'>
                  <div className='px-20 mb-20 d-flex justify-content-between'>
                    <div className='d-flex align-items-center gap-8'>
                      <img
                        src='assets/images/icons/kids-courses-shape-img1.png'
                        alt=''
                      />
                      <span className='text-sm fw-normal'>By Wowtheme7 IT</span>
                    </div>
                    <span className='px-8 py-4 border-warning-600 border text-warning-600 rounded-6'>
                      -25%
                    </span>
                  </div>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/kids-courses-img6.png'
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-4 px-12 rounded-8 flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white border border-success-200'
                        >
                          <span className='md'>Data &amp; Tech</span>
                        </Link>
                      </div>
                      <div className='d-flex gap-24 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            25 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-lg d-flex'>
                            <i className='ph-bold ph-user-circle' />
                          </span>
                          <span className='text-neutral-700 text-md fw-normal'>
                            2.6K Students
                          </span>
                        </div>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Little Science Explorers
                        </Link>
                      </h4>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border border-0'>
                      <div>
                        <div className='flex-align gap-4 mb-8'>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-md fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star-half' />
                          </span>
                        </div>
                        <span>4.8/5 (1.5K Reviews)</span>
                      </div>
                      <h4 className='mb-0 text-main-two-600'>$299</h4>
                    </div>
                    <div>
                      <Link
                        to='#'
                        className='fw-semibold text-md border border-main-600 w-100 py-12 text-center rounded-pill hover-bg-main-50 mt-32 d-none group-hover-item'
                      >
                        Preview Course
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='text-center'>
              <Link
                to='/course'
                className='btn btn-outline-main transition-04 rounded-pill fw-semibold flex-align d-inline-flex gap-8 mt-40'
                data-aos='fade-left'
              >
                See All Courses
                <i className='ph-bold ph-arrow-up-right d-flex text-lg' />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className='position-absolute start-0 bottom-0 w-100 z-index-n9'>
        <img
          src='assets/images/shapes/cloud-shap-img1.png'
          alt=''
          className='w-100'
        />
      </div>
    </section>
  );
};

export default ExploreCourseThree;
