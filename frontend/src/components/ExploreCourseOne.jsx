import { Link } from "react-router-dom";

const ExploreCourseOne = () => {
  return (
    <section className='explore-course py-120 bg-main-25 position-relative z-1'>
      <img
        src='assets/images/shapes/shape2.png'
        alt=''
        className='shape six animation-scalation'
      />
      <div className='container'>
        <div className='section-heading text-center style-flex gap-24'>
          <div className='section-heading__inner text-start'>
            <h2 className='mb-0 wow bounceIn'>
              Explore 4,000+ Free Online Courses For Students
            </h2>
          </div>
          <div className='section-heading__content'>
            <p className='section-heading__desc text-start mt-0 text-line-2 wow bounceInUp'>
              Welcome to our diverse and dynamic course catalog. we're dedicated
              to providing you...
            </p>
            <Link
              to='/course-list-view'
              className='item-hover__text flex-align gap-8 text-main-600 mt-24 hover-text-decoration-underline transition-1'
              tabIndex={0}
            >
              See All Course
              <i className='ph ph-arrow-right' />
            </Link>
          </div>
        </div>
        <div
          className='nav-tab-wrapper bg-white p-16 mb-40'
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
                id='pills-design-tab'
                data-bs-toggle='pill'
                data-bs-target='#pills-design'
                type='button'
                role='tab'
                aria-controls='pills-design'
                aria-selected='false'
              >
                <i className='text-xl d-flex ph-bold ph-magic-wand' />
                Design
              </button>
            </li>
            <li className='nav-item' role='presentation'>
              <button
                className='nav-link rounded-pill bg-main-25 text-md fw-medium text-neutral-500 flex-center w-100 gap-8'
                id='pills-programming-tab'
                data-bs-toggle='pill'
                data-bs-target='#pills-programming'
                type='button'
                role='tab'
                aria-controls='pills-programming'
                aria-selected='false'
              >
                <i className='text-xl d-flex ph-bold ph-code' />
                Programming
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
                web Design
              </button>
            </li>
            <li className='nav-item' role='presentation'>
              <button
                className='nav-link rounded-pill bg-main-25 text-md fw-medium text-neutral-500 flex-center w-100 gap-8'
                id='pills-Academic-tab'
                data-bs-toggle='pill'
                data-bs-target='#pills-Academic'
                type='button'
                role='tab'
                aria-controls='pills-Academic'
                aria-selected='false'
              >
                <i className='text-xl d-flex ph-bold ph-graduation-cap' />
                Academic
              </button>
            </li>
            <li className='nav-item' role='presentation'>
              <button
                className='nav-link rounded-pill bg-main-25 text-md fw-medium text-neutral-500 flex-center w-100 gap-8'
                id='pills-marketing-tab'
                data-bs-toggle='pill'
                data-bs-target='#pills-marketing'
                type='button'
                role='tab'
                aria-controls='pills-marketing'
                aria-selected='false'
              >
                <i className='text-xl d-flex ph-bold ph-chart-pie-slice' />
                Marketing
              </button>
            </li>
          </ul>
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
                data-aos-duration={200}
              >
                <div className='course-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/course-img1.png'
                        alt='Courses For Students'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                    <div className='flex-align gap-8 bg-main-600 rounded-pill px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                      <span className='text-2xl d-flex'>
                        <i className='ph ph-clock' />
                      </span>
                      <span className='text-lg fw-medium'>9h 36m</span>
                    </div>
                    <button
                      type='button'
                      className='wishlist-btn w-48 h-48 bg-white text-main-two-600 flex-center position-absolute inset-block-start-0 inset-inline-end-0 mt-20 me-20 z-1 text-2xl rounded-circle transition-2'
                    >
                      <i className='ph ph-heart' />
                    </button>
                  </div>
                  <div className='course-item__content'>
                    <div className=''>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Introduction to Digital Marketing
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-chart-bar' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Beginner
                          </span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <img
                              src='assets/images/thumbs/user-img1.png'
                              alt='Courses For Students'
                              className='w-32 h-32 object-fit-cover rounded-circle'
                            />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            AnikaZ
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <Link
                        to='/apply-admission'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Enroll Now
                        <i className='ph ph-arrow-right' />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={400}
              >
                <div className='course-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/course-img2.png'
                        alt='Courses For Students'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                    <div className='flex-align gap-8 bg-main-600 rounded-pill px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                      <span className='text-2xl d-flex'>
                        <i className='ph ph-clock' />
                      </span>
                      <span className='text-lg fw-medium'>25h 06m</span>
                    </div>
                    <button
                      type='button'
                      className='wishlist-btn w-48 h-48 bg-white text-main-two-600 flex-center position-absolute inset-block-start-0 inset-inline-end-0 mt-20 me-20 z-1 text-2xl rounded-circle transition-2'
                    >
                      <i className='ph ph-heart' />
                    </button>
                  </div>
                  <div className='course-item__content'>
                    <div className=''>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Introduction to Python Programming
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-chart-bar' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Beginner
                          </span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <img
                              src='assets/images/thumbs/user-img2.png'
                              alt='Courses For Students'
                              className='w-32 h-32 object-fit-cover rounded-circle'
                            />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Wade
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$499</h4>
                      <Link
                        to='/apply-admission'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Enroll Now
                        <i className='ph ph-arrow-right' />
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
                <div className='course-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/course-img3.png'
                        alt='Courses For Students'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                    <div className='flex-align gap-8 bg-main-600 rounded-pill px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                      <span className='text-2xl d-flex'>
                        <i className='ph ph-clock' />
                      </span>
                      <span className='text-lg fw-medium'>9h 36m</span>
                    </div>
                    <button
                      type='button'
                      className='wishlist-btn w-48 h-48 bg-white text-main-two-600 flex-center position-absolute inset-block-start-0 inset-inline-end-0 mt-20 me-20 z-1 text-2xl rounded-circle transition-2'
                    >
                      <i className='ph ph-heart' />
                    </button>
                  </div>
                  <div className='course-item__content'>
                    <div className=''>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Introduction to Photography Masterclass
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-chart-bar' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Beginner
                          </span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <img
                              src='assets/images/thumbs/user-img3.png'
                              alt='Courses For Students'
                              className='w-32 h-32 object-fit-cover rounded-circle'
                            />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Cody
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$457</h4>
                      <Link
                        to='/apply-admission'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Enroll Now
                        <i className='ph ph-arrow-right' />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={200}
              >
                <div className='course-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/course-img4.png'
                        alt='Courses For Students'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                    <div className='flex-align gap-8 bg-main-600 rounded-pill px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                      <span className='text-2xl d-flex'>
                        <i className='ph ph-clock' />
                      </span>
                      <span className='text-lg fw-medium'>9h 36m</span>
                    </div>
                    <button
                      type='button'
                      className='wishlist-btn w-48 h-48 bg-white text-main-two-600 flex-center position-absolute inset-block-start-0 inset-inline-end-0 mt-20 me-20 z-1 text-2xl rounded-circle transition-2'
                    >
                      <i className='ph ph-heart' />
                    </button>
                  </div>
                  <div className='course-item__content'>
                    <div className=''>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Spanish Language Mastery: Beginner to Fluent
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-chart-bar' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Beginner
                          </span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <img
                              src='assets/images/thumbs/user-img4.png'
                              alt='Courses For Students'
                              className='w-32 h-32 object-fit-cover rounded-circle'
                            />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Dustin
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <Link
                        to='/apply-admission'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Enroll Now
                        <i className='ph ph-arrow-right' />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={400}
              >
                <div className='course-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/course-img5.png'
                        alt='Courses For Students'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                    <div className='flex-align gap-8 bg-main-600 rounded-pill px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                      <span className='text-2xl d-flex'>
                        <i className='ph ph-clock' />
                      </span>
                      <span className='text-lg fw-medium'>9h 36m</span>
                    </div>
                    <button
                      type='button'
                      className='wishlist-btn w-48 h-48 bg-white text-main-two-600 flex-center position-absolute inset-block-start-0 inset-inline-end-0 mt-20 me-20 z-1 text-2xl rounded-circle transition-2'
                    >
                      <i className='ph ph-heart' />
                    </button>
                  </div>
                  <div className='course-item__content'>
                    <div className=''>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Financial Planning for Millennials
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-chart-bar' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Beginner
                          </span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <img
                              src='assets/images/thumbs/user-img5.png'
                              alt='Courses For Students'
                              className='w-32 h-32 object-fit-cover rounded-circle'
                            />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Bruce
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$546</h4>
                      <Link
                        to='/apply-admission'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Enroll Now
                        <i className='ph ph-arrow-right' />
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
                <div className='course-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/course-img6.png'
                        alt='Courses For Students'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                    <div className='flex-align gap-8 bg-main-600 rounded-pill px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                      <span className='text-2xl d-flex'>
                        <i className='ph ph-clock' />
                      </span>
                      <span className='text-lg fw-medium'>9h 36m</span>
                    </div>
                    <button
                      type='button'
                      className='wishlist-btn w-48 h-48 bg-white text-main-two-600 flex-center position-absolute inset-block-start-0 inset-inline-end-0 mt-20 me-20 z-1 text-2xl rounded-circle transition-2'
                    >
                      <i className='ph ph-heart' />
                    </button>
                  </div>
                  <div className='course-item__content'>
                    <div className=''>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Nutrition Essentials for Healthy Living
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-chart-bar' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Beginner
                          </span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <img
                              src='assets/images/thumbs/user-img6.png'
                              alt='Courses For Students'
                              className='w-32 h-32 object-fit-cover rounded-circle'
                            />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Robert
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$345</h4>
                      <Link
                        to='/apply-admission'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Enroll Now
                        <i className='ph ph-arrow-right' />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className='tab-pane fade'
            id='pills-design'
            role='tabpanel'
            aria-labelledby='pills-design-tab'
            tabIndex={0}
          >
            <div className='row gy-4'>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={200}
              >
                <div className='course-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/course-img1.png'
                        alt='Courses For Students'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                    <div className='flex-align gap-8 bg-main-600 rounded-pill px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                      <span className='text-2xl d-flex'>
                        <i className='ph ph-clock' />
                      </span>
                      <span className='text-lg fw-medium'>9h 36m</span>
                    </div>
                    <button
                      type='button'
                      className='wishlist-btn w-48 h-48 bg-white text-main-two-600 flex-center position-absolute inset-block-start-0 inset-inline-end-0 mt-20 me-20 z-1 text-2xl rounded-circle transition-2'
                    >
                      <i className='ph ph-heart' />
                    </button>
                  </div>
                  <div className='course-item__content'>
                    <div className=''>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Introduction to Digital Marketing
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-chart-bar' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Beginner
                          </span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <img
                              src='assets/images/thumbs/user-img1.png'
                              alt='Courses For Students'
                              className='w-32 h-32 object-fit-cover rounded-circle'
                            />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            AnikaZ
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <Link
                        to='/apply-admission'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Enroll Now
                        <i className='ph ph-arrow-right' />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={400}
              >
                <div className='course-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/course-img2.png'
                        alt='Courses For Students'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                    <div className='flex-align gap-8 bg-main-600 rounded-pill px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                      <span className='text-2xl d-flex'>
                        <i className='ph ph-clock' />
                      </span>
                      <span className='text-lg fw-medium'>25h 06m</span>
                    </div>
                    <button
                      type='button'
                      className='wishlist-btn w-48 h-48 bg-white text-main-two-600 flex-center position-absolute inset-block-start-0 inset-inline-end-0 mt-20 me-20 z-1 text-2xl rounded-circle transition-2'
                    >
                      <i className='ph ph-heart' />
                    </button>
                  </div>
                  <div className='course-item__content'>
                    <div className=''>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Introduction to Python Programming
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-chart-bar' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Beginner
                          </span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <img
                              src='assets/images/thumbs/user-img2.png'
                              alt='Courses For Students'
                              className='w-32 h-32 object-fit-cover rounded-circle'
                            />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Wade
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$499</h4>
                      <Link
                        to='/apply-admission'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Enroll Now
                        <i className='ph ph-arrow-right' />
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
                <div className='course-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/course-img3.png'
                        alt='Courses For Students'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                    <div className='flex-align gap-8 bg-main-600 rounded-pill px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                      <span className='text-2xl d-flex'>
                        <i className='ph ph-clock' />
                      </span>
                      <span className='text-lg fw-medium'>9h 36m</span>
                    </div>
                    <button
                      type='button'
                      className='wishlist-btn w-48 h-48 bg-white text-main-two-600 flex-center position-absolute inset-block-start-0 inset-inline-end-0 mt-20 me-20 z-1 text-2xl rounded-circle transition-2'
                    >
                      <i className='ph ph-heart' />
                    </button>
                  </div>
                  <div className='course-item__content'>
                    <div className=''>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Introduction to Photography Masterclass
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-chart-bar' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Beginner
                          </span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <img
                              src='assets/images/thumbs/user-img3.png'
                              alt='Courses For Students'
                              className='w-32 h-32 object-fit-cover rounded-circle'
                            />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Cody
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$457</h4>
                      <Link
                        to='/apply-admission'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Enroll Now
                        <i className='ph ph-arrow-right' />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={200}
              >
                <div className='course-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/course-img4.png'
                        alt='Courses For Students'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                    <div className='flex-align gap-8 bg-main-600 rounded-pill px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                      <span className='text-2xl d-flex'>
                        <i className='ph ph-clock' />
                      </span>
                      <span className='text-lg fw-medium'>9h 36m</span>
                    </div>
                    <button
                      type='button'
                      className='wishlist-btn w-48 h-48 bg-white text-main-two-600 flex-center position-absolute inset-block-start-0 inset-inline-end-0 mt-20 me-20 z-1 text-2xl rounded-circle transition-2'
                    >
                      <i className='ph ph-heart' />
                    </button>
                  </div>
                  <div className='course-item__content'>
                    <div className=''>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Spanish Language Mastery: Beginner to Fluent
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-chart-bar' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Beginner
                          </span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <img
                              src='assets/images/thumbs/user-img4.png'
                              alt='Courses For Students'
                              className='w-32 h-32 object-fit-cover rounded-circle'
                            />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Dustin
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <Link
                        to='/apply-admission'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Enroll Now
                        <i className='ph ph-arrow-right' />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={400}
              >
                <div className='course-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/course-img5.png'
                        alt='Courses For Students'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                    <div className='flex-align gap-8 bg-main-600 rounded-pill px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                      <span className='text-2xl d-flex'>
                        <i className='ph ph-clock' />
                      </span>
                      <span className='text-lg fw-medium'>9h 36m</span>
                    </div>
                    <button
                      type='button'
                      className='wishlist-btn w-48 h-48 bg-white text-main-two-600 flex-center position-absolute inset-block-start-0 inset-inline-end-0 mt-20 me-20 z-1 text-2xl rounded-circle transition-2'
                    >
                      <i className='ph ph-heart' />
                    </button>
                  </div>
                  <div className='course-item__content'>
                    <div className=''>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Financial Planning for Millennials
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-chart-bar' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Beginner
                          </span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <img
                              src='assets/images/thumbs/user-img5.png'
                              alt='Courses For Students'
                              className='w-32 h-32 object-fit-cover rounded-circle'
                            />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Bruce
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$546</h4>
                      <Link
                        to='/apply-admission'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Enroll Now
                        <i className='ph ph-arrow-right' />
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
                <div className='course-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/course-img6.png'
                        alt='Courses For Students'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                    <div className='flex-align gap-8 bg-main-600 rounded-pill px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                      <span className='text-2xl d-flex'>
                        <i className='ph ph-clock' />
                      </span>
                      <span className='text-lg fw-medium'>9h 36m</span>
                    </div>
                    <button
                      type='button'
                      className='wishlist-btn w-48 h-48 bg-white text-main-two-600 flex-center position-absolute inset-block-start-0 inset-inline-end-0 mt-20 me-20 z-1 text-2xl rounded-circle transition-2'
                    >
                      <i className='ph ph-heart' />
                    </button>
                  </div>
                  <div className='course-item__content'>
                    <div className=''>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Nutrition Essentials for Healthy Living
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-chart-bar' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Beginner
                          </span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <img
                              src='assets/images/thumbs/user-img6.png'
                              alt='Courses For Students'
                              className='w-32 h-32 object-fit-cover rounded-circle'
                            />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Robert
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$345</h4>
                      <Link
                        to='/apply-admission'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Enroll Now
                        <i className='ph ph-arrow-right' />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className='tab-pane fade'
            id='pills-programming'
            role='tabpanel'
            aria-labelledby='pills-programming-tab'
            tabIndex={0}
          >
            <div className='row gy-4'>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={200}
              >
                <div className='course-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/course-img1.png'
                        alt='Courses For Students'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                    <div className='flex-align gap-8 bg-main-600 rounded-pill px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                      <span className='text-2xl d-flex'>
                        <i className='ph ph-clock' />
                      </span>
                      <span className='text-lg fw-medium'>9h 36m</span>
                    </div>
                    <button
                      type='button'
                      className='wishlist-btn w-48 h-48 bg-white text-main-two-600 flex-center position-absolute inset-block-start-0 inset-inline-end-0 mt-20 me-20 z-1 text-2xl rounded-circle transition-2'
                    >
                      <i className='ph ph-heart' />
                    </button>
                  </div>
                  <div className='course-item__content'>
                    <div className=''>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Introduction to Digital Marketing
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-chart-bar' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Beginner
                          </span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <img
                              src='assets/images/thumbs/user-img1.png'
                              alt='Courses For Students'
                              className='w-32 h-32 object-fit-cover rounded-circle'
                            />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            AnikaZ
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <Link
                        to='/apply-admission'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Enroll Now
                        <i className='ph ph-arrow-right' />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={400}
              >
                <div className='course-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/course-img2.png'
                        alt='Courses For Students'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                    <div className='flex-align gap-8 bg-main-600 rounded-pill px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                      <span className='text-2xl d-flex'>
                        <i className='ph ph-clock' />
                      </span>
                      <span className='text-lg fw-medium'>25h 06m</span>
                    </div>
                    <button
                      type='button'
                      className='wishlist-btn w-48 h-48 bg-white text-main-two-600 flex-center position-absolute inset-block-start-0 inset-inline-end-0 mt-20 me-20 z-1 text-2xl rounded-circle transition-2'
                    >
                      <i className='ph ph-heart' />
                    </button>
                  </div>
                  <div className='course-item__content'>
                    <div className=''>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Introduction to Python Programming
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-chart-bar' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Beginner
                          </span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <img
                              src='assets/images/thumbs/user-img2.png'
                              alt='Courses For Students'
                              className='w-32 h-32 object-fit-cover rounded-circle'
                            />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Wade
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$499</h4>
                      <Link
                        to='/apply-admission'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Enroll Now
                        <i className='ph ph-arrow-right' />
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
                <div className='course-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/course-img3.png'
                        alt='Courses For Students'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                    <div className='flex-align gap-8 bg-main-600 rounded-pill px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                      <span className='text-2xl d-flex'>
                        <i className='ph ph-clock' />
                      </span>
                      <span className='text-lg fw-medium'>9h 36m</span>
                    </div>
                    <button
                      type='button'
                      className='wishlist-btn w-48 h-48 bg-white text-main-two-600 flex-center position-absolute inset-block-start-0 inset-inline-end-0 mt-20 me-20 z-1 text-2xl rounded-circle transition-2'
                    >
                      <i className='ph ph-heart' />
                    </button>
                  </div>
                  <div className='course-item__content'>
                    <div className=''>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Introduction to Photography Masterclass
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-chart-bar' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Beginner
                          </span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <img
                              src='assets/images/thumbs/user-img3.png'
                              alt='Courses For Students'
                              className='w-32 h-32 object-fit-cover rounded-circle'
                            />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Cody
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$457</h4>
                      <Link
                        to='/apply-admission'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Enroll Now
                        <i className='ph ph-arrow-right' />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={200}
              >
                <div className='course-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/course-img4.png'
                        alt='Courses For Students'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                    <div className='flex-align gap-8 bg-main-600 rounded-pill px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                      <span className='text-2xl d-flex'>
                        <i className='ph ph-clock' />
                      </span>
                      <span className='text-lg fw-medium'>9h 36m</span>
                    </div>
                    <button
                      type='button'
                      className='wishlist-btn w-48 h-48 bg-white text-main-two-600 flex-center position-absolute inset-block-start-0 inset-inline-end-0 mt-20 me-20 z-1 text-2xl rounded-circle transition-2'
                    >
                      <i className='ph ph-heart' />
                    </button>
                  </div>
                  <div className='course-item__content'>
                    <div className=''>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Spanish Language Mastery: Beginner to Fluent
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-chart-bar' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Beginner
                          </span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <img
                              src='assets/images/thumbs/user-img4.png'
                              alt='Courses For Students'
                              className='w-32 h-32 object-fit-cover rounded-circle'
                            />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Dustin
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <Link
                        to='/apply-admission'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Enroll Now
                        <i className='ph ph-arrow-right' />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={400}
              >
                <div className='course-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/course-img5.png'
                        alt='Courses For Students'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                    <div className='flex-align gap-8 bg-main-600 rounded-pill px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                      <span className='text-2xl d-flex'>
                        <i className='ph ph-clock' />
                      </span>
                      <span className='text-lg fw-medium'>9h 36m</span>
                    </div>
                    <button
                      type='button'
                      className='wishlist-btn w-48 h-48 bg-white text-main-two-600 flex-center position-absolute inset-block-start-0 inset-inline-end-0 mt-20 me-20 z-1 text-2xl rounded-circle transition-2'
                    >
                      <i className='ph ph-heart' />
                    </button>
                  </div>
                  <div className='course-item__content'>
                    <div className=''>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Financial Planning for Millennials
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-chart-bar' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Beginner
                          </span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <img
                              src='assets/images/thumbs/user-img5.png'
                              alt='Courses For Students'
                              className='w-32 h-32 object-fit-cover rounded-circle'
                            />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Bruce
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$546</h4>
                      <Link
                        to='/apply-admission'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Enroll Now
                        <i className='ph ph-arrow-right' />
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
                <div className='course-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/course-img6.png'
                        alt='Courses For Students'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                    <div className='flex-align gap-8 bg-main-600 rounded-pill px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                      <span className='text-2xl d-flex'>
                        <i className='ph ph-clock' />
                      </span>
                      <span className='text-lg fw-medium'>9h 36m</span>
                    </div>
                    <button
                      type='button'
                      className='wishlist-btn w-48 h-48 bg-white text-main-two-600 flex-center position-absolute inset-block-start-0 inset-inline-end-0 mt-20 me-20 z-1 text-2xl rounded-circle transition-2'
                    >
                      <i className='ph ph-heart' />
                    </button>
                  </div>
                  <div className='course-item__content'>
                    <div className=''>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Nutrition Essentials for Healthy Living
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-chart-bar' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Beginner
                          </span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <img
                              src='assets/images/thumbs/user-img6.png'
                              alt='Courses For Students'
                              className='w-32 h-32 object-fit-cover rounded-circle'
                            />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Robert
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$345</h4>
                      <Link
                        to='/apply-admission'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Enroll Now
                        <i className='ph ph-arrow-right' />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
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
                data-aos-duration={200}
              >
                <div className='course-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/course-img1.png'
                        alt='Courses For Students'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                    <div className='flex-align gap-8 bg-main-600 rounded-pill px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                      <span className='text-2xl d-flex'>
                        <i className='ph ph-clock' />
                      </span>
                      <span className='text-lg fw-medium'>9h 36m</span>
                    </div>
                    <button
                      type='button'
                      className='wishlist-btn w-48 h-48 bg-white text-main-two-600 flex-center position-absolute inset-block-start-0 inset-inline-end-0 mt-20 me-20 z-1 text-2xl rounded-circle transition-2'
                    >
                      <i className='ph ph-heart' />
                    </button>
                  </div>
                  <div className='course-item__content'>
                    <div className=''>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Introduction to Digital Marketing
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-chart-bar' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Beginner
                          </span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <img
                              src='assets/images/thumbs/user-img1.png'
                              alt='Courses For Students'
                              className='w-32 h-32 object-fit-cover rounded-circle'
                            />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            AnikaZ
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <Link
                        to='/apply-admission'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Enroll Now
                        <i className='ph ph-arrow-right' />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={400}
              >
                <div className='course-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/course-img2.png'
                        alt='Courses For Students'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                    <div className='flex-align gap-8 bg-main-600 rounded-pill px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                      <span className='text-2xl d-flex'>
                        <i className='ph ph-clock' />
                      </span>
                      <span className='text-lg fw-medium'>25h 06m</span>
                    </div>
                    <button
                      type='button'
                      className='wishlist-btn w-48 h-48 bg-white text-main-two-600 flex-center position-absolute inset-block-start-0 inset-inline-end-0 mt-20 me-20 z-1 text-2xl rounded-circle transition-2'
                    >
                      <i className='ph ph-heart' />
                    </button>
                  </div>
                  <div className='course-item__content'>
                    <div className=''>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Introduction to Python Programming
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-chart-bar' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Beginner
                          </span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <img
                              src='assets/images/thumbs/user-img2.png'
                              alt='Courses For Students'
                              className='w-32 h-32 object-fit-cover rounded-circle'
                            />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Wade
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$499</h4>
                      <Link
                        to='/apply-admission'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Enroll Now
                        <i className='ph ph-arrow-right' />
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
                <div className='course-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/course-img3.png'
                        alt='Courses For Students'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                    <div className='flex-align gap-8 bg-main-600 rounded-pill px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                      <span className='text-2xl d-flex'>
                        <i className='ph ph-clock' />
                      </span>
                      <span className='text-lg fw-medium'>9h 36m</span>
                    </div>
                    <button
                      type='button'
                      className='wishlist-btn w-48 h-48 bg-white text-main-two-600 flex-center position-absolute inset-block-start-0 inset-inline-end-0 mt-20 me-20 z-1 text-2xl rounded-circle transition-2'
                    >
                      <i className='ph ph-heart' />
                    </button>
                  </div>
                  <div className='course-item__content'>
                    <div className=''>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Introduction to Photography Masterclass
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-chart-bar' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Beginner
                          </span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <img
                              src='assets/images/thumbs/user-img3.png'
                              alt='Courses For Students'
                              className='w-32 h-32 object-fit-cover rounded-circle'
                            />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Cody
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$457</h4>
                      <Link
                        to='/apply-admission'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Enroll Now
                        <i className='ph ph-arrow-right' />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={200}
              >
                <div className='course-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/course-img4.png'
                        alt='Courses For Students'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                    <div className='flex-align gap-8 bg-main-600 rounded-pill px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                      <span className='text-2xl d-flex'>
                        <i className='ph ph-clock' />
                      </span>
                      <span className='text-lg fw-medium'>9h 36m</span>
                    </div>
                    <button
                      type='button'
                      className='wishlist-btn w-48 h-48 bg-white text-main-two-600 flex-center position-absolute inset-block-start-0 inset-inline-end-0 mt-20 me-20 z-1 text-2xl rounded-circle transition-2'
                    >
                      <i className='ph ph-heart' />
                    </button>
                  </div>
                  <div className='course-item__content'>
                    <div className=''>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Spanish Language Mastery: Beginner to Fluent
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-chart-bar' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Beginner
                          </span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <img
                              src='assets/images/thumbs/user-img4.png'
                              alt='Courses For Students'
                              className='w-32 h-32 object-fit-cover rounded-circle'
                            />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Dustin
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <Link
                        to='/apply-admission'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Enroll Now
                        <i className='ph ph-arrow-right' />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={400}
              >
                <div className='course-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/course-img5.png'
                        alt='Courses For Students'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                    <div className='flex-align gap-8 bg-main-600 rounded-pill px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                      <span className='text-2xl d-flex'>
                        <i className='ph ph-clock' />
                      </span>
                      <span className='text-lg fw-medium'>9h 36m</span>
                    </div>
                    <button
                      type='button'
                      className='wishlist-btn w-48 h-48 bg-white text-main-two-600 flex-center position-absolute inset-block-start-0 inset-inline-end-0 mt-20 me-20 z-1 text-2xl rounded-circle transition-2'
                    >
                      <i className='ph ph-heart' />
                    </button>
                  </div>
                  <div className='course-item__content'>
                    <div className=''>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Financial Planning for Millennials
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-chart-bar' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Beginner
                          </span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <img
                              src='assets/images/thumbs/user-img5.png'
                              alt='Courses For Students'
                              className='w-32 h-32 object-fit-cover rounded-circle'
                            />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Bruce
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$546</h4>
                      <Link
                        to='/apply-admission'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Enroll Now
                        <i className='ph ph-arrow-right' />
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
                <div className='course-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/course-img6.png'
                        alt='Courses For Students'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                    <div className='flex-align gap-8 bg-main-600 rounded-pill px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                      <span className='text-2xl d-flex'>
                        <i className='ph ph-clock' />
                      </span>
                      <span className='text-lg fw-medium'>9h 36m</span>
                    </div>
                    <button
                      type='button'
                      className='wishlist-btn w-48 h-48 bg-white text-main-two-600 flex-center position-absolute inset-block-start-0 inset-inline-end-0 mt-20 me-20 z-1 text-2xl rounded-circle transition-2'
                    >
                      <i className='ph ph-heart' />
                    </button>
                  </div>
                  <div className='course-item__content'>
                    <div className=''>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Nutrition Essentials for Healthy Living
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-chart-bar' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Beginner
                          </span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <img
                              src='assets/images/thumbs/user-img6.png'
                              alt='Courses For Students'
                              className='w-32 h-32 object-fit-cover rounded-circle'
                            />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Robert
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$345</h4>
                      <Link
                        to='/apply-admission'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Enroll Now
                        <i className='ph ph-arrow-right' />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className='tab-pane fade'
            id='pills-Academic'
            role='tabpanel'
            aria-labelledby='pills-Academic-tab'
            tabIndex={0}
          >
            <div className='row gy-4'>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={200}
              >
                <div className='course-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/course-img1.png'
                        alt='Courses For Students'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                    <div className='flex-align gap-8 bg-main-600 rounded-pill px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                      <span className='text-2xl d-flex'>
                        <i className='ph ph-clock' />
                      </span>
                      <span className='text-lg fw-medium'>9h 36m</span>
                    </div>
                    <button
                      type='button'
                      className='wishlist-btn w-48 h-48 bg-white text-main-two-600 flex-center position-absolute inset-block-start-0 inset-inline-end-0 mt-20 me-20 z-1 text-2xl rounded-circle transition-2'
                    >
                      <i className='ph ph-heart' />
                    </button>
                  </div>
                  <div className='course-item__content'>
                    <div className=''>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Introduction to Digital Marketing
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-chart-bar' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Beginner
                          </span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <img
                              src='assets/images/thumbs/user-img1.png'
                              alt='Courses For Students'
                              className='w-32 h-32 object-fit-cover rounded-circle'
                            />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            AnikaZ
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <Link
                        to='/apply-admission'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Enroll Now
                        <i className='ph ph-arrow-right' />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={400}
              >
                <div className='course-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/course-img2.png'
                        alt='Courses For Students'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                    <div className='flex-align gap-8 bg-main-600 rounded-pill px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                      <span className='text-2xl d-flex'>
                        <i className='ph ph-clock' />
                      </span>
                      <span className='text-lg fw-medium'>25h 06m</span>
                    </div>
                    <button
                      type='button'
                      className='wishlist-btn w-48 h-48 bg-white text-main-two-600 flex-center position-absolute inset-block-start-0 inset-inline-end-0 mt-20 me-20 z-1 text-2xl rounded-circle transition-2'
                    >
                      <i className='ph ph-heart' />
                    </button>
                  </div>
                  <div className='course-item__content'>
                    <div className=''>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Introduction to Python Programming
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-chart-bar' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Beginner
                          </span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <img
                              src='assets/images/thumbs/user-img2.png'
                              alt='Courses For Students'
                              className='w-32 h-32 object-fit-cover rounded-circle'
                            />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Wade
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$499</h4>
                      <Link
                        to='/apply-admission'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Enroll Now
                        <i className='ph ph-arrow-right' />
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
                <div className='course-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/course-img3.png'
                        alt='Courses For Students'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                    <div className='flex-align gap-8 bg-main-600 rounded-pill px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                      <span className='text-2xl d-flex'>
                        <i className='ph ph-clock' />
                      </span>
                      <span className='text-lg fw-medium'>9h 36m</span>
                    </div>
                    <button
                      type='button'
                      className='wishlist-btn w-48 h-48 bg-white text-main-two-600 flex-center position-absolute inset-block-start-0 inset-inline-end-0 mt-20 me-20 z-1 text-2xl rounded-circle transition-2'
                    >
                      <i className='ph ph-heart' />
                    </button>
                  </div>
                  <div className='course-item__content'>
                    <div className=''>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Introduction to Photography Masterclass
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-chart-bar' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Beginner
                          </span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <img
                              src='assets/images/thumbs/user-img3.png'
                              alt='Courses For Students'
                              className='w-32 h-32 object-fit-cover rounded-circle'
                            />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Cody
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$457</h4>
                      <Link
                        to='/apply-admission'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Enroll Now
                        <i className='ph ph-arrow-right' />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={200}
              >
                <div className='course-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/course-img4.png'
                        alt='Courses For Students'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                    <div className='flex-align gap-8 bg-main-600 rounded-pill px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                      <span className='text-2xl d-flex'>
                        <i className='ph ph-clock' />
                      </span>
                      <span className='text-lg fw-medium'>9h 36m</span>
                    </div>
                    <button
                      type='button'
                      className='wishlist-btn w-48 h-48 bg-white text-main-two-600 flex-center position-absolute inset-block-start-0 inset-inline-end-0 mt-20 me-20 z-1 text-2xl rounded-circle transition-2'
                    >
                      <i className='ph ph-heart' />
                    </button>
                  </div>
                  <div className='course-item__content'>
                    <div className=''>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Spanish Language Mastery: Beginner to Fluent
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-chart-bar' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Beginner
                          </span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <img
                              src='assets/images/thumbs/user-img4.png'
                              alt='Courses For Students'
                              className='w-32 h-32 object-fit-cover rounded-circle'
                            />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Dustin
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <Link
                        to='/apply-admission'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Enroll Now
                        <i className='ph ph-arrow-right' />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={400}
              >
                <div className='course-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/course-img5.png'
                        alt='Courses For Students'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                    <div className='flex-align gap-8 bg-main-600 rounded-pill px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                      <span className='text-2xl d-flex'>
                        <i className='ph ph-clock' />
                      </span>
                      <span className='text-lg fw-medium'>9h 36m</span>
                    </div>
                    <button
                      type='button'
                      className='wishlist-btn w-48 h-48 bg-white text-main-two-600 flex-center position-absolute inset-block-start-0 inset-inline-end-0 mt-20 me-20 z-1 text-2xl rounded-circle transition-2'
                    >
                      <i className='ph ph-heart' />
                    </button>
                  </div>
                  <div className='course-item__content'>
                    <div className=''>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Financial Planning for Millennials
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-chart-bar' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Beginner
                          </span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <img
                              src='assets/images/thumbs/user-img5.png'
                              alt='Courses For Students'
                              className='w-32 h-32 object-fit-cover rounded-circle'
                            />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Bruce
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$546</h4>
                      <Link
                        to='/apply-admission'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Enroll Now
                        <i className='ph ph-arrow-right' />
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
                <div className='course-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/course-img6.png'
                        alt='Courses For Students'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                    <div className='flex-align gap-8 bg-main-600 rounded-pill px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                      <span className='text-2xl d-flex'>
                        <i className='ph ph-clock' />
                      </span>
                      <span className='text-lg fw-medium'>9h 36m</span>
                    </div>
                    <button
                      type='button'
                      className='wishlist-btn w-48 h-48 bg-white text-main-two-600 flex-center position-absolute inset-block-start-0 inset-inline-end-0 mt-20 me-20 z-1 text-2xl rounded-circle transition-2'
                    >
                      <i className='ph ph-heart' />
                    </button>
                  </div>
                  <div className='course-item__content'>
                    <div className=''>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Nutrition Essentials for Healthy Living
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-chart-bar' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Beginner
                          </span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <img
                              src='assets/images/thumbs/user-img6.png'
                              alt='Courses For Students'
                              className='w-32 h-32 object-fit-cover rounded-circle'
                            />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Robert
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$345</h4>
                      <Link
                        to='/apply-admission'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Enroll Now
                        <i className='ph ph-arrow-right' />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className='tab-pane fade'
            id='pills-marketing'
            role='tabpanel'
            aria-labelledby='pills-marketing-tab'
            tabIndex={0}
          >
            <div className='row gy-4'>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={200}
              >
                <div className='course-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/course-img1.png'
                        alt='Courses For Students'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                    <div className='flex-align gap-8 bg-main-600 rounded-pill px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                      <span className='text-2xl d-flex'>
                        <i className='ph ph-clock' />
                      </span>
                      <span className='text-lg fw-medium'>9h 36m</span>
                    </div>
                    <button
                      type='button'
                      className='wishlist-btn w-48 h-48 bg-white text-main-two-600 flex-center position-absolute inset-block-start-0 inset-inline-end-0 mt-20 me-20 z-1 text-2xl rounded-circle transition-2'
                    >
                      <i className='ph ph-heart' />
                    </button>
                  </div>
                  <div className='course-item__content'>
                    <div className=''>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Introduction to Digital Marketing
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-chart-bar' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Beginner
                          </span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <img
                              src='assets/images/thumbs/user-img1.png'
                              alt='Courses For Students'
                              className='w-32 h-32 object-fit-cover rounded-circle'
                            />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            AnikaZ
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <Link
                        to='/apply-admission'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Enroll Now
                        <i className='ph ph-arrow-right' />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={400}
              >
                <div className='course-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/course-img2.png'
                        alt='Courses For Students'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                    <div className='flex-align gap-8 bg-main-600 rounded-pill px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                      <span className='text-2xl d-flex'>
                        <i className='ph ph-clock' />
                      </span>
                      <span className='text-lg fw-medium'>25h 06m</span>
                    </div>
                    <button
                      type='button'
                      className='wishlist-btn w-48 h-48 bg-white text-main-two-600 flex-center position-absolute inset-block-start-0 inset-inline-end-0 mt-20 me-20 z-1 text-2xl rounded-circle transition-2'
                    >
                      <i className='ph ph-heart' />
                    </button>
                  </div>
                  <div className='course-item__content'>
                    <div className=''>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Introduction to Python Programming
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-chart-bar' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Beginner
                          </span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <img
                              src='assets/images/thumbs/user-img2.png'
                              alt='Courses For Students'
                              className='w-32 h-32 object-fit-cover rounded-circle'
                            />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Wade
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$499</h4>
                      <Link
                        to='/apply-admission'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Enroll Now
                        <i className='ph ph-arrow-right' />
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
                <div className='course-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/course-img3.png'
                        alt='Courses For Students'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                    <div className='flex-align gap-8 bg-main-600 rounded-pill px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                      <span className='text-2xl d-flex'>
                        <i className='ph ph-clock' />
                      </span>
                      <span className='text-lg fw-medium'>9h 36m</span>
                    </div>
                    <button
                      type='button'
                      className='wishlist-btn w-48 h-48 bg-white text-main-two-600 flex-center position-absolute inset-block-start-0 inset-inline-end-0 mt-20 me-20 z-1 text-2xl rounded-circle transition-2'
                    >
                      <i className='ph ph-heart' />
                    </button>
                  </div>
                  <div className='course-item__content'>
                    <div className=''>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Introduction to Photography Masterclass
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-chart-bar' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Beginner
                          </span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <img
                              src='assets/images/thumbs/user-img3.png'
                              alt='Courses For Students'
                              className='w-32 h-32 object-fit-cover rounded-circle'
                            />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Cody
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$457</h4>
                      <Link
                        to='/apply-admission'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Enroll Now
                        <i className='ph ph-arrow-right' />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={200}
              >
                <div className='course-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/course-img4.png'
                        alt='Courses For Students'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                    <div className='flex-align gap-8 bg-main-600 rounded-pill px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                      <span className='text-2xl d-flex'>
                        <i className='ph ph-clock' />
                      </span>
                      <span className='text-lg fw-medium'>9h 36m</span>
                    </div>
                    <button
                      type='button'
                      className='wishlist-btn w-48 h-48 bg-white text-main-two-600 flex-center position-absolute inset-block-start-0 inset-inline-end-0 mt-20 me-20 z-1 text-2xl rounded-circle transition-2'
                    >
                      <i className='ph ph-heart' />
                    </button>
                  </div>
                  <div className='course-item__content'>
                    <div className=''>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Spanish Language Mastery: Beginner to Fluent
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-chart-bar' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Beginner
                          </span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <img
                              src='assets/images/thumbs/user-img4.png'
                              alt='Courses For Students'
                              className='w-32 h-32 object-fit-cover rounded-circle'
                            />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Dustin
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <Link
                        to='/apply-admission'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Enroll Now
                        <i className='ph ph-arrow-right' />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className='col-lg-4 col-sm-6 wow fadeInUp'
                data-aos='fade-up'
                data-aos-duration={400}
              >
                <div className='course-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/course-img5.png'
                        alt='Courses For Students'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                    <div className='flex-align gap-8 bg-main-600 rounded-pill px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                      <span className='text-2xl d-flex'>
                        <i className='ph ph-clock' />
                      </span>
                      <span className='text-lg fw-medium'>9h 36m</span>
                    </div>
                    <button
                      type='button'
                      className='wishlist-btn w-48 h-48 bg-white text-main-two-600 flex-center position-absolute inset-block-start-0 inset-inline-end-0 mt-20 me-20 z-1 text-2xl rounded-circle transition-2'
                    >
                      <i className='ph ph-heart' />
                    </button>
                  </div>
                  <div className='course-item__content'>
                    <div className=''>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Financial Planning for Millennials
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-chart-bar' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Beginner
                          </span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <img
                              src='assets/images/thumbs/user-img5.png'
                              alt='Courses For Students'
                              className='w-32 h-32 object-fit-cover rounded-circle'
                            />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Bruce
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$546</h4>
                      <Link
                        to='/apply-admission'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Enroll Now
                        <i className='ph ph-arrow-right' />
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
                <div className='course-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/course-img6.png'
                        alt='Courses For Students'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                    <div className='flex-align gap-8 bg-main-600 rounded-pill px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                      <span className='text-2xl d-flex'>
                        <i className='ph ph-clock' />
                      </span>
                      <span className='text-lg fw-medium'>9h 36m</span>
                    </div>
                    <button
                      type='button'
                      className='wishlist-btn w-48 h-48 bg-white text-main-two-600 flex-center position-absolute inset-block-start-0 inset-inline-end-0 mt-20 me-20 z-1 text-2xl rounded-circle transition-2'
                    >
                      <i className='ph ph-heart' />
                    </button>
                  </div>
                  <div className='course-item__content'>
                    <div className=''>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Nutrition Essentials for Healthy Living
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20 Lessons
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-chart-bar' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Beginner
                          </span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <img
                              src='assets/images/thumbs/user-img6.png'
                              alt='Courses For Students'
                              className='w-32 h-32 object-fit-cover rounded-circle'
                            />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            Robert
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$345</h4>
                      <Link
                        to='/apply-admission'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Enroll Now
                        <i className='ph ph-arrow-right' />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExploreCourseOne;
