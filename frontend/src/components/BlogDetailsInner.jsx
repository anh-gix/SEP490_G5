import { Link } from "react-router-dom";

const BlogDetailsInner = () => {
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
            <div className='bg-main-25 rounded-16 p-12 border border-neutral-30'>
              <div className='rounded-12 overflow-hidden position-relative'>
                <img
                  src='assets/images/thumbs/blog-details-img.png'
                  alt='Course'
                  className='rounded-12 cover-img transition-2'
                />
                <div className='position-absolute inset-inline-end-0 inset-block-end-0 me-16 mb-16 py-12 px-24 rounded-8 bg-main-two-600 text-white fw-medium'>
                  <h3 className='mb-0 text-white fw-medium'>21</h3>
                  DEC
                </div>
              </div>
              <div className='pt-32 pb-24 px-16 position-relative'>
                <div className='flex-align gap-14 flex-wrap mb-20'>
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
                <h2 className='mb-24'>
                  {" "}
                  Top 10 Tips for Online Learning Success{" "}
                </h2>
                <p className='text-neutral-500 mb-32'>
                  This blog post provides practical tips and strategies to help
                  students succeed in their online learning journey. It covers
                  aspects like time management, staying motivated, and effective
                  study techniques.
                </p>
                <h6 className='mb-16 text-neutral-500 text-lg'>Key Points:</h6>
                <ul className='list-dotted d-flex flex-column gap-8'>
                  <li>
                    {" "}
                    Create a Dedicated Study Space: Ensure your study area is
                    quiet, well-lit, and free from distractions.
                  </li>
                  <li>
                    {" "}
                    Set a Routine: Develop a consistent study schedule to stay
                    organized and on track.
                  </li>
                  <li>
                    {" "}
                    Stay Organized: Use planners or digital tools to keep track
                    of assignments and deadlines.
                  </li>
                  <li>
                    {" "}
                    Participate Actively: Engage in online discussions, forums,
                    and group projects to enhance learning.
                  </li>
                  <li>
                    {" "}
                    Take Breaks: Avoid burnout by taking regular breaks and
                    practicing self-care.
                  </li>
                  <li>
                    {" "}
                    Stay Connected: Communicate regularly with instructors and
                    classmates for support and collaboration.
                  </li>
                  <li>
                    {" "}
                    Utilize Resources: Take advantage of available resources
                    like online libraries, tutoring services, and study guides.
                  </li>
                  <li>
                    {" "}
                    Practice Time Management: Prioritize tasks and break larger
                    projects into manageable chunks.
                  </li>
                  <li>
                    {" "}
                    Stay Motivated: Set personal goals and reward yourself for
                    achieving milestones.
                  </li>
                  <li>
                    {" "}
                    Seek Feedback: Actively seek and apply feedback to improve
                    your understanding and performance.
                  </li>
                </ul>
                <span className='d-block border border-neutral-30 my-32 border-dashed' />
                <h3 className='mb-16 text-neutral-500 text-lg'>
                  Create a Dedicated Study Space
                </h3>
                <ul className='list-dotted d-flex flex-column gap-8'>
                  <li>
                    Description: Set up a specific area in your home that is
                    solely for studying. This helps create a clear boundary
                    between study time and personal time.
                  </li>
                  <li>
                    Tips: Ensure your study space is quiet, well-lit,
                    comfortable, and free from distractions. Keep all necessary
                    materials within reach to minimize interruptions.
                  </li>
                </ul>
                <span className='d-block border border-neutral-30 my-32 border-dashed' />
                <h4 className='mb-16 text-neutral-500 text-lg'>
                  Set a Routine
                </h4>
                <ul className='list-dotted d-flex flex-column gap-8'>
                  <li>
                    Description: Establishing a consistent study schedule can
                    help you stay organized and manage your time effectively.
                  </li>
                  <li>
                    Tips: Plan your day around your classes and study sessions.
                    Stick to this routine as closely as possible to build good
                    habits and ensure you cover all your subjects.
                  </li>
                </ul>
                <span className='d-block border border-neutral-30 my-32 border-dashed' />
                <h5 className='mb-16 text-neutral-500 text-lg'>
                  Stay Organized
                </h5>
                <ul className='list-dotted d-flex flex-column gap-8'>
                  <li>
                    Description: Organization is key to managing coursework,
                    deadlines, and other responsibilities.
                  </li>
                  <li>
                    {" "}
                    Tips: Use planners, calendars, or digital tools to keep
                    track of assignments, exams, and important dates. Regularly
                    review and update your schedule to stay on top of your
                    tasks.
                  </li>
                </ul>
                <span className='d-block border border-neutral-30 my-32 border-dashed' />
                <h6 className='mb-16 text-neutral-500 text-lg'>
                  Utilize Resources
                </h6>
                <ul className='list-dotted d-flex flex-column gap-8'>
                  <li>
                    Description: Take full advantage of the resources available
                    to you, such as libraries, tutoring services, and online
                    tools.
                  </li>
                  <li>
                    Tips: Access digital libraries, attend virtual tutoring
                    sessions, and use educational apps and websites. Many
                    institutions offer free resources to support online
                    learners.
                  </li>
                </ul>
                <p className='text-neutral-500 mt-24'>
                  Online learning can be a highly effective way to achieve your
                  educational goals if approached with the right strategies. By
                  creating a dedicated study space, setting a routine, staying
                  organized, and actively participating, you can make the most
                  of your online learning experience.
                </p>
              </div>
            </div>
            {/* Review Start */}
            <div className='border border-neutral-30 rounded-12 bg-main-25 p-32 mt-24'>
              <div className='flex-between gap-16 flex-wrap mb-24'>
                <h4 className='mb-0'>All Comments</h4>
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
                  "This course was fantastic! The instructor's explanations were
                  clear and concise, making it easy to understand even the more
                  complex topics."
                </p>
                <span className='d-block border border-neutral-30 my-24 border-dashed' />
                <div className='flex-align gap-24'>
                  <img
                    src='assets/images/thumbs/reviewer-img1.png'
                    alt=''
                    className='w-60 h-60 rounded-circle cover-img'
                  />
                  <div className=''>
                    <h6 className='text-xl mb-8 fw-medium'>Mary Johnson</h6>
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
                  "Great course for beginners and advanced learners alike. The
                  projects were particularly helpful in applying what I learned.
                  Highly recommend!"
                </p>
                <span className='d-block border border-neutral-30 my-24 border-dashed' />
                <div className='flex-align gap-24'>
                  <img
                    src='assets/images/thumbs/reviewer-img2.png'
                    alt=''
                    className='w-60 h-60 rounded-circle cover-img'
                  />
                  <div className=''>
                    <h6 className='text-xl mb-8 fw-medium'>Alice Brown</h6>
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
                  "Dr. Smith is an amazing instructor. Her real-world experience
                  and teaching style made this course one of the best I've ever
                  taken."
                </p>
                <span className='d-block border border-neutral-30 my-24 border-dashed' />
                <div className='flex-align gap-24'>
                  <img
                    src='assets/images/thumbs/reviewer-img3.png'
                    alt=''
                    className='w-60 h-60 rounded-circle cover-img'
                  />
                  <div className=''>
                    <h6 className='text-xl mb-8 fw-medium'>David Wilson</h6>
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
                See All Comments
                <i className='ph-bold ph-arrow-up-right d-flex text-lg' />
              </button>
            </div>
            {/* Review End */}
            {/* Review Form Start */}
            <div className='border border-neutral-30 rounded-12 bg-main-25 p-32 mt-24'>
              <form action='#' id='commentForm'>
                <h5 className='mb-0'>Write a Comment</h5>
                <span className='d-block border border-neutral-30 my-32 border-dashed' />
                <div className='mb-24'>
                  <label
                    htmlFor='name'
                    className='text-neutral-700 text-lg fw-medium mb-12'
                  >
                    Name{" "}
                  </label>
                  <input
                    type='text'
                    className='common-input rounded-pill'
                    id='name'
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
                    type='email'
                    className='common-input rounded-pill'
                    id='email'
                    placeholder='Enter Email...'
                  />
                </div>
                <div className='mb-24'>
                  <label className='text-neutral-700 text-lg fw-medium mb-12'>
                    Star Reviews{" "}
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
                    Your Question
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
                    Submit Comments
                    <i className='ph-bold ph-arrow-up-right d-flex text-lg' />
                  </button>
                </div>
              </form>
            </div>
            {/* Review Form End */}
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
              <h4 className='mb-16'>More Related Blogs</h4>
              <span className='d-block border border-neutral-30 my-24 border-dashed' />
              <div className='flex-align gap-16'>
                <Link to='/blog' className='flex-shrink-0'>
                  <img
                    src='assets/images/thumbs/blog-two-img1.png'
                    alt=''
                    className='w-80 h-80 rounded-8 object-fit-cover'
                  />
                </Link>
                <div className='flex-grow-1'>
                  <h6 className='text-xl mb-10'>
                    <Link
                      to='/blog'
                      className='hover-text-main-600 text-line-2'
                    >
                      The Role of Emotional Intelligence{" "}
                    </Link>
                  </h6>
                  <span className='text-neutral-500'>23/10/24</span>
                </div>
              </div>
              <span className='d-block border border-neutral-30 my-24 border-dashed' />
              <div className='flex-align gap-16'>
                <Link to='/blog' className='flex-shrink-0'>
                  <img
                    src='assets/images/thumbs/blog-two-img2.png'
                    alt=''
                    className='w-80 h-80 rounded-8 object-fit-cover'
                  />
                </Link>
                <div className='flex-grow-1'>
                  <h6 className='text-xl mb-10'>
                    <Link
                      to='/blog'
                      className='hover-text-main-600 text-line-2'
                    >
                      The Psychology of Learning: How Cognitive{" "}
                    </Link>
                  </h6>
                  <span className='text-neutral-500'>23/10/24</span>
                </div>
              </div>
              <span className='d-block border border-neutral-30 my-24 border-dashed' />
              <div className='flex-align gap-16'>
                <Link to='/blog' className='flex-shrink-0'>
                  <img
                    src='assets/images/thumbs/blog-two-img3.png'
                    alt=''
                    className='w-80 h-80 rounded-8 object-fit-cover'
                  />
                </Link>
                <div className='flex-grow-1'>
                  <h6 className='text-xl mb-10'>
                    <Link
                      to='/blog'
                      className='hover-text-main-600 text-line-2'
                    >
                      The Future of Remote Work: Trends{" "}
                    </Link>
                  </h6>
                  <span className='text-neutral-500'>23/10/24</span>
                </div>
              </div>
              <span className='d-block border border-neutral-30 my-24 border-dashed' />
              <div className='flex-align gap-16'>
                <Link to='/blog' className='flex-shrink-0'>
                  <img
                    src='assets/images/thumbs/blog-two-img4.png'
                    alt=''
                    className='w-80 h-80 rounded-8 object-fit-cover'
                  />
                </Link>
                <div className='flex-grow-1'>
                  <h6 className='text-xl mb-10'>
                    <Link
                      to='/blog'
                      className='hover-text-main-600 text-line-2'
                    >
                      Crafting Compelling Presentations
                    </Link>
                  </h6>
                  <span className='text-neutral-500'>23/10/24</span>
                </div>
              </div>
              <span className='d-block border border-neutral-30 my-24 border-dashed' />
              <div className='flex-align gap-16'>
                <Link to='/blog' className='flex-shrink-0'>
                  <img
                    src='assets/images/thumbs/blog-two-img5.png'
                    alt=''
                    className='w-80 h-80 rounded-8 object-fit-cover'
                  />
                </Link>
                <div className='flex-grow-1'>
                  <h6 className='text-xl mb-10'>
                    <Link
                      to='/blog'
                      className='hover-text-main-600 text-line-2'
                    >
                      Demystifying Data Science
                    </Link>
                  </h6>
                  <span className='text-neutral-500'>23/10/24</span>
                </div>
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

export default BlogDetailsInner;
