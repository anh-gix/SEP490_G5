const TutorDetails = () => {
  return (
    <section className='tutor-details py-120'>
      <div className='container'>
        <div className='row gy-4'>
          <div className='col-lg-4'>
            <div className='border border-neutral-30 rounded-12 bg-white p-8'>
              <div className='border border-neutral-30 rounded-12 bg-main-25 p-32 bg-main-25'>
                <div className='p-16 border border-neutral-50 rounded-circle aspect-ratio-1 max-w-150 max-h-150 mx-auto'>
                  <div className='position-relative'>
                    <img
                      src='assets/images/thumbs/instructor-img1.png'
                      alt=''
                      className='rounded-circle bg-dark-yellow aspect-ratio-1 cover-img'
                    />
                    <span className='w-32 h-32 bg-success-600 rounded-circle border border-main-25 border-3 flex-center text-white position-absolute inset-block-end-0 inset-inline-end-0 me-4'>
                      <i className='ph-bold ph-check' />
                    </span>
                  </div>
                </div>
                <h4 className='mb-16 text-center mt-40'>Savannah Nguyen</h4>
                <div className='flex-center gap-10 flex-wrap my-20'>
                  <span className='text-neutral-500 text-md'>
                    ID: <span className='text-main-600 fw-medium'>TS-950</span>
                  </span>
                  <span className='w-4 h-4 bg-main-600 rounded-circle' />
                  <span className='text-neutral-500 text-md'>
                    Gender:{" "}
                    <span className='text-main-600 fw-medium'>Male </span>
                  </span>
                  <span className='w-4 h-4 bg-main-600 rounded-circle' />
                  <div className='flex-align gap-4'>
                    <span className='text-lg fw-medium text-warning-600 d-flex'>
                      <i className='ph-fill ph-star' />
                    </span>
                    <span className='text-md text-neutral-700'>
                      4.8
                      <span className='text-neutral-100'> (114)</span>
                    </span>
                  </div>
                </div>
                <ul className='social-list flex-center gap-16 mt-28'>
                  <li className='social-list__item'>
                    <a
                      href='https://www.facebook.com'
                      className='text-main-600 text-xl hover-text-white w-40 h-40 rounded-circle border border-main-600 hover-bg-main-600 flex-center'
                    >
                      <i className='ph-bold ph-facebook-logo' />
                    </a>
                  </li>
                  <li className='social-list__item'>
                    <a
                      href='https://www.twitter.com'
                      className='text-main-600 text-xl hover-text-white w-40 h-40 rounded-circle border border-main-600 hover-bg-main-600 flex-center'
                    >
                      <i className='ph-bold ph-twitter-logo' />
                    </a>
                  </li>
                  <li className='social-list__item'>
                    <a
                      href='https://www.linkedin.com'
                      className='text-main-600 text-xl hover-text-white w-40 h-40 rounded-circle border border-main-600 hover-bg-main-600 flex-center'
                    >
                      <i className='ph-bold ph-instagram-logo' />
                    </a>
                  </li>
                  <li className='social-list__item'>
                    <a
                      href='https://www.pinterest.com'
                      className='text-main-600 text-xl hover-text-white w-40 h-40 rounded-circle border border-main-600 hover-bg-main-600 flex-center'
                    >
                      <i className='ph-bold ph-pinterest-logo' />
                    </a>
                  </li>
                </ul>
                <span className='d-block border border-neutral-30 my-20 border-dashed' />
                <div className='d-flex flex-column gap-16'>
                  <div className='flex-align gap-16'>
                    <span className='text-2xl text-main-600'>
                      <i className='ph-bold ph-phone-call' />
                    </span>
                    <a
                      href='tel:252555-0126'
                      className='text-neutral-700 hover-text-main-600'
                    >
                      (252) 555-0126
                    </a>
                  </div>
                  <div className='flex-align gap-16'>
                    <span className='text-2xl text-success-600'>
                      <i className='ph-bold ph-envelope-simple' />
                    </span>
                    <a
                      href='mailto:demo@gmail.com'
                      className='text-neutral-700 hover-text-main-600'
                    >
                      demo@gmail.com
                    </a>
                  </div>
                  <div className='flex-align gap-16'>
                    <span className='text-2xl text-warning-600'>
                      <i className='ph-bold ph-map-pin-line' />
                    </span>
                    <span className='text-neutral-700'>
                      2715 Ash Dr. San Jose, South Dakota
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className='border border-neutral-30 rounded-12 bg-white p-8 mt-24'>
              <div className='border border-neutral-30 rounded-12 bg-main-25 p-32 bg-main-25'>
                <h4 className='mb-16'>Get In Touch</h4>
                <span className='d-block border border-neutral-30 my-24 border-dashed' />
                <form action='#' className='d-flex flex-column gap-20'>
                  <div className=''>
                    <label
                      htmlFor='myName'
                      className='text-lg fw-semibold text-neutral-700 mb-8'
                    >
                      Name
                    </label>
                    <input
                      type='text'
                      className='common-input border-transparent rounded-pill focus-border-main-600'
                      id='myName'
                      placeholder='Enter Your Name...'
                    />
                  </div>
                  <div className=''>
                    <label
                      htmlFor='Email'
                      className='text-lg fw-semibold text-neutral-700 mb-8'
                    >
                      Email
                    </label>
                    <input
                      type='email'
                      className='common-input border-transparent rounded-pill focus-border-main-600'
                      id='Email'
                      placeholder='Enter Your Email...'
                    />
                  </div>
                  <div className=''>
                    <label
                      htmlFor='Phone'
                      className='text-lg fw-semibold text-neutral-700 mb-8'
                    >
                      Phone
                    </label>
                    <input
                      type='tel'
                      className='common-input border-transparent rounded-pill focus-border-main-600'
                      id='Phone'
                      placeholder='Enter Your Number...'
                    />
                  </div>
                  <div className=''>
                    <label
                      htmlFor='Message'
                      className='text-lg fw-semibold text-neutral-700 mb-8'
                    >
                      Message
                    </label>
                    <textarea
                      className='common-input border-transparent rounded-24 focus-border-main-600'
                      id='Message'
                      placeholder='Enter Your Message...'
                      defaultValue={""}
                    />
                  </div>
                  <div className=''>
                    <button
                      type='submit'
                      className='btn btn-main rounded-pill flex-center gap-8 mt-20'
                    >
                      Submit Review
                      <i className='ph-bold ph-arrow-up-right d-flex text-lg' />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className='col-lg-8'>
            <ul
              className='nav nav-pills common-tab d-inline-flex gap-16 bg-white p-12 border border-neutral-30 rounded-pill'
              id='pills-tab'
              role='tablist'
            >
              <li className='nav-item' role='presentation'>
                <button
                  className='nav-link rounded-pill bg-main-25 text-md fw-medium text-neutral-500 flex-center w-100 gap-8 active'
                  id='pills-tutionInfo-tab'
                  data-bs-toggle='pill'
                  data-bs-target='#pills-tutionInfo'
                  type='button'
                  role='tab'
                  aria-controls='pills-tutionInfo'
                  aria-selected='true'
                >
                  <i className='text-xl text-main-600 d-flex ph-bold ph-user' />
                  Tuition Info
                </button>
              </li>
              <li className='nav-item' role='presentation'>
                <button
                  className='nav-link rounded-pill bg-main-25 text-md fw-medium text-neutral-500 flex-center w-100 gap-8'
                  id='pills-qualification-tab'
                  data-bs-toggle='pill'
                  data-bs-target='#pills-qualification'
                  type='button'
                  role='tab'
                  aria-controls='pills-qualification'
                  aria-selected='false'
                >
                  <i className='text-xl text-main-600 d-flex ph-bold ph-graduation-cap' />
                  Qualification
                </button>
              </li>
              <li className='nav-item' role='presentation'>
                <button
                  className='nav-link rounded-pill bg-main-25 text-md fw-medium text-neutral-500 flex-center w-100 gap-8'
                  id='pills-reviews-tab'
                  data-bs-toggle='pill'
                  data-bs-target='#pills-reviews'
                  type='button'
                  role='tab'
                  aria-controls='pills-reviews'
                  aria-selected='false'
                >
                  <i className='text-xl text-main-600 d-flex ph-bold ph-star' />
                  Reviews
                </button>
              </li>
            </ul>
            <div className='tab-content' id='pills-tabContent'>
              <div
                className='tab-pane fade show active'
                id='pills-tutionInfo'
                role='tabpanel'
                aria-labelledby='pills-tutionInfo-tab'
                tabIndex={0}
              >
                {/* Tuition Info Start */}
                <div className='tutor-details__content'>
                  <div className='border border-neutral-30 rounded-12 bg-white p-8 mt-24'>
                    <div className='border border-neutral-30 rounded-12 bg-main-25 p-32 bg-main-25'>
                      <h4 className='mb-16'>Tuition Info</h4>
                      <span className='d-block border border-neutral-30 my-24 border-dashed' />
                      <ul className='tution-info-list bg-white rounded-8'>
                        <li className='d-flex align-items-start px-32 py-16'>
                          <span className='w-50-percent fw-semibold text-neutral-700'>
                            Expected Minimum Salary
                          </span>
                          <span className='w-50-percent fw-normal text-neutral-500 text-md'>
                            {" "}
                            <span className='text-main-600 fw-semibold '>
                              $400{" "}
                            </span>{" "}
                            per month
                          </span>
                        </li>
                        <li className='d-flex align-items-start px-32 py-16'>
                          <span className='w-50-percent fw-semibold text-neutral-700'>
                            Expected Minimum Salary
                          </span>
                          <span className='w-50-percent fw-semibold text-warning-600 text-md'>
                            Available
                          </span>
                        </li>
                        <li className='d-flex align-items-start px-32 py-16'>
                          <span className='w-50-percent fw-semibold text-neutral-700'>
                            Days Per Week
                          </span>
                          <span className='w-50-percent fw-normal text-neutral-500 text-md'>
                            {" "}
                            4 Day/Week
                          </span>
                        </li>
                        <li className='d-flex align-items-start px-32 py-16'>
                          <span className='w-50-percent fw-semibold text-neutral-700'>
                            Preferred Tuition Style
                          </span>
                          <span className='w-50-percent fw-normal text-neutral-500 text-md'>
                            {" "}
                            Private Tuition, Online Tuition
                          </span>
                        </li>
                        <li className='d-flex align-items-start px-32 py-16'>
                          <span className='w-50-percent fw-semibold text-neutral-700'>
                            Tuitoring Experience
                          </span>
                          <span className='w-50-percent fw-normal text-neutral-500 text-md'>
                            {" "}
                            6 Years
                          </span>
                        </li>
                        <li className='d-flex align-items-start px-32 py-16'>
                          <span className='w-50-percent fw-semibold text-neutral-700'>
                            Place of Learning
                          </span>
                          <span className='w-50-percent fw-normal text-neutral-500 text-md'>
                            {" "}
                            Home Visit
                          </span>
                        </li>
                        <li className='d-flex align-items-start px-32 py-16'>
                          <span className='w-50-percent fw-semibold text-neutral-700'>
                            Extra Facilities
                          </span>
                          <span className='w-50-percent fw-normal text-neutral-500 text-md'>
                            {" "}
                            Phone help
                          </span>
                        </li>
                        <li className='d-flex align-items-start px-32 py-16'>
                          <span className='w-50-percent fw-semibold text-neutral-700'>
                            Preferred Medium of Instruction
                          </span>
                          <span className='w-50-percent fw-normal text-neutral-500 text-md'>
                            {" "}
                            Bangla Medium, English Version
                          </span>
                        </li>
                        <li className='d-flex align-items-start px-32 py-16'>
                          <span className='w-50-percent fw-semibold text-neutral-700'>
                            Preferred Class
                          </span>
                          <span className='w-50-percent fw-normal text-neutral-500 text-md'>
                            {" "}
                            Class 10 (Bangla Medium), Class 4 (Bangla Medium),
                            Class 4 (English Version), Class 5 (Bangla Medium),
                            Class 5 (English Version), Class 6 (English
                            Version), Class 6 (Bangla Medium), Class 7 (Bangla
                            Medium), Class 8 (Bangla Medium), Class 9 (Bangla
                            Medium), HSC-1st YEAR (Bangla Medium), SSC (Bangla
                            Medium), HSC-2nd YEAR (Bangla Medium)
                          </span>
                        </li>
                        <li className='d-flex align-items-start px-32 py-16'>
                          <span className='w-50-percent fw-semibold text-neutral-700'>
                            Preferred Subjects
                          </span>
                          <span className='w-50-percent fw-normal text-neutral-500 text-md'>
                            {" "}
                            General Maths (Class 9), Higher Math (Class 10),
                            Agricultural Education (Class 6), All (Class 7),
                            Bangla (Class 7), Bangladesh &amp; Global Studies
                            (Class 7), Bangladesh And Global Studies (Class 10),
                            BGS (SSC), Biology (Class 9), Chemistry (Class 9),
                            English (Class 7), General Science (Class 7),
                            Genaral Math (Class 10), Higher maths (Class 9),
                            Higher Maths (HSC-2nd YEAR), History (SSC), Home
                            economics (Class 8), ‎Home Science (Class 10), Home
                            Economics (Class 9), ICT (Class 6), Maths (SSC),
                            Others (Class 5), Mathematics (Class 9), Physics
                            (Class 9), Science (Class 9), Islamic Studies (Class
                            8), Social science (Class 7)
                          </span>
                        </li>
                        <li className='d-flex align-items-start px-32 py-16'>
                          <span className='w-50-percent fw-semibold text-neutral-700'>
                            Preferred Time
                          </span>
                          <span className='w-50-percent fw-normal text-neutral-500 text-md'>
                            {" "}
                            Evening, After Magrib
                          </span>
                        </li>
                        <li className='d-flex align-items-start px-32 py-16'>
                          <span className='w-50-percent fw-semibold text-neutral-700'>
                            Preferred Area to Teach
                          </span>
                          <span className='w-50-percent fw-normal text-neutral-500 text-md'>
                            {" "}
                            2464 Royal Ln. Mesa, New Jersey 45463
                          </span>
                        </li>
                        <li className='d-flex align-items-start px-32 py-16'>
                          <span className='w-50-percent fw-semibold text-neutral-700'>
                            Student Reviews
                          </span>
                          <div className='flex-align gap-8'>
                            <span className='text-xl fw-medium text-warning-600 d-flex'>
                              <i className='ph-fill ph-star' />
                            </span>
                            <span className='text-xl fw-medium text-warning-600 d-flex'>
                              <i className='ph-fill ph-star' />
                            </span>
                            <span className='text-xl fw-medium text-warning-600 d-flex'>
                              <i className='ph-fill ph-star' />
                            </span>
                            <span className='text-xl fw-medium text-warning-600 d-flex'>
                              <i className='ph-fill ph-star' />
                            </span>
                            <span className='text-xl fw-medium text-warning-600 d-flex'>
                              <i className='ph-fill ph-star-half' />
                            </span>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                {/* Tuition Info End */}
              </div>
              <div
                className='tab-pane fade'
                id='pills-qualification'
                role='tabpanel'
                aria-labelledby='pills-qualification-tab'
                tabIndex={0}
              >
                {/* Qualification Start */}
                <div className='tutor-details__content'>
                  <div className='border border-neutral-30 rounded-12 bg-white p-8 mt-24'>
                    <div className='border border-neutral-30 rounded-12 bg-main-25 p-32 bg-main-25'>
                      <h4 className='mb-16'>Educational Qualification</h4>
                      <span className='d-block border border-neutral-30 my-24 border-dashed' />
                      <div className='overflow-x-auto'>
                        <ul className='tution-info-list style-two bg-white rounded-8 border border-white border-2 rounded-12'>
                          <li className='px-32 py-16'>
                            <span className='fw-semibold text-neutral-700'>
                              Exam Name
                            </span>
                            <span className='fw-semibold text-neutral-700'>
                              Year
                            </span>
                            <span className='fw-semibold text-neutral-700'>
                              Institute
                            </span>
                            <span className='fw-semibold text-neutral-700'>
                              Group/Subject
                            </span>
                            <span className='fw-semibold text-neutral-700'>
                              Result
                            </span>
                          </li>
                          <li className='px-32 py-16'>
                            <span className='fw-normal text-neutral-700'>
                              SSC / O-level / Dakhil
                            </span>
                            <span className='fw-normal text-neutral-700'>
                              2015
                            </span>
                            <span className='fw-normal text-neutral-700'>
                              Birshreshtha Munshi Abdur Rouf public College
                            </span>
                            <span className='fw-normal text-neutral-700'>
                              Science
                            </span>
                            <span className='fw-normal text-main-600 text-md'>
                              5.00
                            </span>
                          </li>
                          <li className='px-32 py-16'>
                            <span className='fw-normal text-neutral-700'>
                              HSC / A level / Alim
                            </span>
                            <span className='fw-normal text-neutral-700'>
                              2017
                            </span>
                            <span className='fw-normal text-neutral-700'>
                              Birshreshtha Noor Mohammad Public College
                            </span>
                            <span className='fw-normal text-neutral-700'>
                              Science
                            </span>
                            <span className='fw-normal text-main-600 text-md'>
                              5.00
                            </span>
                          </li>
                          <li className='px-32 py-16'>
                            <span className='fw-normal text-neutral-700'>
                              Graduation / Bachelor / Diploma
                            </span>
                            <span className='fw-normal text-neutral-700'>
                              Graduation Complete
                            </span>
                            <span className='fw-normal text-neutral-700'>
                              Sher-e-Bangla Agricultural University
                            </span>
                            <span className='fw-normal text-neutral-700'>
                              null
                            </span>
                            <span className='fw-normal text-main-600 text-md'>
                              3.30{" "}
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Qualification End */}
              </div>
              <div
                className='tab-pane fade'
                id='pills-reviews'
                role='tabpanel'
                aria-labelledby='pills-reviews-tab'
                tabIndex={0}
              >
                {/* Reviews Start */}
                <div className='tutor-details__content'>
                  <div className='border border-neutral-30 rounded-12 bg-white p-8 mt-24'>
                    <div className='border border-neutral-30 rounded-12 bg-main-25 p-32'>
                      <h5 className='mb-0'>Average Reviews</h5>
                      <span className='d-block border border-neutral-30 my-32 border-dashed' />
                      <div className='d-flex flex-sm-row flex-column gap-36'>
                        <div className='rounded-16 px-40 py-24 flex-center flex-column flex-shrink-0 text-center bg-main-600 text-white'>
                          <h2 className='mb-8 text-white'>4.8</h2>
                          <div className='flex-center gap-4'>
                            <span className='text-15 fw-medium text-white d-flex'>
                              <i className='ph-fill ph-star' />
                            </span>
                            <span className='text-15 fw-medium text-white d-flex'>
                              <i className='ph-fill ph-star' />
                            </span>
                            <span className='text-15 fw-medium text-white d-flex'>
                              <i className='ph-fill ph-star' />
                            </span>
                            <span className='text-15 fw-medium text-white d-flex'>
                              <i className='ph-fill ph-star' />
                            </span>
                            <span className='text-15 fw-medium text-white d-flex'>
                              <i className='ph-fill ph-star-half' />
                            </span>
                          </div>
                          <span className='mt-8 text-gray-500'>26 Rating</span>
                        </div>
                        <div className='flex-grow-1'>
                          <div className='flex-align gap-20 mb-8'>
                            <div className='flex-align gap-8'>
                              <span className='text-lg fw-medium text-warning-600 d-flex'>
                                <i className='ph-fill ph-star' />
                              </span>
                              <span className='text-gray-900 flex-shrink-0'>
                                5
                              </span>
                            </div>
                            <div
                              className='progress w-100 bg-white rounded-pill h-12'
                              role='progressbar'
                              aria-label='Basic example'
                              aria-valuenow={90}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            >
                              <div
                                className='progress-bar bg-main-600 rounded-pill'
                                style={{ width: "90%" }}
                              />
                            </div>
                            <span className='text-gray-900 flex-shrink-0'>
                              90%
                            </span>
                          </div>
                          <div className='flex-align gap-20 mb-8'>
                            <div className='flex-align gap-8'>
                              <span className='text-lg fw-medium text-warning-600 d-flex'>
                                <i className='ph-fill ph-star' />
                              </span>
                              <span className='text-gray-900 flex-shrink-0'>
                                5
                              </span>
                            </div>
                            <div
                              className='progress w-100 bg-white rounded-pill h-12'
                              role='progressbar'
                              aria-label='Basic example'
                              aria-valuenow={75}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            >
                              <div
                                className='progress-bar bg-main-600 rounded-pill'
                                style={{ width: "75%" }}
                              />
                            </div>
                            <span className='text-gray-900 flex-shrink-0'>
                              75%
                            </span>
                          </div>
                          <div className='flex-align gap-20 mb-8'>
                            <div className='flex-align gap-8'>
                              <span className='text-lg fw-medium text-warning-600 d-flex'>
                                <i className='ph-fill ph-star' />
                              </span>
                              <span className='text-gray-900 flex-shrink-0'>
                                5
                              </span>
                            </div>
                            <div
                              className='progress w-100 bg-white rounded-pill h-12'
                              role='progressbar'
                              aria-label='Basic example'
                              aria-valuenow={67}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            >
                              <div
                                className='progress-bar bg-main-600 rounded-pill'
                                style={{ width: "67%" }}
                              />
                            </div>
                            <span className='text-gray-900 flex-shrink-0'>
                              67%
                            </span>
                          </div>
                          <div className='flex-align gap-20 mb-8'>
                            <div className='flex-align gap-8'>
                              <span className='text-lg fw-medium text-warning-600 d-flex'>
                                <i className='ph-fill ph-star' />
                              </span>
                              <span className='text-gray-900 flex-shrink-0'>
                                5
                              </span>
                            </div>
                            <div
                              className='progress w-100 bg-white rounded-pill h-12'
                              role='progressbar'
                              aria-label='Basic example'
                              aria-valuenow={44}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            >
                              <div
                                className='progress-bar bg-main-600 rounded-pill'
                                style={{ width: "44%" }}
                              />
                            </div>
                            <span className='text-gray-900 flex-shrink-0'>
                              44%
                            </span>
                          </div>
                          <div className='flex-align gap-20'>
                            <div className='flex-align gap-8'>
                              <span className='text-lg fw-medium text-warning-600 d-flex'>
                                <i className='ph-fill ph-star' />
                              </span>
                              <span className='text-gray-900 flex-shrink-0'>
                                5
                              </span>
                            </div>
                            <div
                              className='progress w-100 bg-white rounded-pill h-12'
                              role='progressbar'
                              aria-label='Basic example'
                              aria-valuenow={21}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            >
                              <div
                                className='progress-bar bg-main-600 rounded-pill'
                                style={{ width: "21%" }}
                              />
                            </div>
                            <span className='text-gray-900 flex-shrink-0'>
                              21%
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className='d-block border border-neutral-30 my-32 border-dashed' />
                      <div className='flex-between gap-16 flex-wrap mb-24'>
                        <h6 className='mb-0'>All Reviews</h6>
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
                        </div>
                      </div>
                      {/* Review Item */}
                      <div className='border border-neutral-30 rounded-12 bg-white p-32'>
                        <div className='flex-align gap-8 mb-16'>
                          <span className='text-xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star-half' />
                          </span>
                        </div>
                        <p className='text-neutral-700'>
                          "This course was fantastic! The instructor's
                          explanations were clear and concise, making it easy to
                          understand even the more complex topics."
                        </p>
                        <span className='d-block border border-neutral-30 my-24 border-dashed' />
                        <div className='flex-align gap-24'>
                          <img
                            src='assets/images/thumbs/reviewer-img1.png'
                            alt=''
                            className='w-60 h-60 rounded-circle cover-img'
                          />
                          <div className=''>
                            <h6 className='text-xl mb-8 fw-medium'>
                              Mary Johnson
                            </h6>
                            <span className='text-neutral-700 text-sm'>
                              Project Manager
                            </span>
                          </div>
                        </div>
                        <span className='d-block border border-neutral-30 my-24 border-dashed' />
                        <div className='flex-align flex-wrap gap-40'>
                          <button
                            type='button'
                            className='like-button flex-align gap-8 text-neutral-500 hover-text-main-600'
                          >
                            <span className='like-button__icon text-xl d-flex'>
                              <i className='ph-bold ph-thumbs-up' />
                            </span>
                            <span className='like-button__text'>178</span>
                          </button>
                          <a
                            href='#commentForm'
                            className='flex-align gap-8 text-neutral-500 hover-text-main-600'
                          >
                            <i className='text-xl d-flex ph-bold ph-chat-centered-text' />
                            Reply
                          </a>
                        </div>
                        <div className='flex-align gap-20 mt-24'>
                          <img
                            src='assets/images/thumbs/reviewer-img2.png'
                            alt=''
                            className='w-60 h-60 rounded-circle cover-img'
                          />
                          <input
                            type='text'
                            className='common-input rounded-pill bg-main-25 border-neutral-30 py-16'
                            placeholder='Join the discussion...'
                          />
                        </div>
                      </div>
                      {/* Review Item */}
                      {/* Review Item */}
                      <div className='border border-neutral-30 rounded-12 bg-white p-32 mt-24'>
                        <div className='flex-align gap-8 mb-16'>
                          <span className='text-xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star-half' />
                          </span>
                        </div>
                        <p className='text-neutral-700'>
                          "Great course for beginners and advanced learners
                          alike. The projects were particularly helpful in
                          applying what I learned. Highly recommend!"
                        </p>
                        <span className='d-block border border-neutral-30 my-24 border-dashed' />
                        <div className='flex-align gap-24'>
                          <img
                            src='assets/images/thumbs/reviewer-img2.png'
                            alt=''
                            className='w-60 h-60 rounded-circle cover-img'
                          />
                          <div className=''>
                            <h6 className='text-xl mb-8 fw-medium'>
                              Alice Brown
                            </h6>
                            <span className='text-neutral-700 text-sm'>
                              Software Developer
                            </span>
                          </div>
                        </div>
                        <span className='d-block border border-neutral-30 my-24 border-dashed' />
                        <div className='flex-align flex-wrap gap-40'>
                          <button
                            type='button'
                            className='like-button flex-align gap-8 text-neutral-500 hover-text-main-600'
                          >
                            <span className='like-button__icon text-xl d-flex'>
                              <i className='ph-bold ph-thumbs-up' />
                            </span>
                            <span className='like-button__text'>178</span>
                          </button>
                          <a
                            href='#commentForm'
                            className='flex-align gap-8 text-neutral-500 hover-text-main-600'
                          >
                            <i className='text-xl d-flex ph-bold ph-chat-centered-text' />
                            Reply
                          </a>
                        </div>
                      </div>
                      {/* Review Item */}
                      {/* Review Item */}
                      <div className='border border-neutral-30 rounded-12 bg-white p-32 mt-24'>
                        <div className='flex-align gap-8 mb-16'>
                          <span className='text-xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star' />
                          </span>
                          <span className='text-xl fw-medium text-warning-600 d-flex'>
                            <i className='ph-fill ph-star-half' />
                          </span>
                        </div>
                        <p className='text-neutral-700'>
                          "Dr. Smith is an amazing instructor. Her real-world
                          experience and teaching style made this course one of
                          the best I've ever taken."
                        </p>
                        <span className='d-block border border-neutral-30 my-24 border-dashed' />
                        <div className='flex-align gap-24'>
                          <img
                            src='assets/images/thumbs/reviewer-img3.png'
                            alt=''
                            className='w-60 h-60 rounded-circle cover-img'
                          />
                          <div className=''>
                            <h6 className='text-xl mb-8 fw-medium'>
                              David Wilson
                            </h6>
                            <span className='text-neutral-700 text-sm'>
                              Ethical Hacker
                            </span>
                          </div>
                        </div>
                        <span className='d-block border border-neutral-30 my-24 border-dashed' />
                        <div className='flex-align flex-wrap gap-40'>
                          <button
                            type='button'
                            className='like-button flex-align gap-8 text-neutral-500 hover-text-main-600'
                          >
                            <span className='like-button__icon text-xl d-flex'>
                              <i className='ph-bold ph-thumbs-up' />
                            </span>
                            <span className='like-button__text'>178</span>
                          </button>
                          <a
                            href='#commentForm'
                            className='flex-align gap-8 text-neutral-500 hover-text-main-600'
                          >
                            <i className='text-xl d-flex ph-bold ph-chat-centered-text' />
                            Reply
                          </a>
                        </div>
                      </div>
                      {/* Review Item */}
                      <button
                        type='button'
                        className='btn btn-main rounded-pill flex-center gap-8 mt-40'
                      >
                        See All Reviews
                        <i className='ph-bold ph-arrow-up-right d-flex text-lg' />
                      </button>
                    </div>
                    {/* Comment Form Start */}
                    <div className='border border-neutral-30 rounded-12 bg-main-25 p-32 mt-24'>
                      <form action='#' id='commentForm'>
                        <h5 className='mb-0'>Write a Review</h5>
                        <span className='d-block border border-neutral-30 my-32 border-dashed' />
                        <div className='mb-24'>
                          <label
                            htmlFor='nameee'
                            className='text-neutral-700 text-lg fw-medium mb-12'
                          >
                            Name{" "}
                          </label>
                          <input
                            type='text'
                            className='common-input rounded-pill'
                            id='nameee'
                            placeholder='Enter Name...'
                          />
                        </div>
                        <div className='mb-24'>
                          <label
                            htmlFor='email'
                            className='text-neutral-700 text-lg fw-medium mb-12'
                          >
                            Email{" "}
                          </label>
                          <input
                            type='text'
                            className='common-input rounded-pill'
                            id='email'
                            placeholder='Enter Email...'
                          />
                        </div>
                        <div className='mb-24'>
                          <label className='text-neutral-700 text-lg fw-medium mb-12'>
                            Star Reviews
                          </label>
                          <div id='half-star-rating'>
                            <div className='rating-group'>
                              <input
                                className='rating__input rating__input--none'
                                defaultChecked=''
                                name='rating2'
                                id='rating2-0'
                                defaultValue={0}
                                type='radio'
                              />
                              <label
                                aria-label='0 stars'
                                className='rating__label'
                                htmlFor='rating2-0'
                              >
                                &nbsp;
                              </label>
                              <label
                                aria-label='0.5 stars'
                                className='rating__label rating__label--half'
                                htmlFor='rating2-05'
                              >
                                <i className='rating__icon rating__icon--star ph-fill ph-star-half' />
                              </label>
                              <input
                                className='rating__input'
                                name='rating2'
                                id='rating2-05'
                                defaultValue='0.5'
                                type='radio'
                              />
                              <label
                                aria-label='1 star'
                                className='rating__label'
                                htmlFor='rating2-10'
                              >
                                <i className='rating__icon rating__icon--star ph-fill ph-star' />
                              </label>
                              <input
                                className='rating__input'
                                name='rating2'
                                id='rating2-10'
                                defaultValue={1}
                                type='radio'
                              />
                              <label
                                aria-label='1.5 stars'
                                className='rating__label rating__label--half'
                                htmlFor='rating2-15'
                              >
                                <i className='rating__icon rating__icon--star ph-fill ph-star-half' />
                              </label>
                              <input
                                className='rating__input'
                                name='rating2'
                                id='rating2-15'
                                defaultValue='1.5'
                                type='radio'
                              />
                              <label
                                aria-label='2 stars'
                                className='rating__label'
                                htmlFor='rating2-20'
                              >
                                <i className='rating__icon rating__icon--star ph-fill ph-star' />
                              </label>
                              <input
                                className='rating__input'
                                name='rating2'
                                id='rating2-20'
                                defaultValue={2}
                                type='radio'
                              />
                              <label
                                aria-label='2.5 stars'
                                className='rating__label rating__label--half'
                                htmlFor='rating2-25'
                              >
                                <i className='rating__icon rating__icon--star ph-fill ph-star-half' />
                              </label>
                              <input
                                className='rating__input'
                                name='rating2'
                                id='rating2-25'
                                defaultValue='2.5'
                                type='radio'
                                defaultChecked=''
                              />
                              <label
                                aria-label='3 stars'
                                className='rating__label'
                                htmlFor='rating2-30'
                              >
                                <i className='rating__icon rating__icon--star ph-fill ph-star' />
                              </label>
                              <input
                                className='rating__input'
                                name='rating2'
                                id='rating2-30'
                                defaultValue={3}
                                type='radio'
                              />
                              <label
                                aria-label='3.5 stars'
                                className='rating__label rating__label--half'
                                htmlFor='rating2-35'
                              >
                                <i className='rating__icon rating__icon--star ph-fill ph-star-half' />
                              </label>
                              <input
                                className='rating__input'
                                name='rating2'
                                id='rating2-35'
                                defaultValue='3.5'
                                type='radio'
                              />
                              <label
                                aria-label='4 stars'
                                className='rating__label'
                                htmlFor='rating2-40'
                              >
                                <i className='rating__icon rating__icon--star ph-fill ph-star' />
                              </label>
                              <input
                                className='rating__input'
                                name='rating2'
                                id='rating2-40'
                                defaultValue={4}
                                type='radio'
                              />
                              <label
                                aria-label='4.5 stars'
                                className='rating__label rating__label--half'
                                htmlFor='rating2-45'
                              >
                                <i className='rating__icon rating__icon--star ph-fill ph-star-half' />
                              </label>
                              <input
                                className='rating__input'
                                name='rating2'
                                id='rating2-45'
                                defaultValue='4.5'
                                type='radio'
                              />
                              <label
                                aria-label='5 stars'
                                className='rating__label'
                                htmlFor='rating2-50'
                              >
                                <i className='rating__icon rating__icon--star ph-fill ph-star' />
                              </label>
                              <input
                                className='rating__input'
                                name='rating2'
                                id='rating2-50'
                                defaultValue={5}
                                type='radio'
                              />
                            </div>
                          </div>
                        </div>
                        <div className='mb-24'>
                          <label
                            htmlFor='desc'
                            className='text-neutral-700 text-lg fw-medium mb-12'
                          >
                            Your Question{" "}
                          </label>
                          <textarea
                            id='desc'
                            className='common-input rounded-24'
                            placeholder='Write you question...'
                            defaultValue={""}
                          />
                        </div>
                        <div className='mb-0'>
                          <button
                            type='submit'
                            className='btn btn-main rounded-pill flex-center gap-8 mt-40'
                          >
                            Submit Review
                            <i className='ph-bold ph-arrow-up-right d-flex text-lg' />
                          </button>
                        </div>
                      </form>
                    </div>
                    {/* Comment Form End */}
                  </div>
                </div>
                {/* Reviews End */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TutorDetails;
