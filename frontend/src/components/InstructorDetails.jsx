const InstructorDetails = () => {
  return (
    <section className='instructor-details py-120 position-relative z-1'>
      <div className='container'>
        <div className='row gy-4'>
          <div className='col-lg-4'>
            <div className='instructor-details__thumb'>
              <img
                src='assets/images/thumbs/instructor-details-thumb.png'
                alt=''
                className='max-h-416 max-w-416 cover-img rounded-circle'
              />
              <ul className='social-list flex-center gap-16 mt-40'>
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
            </div>
          </div>
          <div className='col-lg-8 ps-xl-5'>
            <div className='ps-lg-5'>
              <h5 className='text-main-600 mb-0'>Instructor</h5>
              <h2 className='my-16'>Robert Fox</h2>
              <span className='text-neutral-700'>Developer And Instructor</span>
              <div className='d-flex flex-column gap-16 flex-wrap max-w-340 mt-40'>
                <div className='flex-between gap-8'>
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
                    <span className='text-lg text-neutral-700 fw-semibold'>
                      4.7
                      <span className='text-neutral-100 fw-normal'>(6.4k)</span>
                    </span>
                  </div>
                </div>
              </div>
              <span className='d-block border border-neutral-30 my-40 border-dashed' />
              <h4 className='mb-24'>Bio Data</h4>
              <p className='text-neutral-500'>
                Offer brief biographies or profiles of each instructor. These
                may include details about their careers, achievements, and
                interests.
              </p>
              <span className='d-block border border-neutral-30 my-40 border-dashed' />
              <h4 className='mb-24'>Contact</h4>
              <div className='d-flex flex-column gap-24'>
                <div className='flex-align gap-12'>
                  <span className='text-2xl w-44 h-44 border border border-neutral-30 rounded-4 flex-center text-main-600 bg-main-25'>
                    <i className='ph-bold ph-phone-call' />
                  </span>
                  <a
                    href='tel:603555-0123'
                    className='text-neutral-500 hover-text-main-600'
                  >
                    (603) 555-0123, (684) 555-0102
                  </a>
                </div>
                <div className='flex-align gap-12'>
                  <span className='text-2xl w-44 h-44 border border border-neutral-30 rounded-4 flex-center text-success-600 bg-main-25'>
                    <i className='ph-bold ph-envelope-simple' />
                  </span>
                  <a
                    href='mailto:example@gmail.com'
                    className='text-neutral-500 hover-text-main-600'
                  >
                    example@gmail.com
                  </a>
                </div>
                <div className='flex-align gap-12'>
                  <span className='text-2xl w-44 h-44 border border border-neutral-30 rounded-4 flex-center text-warning-600 bg-main-25'>
                    <i className='ph-bold ph-map-pin-line' />
                  </span>
                  <span className='text-neutral-500'>
                    8502 Preston Rd. Inglewood, Maine 98380
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstructorDetails;
