import { useState } from "react";
import { Link } from "react-router-dom";
import ReactSlider from "react-slider";
const TutorSectionOne = () => {
  const [values, setValues] = useState([100, 1000]);
  let [sidebarActive, setSidebarActive] = useState(false);
  let sidebarControl = () => {
    setSidebarActive(!sidebarActive);
  };
  return (
    <section
      className='course-list-view py-120 background-img bg-img'
      data-background-image='assets/images/bg/gradient-bg.png'
    >
      <div className={`side-overlay ${sidebarActive ? "show" : ""}`}></div>
      <div className='container'>
        <div className='row'>
          <div className='col-lg-4'>
            <div
              className={`sidebar rounded-12 bg-white p-32 box-shadow-md ${
                sidebarActive ? "active" : ""
              }`}
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
                    className='common-input pe-48 rounded-pill bg-main-25'
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
                <div className='d-flex flex-column gap-32'>
                  <div className=''>
                    <h6 className='text-lg mb-24 fw-semibold'>Tutor Type</h6>
                    <div className='d-flex flex-column gap-16'>
                      <div className='form-check common-check mb-0'>
                        <input
                          className='form-check-input bg-main-25'
                          type='checkbox'
                          name='tutorType'
                          id='AllTutors'
                        />
                        <label
                          className='form-check-label fw-normal flex-grow-1'
                          htmlFor='AllTutors'
                        >
                          All Tutors
                        </label>
                      </div>
                      <div className='form-check common-check mb-0'>
                        <input
                          className='form-check-input bg-main-25'
                          type='checkbox'
                          name='tutorType'
                          id='Premiums'
                        />
                        <label
                          className='form-check-label fw-normal flex-grow-1'
                          htmlFor='Premiums'
                        >
                          Premiums
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className=''>
                    <h6 className='text-lg mb-24 fw-semibold'>Gender</h6>
                    <div className='d-flex flex-column gap-16'>
                      <div className='form-check common-check mb-0'>
                        <input
                          className='form-check-input bg-main-25'
                          type='checkbox'
                          name='tutorType'
                          id='Male'
                        />
                        <label
                          className='form-check-label fw-normal flex-grow-1'
                          htmlFor='Male'
                        >
                          Male
                        </label>
                      </div>
                      <div className='form-check common-check mb-0'>
                        <input
                          className='form-check-input bg-main-25'
                          type='checkbox'
                          name='tutorType'
                          id='Female'
                        />
                        <label
                          className='form-check-label fw-normal flex-grow-1'
                          htmlFor='Female'
                        >
                          Female
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className=''>
                    <h6 className='text-lg mb-24 fw-semibold'>Tuition Type</h6>
                    <div className='d-flex flex-column gap-16'>
                      <div className='form-check common-check mb-0'>
                        <input
                          className='form-check-input bg-main-25'
                          type='checkbox'
                          name='tutorType'
                          id='Home'
                        />
                        <label
                          className='form-check-label fw-normal flex-grow-1'
                          htmlFor='Home'
                        >
                          Home
                        </label>
                      </div>
                      <div className='form-check common-check mb-0'>
                        <input
                          className='form-check-input bg-main-25'
                          type='checkbox'
                          name='tutorType'
                          id='Online'
                        />
                        <label
                          className='form-check-label fw-normal flex-grow-1'
                          htmlFor='Online'
                        >
                          Online
                        </label>
                      </div>
                      <div className='form-check common-check mb-0'>
                        <input
                          className='form-check-input bg-main-25'
                          type='checkbox'
                          name='tutorType'
                          id='Package'
                        />
                        <label
                          className='form-check-label fw-normal flex-grow-1'
                          htmlFor='Package'
                        >
                          Package
                        </label>
                      </div>
                      <div className='form-check common-check mb-0'>
                        <input
                          className='form-check-input bg-main-25'
                          type='checkbox'
                          name='tutorType'
                          id='Group'
                        />
                        <label
                          className='form-check-label fw-normal flex-grow-1'
                          htmlFor='Group'
                        >
                          Group
                        </label>
                      </div>
                      <div className='form-check common-check mb-0'>
                        <input
                          className='form-check-input bg-main-25'
                          type='checkbox'
                          name='tutorType'
                          id='School'
                        />
                        <label
                          className='form-check-label fw-normal flex-grow-1'
                          htmlFor='School'
                        >
                          School
                        </label>
                      </div>
                      <div className='form-check common-check mb-0'>
                        <input
                          className='form-check-input bg-main-25'
                          type='checkbox'
                          name='tutorType'
                          id='Collage'
                        />
                        <label
                          className='form-check-label fw-normal flex-grow-1'
                          htmlFor='Collage'
                        >
                          Collage
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className=''>
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
                  </div>
                  <div className=''>
                    <h6 className='text-lg mb-20 fw-medium'>Star Category</h6>
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
                  </div>
                  <div className=''>
                    <h6 className='text-lg mb-20 fw-medium'>Location</h6>
                    <input
                      type='text'
                      className='common-input border-transparent rounded-pill focus-border-main-600 bg-main-25'
                      placeholder='Enter location...'
                    />
                  </div>
                  <div className=''>
                    <h6 className='text-lg mb-20 fw-medium'>Select Country</h6>
                    <select className='common-input form-select border-transparent rounded-pill focus-border-main-600 bg-main-25'>
                      <option value={1}>Bangladesh</option>
                      <option value={1}>Pakistan</option>
                      <option value={1}>England</option>
                      <option value={1}>Australia</option>
                      <option value={1}>Indoneshia</option>
                    </select>
                  </div>
                  <div className=''>
                    <h6 className='text-lg mb-20 fw-medium'>Select Language</h6>
                    <select className='common-input form-select border-transparent rounded-pill focus-border-main-600 bg-main-25'>
                      <option value={1}>Bangla</option>
                      <option value={1}>English</option>
                      <option value={1}>Hindi</option>
                      <option value={1}>Urdhu</option>
                    </select>
                  </div>
                  <div className=''>
                    <h6 className='text-lg mb-20 fw-medium'>
                      Select Department{" "}
                    </h6>
                    <select className='common-input form-select border-transparent rounded-pill focus-border-main-600 bg-main-25'>
                      <option value={1}>English</option>
                      <option value={1}>Bangla</option>
                      <option value={1}>Economics</option>
                      <option value={1}>Management</option>
                    </select>
                  </div>
                  <div className=''>
                    <h6 className='text-lg mb-20 fw-medium'>Select Subject</h6>
                    <select className='common-input form-select border-transparent rounded-pill focus-border-main-600 bg-main-25'>
                      <option value={1}>English</option>
                      <option value={1}>Bangla</option>
                      <option value={1}>Economics</option>
                      <option value={1}>Management</option>
                    </select>
                  </div>
                </div>
                <span className='d-block border border-neutral-30 border-dashed my-32' />
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
              <div className='col-sm-6'>
                <div className='scale-hover-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 bg-main-25 overflow-hidden position-relative'>
                    <Link to='/tutor-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/instructor-img1.png'
                        alt='Course'
                        className='scale-hover-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='pt-32 pb-24 px-16 position-relative'>
                    <div className=''>
                      <h4 className='mb-16'>
                        <Link to='/tutor-details' className='link text-line-2'>
                          Ronald Richards
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-12'>
                          <span className='text-2xl text-main-600 d-flex'>
                            <i className='ph-bold ph-graduation-cap' />
                          </span>
                          <span className=''>Global University</span>
                        </div>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                      </div>
                      <div className='mt-24 flex-between gap-16 flex-wrap'>
                        <h4 className='mb-0 text-main-two-600'>
                          $155{" "}
                          <span className='text-inherit text-neutral-200 fw-normal'>
                            per/hr
                          </span>
                        </h4>
                        <div className='flex-align gap-8 py-10 px-14 border border-main-100 rounded-8 bg-main-25'>
                          <span className='text-xl d-flex text-main-600'>
                            <i className='ph-bold ph-map-pin' />
                          </span>
                          <span className='text-sm fw-medium text-neutral-500'>
                            New York
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-24 border-dashed border-0'>
                      <Link
                        to='/contact'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Apply Now
                        <i className='ph ph-arrow-right' />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-sm-6'>
                <div className='scale-hover-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 bg-main-25 overflow-hidden position-relative'>
                    <Link to='/tutor-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/instructor-img2.png'
                        alt='Course'
                        className='scale-hover-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='pt-32 pb-24 px-16 position-relative'>
                    <div className=''>
                      <h4 className='mb-16'>
                        <Link to='/tutor-details' className='link text-line-2'>
                          Jacob Jones
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-12'>
                          <span className='text-2xl text-main-600 d-flex'>
                            <i className='ph-bold ph-graduation-cap' />
                          </span>
                          <span className=''>LKS University</span>
                        </div>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                      </div>
                      <div className='mt-24 flex-between gap-16 flex-wrap'>
                        <h4 className='mb-0 text-main-two-600'>
                          $155{" "}
                          <span className='text-inherit text-neutral-200 fw-normal'>
                            per/hr
                          </span>
                        </h4>
                        <div className='flex-align gap-8 py-10 px-14 border border-main-100 rounded-8 bg-main-25'>
                          <span className='text-xl d-flex text-main-600'>
                            <i className='ph-bold ph-map-pin' />
                          </span>
                          <span className='text-sm fw-medium text-neutral-500'>
                            Phoenix
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-24 border-dashed border-0'>
                      <Link
                        to='/contact'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Apply Now
                        <i className='ph ph-arrow-right' />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-sm-6'>
                <div className='scale-hover-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 bg-main-25 overflow-hidden position-relative'>
                    <Link to='/tutor-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/instructor-img3.png'
                        alt='Course'
                        className='scale-hover-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='pt-32 pb-24 px-16 position-relative'>
                    <div className=''>
                      <h4 className='mb-16'>
                        <Link to='/tutor-details' className='link text-line-2'>
                          Darlene Robertson
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-12'>
                          <span className='text-2xl text-main-600 d-flex'>
                            <i className='ph-bold ph-graduation-cap' />
                          </span>
                          <span className=''>Notware</span>
                        </div>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                      </div>
                      <div className='mt-24 flex-between gap-16 flex-wrap'>
                        <h4 className='mb-0 text-main-two-600'>
                          $155{" "}
                          <span className='text-inherit text-neutral-200 fw-normal'>
                            per/hr
                          </span>
                        </h4>
                        <div className='flex-align gap-8 py-10 px-14 border border-main-100 rounded-8 bg-main-25'>
                          <span className='text-xl d-flex text-main-600'>
                            <i className='ph-bold ph-map-pin' />
                          </span>
                          <span className='text-sm fw-medium text-neutral-500'>
                            Chicago
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-24 border-dashed border-0'>
                      <Link
                        to='/contact'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Apply Now
                        <i className='ph ph-arrow-right' />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-sm-6'>
                <div className='scale-hover-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 bg-main-25 overflow-hidden position-relative'>
                    <Link to='/tutor-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/instructor-img4.png'
                        alt='Course'
                        className='scale-hover-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='pt-32 pb-24 px-16 position-relative'>
                    <div className=''>
                      <h4 className='mb-16'>
                        <Link to='/tutor-details' className='link text-line-2'>
                          Esther Howard
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-12'>
                          <span className='text-2xl text-main-600 d-flex'>
                            <i className='ph-bold ph-graduation-cap' />
                          </span>
                          <span className=''>Global University</span>
                        </div>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                      </div>
                      <div className='mt-24 flex-between gap-16 flex-wrap'>
                        <h4 className='mb-0 text-main-two-600'>
                          $155{" "}
                          <span className='text-inherit text-neutral-200 fw-normal'>
                            per/hr
                          </span>
                        </h4>
                        <div className='flex-align gap-8 py-10 px-14 border border-main-100 rounded-8 bg-main-25'>
                          <span className='text-xl d-flex text-main-600'>
                            <i className='ph-bold ph-map-pin' />
                          </span>
                          <span className='text-sm fw-medium text-neutral-500'>
                            Phoenix
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-24 border-dashed border-0'>
                      <Link
                        to='/contact'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Apply Now
                        <i className='ph ph-arrow-right' />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-sm-6'>
                <div className='scale-hover-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 bg-main-25 overflow-hidden position-relative'>
                    <Link to='/tutor-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/instructor-img5.png'
                        alt='Course'
                        className='scale-hover-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='pt-32 pb-24 px-16 position-relative'>
                    <div className=''>
                      <h4 className='mb-16'>
                        <Link to='/tutor-details' className='link text-line-2'>
                          Wade Warren
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-12'>
                          <span className='text-2xl text-main-600 d-flex'>
                            <i className='ph-bold ph-graduation-cap' />
                          </span>
                          <span className=''>GFC University</span>
                        </div>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                      </div>
                      <div className='mt-24 flex-between gap-16 flex-wrap'>
                        <h4 className='mb-0 text-main-two-600'>
                          $155{" "}
                          <span className='text-inherit text-neutral-200 fw-normal'>
                            per/hr
                          </span>
                        </h4>
                        <div className='flex-align gap-8 py-10 px-14 border border-main-100 rounded-8 bg-main-25'>
                          <span className='text-xl d-flex text-main-600'>
                            <i className='ph-bold ph-map-pin' />
                          </span>
                          <span className='text-sm fw-medium text-neutral-500'>
                            Phoenix
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-24 border-dashed border-0'>
                      <Link
                        to='/contact'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Apply Now
                        <i className='ph ph-arrow-right' />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-sm-6'>
                <div className='scale-hover-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 bg-main-25 overflow-hidden position-relative'>
                    <Link to='/tutor-details' className='w-100 h-100'>
                      <img
                        src='assets/images/thumbs/instructor-img6.png'
                        alt='Course'
                        className='scale-hover-item__img rounded-12 cover-img transition-2'
                      />
                    </Link>
                  </div>
                  <div className='pt-32 pb-24 px-16 position-relative'>
                    <div className=''>
                      <h4 className='mb-16'>
                        <Link to='/tutor-details' className='link text-line-2'>
                          Dianne Russell
                        </Link>
                      </h4>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-12'>
                          <span className='text-2xl text-main-600 d-flex'>
                            <i className='ph-bold ph-graduation-cap' />
                          </span>
                          <span className=''>GFC University</span>
                        </div>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>
                            4.7
                            <span className='text-neutral-100'>(6.4k)</span>
                          </span>
                        </div>
                      </div>
                      <div className='mt-24 flex-between gap-16 flex-wrap'>
                        <h4 className='mb-0 text-main-two-600'>
                          $155{" "}
                          <span className='text-inherit text-neutral-200 fw-normal'>
                            per/hr
                          </span>
                        </h4>
                        <div className='flex-align gap-8 py-10 px-14 border border-main-100 rounded-8 bg-main-25'>
                          <span className='text-xl d-flex text-main-600'>
                            <i className='ph-bold ph-map-pin' />
                          </span>
                          <span className='text-sm fw-medium text-neutral-500'>
                            Phoenix
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-24 border-dashed border-0'>
                      <Link
                        to='/contact'
                        className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                        tabIndex={0}
                      >
                        Apply Now
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
        </div>
      </div>
    </section>
  );
};

export default TutorSectionOne;
