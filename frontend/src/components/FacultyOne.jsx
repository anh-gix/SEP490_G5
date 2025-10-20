import { Link } from "react-router-dom";

const FacultyOne = () => {
  return (
    <section className='faculty pb-120 bg-main-25'>
      <div className='container'>
        <div className='section-heading text-center'>
          <div className='flex-align d-inline-flex gap-8 mb-16 wow bounceInDown'>
            <span className='text-main-600 text-2xl d-flex'>
              <i className='ph-bold ph-book-open' />
            </span>
            <h5 className='text-main-600 mb-0'>
              Explore Faculty Of University
            </h5>
          </div>
          <h2 className='mb-24 wow bounceIn'>Top Listed Faculty</h2>
          <p className=' wow bounceInUp'>
            Certainly cordially, sweetness perceived day's end; why knowledge, a
            perception to cherish deeply.
          </p>
        </div>
        <div className='row gy-4'>
          <div
            className='col-lg-4 col-md-6'
            data-aos='fade-up'
            data-aos-duration={200}
          >
            <div className='scale-hover-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
              <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                <Link to='/course-details' className='w-100 h-100'>
                  <img
                    src='assets/images/thumbs/faculty-img1.png'
                    alt='Course'
                    className='scale-hover-item__img rounded-12 cover-img transition-2'
                  />
                </Link>
              </div>
              <div className='pt-32 pb-24 px-16 position-relative'>
                <div className=''>
                  <span className='text-up py-12 px-24 rounded-8 bg-main-three-600 text-white fw-medium'>
                    Admission Open
                  </span>
                  <div className='flex-between gap-8 flex-wrap mb-16'>
                    <Link
                      to='/course'
                      className='py-8 px-20 rounded-8 flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                    >
                      <span className='text-xl d-flex'>
                        <i className='ph-bold ph-squares-four' />
                      </span>
                      CSE
                    </Link>
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
                  <h4 className='mb-28'>
                    <Link to='/course-details' className='link text-line-2'>
                      Faculty of Engineering Admissions
                    </Link>
                  </h4>
                  <ul className='check-list'>
                    <li className='flex-align gap-8'>
                      <img src='assets/images/icons/check.png' alt='' />
                      <span className='text-neutral-500 text-md'>
                        Playground
                      </span>
                    </li>
                    <li className='flex-align gap-8'>
                      <img src='assets/images/icons/check.png' alt='' />
                      <span className='text-neutral-500 text-md'>Library</span>
                    </li>
                    <li className='flex-align gap-8'>
                      <img src='assets/images/icons/check.png' alt='' />
                      <span className='text-neutral-500 text-md'>Canteen</span>
                    </li>
                    <li className='flex-align gap-8'>
                      <img src='assets/images/icons/check.png' alt='' />
                      <span className='text-neutral-500 text-md'>
                        Stationary
                      </span>
                    </li>
                    <li className='flex-align gap-8'>
                      <img src='assets/images/icons/check.png' alt='' />
                      <span className='text-neutral-500 text-md'>Hostel</span>
                    </li>
                  </ul>
                </div>
                <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
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
          <div
            className='col-lg-4 col-md-6'
            data-aos='fade-up'
            data-aos-duration={400}
          >
            <div className='scale-hover-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
              <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                <Link to='/course-details' className='w-100 h-100'>
                  <img
                    src='assets/images/thumbs/faculty-img2.png'
                    alt='Course'
                    className='scale-hover-item__img rounded-12 cover-img transition-2'
                  />
                </Link>
              </div>
              <div className='pt-32 pb-24 px-16 position-relative'>
                <div className=''>
                  <span className='text-up py-12 px-24 rounded-8 bg-main-two-600 text-white fw-medium'>
                    Admission Closed
                  </span>
                  <div className='flex-between gap-8 flex-wrap mb-16'>
                    <Link
                      to='/course'
                      className='py-8 px-20 rounded-8 flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                    >
                      <span className='text-xl d-flex'>
                        <i className='ph-bold ph-squares-four' />
                      </span>
                      ARTS
                    </Link>
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
                  <h4 className='mb-28'>
                    <Link to='/course-details' className='link text-line-2'>
                      Arts and Humanities Admissions
                    </Link>
                  </h4>
                  <ul className='check-list'>
                    <li className='flex-align gap-8'>
                      <img src='assets/images/icons/check.png' alt='' />
                      <span className='text-neutral-500 text-md'>
                        Playground
                      </span>
                    </li>
                    <li className='flex-align gap-8'>
                      <img src='assets/images/icons/check.png' alt='' />
                      <span className='text-neutral-500 text-md'>Library</span>
                    </li>
                    <li className='flex-align gap-8'>
                      <img src='assets/images/icons/check.png' alt='' />
                      <span className='text-neutral-500 text-md'>Canteen</span>
                    </li>
                    <li className='flex-align gap-8'>
                      <img src='assets/images/icons/check.png' alt='' />
                      <span className='text-neutral-500 text-md'>
                        Stationary
                      </span>
                    </li>
                    <li className='flex-align gap-8'>
                      <img src='assets/images/icons/check.png' alt='' />
                      <span className='text-neutral-500 text-md'>Hostel</span>
                    </li>
                  </ul>
                </div>
                <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
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
          <div
            className='col-lg-4 col-md-6'
            data-aos='fade-up'
            data-aos-duration={600}
          >
            <div className='scale-hover-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
              <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                <Link to='/course-details' className='w-100 h-100'>
                  <img
                    src='assets/images/thumbs/faculty-img3.png'
                    alt='Course'
                    className='scale-hover-item__img rounded-12 cover-img transition-2'
                  />
                </Link>
              </div>
              <div className='pt-32 pb-24 px-16 position-relative'>
                <div className=''>
                  <span className='text-up py-12 px-24 rounded-8 bg-main-three-600 text-white fw-medium'>
                    Admission Open
                  </span>
                  <div className='flex-between gap-8 flex-wrap mb-16'>
                    <Link
                      to='/course'
                      className='py-8 px-20 rounded-8 flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                    >
                      <span className='text-xl d-flex'>
                        <i className='ph-bold ph-squares-four' />
                      </span>
                      BBA
                    </Link>
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
                  <h4 className='mb-28'>
                    <Link to='/course-details' className='link text-line-2'>
                      Social And Sciences Admissions
                    </Link>
                  </h4>
                  <ul className='check-list'>
                    <li className='flex-align gap-8'>
                      <img src='assets/images/icons/check.png' alt='' />
                      <span className='text-neutral-500 text-md'>
                        Playground
                      </span>
                    </li>
                    <li className='flex-align gap-8'>
                      <img src='assets/images/icons/check.png' alt='' />
                      <span className='text-neutral-500 text-md'>Library</span>
                    </li>
                    <li className='flex-align gap-8'>
                      <img src='assets/images/icons/check.png' alt='' />
                      <span className='text-neutral-500 text-md'>Canteen</span>
                    </li>
                    <li className='flex-align gap-8'>
                      <img src='assets/images/icons/check.png' alt='' />
                      <span className='text-neutral-500 text-md'>
                        Stationary
                      </span>
                    </li>
                    <li className='flex-align gap-8'>
                      <img src='assets/images/icons/check.png' alt='' />
                      <span className='text-neutral-500 text-md'>Hostel</span>
                    </li>
                  </ul>
                </div>
                <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
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
          <div
            className='col-lg-4 col-md-6'
            data-aos='fade-up'
            data-aos-duration={200}
          >
            <div className='scale-hover-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
              <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                <Link to='/course-details' className='w-100 h-100'>
                  <img
                    src='assets/images/thumbs/faculty-img4.png'
                    alt='Course'
                    className='scale-hover-item__img rounded-12 cover-img transition-2'
                  />
                </Link>
              </div>
              <div className='pt-32 pb-24 px-16 position-relative'>
                <div className=''>
                  <span className='text-up py-12 px-24 rounded-8 bg-main-two-600 text-white fw-medium'>
                    Admission Closed
                  </span>
                  <div className='flex-between gap-8 flex-wrap mb-16'>
                    <Link
                      to='/course'
                      className='py-8 px-20 rounded-8 flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                    >
                      <span className='text-xl d-flex'>
                        <i className='ph-bold ph-squares-four' />
                      </span>
                      CSE
                    </Link>
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
                  <h4 className='mb-28'>
                    <Link to='/course-details' className='link text-line-2'>
                      Computer Science Admissions
                    </Link>
                  </h4>
                  <ul className='check-list'>
                    <li className='flex-align gap-8'>
                      <img src='assets/images/icons/check.png' alt='' />
                      <span className='text-neutral-500 text-md'>
                        Playground
                      </span>
                    </li>
                    <li className='flex-align gap-8'>
                      <img src='assets/images/icons/check.png' alt='' />
                      <span className='text-neutral-500 text-md'>Library</span>
                    </li>
                    <li className='flex-align gap-8'>
                      <img src='assets/images/icons/check.png' alt='' />
                      <span className='text-neutral-500 text-md'>Canteen</span>
                    </li>
                    <li className='flex-align gap-8'>
                      <img src='assets/images/icons/check.png' alt='' />
                      <span className='text-neutral-500 text-md'>
                        Stationary
                      </span>
                    </li>
                    <li className='flex-align gap-8'>
                      <img src='assets/images/icons/check.png' alt='' />
                      <span className='text-neutral-500 text-md'>Hostel</span>
                    </li>
                  </ul>
                </div>
                <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
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
          <div
            className='col-lg-4 col-md-6'
            data-aos='fade-up'
            data-aos-duration={400}
          >
            <div className='scale-hover-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
              <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                <Link to='/course-details' className='w-100 h-100'>
                  <img
                    src='assets/images/thumbs/faculty-img5.png'
                    alt='Course'
                    className='scale-hover-item__img rounded-12 cover-img transition-2'
                  />
                </Link>
              </div>
              <div className='pt-32 pb-24 px-16 position-relative'>
                <div className=''>
                  <span className='text-up py-12 px-24 rounded-8 bg-main-three-600 text-white fw-medium'>
                    Admission Open
                  </span>
                  <div className='flex-between gap-8 flex-wrap mb-16'>
                    <Link
                      to='/course'
                      className='py-8 px-20 rounded-8 flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                    >
                      <span className='text-xl d-flex'>
                        <i className='ph-bold ph-squares-four' />
                      </span>
                      BBA
                    </Link>
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
                  <h4 className='mb-28'>
                    <Link to='/course-details' className='link text-line-2'>
                      Business and Economics Admissions
                    </Link>
                  </h4>
                  <ul className='check-list'>
                    <li className='flex-align gap-8'>
                      <img src='assets/images/icons/check.png' alt='' />
                      <span className='text-neutral-500 text-md'>
                        Playground
                      </span>
                    </li>
                    <li className='flex-align gap-8'>
                      <img src='assets/images/icons/check.png' alt='' />
                      <span className='text-neutral-500 text-md'>Library</span>
                    </li>
                    <li className='flex-align gap-8'>
                      <img src='assets/images/icons/check.png' alt='' />
                      <span className='text-neutral-500 text-md'>Canteen</span>
                    </li>
                    <li className='flex-align gap-8'>
                      <img src='assets/images/icons/check.png' alt='' />
                      <span className='text-neutral-500 text-md'>
                        Stationary
                      </span>
                    </li>
                    <li className='flex-align gap-8'>
                      <img src='assets/images/icons/check.png' alt='' />
                      <span className='text-neutral-500 text-md'>Hostel</span>
                    </li>
                  </ul>
                </div>
                <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
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
          <div
            className='col-lg-4 col-md-6'
            data-aos='fade-up'
            data-aos-duration={600}
          >
            <div className='scale-hover-item bg-white rounded-16 p-12 h-100 box-shadow-md'>
              <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                <Link to='/course-details' className='w-100 h-100'>
                  <img
                    src='assets/images/thumbs/faculty-img6.png'
                    alt='Course'
                    className='scale-hover-item__img rounded-12 cover-img transition-2'
                  />
                </Link>
              </div>
              <div className='pt-32 pb-24 px-16 position-relative'>
                <div className=''>
                  <span className='text-up py-12 px-24 rounded-8 bg-main-two-600 text-white fw-medium'>
                    Admission Closed
                  </span>
                  <div className='flex-between gap-8 flex-wrap mb-16'>
                    <Link
                      to='/course'
                      className='py-8 px-20 rounded-8 flex-align gap-8 text-main-600 fw-medium bg-main-25 hover-bg-main-600 hover-text-white'
                    >
                      <span className='text-xl d-flex'>
                        <i className='ph-bold ph-squares-four' />
                      </span>
                      Medical
                    </Link>
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
                  <h4 className='mb-28'>
                    <Link to='/course-details' className='link text-line-2'>
                      Medicine and Health Sciences Admissions
                    </Link>
                  </h4>
                  <ul className='check-list'>
                    <li className='flex-align gap-8'>
                      <img src='assets/images/icons/check.png' alt='' />
                      <span className='text-neutral-500 text-md'>
                        Playground
                      </span>
                    </li>
                    <li className='flex-align gap-8'>
                      <img src='assets/images/icons/check.png' alt='' />
                      <span className='text-neutral-500 text-md'>Library</span>
                    </li>
                    <li className='flex-align gap-8'>
                      <img src='assets/images/icons/check.png' alt='' />
                      <span className='text-neutral-500 text-md'>Canteen</span>
                    </li>
                    <li className='flex-align gap-8'>
                      <img src='assets/images/icons/check.png' alt='' />
                      <span className='text-neutral-500 text-md'>
                        Stationary
                      </span>
                    </li>
                    <li className='flex-align gap-8'>
                      <img src='assets/images/icons/check.png' alt='' />
                      <span className='text-neutral-500 text-md'>Hostel</span>
                    </li>
                  </ul>
                </div>
                <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
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
        <div className='text-center mt-40'>
          <Link
            to='/about'
            className='btn btn-outline-main rounded-pill flex-align d-inline-flex gap-8'
          >
            See All University
            <i className='ph-bold ph-arrow-up-right d-flex text-lg' />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FacultyOne;
