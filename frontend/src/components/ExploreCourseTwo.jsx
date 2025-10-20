import { Link } from "react-router-dom";

const ExploreCourseTwo = () => {
  return (
    <section className='explore-course py-120 bg-main-25 position-relative z-1'>
      <img
        src='assets/images/shapes/shape2.png'
        alt=''
        className='shape six animation-scalation'
      />
      <div className='container'>
        <div className='section-heading text-center'>
          <div className='flex-align d-inline-flex gap-8 mb-16 wow bounceInDown'>
            <span className='text-main-600 text-2xl d-flex'>
              <i className='ph-bold ph-book' />
            </span>
            <h5 className='text-main-600 mb-0'>Popular Courses</h5>
          </div>
          <h2 className='mb-24 wow bounceIn'>Pick A Course To Get Started</h2>
          <p className=' wow bounceInUp'>
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
              className='nav nav-pills common-tab edit gap-16'
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
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <span className='course-item__user border border-white flex-center w-60 h-60 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                      <img
                        src='assets/images/thumbs/user-two-img1.png'
                        alt=''
                      />
                    </span>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Marketing
                        </Link>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Beginner
                        </Link>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Introduction to Digital Marketing
                        </Link>
                      </h4>
                      <div className='flex-align gap-28 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-clock' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            9h 36m
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-users' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            1.5K
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <div className='flex-align gap-4'>
                        <span className='text-2xl fw-medium text-warning-600 d-flex'>
                          <i className='ph-fill ph-star' />
                        </span>
                        <span className='text-lg text-neutral-700 fw-medium'>
                          4.7
                          <span className='text-neutral-100 fw-normal'>
                            (6.4k)
                          </span>
                        </span>
                      </div>
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
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <span className='course-item__user border border-white flex-center w-60 h-60 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                      <img
                        src='assets/images/thumbs/user-two-img2.png'
                        alt=''
                      />
                    </span>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Python
                        </Link>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Beginner
                        </Link>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Mastering Python : From Zero to Hero
                        </Link>
                      </h4>
                      <div className='flex-align gap-28 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-clock' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            9h 36m
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-users' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            1.5K
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <div className='flex-align gap-4'>
                        <span className='text-2xl fw-medium text-warning-600 d-flex'>
                          <i className='ph-fill ph-star' />
                        </span>
                        <span className='text-lg text-neutral-700 fw-medium'>
                          4.7
                          <span className='text-neutral-100 fw-normal'>
                            (6.4k)
                          </span>
                        </span>
                      </div>
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
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <span className='course-item__user border border-white flex-center w-60 h-60 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                      <img
                        src='assets/images/thumbs/user-two-img3.png'
                        alt=''
                      />
                    </span>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Graphic Design
                        </Link>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Beginner
                        </Link>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Beginner's Guide to Adobe Photoshop
                        </Link>
                      </h4>
                      <div className='flex-align gap-28 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-clock' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            9h 36m
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-users' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            1.5K
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <div className='flex-align gap-4'>
                        <span className='text-2xl fw-medium text-warning-600 d-flex'>
                          <i className='ph-fill ph-star' />
                        </span>
                        <span className='text-lg text-neutral-700 fw-medium'>
                          4.7
                          <span className='text-neutral-100 fw-normal'>
                            (6.4k)
                          </span>
                        </span>
                      </div>
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
                        src='assets/images/thumbs/course-img3.png'
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <span className='course-item__user border border-white flex-center w-60 h-60 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                      <img
                        src='assets/images/thumbs/user-two-img3.png'
                        alt=''
                      />
                    </span>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          ART Design
                        </Link>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Beginner
                        </Link>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          The Art of Public Speaking online Course
                        </Link>
                      </h4>
                      <div className='flex-align gap-28 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-clock' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            9h 36m
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-users' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            1.5K
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <div className='flex-align gap-4'>
                        <span className='text-2xl fw-medium text-warning-600 d-flex'>
                          <i className='ph-fill ph-star' />
                        </span>
                        <span className='text-lg text-neutral-700 fw-medium'>
                          4.7
                          <span className='text-neutral-100 fw-normal'>
                            (6.4k)
                          </span>
                        </span>
                      </div>
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
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <span className='course-item__user border border-white flex-center w-60 h-60 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                      <img
                        src='assets/images/thumbs/user-two-img5.png'
                        alt=''
                      />
                    </span>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          AI Machine
                        </Link>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Beginner
                        </Link>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Introduction to Machine Learning AI
                        </Link>
                      </h4>
                      <div className='flex-align gap-28 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-clock' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            9h 36m
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-users' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            1.5K
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <div className='flex-align gap-4'>
                        <span className='text-2xl fw-medium text-warning-600 d-flex'>
                          <i className='ph-fill ph-star' />
                        </span>
                        <span className='text-lg text-neutral-700 fw-medium'>
                          4.7
                          <span className='text-neutral-100 fw-normal'>
                            (6.4k)
                          </span>
                        </span>
                      </div>
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
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <span className='course-item__user border border-white flex-center w-60 h-60 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                      <img
                        src='assets/images/thumbs/user-two-img3.png'
                        alt=''
                      />
                    </span>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Yoga
                        </Link>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Beginner
                        </Link>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Yoga for Wellness: A Comprehensive Guide
                        </Link>
                      </h4>
                      <div className='flex-align gap-28 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-clock' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            9h 36m
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-users' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            1.5K
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <div className='flex-align gap-4'>
                        <span className='text-2xl fw-medium text-warning-600 d-flex'>
                          <i className='ph-fill ph-star' />
                        </span>
                        <span className='text-lg text-neutral-700 fw-medium'>
                          4.7
                          <span className='text-neutral-100 fw-normal'>
                            (6.4k)
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='text-center'>
              <Link
                to='/course'
                className='btn btn-outline-main rounded-pill flex-align d-inline-flex gap-8 mt-40'
              >
                See All Courses
                <i className='ph-bold ph-arrow-up-right d-flex text-lg' />
              </Link>
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
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <span className='course-item__user border border-white flex-center w-60 h-60 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                      <img
                        src='assets/images/thumbs/user-two-img1.png'
                        alt=''
                      />
                    </span>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Marketing
                        </Link>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Beginner
                        </Link>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Introduction to Digital Marketing
                        </Link>
                      </h4>
                      <div className='flex-align gap-28 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-clock' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            9h 36m
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-users' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            1.5K
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <div className='flex-align gap-4'>
                        <span className='text-2xl fw-medium text-warning-600 d-flex'>
                          <i className='ph-fill ph-star' />
                        </span>
                        <span className='text-lg text-neutral-700 fw-medium'>
                          4.7
                          <span className='text-neutral-100 fw-normal'>
                            (6.4k)
                          </span>
                        </span>
                      </div>
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
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <span className='course-item__user border border-white flex-center w-60 h-60 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                      <img
                        src='assets/images/thumbs/user-two-img2.png'
                        alt=''
                      />
                    </span>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Python
                        </Link>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Beginner
                        </Link>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Mastering Python : From Zero to Hero
                        </Link>
                      </h4>
                      <div className='flex-align gap-28 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-clock' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            9h 36m
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-users' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            1.5K
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <div className='flex-align gap-4'>
                        <span className='text-2xl fw-medium text-warning-600 d-flex'>
                          <i className='ph-fill ph-star' />
                        </span>
                        <span className='text-lg text-neutral-700 fw-medium'>
                          4.7
                          <span className='text-neutral-100 fw-normal'>
                            (6.4k)
                          </span>
                        </span>
                      </div>
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
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <span className='course-item__user border border-white flex-center w-60 h-60 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                      <img
                        src='assets/images/thumbs/user-two-img3.png'
                        alt=''
                      />
                    </span>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Graphic Design
                        </Link>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Beginner
                        </Link>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Beginner's Guide to Adobe Photoshop
                        </Link>
                      </h4>
                      <div className='flex-align gap-28 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-clock' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            9h 36m
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-users' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            1.5K
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <div className='flex-align gap-4'>
                        <span className='text-2xl fw-medium text-warning-600 d-flex'>
                          <i className='ph-fill ph-star' />
                        </span>
                        <span className='text-lg text-neutral-700 fw-medium'>
                          4.7
                          <span className='text-neutral-100 fw-normal'>
                            (6.4k)
                          </span>
                        </span>
                      </div>
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
                        src='assets/images/thumbs/course-img3.png'
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <span className='course-item__user border border-white flex-center w-60 h-60 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                      <img
                        src='assets/images/thumbs/user-two-img3.png'
                        alt=''
                      />
                    </span>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          ART Design
                        </Link>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Beginner
                        </Link>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          The Art of Public Speaking online Course
                        </Link>
                      </h4>
                      <div className='flex-align gap-28 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-clock' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            9h 36m
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-users' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            1.5K
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <div className='flex-align gap-4'>
                        <span className='text-2xl fw-medium text-warning-600 d-flex'>
                          <i className='ph-fill ph-star' />
                        </span>
                        <span className='text-lg text-neutral-700 fw-medium'>
                          4.7
                          <span className='text-neutral-100 fw-normal'>
                            (6.4k)
                          </span>
                        </span>
                      </div>
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
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <span className='course-item__user border border-white flex-center w-60 h-60 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                      <img
                        src='assets/images/thumbs/user-two-img5.png'
                        alt=''
                      />
                    </span>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          AI Machine
                        </Link>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Beginner
                        </Link>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Introduction to Machine Learning AI
                        </Link>
                      </h4>
                      <div className='flex-align gap-28 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-clock' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            9h 36m
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-users' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            1.5K
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <div className='flex-align gap-4'>
                        <span className='text-2xl fw-medium text-warning-600 d-flex'>
                          <i className='ph-fill ph-star' />
                        </span>
                        <span className='text-lg text-neutral-700 fw-medium'>
                          4.7
                          <span className='text-neutral-100 fw-normal'>
                            (6.4k)
                          </span>
                        </span>
                      </div>
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
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <span className='course-item__user border border-white flex-center w-60 h-60 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                      <img
                        src='assets/images/thumbs/user-two-img3.png'
                        alt=''
                      />
                    </span>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Yoga
                        </Link>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Beginner
                        </Link>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Yoga for Wellness: A Comprehensive Guide
                        </Link>
                      </h4>
                      <div className='flex-align gap-28 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-clock' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            9h 36m
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-users' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            1.5K
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <div className='flex-align gap-4'>
                        <span className='text-2xl fw-medium text-warning-600 d-flex'>
                          <i className='ph-fill ph-star' />
                        </span>
                        <span className='text-lg text-neutral-700 fw-medium'>
                          4.7
                          <span className='text-neutral-100 fw-normal'>
                            (6.4k)
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='text-center'>
              <Link
                to='/course'
                className='btn btn-outline-main rounded-pill flex-align d-inline-flex gap-8 mt-40'
              >
                See All Courses
                <i className='ph-bold ph-arrow-up-right d-flex text-lg' />
              </Link>
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
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <span className='course-item__user border border-white flex-center w-60 h-60 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                      <img
                        src='assets/images/thumbs/user-two-img1.png'
                        alt=''
                      />
                    </span>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Marketing
                        </Link>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Beginner
                        </Link>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Introduction to Digital Marketing
                        </Link>
                      </h4>
                      <div className='flex-align gap-28 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-clock' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            9h 36m
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-users' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            1.5K
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <div className='flex-align gap-4'>
                        <span className='text-2xl fw-medium text-warning-600 d-flex'>
                          <i className='ph-fill ph-star' />
                        </span>
                        <span className='text-lg text-neutral-700 fw-medium'>
                          4.7
                          <span className='text-neutral-100 fw-normal'>
                            (6.4k)
                          </span>
                        </span>
                      </div>
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
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <span className='course-item__user border border-white flex-center w-60 h-60 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                      <img
                        src='assets/images/thumbs/user-two-img2.png'
                        alt=''
                      />
                    </span>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Python
                        </Link>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Beginner
                        </Link>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Mastering Python : From Zero to Hero
                        </Link>
                      </h4>
                      <div className='flex-align gap-28 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-clock' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            9h 36m
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-users' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            1.5K
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <div className='flex-align gap-4'>
                        <span className='text-2xl fw-medium text-warning-600 d-flex'>
                          <i className='ph-fill ph-star' />
                        </span>
                        <span className='text-lg text-neutral-700 fw-medium'>
                          4.7
                          <span className='text-neutral-100 fw-normal'>
                            (6.4k)
                          </span>
                        </span>
                      </div>
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
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <span className='course-item__user border border-white flex-center w-60 h-60 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                      <img
                        src='assets/images/thumbs/user-two-img3.png'
                        alt=''
                      />
                    </span>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Graphic Design
                        </Link>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Beginner
                        </Link>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Beginner's Guide to Adobe Photoshop
                        </Link>
                      </h4>
                      <div className='flex-align gap-28 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-clock' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            9h 36m
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-users' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            1.5K
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <div className='flex-align gap-4'>
                        <span className='text-2xl fw-medium text-warning-600 d-flex'>
                          <i className='ph-fill ph-star' />
                        </span>
                        <span className='text-lg text-neutral-700 fw-medium'>
                          4.7
                          <span className='text-neutral-100 fw-normal'>
                            (6.4k)
                          </span>
                        </span>
                      </div>
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
                        src='assets/images/thumbs/course-img3.png'
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <span className='course-item__user border border-white flex-center w-60 h-60 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                      <img
                        src='assets/images/thumbs/user-two-img3.png'
                        alt=''
                      />
                    </span>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          ART Design
                        </Link>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Beginner
                        </Link>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          The Art of Public Speaking online Course
                        </Link>
                      </h4>
                      <div className='flex-align gap-28 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-clock' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            9h 36m
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-users' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            1.5K
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <div className='flex-align gap-4'>
                        <span className='text-2xl fw-medium text-warning-600 d-flex'>
                          <i className='ph-fill ph-star' />
                        </span>
                        <span className='text-lg text-neutral-700 fw-medium'>
                          4.7
                          <span className='text-neutral-100 fw-normal'>
                            (6.4k)
                          </span>
                        </span>
                      </div>
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
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <span className='course-item__user border border-white flex-center w-60 h-60 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                      <img
                        src='assets/images/thumbs/user-two-img5.png'
                        alt=''
                      />
                    </span>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          AI Machine
                        </Link>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Beginner
                        </Link>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Introduction to Machine Learning AI
                        </Link>
                      </h4>
                      <div className='flex-align gap-28 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-clock' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            9h 36m
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-users' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            1.5K
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <div className='flex-align gap-4'>
                        <span className='text-2xl fw-medium text-warning-600 d-flex'>
                          <i className='ph-fill ph-star' />
                        </span>
                        <span className='text-lg text-neutral-700 fw-medium'>
                          4.7
                          <span className='text-neutral-100 fw-normal'>
                            (6.4k)
                          </span>
                        </span>
                      </div>
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
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <span className='course-item__user border border-white flex-center w-60 h-60 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                      <img
                        src='assets/images/thumbs/user-two-img3.png'
                        alt=''
                      />
                    </span>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Yoga
                        </Link>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Beginner
                        </Link>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Yoga for Wellness: A Comprehensive Guide
                        </Link>
                      </h4>
                      <div className='flex-align gap-28 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-clock' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            9h 36m
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-users' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            1.5K
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <div className='flex-align gap-4'>
                        <span className='text-2xl fw-medium text-warning-600 d-flex'>
                          <i className='ph-fill ph-star' />
                        </span>
                        <span className='text-lg text-neutral-700 fw-medium'>
                          4.7
                          <span className='text-neutral-100 fw-normal'>
                            (6.4k)
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='text-center'>
              <Link
                to='/course'
                className='btn btn-outline-main rounded-pill flex-align d-inline-flex gap-8 mt-40'
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
                data-aos-duration={200}
              >
                <div className='course-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                    <Link to='/course-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/course-img1.png'
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <span className='course-item__user border border-white flex-center w-60 h-60 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                      <img
                        src='assets/images/thumbs/user-two-img1.png'
                        alt=''
                      />
                    </span>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Marketing
                        </Link>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Beginner
                        </Link>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Introduction to Digital Marketing
                        </Link>
                      </h4>
                      <div className='flex-align gap-28 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-clock' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            9h 36m
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-users' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            1.5K
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <div className='flex-align gap-4'>
                        <span className='text-2xl fw-medium text-warning-600 d-flex'>
                          <i className='ph-fill ph-star' />
                        </span>
                        <span className='text-lg text-neutral-700 fw-medium'>
                          4.7
                          <span className='text-neutral-100 fw-normal'>
                            (6.4k)
                          </span>
                        </span>
                      </div>
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
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <span className='course-item__user border border-white flex-center w-60 h-60 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                      <img
                        src='assets/images/thumbs/user-two-img2.png'
                        alt=''
                      />
                    </span>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Python
                        </Link>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Beginner
                        </Link>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Mastering Python : From Zero to Hero
                        </Link>
                      </h4>
                      <div className='flex-align gap-28 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-clock' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            9h 36m
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-users' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            1.5K
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <div className='flex-align gap-4'>
                        <span className='text-2xl fw-medium text-warning-600 d-flex'>
                          <i className='ph-fill ph-star' />
                        </span>
                        <span className='text-lg text-neutral-700 fw-medium'>
                          4.7
                          <span className='text-neutral-100 fw-normal'>
                            (6.4k)
                          </span>
                        </span>
                      </div>
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
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <span className='course-item__user border border-white flex-center w-60 h-60 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                      <img
                        src='assets/images/thumbs/user-two-img3.png'
                        alt=''
                      />
                    </span>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Graphic Design
                        </Link>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Beginner
                        </Link>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Beginner's Guide to Adobe Photoshop
                        </Link>
                      </h4>
                      <div className='flex-align gap-28 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-clock' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            9h 36m
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-users' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            1.5K
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <div className='flex-align gap-4'>
                        <span className='text-2xl fw-medium text-warning-600 d-flex'>
                          <i className='ph-fill ph-star' />
                        </span>
                        <span className='text-lg text-neutral-700 fw-medium'>
                          4.7
                          <span className='text-neutral-100 fw-normal'>
                            (6.4k)
                          </span>
                        </span>
                      </div>
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
                        src='assets/images/thumbs/course-img3.png'
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <span className='course-item__user border border-white flex-center w-60 h-60 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                      <img
                        src='assets/images/thumbs/user-two-img3.png'
                        alt=''
                      />
                    </span>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          ART Design
                        </Link>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Beginner
                        </Link>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          The Art of Public Speaking online Course
                        </Link>
                      </h4>
                      <div className='flex-align gap-28 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-clock' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            9h 36m
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-users' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            1.5K
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <div className='flex-align gap-4'>
                        <span className='text-2xl fw-medium text-warning-600 d-flex'>
                          <i className='ph-fill ph-star' />
                        </span>
                        <span className='text-lg text-neutral-700 fw-medium'>
                          4.7
                          <span className='text-neutral-100 fw-normal'>
                            (6.4k)
                          </span>
                        </span>
                      </div>
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
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <span className='course-item__user border border-white flex-center w-60 h-60 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                      <img
                        src='assets/images/thumbs/user-two-img5.png'
                        alt=''
                      />
                    </span>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          AI Machine
                        </Link>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Beginner
                        </Link>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Introduction to Machine Learning AI
                        </Link>
                      </h4>
                      <div className='flex-align gap-28 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-clock' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            9h 36m
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-users' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            1.5K
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <div className='flex-align gap-4'>
                        <span className='text-2xl fw-medium text-warning-600 d-flex'>
                          <i className='ph-fill ph-star' />
                        </span>
                        <span className='text-lg text-neutral-700 fw-medium'>
                          4.7
                          <span className='text-neutral-100 fw-normal'>
                            (6.4k)
                          </span>
                        </span>
                      </div>
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
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <span className='course-item__user border border-white flex-center w-60 h-60 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                      <img
                        src='assets/images/thumbs/user-two-img3.png'
                        alt=''
                      />
                    </span>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Yoga
                        </Link>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Beginner
                        </Link>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Yoga for Wellness: A Comprehensive Guide
                        </Link>
                      </h4>
                      <div className='flex-align gap-28 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-clock' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            9h 36m
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-users' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            1.5K
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <div className='flex-align gap-4'>
                        <span className='text-2xl fw-medium text-warning-600 d-flex'>
                          <i className='ph-fill ph-star' />
                        </span>
                        <span className='text-lg text-neutral-700 fw-medium'>
                          4.7
                          <span className='text-neutral-100 fw-normal'>
                            (6.4k)
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='text-center'>
              <Link
                to='/course'
                className='btn btn-outline-main rounded-pill flex-align d-inline-flex gap-8 mt-40'
              >
                See All Courses
                <i className='ph-bold ph-arrow-up-right d-flex text-lg' />
              </Link>
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
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <span className='course-item__user border border-white flex-center w-60 h-60 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                      <img
                        src='assets/images/thumbs/user-two-img1.png'
                        alt=''
                      />
                    </span>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Marketing
                        </Link>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Beginner
                        </Link>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Introduction to Digital Marketing
                        </Link>
                      </h4>
                      <div className='flex-align gap-28 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-clock' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            9h 36m
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-users' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            1.5K
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <div className='flex-align gap-4'>
                        <span className='text-2xl fw-medium text-warning-600 d-flex'>
                          <i className='ph-fill ph-star' />
                        </span>
                        <span className='text-lg text-neutral-700 fw-medium'>
                          4.7
                          <span className='text-neutral-100 fw-normal'>
                            (6.4k)
                          </span>
                        </span>
                      </div>
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
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <span className='course-item__user border border-white flex-center w-60 h-60 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                      <img
                        src='assets/images/thumbs/user-two-img2.png'
                        alt=''
                      />
                    </span>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Python
                        </Link>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Beginner
                        </Link>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Mastering Python : From Zero to Hero
                        </Link>
                      </h4>
                      <div className='flex-align gap-28 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-clock' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            9h 36m
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-users' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            1.5K
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <div className='flex-align gap-4'>
                        <span className='text-2xl fw-medium text-warning-600 d-flex'>
                          <i className='ph-fill ph-star' />
                        </span>
                        <span className='text-lg text-neutral-700 fw-medium'>
                          4.7
                          <span className='text-neutral-100 fw-normal'>
                            (6.4k)
                          </span>
                        </span>
                      </div>
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
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <span className='course-item__user border border-white flex-center w-60 h-60 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                      <img
                        src='assets/images/thumbs/user-two-img3.png'
                        alt=''
                      />
                    </span>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Graphic Design
                        </Link>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Beginner
                        </Link>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Beginner's Guide to Adobe Photoshop
                        </Link>
                      </h4>
                      <div className='flex-align gap-28 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-clock' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            9h 36m
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-users' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            1.5K
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <div className='flex-align gap-4'>
                        <span className='text-2xl fw-medium text-warning-600 d-flex'>
                          <i className='ph-fill ph-star' />
                        </span>
                        <span className='text-lg text-neutral-700 fw-medium'>
                          4.7
                          <span className='text-neutral-100 fw-normal'>
                            (6.4k)
                          </span>
                        </span>
                      </div>
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
                        src='assets/images/thumbs/course-img3.png'
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <span className='course-item__user border border-white flex-center w-60 h-60 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                      <img
                        src='assets/images/thumbs/user-two-img3.png'
                        alt=''
                      />
                    </span>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          ART Design
                        </Link>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Beginner
                        </Link>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          The Art of Public Speaking online Course
                        </Link>
                      </h4>
                      <div className='flex-align gap-28 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-clock' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            9h 36m
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-users' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            1.5K
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <div className='flex-align gap-4'>
                        <span className='text-2xl fw-medium text-warning-600 d-flex'>
                          <i className='ph-fill ph-star' />
                        </span>
                        <span className='text-lg text-neutral-700 fw-medium'>
                          4.7
                          <span className='text-neutral-100 fw-normal'>
                            (6.4k)
                          </span>
                        </span>
                      </div>
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
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <span className='course-item__user border border-white flex-center w-60 h-60 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                      <img
                        src='assets/images/thumbs/user-two-img5.png'
                        alt=''
                      />
                    </span>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          AI Machine
                        </Link>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Beginner
                        </Link>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Introduction to Machine Learning AI
                        </Link>
                      </h4>
                      <div className='flex-align gap-28 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-clock' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            9h 36m
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-users' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            1.5K
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <div className='flex-align gap-4'>
                        <span className='text-2xl fw-medium text-warning-600 d-flex'>
                          <i className='ph-fill ph-star' />
                        </span>
                        <span className='text-lg text-neutral-700 fw-medium'>
                          4.7
                          <span className='text-neutral-100 fw-normal'>
                            (6.4k)
                          </span>
                        </span>
                      </div>
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
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <span className='course-item__user border border-white flex-center w-60 h-60 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                      <img
                        src='assets/images/thumbs/user-two-img3.png'
                        alt=''
                      />
                    </span>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Yoga
                        </Link>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Beginner
                        </Link>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Yoga for Wellness: A Comprehensive Guide
                        </Link>
                      </h4>
                      <div className='flex-align gap-28 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-clock' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            9h 36m
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-users' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            1.5K
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <div className='flex-align gap-4'>
                        <span className='text-2xl fw-medium text-warning-600 d-flex'>
                          <i className='ph-fill ph-star' />
                        </span>
                        <span className='text-lg text-neutral-700 fw-medium'>
                          4.7
                          <span className='text-neutral-100 fw-normal'>
                            (6.4k)
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='text-center'>
              <Link
                to='/course'
                className='btn btn-outline-main rounded-pill flex-align d-inline-flex gap-8 mt-40'
              >
                See All Courses
                <i className='ph-bold ph-arrow-up-right d-flex text-lg' />
              </Link>
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
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <span className='course-item__user border border-white flex-center w-60 h-60 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                      <img
                        src='assets/images/thumbs/user-two-img1.png'
                        alt=''
                      />
                    </span>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Marketing
                        </Link>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Beginner
                        </Link>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Introduction to Digital Marketing
                        </Link>
                      </h4>
                      <div className='flex-align gap-28 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-clock' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            9h 36m
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-users' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            1.5K
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <div className='flex-align gap-4'>
                        <span className='text-2xl fw-medium text-warning-600 d-flex'>
                          <i className='ph-fill ph-star' />
                        </span>
                        <span className='text-lg text-neutral-700 fw-medium'>
                          4.7
                          <span className='text-neutral-100 fw-normal'>
                            (6.4k)
                          </span>
                        </span>
                      </div>
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
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <span className='course-item__user border border-white flex-center w-60 h-60 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                      <img
                        src='assets/images/thumbs/user-two-img2.png'
                        alt=''
                      />
                    </span>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Python
                        </Link>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Beginner
                        </Link>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Mastering Python : From Zero to Hero
                        </Link>
                      </h4>
                      <div className='flex-align gap-28 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-clock' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            9h 36m
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-users' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            1.5K
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <div className='flex-align gap-4'>
                        <span className='text-2xl fw-medium text-warning-600 d-flex'>
                          <i className='ph-fill ph-star' />
                        </span>
                        <span className='text-lg text-neutral-700 fw-medium'>
                          4.7
                          <span className='text-neutral-100 fw-normal'>
                            (6.4k)
                          </span>
                        </span>
                      </div>
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
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <span className='course-item__user border border-white flex-center w-60 h-60 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                      <img
                        src='assets/images/thumbs/user-two-img3.png'
                        alt=''
                      />
                    </span>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Graphic Design
                        </Link>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Beginner
                        </Link>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Beginner's Guide to Adobe Photoshop
                        </Link>
                      </h4>
                      <div className='flex-align gap-28 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-clock' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            9h 36m
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-users' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            1.5K
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <div className='flex-align gap-4'>
                        <span className='text-2xl fw-medium text-warning-600 d-flex'>
                          <i className='ph-fill ph-star' />
                        </span>
                        <span className='text-lg text-neutral-700 fw-medium'>
                          4.7
                          <span className='text-neutral-100 fw-normal'>
                            (6.4k)
                          </span>
                        </span>
                      </div>
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
                        src='assets/images/thumbs/course-img3.png'
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <span className='course-item__user border border-white flex-center w-60 h-60 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                      <img
                        src='assets/images/thumbs/user-two-img3.png'
                        alt=''
                      />
                    </span>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          ART Design
                        </Link>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Beginner
                        </Link>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          The Art of Public Speaking online Course
                        </Link>
                      </h4>
                      <div className='flex-align gap-28 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-clock' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            9h 36m
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-users' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            1.5K
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <div className='flex-align gap-4'>
                        <span className='text-2xl fw-medium text-warning-600 d-flex'>
                          <i className='ph-fill ph-star' />
                        </span>
                        <span className='text-lg text-neutral-700 fw-medium'>
                          4.7
                          <span className='text-neutral-100 fw-normal'>
                            (6.4k)
                          </span>
                        </span>
                      </div>
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
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <span className='course-item__user border border-white flex-center w-60 h-60 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                      <img
                        src='assets/images/thumbs/user-two-img5.png'
                        alt=''
                      />
                    </span>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          AI Machine
                        </Link>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Beginner
                        </Link>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Introduction to Machine Learning AI
                        </Link>
                      </h4>
                      <div className='flex-align gap-28 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-clock' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            9h 36m
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-users' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            1.5K
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <div className='flex-align gap-4'>
                        <span className='text-2xl fw-medium text-warning-600 d-flex'>
                          <i className='ph-fill ph-star' />
                        </span>
                        <span className='text-lg text-neutral-700 fw-medium'>
                          4.7
                          <span className='text-neutral-100 fw-normal'>
                            (6.4k)
                          </span>
                        </span>
                      </div>
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
                        alt='Course'
                        className='course-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='course-item__content position-relative'>
                    <span className='course-item__user border border-white flex-center w-60 h-60 bg-white text-main-600 rounded-circle text-2xl transition-2'>
                      <img
                        src='assets/images/thumbs/user-two-img3.png'
                        alt=''
                      />
                    </span>
                    <div className=''>
                      <div className='mb-16 flex-align gap-16 flex-wrap'>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Yoga
                        </Link>
                        <Link
                          to='/course'
                          className='py-8 px-20 rounded-pill flex-align gap-8 text-main-three-600 fw-medium bg-main-three-25 hover-bg-main-three-600 hover-text-white'
                        >
                          <span className='text-xl d-flex'>
                            <i className='ph-bold ph-squares-four' />
                          </span>
                          Beginner
                        </Link>
                      </div>
                      <h4 className='mb-28'>
                        <Link to='/course-details' className='link text-line-2'>
                          Yoga for Wellness: A Comprehensive Guide
                        </Link>
                      </h4>
                      <div className='flex-align gap-28 flex-wrap mb-16'>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-video-camera' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            20
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-clock' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            9h 36m
                          </span>
                        </div>
                        <div className='flex-align gap-8'>
                          <span className='text-neutral-700 text-2xl d-flex'>
                            <i className='ph-bold ph-users' />
                          </span>
                          <span className='text-neutral-700 text-lg fw-medium'>
                            1.5K
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                      <h4 className='mb-0 text-main-two-600'>$148</h4>
                      <div className='flex-align gap-4'>
                        <span className='text-2xl fw-medium text-warning-600 d-flex'>
                          <i className='ph-fill ph-star' />
                        </span>
                        <span className='text-lg text-neutral-700 fw-medium'>
                          4.7
                          <span className='text-neutral-100 fw-normal'>
                            (6.4k)
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='text-center'>
              <Link
                to='/course'
                className='btn btn-outline-main rounded-pill flex-align d-inline-flex gap-8 mt-40'
              >
                See All Courses
                <i className='ph-bold ph-arrow-up-right d-flex text-lg' />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExploreCourseTwo;
