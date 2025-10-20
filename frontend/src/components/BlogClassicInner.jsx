import { Link } from "react-router-dom";

const BlogClassicInner = () => {
  return (
    <div className='blog-page-section py-120'>
      <div className='container'>
        <div className='flex-between gap-16 flex-wrap mb-40'>
          <span className='text-neutral-500'>Showing 9 of 600 Results </span>
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
          <div className='col-lg-8'>
            <div className='d-flex flex-column gap-24'>
              <div className='scale-hover-item bg-main-25 rounded-16 p-12 h-100 border border-neutral-30'>
                <div className='course-item__thumb max-h-unset rounded-12 overflow-hidden position-relative'>
                  <Link to='/blog-details' className='w-100 h-100'>
                    <img
                      src='assets/images/thumbs/blog-two-img1.png'
                      alt='Course'
                      className='scale-hover-item__img rounded-12 cover-img transition-2'
                    />
                  </Link>
                  <div className='position-absolute inset-inline-end-0 inset-block-end-0 me-16 mb-16 py-12 px-24 rounded-8 bg-main-two-600 text-white fw-medium'>
                    <h3 className='mb-0 text-white fw-medium'>21</h3>
                    DEC
                  </div>
                </div>
                <div className='pt-32 pb-24 px-16 position-relative'>
                  <h4 className='mb-28'>
                    <Link to='/blog-details' className='link text-line-2'>
                      Navigating the Job Market: Advice for Graduates
                    </Link>
                  </h4>
                  <div className='flex-align gap-14 flex-wrap my-20'>
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-500 text-2xl d-flex'>
                        <i className='ph ph-user-circle' />
                      </span>
                      <span className='text-neutral-500 text-lg'>By Admin</span>
                    </div>
                    <span className='w-8 h-8 bg-neutral-100 rounded-circle' />
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-500 text-2xl d-flex'>
                        <i className='ph-bold ph-eye' />
                      </span>
                      <span className='text-neutral-500 text-lg'>1.6k</span>
                    </div>
                    <span className='w-8 h-8 bg-neutral-100 rounded-circle' />
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-500 text-2xl d-flex'>
                        <i className='ph ph-chat-dots' />
                      </span>
                      <span className='text-neutral-500 text-lg'>24</span>
                    </div>
                  </div>
                  <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                    <Link
                      to='/blog-details'
                      className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                      tabIndex={0}
                    >
                      Read More
                      <i className='ph ph-arrow-right' />
                    </Link>
                  </div>
                </div>
              </div>
              <div className='scale-hover-item bg-main-25 rounded-16 p-12 h-100 border border-neutral-30'>
                <div className='course-item__thumb max-h-unset rounded-12 overflow-hidden position-relative'>
                  <Link to='/blog-details' className='w-100 h-100'>
                    <img
                      src='assets/images/thumbs/blog-two-img2.png'
                      alt='Course'
                      className='scale-hover-item__img rounded-12 cover-img transition-2'
                    />
                  </Link>
                  <div className='position-absolute inset-inline-end-0 inset-block-end-0 me-16 mb-16 py-12 px-24 rounded-8 bg-main-two-600 text-white fw-medium'>
                    <h3 className='mb-0 text-white fw-medium'>21</h3>
                    DEC
                  </div>
                </div>
                <div className='pt-32 pb-24 px-16 position-relative'>
                  <h4 className='mb-28'>
                    <Link to='/blog-details' className='link text-line-2'>
                      The Importance of Diversity in Higher Education
                    </Link>
                  </h4>
                  <div className='flex-align gap-14 flex-wrap my-20'>
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-500 text-2xl d-flex'>
                        <i className='ph ph-user-circle' />
                      </span>
                      <span className='text-neutral-500 text-lg'>By Admin</span>
                    </div>
                    <span className='w-8 h-8 bg-neutral-100 rounded-circle' />
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-500 text-2xl d-flex'>
                        <i className='ph-bold ph-eye' />
                      </span>
                      <span className='text-neutral-500 text-lg'>1.6k</span>
                    </div>
                    <span className='w-8 h-8 bg-neutral-100 rounded-circle' />
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-500 text-2xl d-flex'>
                        <i className='ph ph-chat-dots' />
                      </span>
                      <span className='text-neutral-500 text-lg'>24</span>
                    </div>
                  </div>
                  <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                    <Link
                      to='/blog-details'
                      className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                      tabIndex={0}
                    >
                      Read More
                      <i className='ph ph-arrow-right' />
                    </Link>
                  </div>
                </div>
              </div>
              <div className='scale-hover-item bg-main-25 rounded-16 p-12 h-100 border border-neutral-30'>
                <div className='course-item__thumb max-h-unset rounded-12 overflow-hidden position-relative'>
                  <Link to='/blog-details' className='w-100 h-100'>
                    <img
                      src='assets/images/thumbs/blog-two-img3.png'
                      alt='Course'
                      className='scale-hover-item__img rounded-12 cover-img transition-2'
                    />
                  </Link>
                  <div className='position-absolute inset-inline-end-0 inset-block-end-0 me-16 mb-16 py-12 px-24 rounded-8 bg-main-two-600 text-white fw-medium'>
                    <h3 className='mb-0 text-white fw-medium'>21</h3>
                    DEC
                  </div>
                </div>
                <div className='pt-32 pb-24 px-16 position-relative'>
                  <h4 className='mb-28'>
                    <Link to='/blog-details' className='link text-line-2'>
                      10 Tips for Successful Online Learning
                    </Link>
                  </h4>
                  <div className='flex-align gap-14 flex-wrap my-20'>
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-500 text-2xl d-flex'>
                        <i className='ph ph-user-circle' />
                      </span>
                      <span className='text-neutral-500 text-lg'>By Admin</span>
                    </div>
                    <span className='w-8 h-8 bg-neutral-100 rounded-circle' />
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-500 text-2xl d-flex'>
                        <i className='ph-bold ph-eye' />
                      </span>
                      <span className='text-neutral-500 text-lg'>1.6k</span>
                    </div>
                    <span className='w-8 h-8 bg-neutral-100 rounded-circle' />
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-500 text-2xl d-flex'>
                        <i className='ph ph-chat-dots' />
                      </span>
                      <span className='text-neutral-500 text-lg'>24</span>
                    </div>
                  </div>
                  <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                    <Link
                      to='/blog-details'
                      className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                      tabIndex={0}
                    >
                      Read More
                      <i className='ph ph-arrow-right' />
                    </Link>
                  </div>
                </div>
              </div>
              <div className='scale-hover-item bg-main-25 rounded-16 p-12 h-100 border border-neutral-30'>
                <div className='course-item__thumb max-h-unset rounded-12 overflow-hidden position-relative'>
                  <Link to='/blog-details' className='w-100 h-100'>
                    <img
                      src='assets/images/thumbs/blog-two-img4.png'
                      alt='Course'
                      className='scale-hover-item__img rounded-12 cover-img transition-2'
                    />
                  </Link>
                  <div className='position-absolute inset-inline-end-0 inset-block-end-0 me-16 mb-16 py-12 px-24 rounded-8 bg-main-two-600 text-white fw-medium'>
                    <h3 className='mb-0 text-white fw-medium'>21</h3>
                    DEC
                  </div>
                </div>
                <div className='pt-32 pb-24 px-16 position-relative'>
                  <h4 className='mb-28'>
                    <Link to='/blog-details' className='link text-line-2'>
                      How to Stay Motivated While Studying from Home
                    </Link>
                  </h4>
                  <div className='flex-align gap-14 flex-wrap my-20'>
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-500 text-2xl d-flex'>
                        <i className='ph ph-user-circle' />
                      </span>
                      <span className='text-neutral-500 text-lg'>By Admin</span>
                    </div>
                    <span className='w-8 h-8 bg-neutral-100 rounded-circle' />
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-500 text-2xl d-flex'>
                        <i className='ph-bold ph-eye' />
                      </span>
                      <span className='text-neutral-500 text-lg'>1.6k</span>
                    </div>
                    <span className='w-8 h-8 bg-neutral-100 rounded-circle' />
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-500 text-2xl d-flex'>
                        <i className='ph ph-chat-dots' />
                      </span>
                      <span className='text-neutral-500 text-lg'>24</span>
                    </div>
                  </div>
                  <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                    <Link
                      to='/blog-details'
                      className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                      tabIndex={0}
                    >
                      Read More
                      <i className='ph ph-arrow-right' />
                    </Link>
                  </div>
                </div>
              </div>
              <div className='scale-hover-item bg-main-25 rounded-16 p-12 h-100 border border-neutral-30'>
                <div className='course-item__thumb max-h-unset rounded-12 overflow-hidden position-relative'>
                  <Link to='/blog-details' className='w-100 h-100'>
                    <img
                      src='assets/images/thumbs/blog-two-img5.png'
                      alt='Course'
                      className='scale-hover-item__img rounded-12 cover-img transition-2'
                    />
                  </Link>
                  <div className='position-absolute inset-inline-end-0 inset-block-end-0 me-16 mb-16 py-12 px-24 rounded-8 bg-main-two-600 text-white fw-medium'>
                    <h3 className='mb-0 text-white fw-medium'>21</h3>
                    DEC
                  </div>
                </div>
                <div className='pt-32 pb-24 px-16 position-relative'>
                  <h4 className='mb-28'>
                    <Link to='/blog-details' className='link text-line-2'>
                      Mastering Python: Beginner to Advanced Tips
                    </Link>
                  </h4>
                  <div className='flex-align gap-14 flex-wrap my-20'>
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-500 text-2xl d-flex'>
                        <i className='ph ph-user-circle' />
                      </span>
                      <span className='text-neutral-500 text-lg'>By Admin</span>
                    </div>
                    <span className='w-8 h-8 bg-neutral-100 rounded-circle' />
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-500 text-2xl d-flex'>
                        <i className='ph-bold ph-eye' />
                      </span>
                      <span className='text-neutral-500 text-lg'>1.6k</span>
                    </div>
                    <span className='w-8 h-8 bg-neutral-100 rounded-circle' />
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-500 text-2xl d-flex'>
                        <i className='ph ph-chat-dots' />
                      </span>
                      <span className='text-neutral-500 text-lg'>24</span>
                    </div>
                  </div>
                  <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                    <Link
                      to='/blog-details'
                      className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                      tabIndex={0}
                    >
                      Read More
                      <i className='ph ph-arrow-right' />
                    </Link>
                  </div>
                </div>
              </div>
              <div className='scale-hover-item bg-main-25 rounded-16 p-12 h-100 border border-neutral-30'>
                <div className='course-item__thumb max-h-unset rounded-12 overflow-hidden position-relative'>
                  <Link to='/blog-details' className='w-100 h-100'>
                    <img
                      src='assets/images/thumbs/blog-two-img6.png'
                      alt='Course'
                      className='scale-hover-item__img rounded-12 cover-img transition-2'
                    />
                  </Link>
                  <div className='position-absolute inset-inline-end-0 inset-block-end-0 me-16 mb-16 py-12 px-24 rounded-8 bg-main-two-600 text-white fw-medium'>
                    <h3 className='mb-0 text-white fw-medium'>21</h3>
                    DEC
                  </div>
                </div>
                <div className='pt-32 pb-24 px-16 position-relative'>
                  <h4 className='mb-28'>
                    <Link to='/blog-details' className='link text-line-2'>
                      Balancing Work and Study: Strategies for Success
                    </Link>
                  </h4>
                  <div className='flex-align gap-14 flex-wrap my-20'>
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-500 text-2xl d-flex'>
                        <i className='ph ph-user-circle' />
                      </span>
                      <span className='text-neutral-500 text-lg'>By Admin</span>
                    </div>
                    <span className='w-8 h-8 bg-neutral-100 rounded-circle' />
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-500 text-2xl d-flex'>
                        <i className='ph-bold ph-eye' />
                      </span>
                      <span className='text-neutral-500 text-lg'>1.6k</span>
                    </div>
                    <span className='w-8 h-8 bg-neutral-100 rounded-circle' />
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-500 text-2xl d-flex'>
                        <i className='ph ph-chat-dots' />
                      </span>
                      <span className='text-neutral-500 text-lg'>24</span>
                    </div>
                  </div>
                  <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                    <Link
                      to='/blog-details'
                      className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                      tabIndex={0}
                    >
                      Read More
                      <i className='ph ph-arrow-right' />
                    </Link>
                  </div>
                </div>
              </div>
              <div className='scale-hover-item bg-main-25 rounded-16 p-12 h-100 border border-neutral-30'>
                <div className='course-item__thumb max-h-unset rounded-12 overflow-hidden position-relative'>
                  <Link to='/blog-details' className='w-100 h-100'>
                    <img
                      src='assets/images/thumbs/blog-two-img7.png'
                      alt='Course'
                      className='scale-hover-item__img rounded-12 cover-img transition-2'
                    />
                  </Link>
                  <div className='position-absolute inset-inline-end-0 inset-block-end-0 me-16 mb-16 py-12 px-24 rounded-8 bg-main-two-600 text-white fw-medium'>
                    <h3 className='mb-0 text-white fw-medium'>21</h3>
                    DEC
                  </div>
                </div>
                <div className='pt-32 pb-24 px-16 position-relative'>
                  <h4 className='mb-28'>
                    <Link to='/blog-details' className='link text-line-2'>
                      The Importance of Lifelong Learning in Today's World
                    </Link>
                  </h4>
                  <div className='flex-align gap-14 flex-wrap my-20'>
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-500 text-2xl d-flex'>
                        <i className='ph ph-user-circle' />
                      </span>
                      <span className='text-neutral-500 text-lg'>By Admin</span>
                    </div>
                    <span className='w-8 h-8 bg-neutral-100 rounded-circle' />
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-500 text-2xl d-flex'>
                        <i className='ph-bold ph-eye' />
                      </span>
                      <span className='text-neutral-500 text-lg'>1.6k</span>
                    </div>
                    <span className='w-8 h-8 bg-neutral-100 rounded-circle' />
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-500 text-2xl d-flex'>
                        <i className='ph ph-chat-dots' />
                      </span>
                      <span className='text-neutral-500 text-lg'>24</span>
                    </div>
                  </div>
                  <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                    <Link
                      to='/blog-details'
                      className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                      tabIndex={0}
                    >
                      Read More
                      <i className='ph ph-arrow-right' />
                    </Link>
                  </div>
                </div>
              </div>
              <div className='scale-hover-item bg-main-25 rounded-16 p-12 h-100 border border-neutral-30'>
                <div className='course-item__thumb max-h-unset rounded-12 overflow-hidden position-relative'>
                  <Link to='/blog-details' className='w-100 h-100'>
                    <img
                      src='assets/images/thumbs/blog-two-img8.png'
                      alt='Course'
                      className='scale-hover-item__img rounded-12 cover-img transition-2'
                    />
                  </Link>
                  <div className='position-absolute inset-inline-end-0 inset-block-end-0 me-16 mb-16 py-12 px-24 rounded-8 bg-main-two-600 text-white fw-medium'>
                    <h3 className='mb-0 text-white fw-medium'>21</h3>
                    DEC
                  </div>
                </div>
                <div className='pt-32 pb-24 px-16 position-relative'>
                  <h4 className='mb-28'>
                    <Link to='/blog-details' className='link text-line-2'>
                      Effective Time Management for Students
                    </Link>
                  </h4>
                  <div className='flex-align gap-14 flex-wrap my-20'>
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-500 text-2xl d-flex'>
                        <i className='ph ph-user-circle' />
                      </span>
                      <span className='text-neutral-500 text-lg'>By Admin</span>
                    </div>
                    <span className='w-8 h-8 bg-neutral-100 rounded-circle' />
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-500 text-2xl d-flex'>
                        <i className='ph-bold ph-eye' />
                      </span>
                      <span className='text-neutral-500 text-lg'>1.6k</span>
                    </div>
                    <span className='w-8 h-8 bg-neutral-100 rounded-circle' />
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-500 text-2xl d-flex'>
                        <i className='ph ph-chat-dots' />
                      </span>
                      <span className='text-neutral-500 text-lg'>24</span>
                    </div>
                  </div>
                  <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                    <Link
                      to='/blog-details'
                      className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                      tabIndex={0}
                    >
                      Read More
                      <i className='ph ph-arrow-right' />
                    </Link>
                  </div>
                </div>
              </div>
              <div className='scale-hover-item bg-main-25 rounded-16 p-12 h-100 border border-neutral-30'>
                <div className='course-item__thumb max-h-unset rounded-12 overflow-hidden position-relative'>
                  <Link to='/blog-details' className='w-100 h-100'>
                    <img
                      src='assets/images/thumbs/blog-two-img9.png'
                      alt='Course'
                      className='scale-hover-item__img rounded-12 cover-img transition-2'
                    />
                  </Link>
                  <div className='position-absolute inset-inline-end-0 inset-block-end-0 me-16 mb-16 py-12 px-24 rounded-8 bg-main-two-600 text-white fw-medium'>
                    <h3 className='mb-0 text-white fw-medium'>21</h3>
                    DEC
                  </div>
                </div>
                <div className='pt-32 pb-24 px-16 position-relative'>
                  <h4 className='mb-28'>
                    <Link to='/blog-details' className='link text-line-2'>
                      The Benefits of Learning a New Language Online
                    </Link>
                  </h4>
                  <div className='flex-align gap-14 flex-wrap my-20'>
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-500 text-2xl d-flex'>
                        <i className='ph ph-user-circle' />
                      </span>
                      <span className='text-neutral-500 text-lg'>By Admin</span>
                    </div>
                    <span className='w-8 h-8 bg-neutral-100 rounded-circle' />
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-500 text-2xl d-flex'>
                        <i className='ph-bold ph-eye' />
                      </span>
                      <span className='text-neutral-500 text-lg'>1.6k</span>
                    </div>
                    <span className='w-8 h-8 bg-neutral-100 rounded-circle' />
                    <div className='flex-align gap-8'>
                      <span className='text-neutral-500 text-2xl d-flex'>
                        <i className='ph ph-chat-dots' />
                      </span>
                      <span className='text-neutral-500 text-lg'>24</span>
                    </div>
                  </div>
                  <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                    <Link
                      to='/blog-details'
                      className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                      tabIndex={0}
                    >
                      Read More
                      <i className='ph ph-arrow-right' />
                    </Link>
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
          <div className='col-lg-4'>
            <div className='border border-neutral-30 rounded-12 bg-main-25 p-32 bg-main-25'>
              <h4 className='mb-16'>Search</h4>
              <span className='d-block border border-neutral-30 my-24 border-dashed' />
              <form action='#' className='position-relative'>
                <input
                  type='text'
                  className='common-input rounded-pill py-18 pe-64'
                  placeholder='Search...'
                />
                <button
                  type='submit'
                  className='flex-center w-44 h-44 rounded-circle bg-main-600 hover-bg-main-700 text-white text-2xl position-absolute inset-inline-end-0 top-50 translate-middle-y me-8'
                >
                  <i className='ph ph-magnifying-glass' />
                </button>
              </form>
            </div>
            <div className='border border-neutral-30 rounded-12 bg-main-25 p-32 bg-main-25 mt-24'>
              <h4 className='mb-16'>Popular Tag</h4>
              <span className='d-block border border-neutral-30 my-24 border-dashed' />
              <div className='flex-align flex-wrap gap-8'>
                <Link
                  to='/blog'
                  className='border border-neutral-30 px-20 py-12 rounded-pill text-sm bg-white text-neutral-500 hover-border-main-600 hover-text-main-600'
                >
                  Machine Learning
                </Link>
                <Link
                  to='/blog'
                  className='border border-neutral-30 px-20 py-12 rounded-pill text-sm bg-white text-neutral-500 hover-border-main-600 hover-text-main-600'
                >
                  Web Development
                </Link>
                <Link
                  to='/blog'
                  className='border border-neutral-30 px-20 py-12 rounded-pill text-sm bg-white text-neutral-500 hover-border-main-600 hover-text-main-600'
                >
                  Python
                </Link>
                <Link
                  to='/blog'
                  className='border border-neutral-30 px-20 py-12 rounded-pill text-sm bg-white text-neutral-500 hover-border-main-600 hover-text-main-600'
                >
                  Laravel
                </Link>
                <Link
                  to='/blog'
                  className='border border-neutral-30 px-20 py-12 rounded-pill text-sm bg-white text-neutral-500 hover-border-main-600 hover-text-main-600'
                >
                  Wordpress
                </Link>
                <Link
                  to='/blog'
                  className='border border-neutral-30 px-20 py-12 rounded-pill text-sm bg-white text-neutral-500 hover-border-main-600 hover-text-main-600'
                >
                  UI/UX Design
                </Link>
                <Link
                  to='/blog'
                  className='border border-neutral-30 px-20 py-12 rounded-pill text-sm bg-white text-neutral-500 hover-border-main-600 hover-text-main-600'
                >
                  AI
                </Link>
              </div>
              <span className='d-block border border-neutral-30 my-24 border-dashed' />
              <Link
                to='/blog'
                className='h6 mb-0 text-main-600 fw-semibold hover-text-decoration-underline'
              >
                See All
                <i className='ph-bold ph-arrow-right' />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogClassicInner;
