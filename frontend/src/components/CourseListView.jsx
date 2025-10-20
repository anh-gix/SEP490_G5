import { useState } from "react";
import { Link } from "react-router-dom";
import ReactSlider from "react-slider";

const CourseListView = () => {
  const [values, setValues] = useState([100, 1000]);
  let [sidebarActive, setSidebarActive] = useState(false);
  let sidebarControl = () => {
    setSidebarActive(!sidebarActive);
  };
  return (
    <section className='course-list-view py-120'>
      <div className={`side-overlay ${sidebarActive ? "show" : ""}`}></div>
      <div className='container'>
        <div className='row'>
          <div className='col-lg-4'>
            <div
              className={`sidebar rounded-12 bg-main-25 p-32 border border-neutral-30 ${
                sidebarActive ? "active" : ""
              } `}
            >
              <form action='#'>
                <div className='flex-between mb-24'>
                  <h4 className='mb-0'>Filter</h4>
                  <button
                    type='button'
                    onClick={sidebarControl}
                    className='sidebar-close text-xl text-neutral-500 d-lg-none hover-text-main-600'
                  >
                    <i className='ph-bold ph-x' />
                  </button>
                </div>
                <div className='position-relative'>
                  <input
                    type='text'
                    className='common-input pe-48 rounded-pill'
                    placeholder='Enter Your Email...'
                  />
                  <button
                    type='submit'
                    className='text-neutral-500 text-xl d-flex position-absolute top-50 translate-middle-y inset-inline-end-0 me-24 hover-text-main-600'
                  >
                    <i className='ph-bold ph-magnifying-glass' />
                  </button>
                </div>
                <span className='d-block border border-neutral-30 border-dashed my-24' />
                <h6 className='text-lg mb-24 fw-medium'>Types of Categories</h6>
                <div className='d-flex flex-column gap-16'>
                  <div className='flex-between gap-16'>
                    <div className='form-check common-check mb-0'>
                      <input
                        className='form-check-input'
                        type='checkbox'
                        name='categories'
                        id={3254}
                      />
                      <label
                        className='form-check-label fw-normal flex-grow-1'
                        htmlFor={3254}
                      >
                        Health and Wellness Courses
                      </label>
                    </div>
                    <span className='text-neutral-500'>3254</span>
                  </div>
                  <div className='flex-between gap-16'>
                    <div className='form-check common-check mb-0'>
                      <input
                        className='form-check-input'
                        type='checkbox'
                        name='categories'
                        id={1522}
                      />
                      <label
                        className='form-check-label fw-normal flex-grow-1'
                        htmlFor={1522}
                      >
                        Language Courses
                      </label>
                    </div>
                    <span className='text-neutral-500'>1522</span>
                  </div>
                  <div className='flex-between gap-16'>
                    <div className='form-check common-check mb-0'>
                      <input
                        className='form-check-input'
                        type='checkbox'
                        name='categories'
                        id={2545}
                      />
                      <label
                        className='form-check-label fw-normal flex-grow-1'
                        htmlFor={2545}
                      >
                        Computer and Technology
                      </label>
                    </div>
                    <span className='text-neutral-500'>2545</span>
                  </div>
                  <div className='flex-between gap-16'>
                    <div className='form-check common-check mb-0'>
                      <input
                        className='form-check-input'
                        type='checkbox'
                        name='categories'
                        id={3215}
                      />
                      <label
                        className='form-check-label fw-normal flex-grow-1'
                        htmlFor={3215}
                      >
                        HealthWellnessCourses
                      </label>
                    </div>
                    <span className='text-neutral-500'>3215</span>
                  </div>
                  <div className='flex-between gap-16'>
                    <div className='form-check common-check mb-0'>
                      <input
                        className='form-check-input'
                        type='checkbox'
                        name='categories'
                        id={5526}
                      />
                      <label
                        className='form-check-label fw-normal flex-grow-1'
                        htmlFor={5526}
                      >
                        Business and Finance Courses
                      </label>
                    </div>
                    <span className='text-neutral-500'>5526</span>
                  </div>
                  <div className='flex-between gap-16'>
                    <div className='form-check common-check mb-0'>
                      <input
                        className='form-check-input'
                        type='checkbox'
                        name='categories'
                        id={1563}
                      />
                      <label
                        className='form-check-label fw-normal flex-grow-1'
                        htmlFor={1563}
                      >
                        Academic Courses
                      </label>
                    </div>
                    <span className='text-neutral-500'>1563</span>
                  </div>
                  <div className='flex-between gap-16'>
                    <div className='form-check common-check mb-0'>
                      <input
                        className='form-check-input'
                        type='checkbox'
                        name='categories'
                        id={4154}
                      />
                      <label
                        className='form-check-label fw-normal flex-grow-1'
                        htmlFor={4154}
                      >
                        Art and Creative Courses
                      </label>
                    </div>
                    <span className='text-neutral-500'>4154</span>
                  </div>
                  <div className='flex-between gap-16'>
                    <div className='form-check common-check mb-0'>
                      <input
                        className='form-check-input'
                        type='checkbox'
                        name='categories'
                        id='categories1'
                      />
                      <label
                        className='form-check-label fw-normal flex-grow-1'
                        htmlFor='categories1'
                      >
                        HealthWellnessCourses
                      </label>
                    </div>
                    <span className='text-neutral-500'>3215</span>
                  </div>
                  <div className='flex-between gap-16'>
                    <div className='form-check common-check mb-0'>
                      <input
                        className='form-check-input'
                        type='checkbox'
                        name='categories'
                        id={4146}
                      />
                      <label
                        className='form-check-label fw-normal flex-grow-1'
                        htmlFor={4146}
                      >
                        Professional Development
                      </label>
                    </div>
                    <span className='text-neutral-500'>4146</span>
                  </div>
                  <div className='flex-between gap-16'>
                    <div className='form-check common-check mb-0'>
                      <input
                        className='form-check-input'
                        type='checkbox'
                        name='categories'
                        id={4955}
                      />
                      <label
                        className='form-check-label fw-normal flex-grow-1'
                        htmlFor={4955}
                      >
                        Science and Engineering
                      </label>
                    </div>
                    <span className='text-neutral-500'>4955</span>
                  </div>
                </div>
                <Link
                  to='/course'
                  className='text-sm text-main-600 fw-semibold mt-24 hover-text-decoration-underline'
                >
                  See All
                </Link>
                <span className='d-block border border-neutral-30 border-dashed my-24' />
                <div>
                  <h6 className='text-lg mb-20 fw-medium'>Pricing scale</h6>
                  <div className='custom--range'>
                    <ReactSlider
                      className='horizontal-slider'
                      thumbClassName='thumb'
                      trackClassName='track'
                      defaultValue={[100, 1000]}
                      min={0}
                      max={1000}
                      value={values}
                      onChange={(newValues) => setValues(newValues)}
                      pearling
                      minDistance={10}
                    />
                    <div className='custom--range__content'>
                      <input
                        type='text'
                        id='amount'
                        readOnly
                        className='custom--range__prices text-neutral-600 text-start text-md fw-medium w-100 text-center bg-transparent border-0 outline-0'
                        value={`$${values[0]} - $${values[1]}`}
                      />
                    </div>
                  </div>
                </div>
                <span className='d-block border border-neutral-30 border-dashed my-24' />
                <h6 className='text-lg mb-24 fw-medium'>Star Category</h6>
                <div className='d-flex flex-column gap-16'>
                  <div className='flex-between gap-16'>
                    <div className='form-check common-check mb-0'>
                      <input
                        className='form-check-input'
                        type='checkbox'
                        name='categories'
                        id='star5'
                      />
                      <label
                        className='form-check-label fw-normal flex-grow-1 flex-align gap-8'
                        htmlFor='star5'
                      >
                        <span className='text-warning-600 text-xl d-flex'>
                          <i className='ph-fill ph-star' />
                        </span>
                        5 Star
                      </label>
                    </div>
                    <span className='text-neutral-500'>122</span>
                  </div>
                  <div className='flex-between gap-16'>
                    <div className='form-check common-check mb-0'>
                      <input
                        className='form-check-input'
                        type='checkbox'
                        name='categories'
                        id='star4'
                      />
                      <label
                        className='form-check-label fw-normal flex-grow-1 flex-align gap-8'
                        htmlFor='star4'
                      >
                        <span className='text-warning-600 text-xl d-flex'>
                          <i className='ph-fill ph-star' />
                        </span>
                        4 Star
                      </label>
                    </div>
                    <span className='text-neutral-500'>356</span>
                  </div>
                  <div className='flex-between gap-16'>
                    <div className='form-check common-check mb-0'>
                      <input
                        className='form-check-input'
                        type='checkbox'
                        name='categories'
                        id='star3'
                      />
                      <label
                        className='form-check-label fw-normal flex-grow-1 flex-align gap-8'
                        htmlFor='star3'
                      >
                        <span className='text-warning-600 text-xl d-flex'>
                          <i className='ph-fill ph-star' />
                        </span>
                        3 Star
                      </label>
                    </div>
                    <span className='text-neutral-500'>356</span>
                  </div>
                  <div className='flex-between gap-16'>
                    <div className='form-check common-check mb-0'>
                      <input
                        className='form-check-input'
                        type='checkbox'
                        name='categories'
                        id='star2'
                      />
                      <label
                        className='form-check-label fw-normal flex-grow-1 flex-align gap-8'
                        htmlFor='star2'
                      >
                        <span className='text-warning-600 text-xl d-flex'>
                          <i className='ph-fill ph-star' />
                        </span>
                        2 Star
                      </label>
                    </div>
                    <span className='text-neutral-500'>213</span>
                  </div>
                  <div className='flex-between gap-16'>
                    <div className='form-check common-check mb-0'>
                      <input
                        className='form-check-input'
                        type='checkbox'
                        name='categories'
                        id='star1s'
                      />
                      <label
                        className='form-check-label fw-normal flex-grow-1 flex-align gap-8'
                        htmlFor='star1s'
                      >
                        <span className='text-warning-600 text-xl d-flex'>
                          <i className='ph-fill ph-star' />
                        </span>
                        1 Star
                      </label>
                    </div>
                    <span className='text-neutral-500'>10</span>
                  </div>
                </div>
                <span className='d-block border border-neutral-30 border-dashed my-24' />
                <h6 className='text-lg mb-24 fw-medium'>Popular Tags</h6>
                <div className='flex-align flex-wrap gap-12'>
                  <Link
                    to='/course'
                    className='border border-neutral-30 px-20 py-12 rounded-pill bg-white text-neutral-500 hover-border-main-600 hover-text-main-600'
                  >
                    UI/UX Design
                  </Link>
                  <Link
                    to='/course'
                    className='border border-neutral-30 px-20 py-12 rounded-pill bg-white text-neutral-500 hover-border-main-600 hover-text-main-600'
                  >
                    Web Development
                  </Link>
                  <Link
                    to='/course'
                    className='border border-neutral-30 px-20 py-12 rounded-pill bg-white text-neutral-500 hover-border-main-600 hover-text-main-600'
                  >
                    Wordpress
                  </Link>
                  <Link
                    to='/course'
                    className='border border-neutral-30 px-20 py-12 rounded-pill bg-white text-neutral-500 hover-border-main-600 hover-text-main-600'
                  >
                    Machine Learning
                  </Link>
                  <Link
                    to='/course'
                    className='border border-neutral-30 px-20 py-12 rounded-pill bg-white text-neutral-500 hover-border-main-600 hover-text-main-600'
                  >
                    AI
                  </Link>
                  <Link
                    to='/course'
                    className='border border-neutral-30 px-20 py-12 rounded-pill bg-white text-neutral-500 hover-border-main-600 hover-text-main-600'
                  >
                    Laravel
                  </Link>
                  <Link
                    to='/course'
                    className='border border-neutral-30 px-20 py-12 rounded-pill bg-white text-neutral-500 hover-border-main-600 hover-text-main-600'
                  >
                    Python
                  </Link>
                </div>
                <Link
                  to='/course'
                  className='text-sm text-main-600 fw-semibold mt-24 hover-text-decoration-underline'
                >
                  More Tags{" "}
                </Link>
                <span className='d-block border border-neutral-30 border-dashed my-24' />
                <h6 className='text-lg mb-24 fw-medium'>Level</h6>
                <div className='d-flex flex-column gap-16'>
                  <div className='form-check common-check mb-0'>
                    <input
                      className='form-check-input'
                      type='checkbox'
                      name='categories'
                      id='AllLevels'
                    />
                    <label
                      className='form-check-label fw-normal flex-grow-1'
                      htmlFor='AllLevels'
                    >
                      All Levels
                    </label>
                  </div>
                  <div className='form-check common-check mb-0'>
                    <input
                      className='form-check-input'
                      type='checkbox'
                      name='categories'
                      id='Beginner'
                    />
                    <label
                      className='form-check-label fw-normal flex-grow-1'
                      htmlFor='Beginner'
                    >
                      Beginner
                    </label>
                  </div>
                  <div className='form-check common-check mb-0'>
                    <input
                      className='form-check-input'
                      type='checkbox'
                      name='categories'
                      id='Intermediate'
                    />
                    <label
                      className='form-check-label fw-normal flex-grow-1'
                      htmlFor='Intermediate'
                    >
                      Intermediate
                    </label>
                  </div>
                  <div className='form-check common-check mb-0'>
                    <input
                      className='form-check-input'
                      type='checkbox'
                      name='categories'
                      id='Expert'
                    />
                    <label
                      className='form-check-label fw-normal flex-grow-1'
                      htmlFor='Expert'
                    >
                      Expert
                    </label>
                  </div>
                </div>
                <span className='d-block border border-neutral-30 border-dashed my-24' />
                <button
                  type='reset'
                  className='btn btn-outline-main rounded-pill flex-center gap-16 fw-semibold w-100'
                >
                  <i className='ph-bold ph-arrow-clockwise d-flex text-lg' />
                  Reset Filters
                </button>
              </form>
            </div>
          </div>
          <div className='col-lg-8'>
            <div className='course-list-wrapper'>
              <div className='flex-between gap-16 flex-wrap mb-40'>
                <span className='text-neutral-500'>
                  Showing 9 of 600 Results{" "}
                </span>
                <div className='flex-align gap-16'>
                  <div className='flex-align gap-8'>
                    <span className='text-neutral-500 flex-shrink-0'>
                      Sort By :
                    </span>
                    <select className='form-select ps-20 pe-28 py-8 fw-medium rounded-pill bg-main-25 border border-neutral-30 text-neutral-700'>
                      <option value={1}>Newest</option>
                      <option value={1}>Trending</option>
                      <option value={1}>Popular</option>
                    </select>
                  </div>
                  <button
                    type='button'
                    onClick={sidebarControl}
                    className='list-bar-btn text-xl w-40 h-40 bg-main-600 text-white rounded-8 flex-center d-lg-none'
                  >
                    <i className='ph-bold ph-funnel' />
                  </button>
                </div>
              </div>
              <div className='row gy-4'>
                <div className='col-12'>
                  <div className='course-item bg-main-25 rounded-16 p-12 h-100 border border-neutral-30 list-view'>
                    <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                      <Link to='/course-details' className='w-100 h-100'>
                        <img
                          src='assets/images/thumbs/course-img1.png'
                          alt='Course'
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
                    <div className='course-item__content flex-grow-1'>
                      <div className=''>
                        <h4 className='mb-28'>
                          <Link
                            to='/course-details'
                            className='link text-line-2'
                          >
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
                                alt='User '
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
                <div className='col-12'>
                  <div className='course-item bg-main-25 rounded-16 p-12 h-100 border border-neutral-30 list-view'>
                    <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                      <Link to='/course-details' className='w-100 h-100'>
                        <img
                          src='assets/images/thumbs/course-img2.png'
                          alt='Course'
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
                    <div className='course-item__content flex-grow-1'>
                      <div className=''>
                        <h4 className='mb-28'>
                          <Link
                            to='/course-details'
                            className='link text-line-2'
                          >
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
                                alt='User '
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
                <div className='col-12'>
                  <div className='course-item bg-main-25 rounded-16 p-12 h-100 border border-neutral-30 list-view'>
                    <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                      <Link to='/course-details' className='w-100 h-100'>
                        <img
                          src='assets/images/thumbs/course-img3.png'
                          alt='Course'
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
                    <div className='course-item__content flex-grow-1'>
                      <div className=''>
                        <h4 className='mb-28'>
                          <Link
                            to='/course-details'
                            className='link text-line-2'
                          >
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
                                alt='User '
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
                <div className='col-12'>
                  <div className='course-item bg-main-25 rounded-16 p-12 h-100 border border-neutral-30 list-view'>
                    <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                      <Link to='/course-details' className='w-100 h-100'>
                        <img
                          src='assets/images/thumbs/course-img4.png'
                          alt='Course'
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
                    <div className='course-item__content flex-grow-1'>
                      <div className=''>
                        <h4 className='mb-28'>
                          <Link
                            to='/course-details'
                            className='link text-line-2'
                          >
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
                                alt='User '
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
                <div className='col-12'>
                  <div className='course-item bg-main-25 rounded-16 p-12 h-100 border border-neutral-30 list-view'>
                    <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                      <Link to='/course-details' className='w-100 h-100'>
                        <img
                          src='assets/images/thumbs/course-img5.png'
                          alt='Course'
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
                    <div className='course-item__content flex-grow-1'>
                      <div className=''>
                        <h4 className='mb-28'>
                          <Link
                            to='/course-details'
                            className='link text-line-2'
                          >
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
                                alt='User '
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
                <div className='col-12'>
                  <div className='course-item bg-main-25 rounded-16 p-12 h-100 border border-neutral-30 list-view'>
                    <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                      <Link to='/course-details' className='w-100 h-100'>
                        <img
                          src='assets/images/thumbs/course-img6.png'
                          alt='Course'
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
                    <div className='course-item__content flex-grow-1'>
                      <div className=''>
                        <h4 className='mb-28'>
                          <Link
                            to='/course-details'
                            className='link text-line-2'
                          >
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
                                alt='User '
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
                <div className='col-12'>
                  <div className='course-item bg-main-25 rounded-16 p-12 h-100 border border-neutral-30 list-view'>
                    <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                      <Link to='/course-details' className='w-100 h-100'>
                        <img
                          src='assets/images/thumbs/course-img7.png'
                          alt='Course'
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
                    <div className='course-item__content flex-grow-1'>
                      <div className=''>
                        <h4 className='mb-28'>
                          <Link
                            to='/course-details'
                            className='link text-line-2'
                          >
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
                                src='assets/images/thumbs/user-img2.png'
                                alt='User '
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
                <div className='col-12'>
                  <div className='course-item bg-main-25 rounded-16 p-12 h-100 border border-neutral-30 list-view'>
                    <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                      <Link to='/course-details' className='w-100 h-100'>
                        <img
                          src='assets/images/thumbs/course-img9.png'
                          alt='Course'
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
                    <div className='course-item__content flex-grow-1'>
                      <div className=''>
                        <h4 className='mb-28'>
                          <Link
                            to='/course-details'
                            className='link text-line-2'
                          >
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
                                src='assets/images/thumbs/user-img3.png'
                                alt='User '
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
                <div className='col-12'>
                  <div className='course-item bg-main-25 rounded-16 p-12 h-100 border border-neutral-30 list-view'>
                    <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                      <Link to='/course-details' className='w-100 h-100'>
                        <img
                          src='assets/images/thumbs/course-img8.png'
                          alt='Course'
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
                    <div className='course-item__content flex-grow-1'>
                      <div className=''>
                        <h4 className='mb-28'>
                          <Link
                            to='/course-details'
                            className='link text-line-2'
                          >
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
                                src='assets/images/thumbs/user-img1.png'
                                alt='User '
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
        </div>
      </div>
    </section>
  );
};

export default CourseListView;
