import { Link } from "react-router-dom";

const EventsAllOne = () => {
  return (
    <section className='course-list-view py-120 bg-white'>
      <div className='container'>
        <div className='flex-between gap-16 flex-wrap mb-40'>
          <span className='text-neutral-500'>Showing 5 of 600 Results</span>
          <div className='flex-align gap-16'>
            <div className='flex-align gap-8'>
              <span className='text-neutral-500 flex-shrink-0'>Sort By :</span>
              <select className='form-select ps-20 pe-28 py-8 fw-medium rounded-pill bg-main-25 border border-neutral-30 text-neutral-700'>
                <option value={1}>Newest</option>
                <option value={1}>Trending</option>
                <option value={1}>Popular</option>
              </select>
            </div>
          </div>
        </div>
        <div className='row gy-4'>
          <div className='col-xl-4 col-sm-6'>
            <div className='scale-hover-item bg-main-25 rounded-16 p-12 h-100 border border-neutral-30'>
              <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                <Link to='/event-details' className='w-100 h-100' tabIndex={0}>
                  <img
                    src='assets/images/thumbs/event-img1.png'
                    alt='Course'
                    className='scale-hover-item__img rounded-12 cover-img transition-2'
                  />
                </Link>
                <div className='position-absolute inset-inline-end-0 inset-block-end-0 me-16 mb-16 py-12 px-24 rounded-8 bg-main-two-600 text-white fw-medium'>
                  <h3 className='mb-0 text-white fw-medium'>21</h3>
                  DEC
                </div>
                <div className='bg-success-600 rounded-8 px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                  10:15 AM
                </div>
              </div>
              <div className='pt-32 pb-24 px-16 position-relative'>
                <h4 className='mb-28'>
                  <Link
                    to='/event-details'
                    className='link text-line-2'
                    tabIndex={0}
                  >
                    Career Guidance Workshops for Students
                  </Link>
                </h4>
                <div className='flex-align gap-8'>
                  <span className='text-neutral-500 text-2xl d-flex'>
                    <i className='ph-bold ph-map-pin-line' />
                  </span>
                  <p className='text-neutral-500 text-lg'>
                    1901 Thornridge Cir. Shiloh
                  </p>
                </div>
                <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                  <h4 className='text-main-two-600 mb-0'>$99</h4>
                  <Link
                    to='/event-details'
                    className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                    tabIndex={0}
                  >
                    Join Now
                    <i className='ph ph-arrow-right' />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className='col-xl-4 col-sm-6'>
            <div className='scale-hover-item bg-main-25 rounded-16 p-12 h-100 border border-neutral-30'>
              <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                <Link to='/event-details' className='w-100 h-100' tabIndex={0}>
                  <img
                    src='assets/images/thumbs/event-img2.png'
                    alt='Course'
                    className='scale-hover-item__img rounded-12 cover-img transition-2'
                  />
                </Link>
                <div className='position-absolute inset-inline-end-0 inset-block-end-0 me-16 mb-16 py-12 px-24 rounded-8 bg-main-two-600 text-white fw-medium'>
                  <h3 className='mb-0 text-white fw-medium'>16</h3>
                  DEC
                </div>
                <div className='bg-success-600 rounded-8 px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                  11:00 AM
                </div>
              </div>
              <div className='pt-32 pb-24 px-16 position-relative'>
                <h4 className='mb-28'>
                  <Link
                    to='/event-details'
                    className='link text-line-2'
                    tabIndex={0}
                  >
                    Intensive Coding Bootcamps for Beginners
                  </Link>
                </h4>
                <div className='flex-align gap-8'>
                  <span className='text-neutral-500 text-2xl d-flex'>
                    <i className='ph-bold ph-map-pin-line' />
                  </span>
                  <p className='text-neutral-500 text-lg'>
                    1901 Thornridge Cir. Shiloh
                  </p>
                </div>
                <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                  <h4 className='text-main-two-600 mb-0'>$199</h4>
                  <Link
                    to='/event-details'
                    className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                    tabIndex={0}
                  >
                    Join Now
                    <i className='ph ph-arrow-right' />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className='col-xl-4 col-sm-6'>
            <div className='scale-hover-item bg-main-25 rounded-16 p-12 h-100 border border-neutral-30'>
              <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                <Link to='/event-details' className='w-100 h-100' tabIndex={0}>
                  <img
                    src='assets/images/thumbs/event-img3.png'
                    alt='Course'
                    className='scale-hover-item__img rounded-12 cover-img transition-2'
                  />
                </Link>
                <div className='position-absolute inset-inline-end-0 inset-block-end-0 me-16 mb-16 py-12 px-24 rounded-8 bg-main-two-600 text-white fw-medium'>
                  <h3 className='mb-0 text-white fw-medium'>26</h3>
                  DEC
                </div>
                <div className='bg-success-600 rounded-8 px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                  12:15 PM
                </div>
              </div>
              <div className='pt-32 pb-24 px-16 position-relative'>
                <h4 className='mb-28'>
                  <Link
                    to='/event-details'
                    className='link text-line-2'
                    tabIndex={0}
                  >
                    Interactive Science Fair and Competition
                  </Link>
                </h4>
                <div className='flex-align gap-8'>
                  <span className='text-neutral-500 text-2xl d-flex'>
                    <i className='ph-bold ph-map-pin-line' />
                  </span>
                  <p className='text-neutral-500 text-lg'>
                    1901 Thornridge Cir. Shiloh
                  </p>
                </div>
                <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                  <h4 className='text-main-two-600 mb-0'>$68</h4>
                  <Link
                    to='/event-details'
                    className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                    tabIndex={0}
                  >
                    Join Now
                    <i className='ph ph-arrow-right' />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className='col-xl-4 col-sm-6'>
            <div className='scale-hover-item bg-main-25 rounded-16 p-12 h-100 border border-neutral-30'>
              <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                <Link to='/event-details' className='w-100 h-100' tabIndex={0}>
                  <img
                    src='assets/images/thumbs/event-img4.png'
                    alt='Course'
                    className='scale-hover-item__img rounded-12 cover-img transition-2'
                  />
                </Link>
                <div className='position-absolute inset-inline-end-0 inset-block-end-0 me-16 mb-16 py-12 px-24 rounded-8 bg-main-two-600 text-white fw-medium'>
                  <h3 className='mb-0 text-white fw-medium'>08</h3>
                  DEC
                </div>
                <div className='bg-success-600 rounded-8 px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                  02:30 PM
                </div>
              </div>
              <div className='pt-32 pb-24 px-16 position-relative'>
                <h4 className='mb-28'>
                  <Link
                    to='/event-details'
                    className='link text-line-2'
                    tabIndex={0}
                  >
                    Mathematics Olympiad for Young Mathematicians
                  </Link>
                </h4>
                <div className='flex-align gap-8'>
                  <span className='text-neutral-500 text-2xl d-flex'>
                    <i className='ph-bold ph-map-pin-line' />
                  </span>
                  <p className='text-neutral-500 text-lg'>
                    1901 Thornridge Cir. Shiloh
                  </p>
                </div>
                <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                  <h4 className='text-main-two-600 mb-0'>$60</h4>
                  <Link
                    to='/event-details'
                    className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                    tabIndex={0}
                  >
                    Join Now
                    <i className='ph ph-arrow-right' />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className='col-xl-4 col-sm-6'>
            <div className='scale-hover-item bg-main-25 rounded-16 p-12 h-100 border border-neutral-30'>
              <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                <Link to='/event-details' className='w-100 h-100' tabIndex={0}>
                  <img
                    src='assets/images/thumbs/event-img5.png'
                    alt='Course'
                    className='scale-hover-item__img rounded-12 cover-img transition-2'
                  />
                </Link>
                <div className='position-absolute inset-inline-end-0 inset-block-end-0 me-16 mb-16 py-12 px-24 rounded-8 bg-main-two-600 text-white fw-medium'>
                  <h3 className='mb-0 text-white fw-medium'>01</h3>
                  DEC
                </div>
                <div className='bg-success-600 rounded-8 px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                  09:00 AM
                </div>
              </div>
              <div className='pt-32 pb-24 px-16 position-relative'>
                <h4 className='mb-28'>
                  <Link
                    to='/event-details'
                    className='link text-line-2'
                    tabIndex={0}
                  >
                    The Importance of Diversity in Higher Education
                  </Link>
                </h4>
                <div className='flex-align gap-8'>
                  <span className='text-neutral-500 text-2xl d-flex'>
                    <i className='ph-bold ph-map-pin-line' />
                  </span>
                  <p className='text-neutral-500 text-lg'>
                    1901 Thornridge Cir. Shiloh
                  </p>
                </div>
                <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                  <h4 className='text-main-two-600 mb-0'>$45</h4>
                  <Link
                    to='/event-details'
                    className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                    tabIndex={0}
                  >
                    Join Now
                    <i className='ph ph-arrow-right' />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className='col-xl-4 col-sm-6'>
            <div className='scale-hover-item bg-main-25 rounded-16 p-12 h-100 border border-neutral-30'>
              <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                <Link to='/event-details' className='w-100 h-100' tabIndex={0}>
                  <img
                    src='assets/images/thumbs/event-img6.png'
                    alt='Course'
                    className='scale-hover-item__img rounded-12 cover-img transition-2'
                  />
                </Link>
                <div className='position-absolute inset-inline-end-0 inset-block-end-0 me-16 mb-16 py-12 px-24 rounded-8 bg-main-two-600 text-white fw-medium'>
                  <h3 className='mb-0 text-white fw-medium'>13</h3>
                  DEC
                </div>
                <div className='bg-success-600 rounded-8 px-24 py-12 text-white position-absolute inset-block-start-0 inset-inline-start-0 mt-20 ms-20 z-1'>
                  05:45 PM
                </div>
              </div>
              <div className='pt-32 pb-24 px-16 position-relative'>
                <h4 className='mb-28'>
                  <Link
                    to='/event-details'
                    className='link text-line-2'
                    tabIndex={0}
                  >
                    Virtual Open House for New Students
                  </Link>
                </h4>
                <div className='flex-align gap-8'>
                  <span className='text-neutral-500 text-2xl d-flex'>
                    <i className='ph-bold ph-map-pin-line' />
                  </span>
                  <p className='text-neutral-500 text-lg'>
                    1901 Thornridge Cir. Shiloh
                  </p>
                </div>
                <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                  <h4 className='text-main-two-600 mb-0'>$77</h4>
                  <Link
                    to='/event-details'
                    className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                    tabIndex={0}
                  >
                    Join Now
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

export default EventsAllOne;
