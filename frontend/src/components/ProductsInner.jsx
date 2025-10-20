import { useState } from "react";
import { Link } from "react-router-dom";
import ReactSlider from "react-slider";

const ProductsInner = () => {
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
          <div className='col-lg-3'>
            <div
              className={`sidebar rounded-12 bg-white p-32 box-shadow-md ${
                sidebarActive ? "active" : ""
              }`}
            >
              <form action='#'>
                <div className='flex-between'>
                  <div className='flex-grow-1'>
                    <div className='flex-between'>
                      <h4 className='mb-0'>Filters</h4>
                      <button
                        type='button'
                        onClick={sidebarControl}
                        className='sidebar-close text-xl text-neutral-500 d-lg-none hover-text-main-600'
                      >
                        <i className='ph-bold ph-x' />
                      </button>
                    </div>
                    <span className='d-block border border-neutral-30 border-dashed my-24' />
                  </div>
                </div>
                <div className='position-relative'>
                  <input
                    type='text'
                    className='common-input pe-48 rounded-pill bg-main-25'
                    placeholder='Enter Your Email...'
                  />
                  <button
                    type='submit'
                    className='text-xl position-absolute top-50 translate-middle-y inset-inline-end-0 me-4  w-40 h-40 bg-main-600 d-flex align-items-center justify-content-center text-white rounded-circle hover-bg-main-700'
                  >
                    <i className='ph-bold ph-magnifying-glass' />
                  </button>
                </div>
                <span className='d-block border border-neutral-30 border-dashed my-24' />
                <div className='d-flex flex-column gap-32'>
                  <div className='col-sm-12'>
                    <h6 className='text-lg mb-24 fw-semibold'>Gender</h6>
                    <div className='d-flex flex-column gap-16'>
                      <div className='form-check common-check common-radio mb-0'>
                        <input
                          className='form-check-input'
                          type='radio'
                          name='gender'
                          id='Male'
                        />
                        <label
                          className='form-check-label fw-normal flex-grow-1'
                          htmlFor='Male'
                        >
                          Male
                        </label>
                      </div>
                      <div className='form-check common-check common-radio mb-0'>
                        <input
                          className='form-check-input'
                          type='radio'
                          name='gender'
                          id='Female'
                        />
                        <label
                          className='form-check-label fw-normal flex-grow-1'
                          htmlFor='Female'
                        >
                          Female
                        </label>
                      </div>
                      <div className='form-check common-check common-radio mb-0'>
                        <input
                          className='form-check-input'
                          type='radio'
                          name='gender'
                          id='kids'
                        />
                        <label
                          className='form-check-label fw-normal flex-grow-1'
                          htmlFor='kids'
                        >
                          kids
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className=''>
                    <h6 className='text-lg mb-24 fw-semibold'>Category</h6>
                    <div className='d-flex flex-column gap-16'>
                      <div className='form-check common-check mb-0'>
                        <input
                          className='form-check-input bg-main-25'
                          type='checkbox'
                          name='tutorType'
                          id='All'
                        />
                        <label
                          className='form-check-label fw-normal flex-grow-1'
                          htmlFor='All'
                        >
                          All
                        </label>
                      </div>
                      <div className='form-check common-check mb-0'>
                        <input
                          className='form-check-input bg-main-25'
                          type='checkbox'
                          name='tutorType'
                          id='Shoes'
                        />
                        <label
                          className='form-check-label fw-normal flex-grow-1'
                          htmlFor='Shoes'
                        >
                          Shoes
                        </label>
                      </div>
                      <div className='form-check common-check mb-0'>
                        <input
                          className='form-check-input bg-main-25'
                          type='checkbox'
                          name='tutorType'
                          id='Apparel'
                        />
                        <label
                          className='form-check-label fw-normal flex-grow-1'
                          htmlFor='Apparel'
                        >
                          Apparel
                        </label>
                      </div>
                      <div className='form-check common-check mb-0'>
                        <input
                          className='form-check-input bg-main-25'
                          type='checkbox'
                          name='tutorType'
                          id='Accessories'
                        />
                        <label
                          className='form-check-label fw-normal flex-grow-1'
                          htmlFor='Accessories'
                        >
                          Accessories
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className=''>
                    <h6 className='text-lg mb-20 fw-medium'>Color</h6>
                    <div className='color-list d-flex flex-wrap align-items-center gap-12'>
                      <button
                        type='button'
                        className='color-list__button w-24 h-24 bg-color-black rounded-circle'
                      />
                      <button
                        type='button'
                        className='color-list__button w-24 h-24 bg-color-deep-green rounded-circle'
                      />
                      <button
                        type='button'
                        className='color-list__button w-24 h-24 bg-color-violet rounded-circle'
                      />
                      <button
                        type='button'
                        className='color-list__button w-24 h-24 bg-color-info rounded-circle'
                      />
                      <button
                        type='button'
                        className='color-list__button w-24 h-24 bg-color-light-green rounded-circle'
                      />
                      <button
                        type='button'
                        className='color-list__button w-24 h-24 bg-color-yellow rounded-circle'
                      />
                      <button
                        type='button'
                        className='color-list__button w-24 h-24 bg-color-danger rounded-circle'
                      />
                      <button
                        type='button'
                        className='color-list__button w-24 h-24 bg-color-blue rounded-circle'
                      />
                      <button
                        type='button'
                        className='color-list__button w-24 h-24 bg-color-paste rounded-circle'
                      />
                      <button
                        type='button'
                        className='color-list__button w-24 h-24 bg-color-warning rounded-circle'
                      />
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
                      </div>
                    </div>
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
          <div className='col-lg-9'>
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
              <div className='col-md-4 col-sm-6 col-xs-6'>
                <div className='scale-hover-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 bg-main-25 overflow-hidden position-relative max-h-unset min-h-252'>
                    <Link
                      to='/product-details'
                      className='w-100 h-100 d-flex justify-content-center align-items-center min-h-inherit'
                    >
                      <img
                        src='assets/images/thumbs/product-img1.png'
                        alt='Course'
                        className='scale-hover-item__img rounded-12 transition-2'
                      />
                    </Link>
                    <div className='position-absolute inset-block-start-0 inset-inline-start-0 w-100 d-flex align-items-center justify-content-between p-16'>
                      <button className='add-to-cart active-scale-08 w-40 h-40 rounded-8 d-flex justify-content-center align-items-center bg-white box-shadow-md text-neutral-500 text-lg hover-bg-main-100 hover-text-main-600 transition-2 ms-auto'>
                        <i className='ph ph-shopping-cart' />
                      </button>
                    </div>
                  </div>
                  <div className='pt-32 pb-24 px-16 position-relative'>
                    <div className=''>
                      <div className='d-flex align-items-center justify-content-between mb-16'>
                        <h5 className='mb-0'>
                          <Link
                            to='/product-details'
                            className='link text-line-1'
                          >
                            Nike Air Force
                          </Link>
                        </h5>
                        <div className='flex-shrink-0 d-flex gap-4'>
                          <div className='d-flex flex-wrap align-items-center'>
                            <button
                              type='button'
                              className='w-16 h-16 border border-2 border-white ms--6 bg-color-blue rounded-circle'
                            />
                            <button
                              type='button'
                              className='w-16 h-16 border border-2 border-white ms--6 bg-color-light-green rounded-circle'
                            />
                            <button
                              type='button'
                              className='w-16 h-16 border border-2 border-white ms--6 bg-color-danger rounded-circle'
                            />
                          </div>
                          <span className='text-neutral-500'>+3</span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>4.7</span>
                        </div>
                        <h5 className='text-main-600 mb-0'>$95.25</h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-md-4 col-sm-6 col-xs-6'>
                <div className='scale-hover-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 bg-main-25 overflow-hidden position-relative max-h-unset min-h-252'>
                    <Link
                      to='/product-details'
                      className='w-100 h-100 d-flex justify-content-center align-items-center min-h-inherit'
                    >
                      <img
                        src='assets/images/thumbs/product-img2.png'
                        alt='Course'
                        className='scale-hover-item__img rounded-12 transition-2'
                      />
                    </Link>
                    <div className='position-absolute inset-block-start-0 inset-inline-start-0 w-100 d-flex align-items-center justify-content-between p-16'>
                      <span className='py-8 px-16 bg-main-two-600 rounded-8 text-white'>
                        Sale
                      </span>
                      <button className='add-to-cart active-scale-08 w-40 h-40 rounded-8 d-flex justify-content-center align-items-center bg-white box-shadow-md text-neutral-500 text-lg hover-bg-main-100 hover-text-main-600 transition-2 ms-auto'>
                        <i className='ph ph-shopping-cart' />
                      </button>
                    </div>
                  </div>
                  <div className='pt-32 pb-24 px-16 position-relative'>
                    <div className=''>
                      <div className='d-flex align-items-center justify-content-between mb-16'>
                        <h5 className='mb-0'>
                          <Link
                            to='/product-details'
                            className='link text-line-1'
                          >
                            Athletic Sneaker
                          </Link>
                        </h5>
                        <div className='flex-shrink-0 d-flex gap-4'>
                          <div className='d-flex flex-wrap align-items-center'>
                            <button
                              type='button'
                              className='w-16 h-16 border border-2 border-white ms--6 bg-color-blue rounded-circle'
                            />
                            <button
                              type='button'
                              className='w-16 h-16 border border-2 border-white ms--6 bg-color-light-green rounded-circle'
                            />
                            <button
                              type='button'
                              className='w-16 h-16 border border-2 border-white ms--6 bg-color-danger rounded-circle'
                            />
                          </div>
                          <span className='text-neutral-500'>+3</span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>4.7</span>
                        </div>
                        <h5 className='text-main-600 mb-0'>$95.25</h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-md-4 col-sm-6 col-xs-6'>
                <div className='scale-hover-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 bg-main-25 overflow-hidden position-relative max-h-unset min-h-252'>
                    <Link
                      to='/product-details'
                      className='w-100 h-100 d-flex justify-content-center align-items-center min-h-inherit'
                    >
                      <img
                        src='assets/images/thumbs/product-img3.png'
                        alt='Course'
                        className='scale-hover-item__img rounded-12 transition-2'
                      />
                    </Link>
                    <div className='position-absolute inset-block-start-0 inset-inline-start-0 w-100 d-flex align-items-center justify-content-between p-16'>
                      <button className='add-to-cart active-scale-08 w-40 h-40 rounded-8 d-flex justify-content-center align-items-center bg-white box-shadow-md text-neutral-500 text-lg hover-bg-main-100 hover-text-main-600 transition-2 ms-auto'>
                        <i className='ph ph-shopping-cart' />
                      </button>
                    </div>
                  </div>
                  <div className='pt-32 pb-24 px-16 position-relative'>
                    <div className=''>
                      <div className='d-flex align-items-center justify-content-between mb-16'>
                        <h5 className='mb-0'>
                          <Link
                            to='/product-details'
                            className='link text-line-1'
                          >
                            Dressy Boots
                          </Link>
                        </h5>
                        <div className='flex-shrink-0 d-flex gap-4'>
                          <div className='d-flex flex-wrap align-items-center'>
                            <button
                              type='button'
                              className='w-16 h-16 border border-2 border-white ms--6 bg-color-blue rounded-circle'
                            />
                            <button
                              type='button'
                              className='w-16 h-16 border border-2 border-white ms--6 bg-color-light-green rounded-circle'
                            />
                            <button
                              type='button'
                              className='w-16 h-16 border border-2 border-white ms--6 bg-color-danger rounded-circle'
                            />
                          </div>
                          <span className='text-neutral-500'>+3</span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>4.7</span>
                        </div>
                        <h5 className='text-main-600 mb-0'>$95.25</h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-md-4 col-sm-6 col-xs-6'>
                <div className='scale-hover-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 bg-main-25 overflow-hidden position-relative max-h-unset min-h-252'>
                    <Link
                      to='/product-details'
                      className='w-100 h-100 d-flex justify-content-center align-items-center min-h-inherit'
                    >
                      <img
                        src='assets/images/thumbs/product-img4.png'
                        alt='Course'
                        className='scale-hover-item__img rounded-12 transition-2'
                      />
                    </Link>
                    <div className='position-absolute inset-block-start-0 inset-inline-start-0 w-100 d-flex align-items-center justify-content-between p-16'>
                      <span className='py-8 px-16 bg-success-600 rounded-8 text-white'>
                        New
                      </span>
                      <button className='add-to-cart active-scale-08 w-40 h-40 rounded-8 d-flex justify-content-center align-items-center bg-white box-shadow-md text-neutral-500 text-lg hover-bg-main-100 hover-text-main-600 transition-2 ms-auto'>
                        <i className='ph ph-shopping-cart' />
                      </button>
                    </div>
                  </div>
                  <div className='pt-32 pb-24 px-16 position-relative'>
                    <div className=''>
                      <div className='d-flex align-items-center justify-content-between mb-16'>
                        <h5 className='mb-0'>
                          <Link
                            to='/product-details'
                            className='link text-line-1'
                          >
                            Popular Loafers
                          </Link>
                        </h5>
                        <div className='flex-shrink-0 d-flex gap-4'>
                          <div className='d-flex flex-wrap align-items-center'>
                            <button
                              type='button'
                              className='w-16 h-16 border border-2 border-white ms--6 bg-color-blue rounded-circle'
                            />
                            <button
                              type='button'
                              className='w-16 h-16 border border-2 border-white ms--6 bg-color-light-green rounded-circle'
                            />
                            <button
                              type='button'
                              className='w-16 h-16 border border-2 border-white ms--6 bg-color-danger rounded-circle'
                            />
                          </div>
                          <span className='text-neutral-500'>+3</span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>4.7</span>
                        </div>
                        <h5 className='text-main-600 mb-0'>$95.25</h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-md-4 col-sm-6 col-xs-6'>
                <div className='scale-hover-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 bg-main-25 overflow-hidden position-relative max-h-unset min-h-252'>
                    <Link
                      to='/product-details'
                      className='w-100 h-100 d-flex justify-content-center align-items-center min-h-inherit'
                    >
                      <img
                        src='assets/images/thumbs/product-img5.png'
                        alt='Course'
                        className='scale-hover-item__img rounded-12 transition-2'
                      />
                    </Link>
                    <div className='position-absolute inset-block-start-0 inset-inline-start-0 w-100 d-flex align-items-center justify-content-between p-16'>
                      <span className='py-8 px-16 bg-success-600 rounded-8 text-white'>
                        New
                      </span>
                      <button className='add-to-cart active-scale-08 w-40 h-40 rounded-8 d-flex justify-content-center align-items-center bg-white box-shadow-md text-neutral-500 text-lg hover-bg-main-100 hover-text-main-600 transition-2 ms-auto'>
                        <i className='ph ph-shopping-cart' />
                      </button>
                    </div>
                  </div>
                  <div className='pt-32 pb-24 px-16 position-relative'>
                    <div className=''>
                      <div className='d-flex align-items-center justify-content-between mb-16'>
                        <h5 className='mb-0'>
                          <Link
                            to='/product-details'
                            className='link text-line-1'
                          >
                            Oxfords leather
                          </Link>
                        </h5>
                        <div className='flex-shrink-0 d-flex gap-4'>
                          <div className='d-flex flex-wrap align-items-center'>
                            <button
                              type='button'
                              className='w-16 h-16 border border-2 border-white ms--6 bg-color-blue rounded-circle'
                            />
                            <button
                              type='button'
                              className='w-16 h-16 border border-2 border-white ms--6 bg-color-light-green rounded-circle'
                            />
                            <button
                              type='button'
                              className='w-16 h-16 border border-2 border-white ms--6 bg-color-danger rounded-circle'
                            />
                          </div>
                          <span className='text-neutral-500'>+3</span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>4.7</span>
                        </div>
                        <h5 className='text-main-600 mb-0'>$95.25</h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-md-4 col-sm-6 col-xs-6'>
                <div className='scale-hover-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 bg-main-25 overflow-hidden position-relative max-h-unset min-h-252'>
                    <Link
                      to='/product-details'
                      className='w-100 h-100 d-flex justify-content-center align-items-center min-h-inherit'
                    >
                      <img
                        src='assets/images/thumbs/product-img6.png'
                        alt='Course'
                        className='scale-hover-item__img rounded-12 transition-2'
                      />
                    </Link>
                    <div className='position-absolute inset-block-start-0 inset-inline-start-0 w-100 d-flex align-items-center justify-content-between p-16'>
                      <button className='add-to-cart active-scale-08 w-40 h-40 rounded-8 d-flex justify-content-center align-items-center bg-white box-shadow-md text-neutral-500 text-lg hover-bg-main-100 hover-text-main-600 transition-2 ms-auto'>
                        <i className='ph ph-shopping-cart' />
                      </button>
                    </div>
                  </div>
                  <div className='pt-32 pb-24 px-16 position-relative'>
                    <div className=''>
                      <div className='d-flex align-items-center justify-content-between mb-16'>
                        <h5 className='mb-0'>
                          <Link
                            to='/product-details'
                            className='link text-line-1'
                          >
                            Dressy Boots
                          </Link>
                        </h5>
                        <div className='flex-shrink-0 d-flex gap-4'>
                          <div className='d-flex flex-wrap align-items-center'>
                            <button
                              type='button'
                              className='w-16 h-16 border border-2 border-white ms--6 bg-color-blue rounded-circle'
                            />
                            <button
                              type='button'
                              className='w-16 h-16 border border-2 border-white ms--6 bg-color-light-green rounded-circle'
                            />
                            <button
                              type='button'
                              className='w-16 h-16 border border-2 border-white ms--6 bg-color-danger rounded-circle'
                            />
                          </div>
                          <span className='text-neutral-500'>+3</span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>4.7</span>
                        </div>
                        <h5 className='text-main-600 mb-0'>$95.25</h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-md-4 col-sm-6 col-xs-6'>
                <div className='scale-hover-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 bg-main-25 overflow-hidden position-relative max-h-unset min-h-252'>
                    <Link
                      to='/product-details'
                      className='w-100 h-100 d-flex justify-content-center align-items-center min-h-inherit'
                    >
                      <img
                        src='assets/images/thumbs/product-img7.png'
                        alt='Course'
                        className='scale-hover-item__img rounded-12 transition-2'
                      />
                    </Link>
                    <div className='position-absolute inset-block-start-0 inset-inline-start-0 w-100 d-flex align-items-center justify-content-between p-16'>
                      <span className='py-8 px-16 bg-main-two-600 rounded-8 text-white'>
                        Sale
                      </span>
                      <button className='add-to-cart active-scale-08 w-40 h-40 rounded-8 d-flex justify-content-center align-items-center bg-white box-shadow-md text-neutral-500 text-lg hover-bg-main-100 hover-text-main-600 transition-2 ms-auto'>
                        <i className='ph ph-shopping-cart' />
                      </button>
                    </div>
                  </div>
                  <div className='pt-32 pb-24 px-16 position-relative'>
                    <div className=''>
                      <div className='d-flex align-items-center justify-content-between mb-16'>
                        <h5 className='mb-0'>
                          <Link
                            to='/product-details'
                            className='link text-line-1'
                          >
                            Heeled Flats
                          </Link>
                        </h5>
                        <div className='flex-shrink-0 d-flex gap-4'>
                          <div className='d-flex flex-wrap align-items-center'>
                            <button
                              type='button'
                              className='w-16 h-16 border border-2 border-white ms--6 bg-color-blue rounded-circle'
                            />
                            <button
                              type='button'
                              className='w-16 h-16 border border-2 border-white ms--6 bg-color-light-green rounded-circle'
                            />
                            <button
                              type='button'
                              className='w-16 h-16 border border-2 border-white ms--6 bg-color-danger rounded-circle'
                            />
                          </div>
                          <span className='text-neutral-500'>+3</span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>4.7</span>
                        </div>
                        <h5 className='text-main-600 mb-0'>$95.25</h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-md-4 col-sm-6 col-xs-6'>
                <div className='scale-hover-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 bg-main-25 overflow-hidden position-relative max-h-unset min-h-252'>
                    <Link
                      to='/product-details'
                      className='w-100 h-100 d-flex justify-content-center align-items-center min-h-inherit'
                    >
                      <img
                        src='assets/images/thumbs/product-img8.png'
                        alt='Course'
                        className='scale-hover-item__img rounded-12 transition-2'
                      />
                    </Link>
                    <div className='position-absolute inset-block-start-0 inset-inline-start-0 w-100 d-flex align-items-center justify-content-between p-16'>
                      <button className='add-to-cart active-scale-08 w-40 h-40 rounded-8 d-flex justify-content-center align-items-center bg-white box-shadow-md text-neutral-500 text-lg hover-bg-main-100 hover-text-main-600 transition-2 ms-auto'>
                        <i className='ph ph-shopping-cart' />
                      </button>
                    </div>
                  </div>
                  <div className='pt-32 pb-24 px-16 position-relative'>
                    <div className=''>
                      <div className='d-flex align-items-center justify-content-between mb-16'>
                        <h5 className='mb-0'>
                          <Link
                            to='/product-details'
                            className='link text-line-1'
                          >
                            Pumps classic
                          </Link>
                        </h5>
                        <div className='flex-shrink-0 d-flex gap-4'>
                          <div className='d-flex flex-wrap align-items-center'>
                            <button
                              type='button'
                              className='w-16 h-16 border border-2 border-white ms--6 bg-color-blue rounded-circle'
                            />
                            <button
                              type='button'
                              className='w-16 h-16 border border-2 border-white ms--6 bg-color-light-green rounded-circle'
                            />
                            <button
                              type='button'
                              className='w-16 h-16 border border-2 border-white ms--6 bg-color-danger rounded-circle'
                            />
                          </div>
                          <span className='text-neutral-500'>+3</span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>4.7</span>
                        </div>
                        <h5 className='text-main-600 mb-0'>$95.25</h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-md-4 col-sm-6 col-xs-6'>
                <div className='scale-hover-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 bg-main-25 overflow-hidden position-relative max-h-unset min-h-252'>
                    <Link
                      to='/product-details'
                      className='w-100 h-100 d-flex justify-content-center align-items-center min-h-inherit'
                    >
                      <img
                        src='assets/images/thumbs/product-img9.png'
                        alt='Course'
                        className='scale-hover-item__img rounded-12 transition-2'
                      />
                    </Link>
                    <div className='position-absolute inset-block-start-0 inset-inline-start-0 w-100 d-flex align-items-center justify-content-between p-16'>
                      <button className='add-to-cart active-scale-08 w-40 h-40 rounded-8 d-flex justify-content-center align-items-center bg-white box-shadow-md text-neutral-500 text-lg hover-bg-main-100 hover-text-main-600 transition-2 ms-auto'>
                        <i className='ph ph-shopping-cart' />
                      </button>
                    </div>
                  </div>
                  <div className='pt-32 pb-24 px-16 position-relative'>
                    <div className=''>
                      <div className='d-flex align-items-center justify-content-between mb-16'>
                        <h5 className='mb-0'>
                          <Link
                            to='/product-details'
                            className='link text-line-1'
                          >
                            Heels stilettos
                          </Link>
                        </h5>
                        <div className='flex-shrink-0 d-flex gap-4'>
                          <div className='d-flex flex-wrap align-items-center'>
                            <button
                              type='button'
                              className='w-16 h-16 border border-2 border-white ms--6 bg-color-blue rounded-circle'
                            />
                            <button
                              type='button'
                              className='w-16 h-16 border border-2 border-white ms--6 bg-color-light-green rounded-circle'
                            />
                            <button
                              type='button'
                              className='w-16 h-16 border border-2 border-white ms--6 bg-color-danger rounded-circle'
                            />
                          </div>
                          <span className='text-neutral-500'>+3</span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>4.7</span>
                        </div>
                        <h5 className='text-main-600 mb-0'>$95.25</h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-md-4 col-sm-6 col-xs-6'>
                <div className='scale-hover-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 bg-main-25 overflow-hidden position-relative max-h-unset min-h-252'>
                    <Link
                      to='/product-details'
                      className='w-100 h-100 d-flex justify-content-center align-items-center min-h-inherit'
                    >
                      <img
                        src='assets/images/thumbs/product-img10.png'
                        alt='Course'
                        className='scale-hover-item__img rounded-12 transition-2'
                      />
                    </Link>
                    <div className='position-absolute inset-block-start-0 inset-inline-start-0 w-100 d-flex align-items-center justify-content-between p-16'>
                      <span className='py-8 px-16 bg-success-600 rounded-8 text-white'>
                        New
                      </span>
                      <button className='add-to-cart active-scale-08 w-40 h-40 rounded-8 d-flex justify-content-center align-items-center bg-white box-shadow-md text-neutral-500 text-lg hover-bg-main-100 hover-text-main-600 transition-2 ms-auto'>
                        <i className='ph ph-shopping-cart' />
                      </button>
                    </div>
                  </div>
                  <div className='pt-32 pb-24 px-16 position-relative'>
                    <div className=''>
                      <div className='d-flex align-items-center justify-content-between mb-16'>
                        <h5 className='mb-0'>
                          <Link
                            to='/product-details'
                            className='link text-line-1'
                          >
                            Sandals various
                          </Link>
                        </h5>
                        <div className='flex-shrink-0 d-flex gap-4'>
                          <div className='d-flex flex-wrap align-items-center'>
                            <button
                              type='button'
                              className='w-16 h-16 border border-2 border-white ms--6 bg-color-blue rounded-circle'
                            />
                            <button
                              type='button'
                              className='w-16 h-16 border border-2 border-white ms--6 bg-color-light-green rounded-circle'
                            />
                            <button
                              type='button'
                              className='w-16 h-16 border border-2 border-white ms--6 bg-color-danger rounded-circle'
                            />
                          </div>
                          <span className='text-neutral-500'>+3</span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>4.7</span>
                        </div>
                        <h5 className='text-main-600 mb-0'>$95.25</h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-md-4 col-sm-6 col-xs-6'>
                <div className='scale-hover-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 bg-main-25 overflow-hidden position-relative max-h-unset min-h-252'>
                    <Link
                      to='/product-details'
                      className='w-100 h-100 d-flex justify-content-center align-items-center min-h-inherit'
                    >
                      <img
                        src='assets/images/thumbs/product-img11.png'
                        alt='Course'
                        className='scale-hover-item__img rounded-12 transition-2'
                      />
                    </Link>
                    <div className='position-absolute inset-block-start-0 inset-inline-start-0 w-100 d-flex align-items-center justify-content-between p-16'>
                      <button className='add-to-cart active-scale-08 w-40 h-40 rounded-8 d-flex justify-content-center align-items-center bg-white box-shadow-md text-neutral-500 text-lg hover-bg-main-100 hover-text-main-600 transition-2 ms-auto'>
                        <i className='ph ph-shopping-cart' />
                      </button>
                    </div>
                  </div>
                  <div className='pt-32 pb-24 px-16 position-relative'>
                    <div className=''>
                      <div className='d-flex align-items-center justify-content-between mb-16'>
                        <h5 className='mb-0'>
                          <Link
                            to='/product-details'
                            className='link text-line-1'
                          >
                            Heels Wedges
                          </Link>
                        </h5>
                        <div className='flex-shrink-0 d-flex gap-4'>
                          <div className='d-flex flex-wrap align-items-center'>
                            <button
                              type='button'
                              className='w-16 h-16 border border-2 border-white ms--6 bg-color-blue rounded-circle'
                            />
                            <button
                              type='button'
                              className='w-16 h-16 border border-2 border-white ms--6 bg-color-light-green rounded-circle'
                            />
                            <button
                              type='button'
                              className='w-16 h-16 border border-2 border-white ms--6 bg-color-danger rounded-circle'
                            />
                          </div>
                          <span className='text-neutral-500'>+3</span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>4.7</span>
                        </div>
                        <h5 className='text-main-600 mb-0'>$95.25</h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-md-4 col-sm-6 col-xs-6'>
                <div className='scale-hover-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
                  <div className='course-item__thumb rounded-12 bg-main-25 overflow-hidden position-relative max-h-unset min-h-252'>
                    <Link
                      to='/product-details'
                      className='w-100 h-100 d-flex justify-content-center align-items-center min-h-inherit'
                    >
                      <img
                        src='assets/images/thumbs/product-img12.png'
                        alt='Course'
                        className='scale-hover-item__img rounded-12 transition-2'
                      />
                    </Link>
                    <div className='position-absolute inset-block-start-0 inset-inline-start-0 w-100 d-flex align-items-center justify-content-between p-16'>
                      <span className='py-8 px-16 bg-main-two-600 rounded-8 text-white'>
                        Sale
                      </span>
                      <button className='add-to-cart active-scale-08 w-40 h-40 rounded-8 d-flex justify-content-center align-items-center bg-white box-shadow-md text-neutral-500 text-lg hover-bg-main-100 hover-text-main-600 transition-2 ms-auto'>
                        <i className='ph ph-shopping-cart' />
                      </button>
                    </div>
                  </div>
                  <div className='pt-32 pb-24 px-16 position-relative'>
                    <div className=''>
                      <div className='d-flex align-items-center justify-content-between mb-16'>
                        <h5 className='mb-0'>
                          <Link
                            to='/product-details'
                            className='link text-line-1'
                          >
                            Mules flat sole
                          </Link>
                        </h5>
                        <div className='flex-shrink-0 d-flex gap-4'>
                          <div className='d-flex flex-wrap align-items-center'>
                            <button
                              type='button'
                              className='w-16 h-16 border border-2 border-white ms--6 bg-color-blue rounded-circle'
                            />
                            <button
                              type='button'
                              className='w-16 h-16 border border-2 border-white ms--6 bg-color-light-green rounded-circle'
                            />
                            <button
                              type='button'
                              className='w-16 h-16 border border-2 border-white ms--6 bg-color-danger rounded-circle'
                            />
                          </div>
                          <span className='text-neutral-500'>+3</span>
                        </div>
                      </div>
                      <div className='flex-between gap-8 flex-wrap'>
                        <div className='flex-align gap-4'>
                          <span className='text-2xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-lg text-neutral-700'>4.7</span>
                        </div>
                        <h5 className='text-main-600 mb-0'>$95.25</h5>
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

export default ProductsInner;
