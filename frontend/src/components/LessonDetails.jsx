import { Link } from "react-router-dom";

const LessonDetails = () => {
  return (
    <section className='course-details py-120 '>
      <div className='container'>
        <div className='row gy-4'>
          <div className='col-xl-8'>
            {/* Details Content Start */}
            <div className='course-details__content border border-neutral-30 rounded-12 bg-white p-12'>
              <video
                id='player'
                className='player'
                playsInline
                controls
                poster='/assets/images/thumbs/course-details-img.png'
              >
                <source
                  src='https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4'
                  type='video/mp4'
                />
                <source
                  src='https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4'
                  type='video/webm'
                />
              </video>

              <div className='p-20'>
                <h2 className='mt-24 mb-24'>
                  Learn Python: From Beginner to Advanced
                </h2>
                <p className='text-neutral-700'>
                  Unlock the power of Python, one of the most versatile and
                  in-demand programming languages today. This comprehensive
                  course is designed for both beginners and experienced
                  programmers looking to enhance their skills. Whether you're
                  aiming to start a new career in software development, data
                  analysis, or simply want to automate everyday tasks, this
                  course will provide you with the skills and knowledge you need
                  to succeed.
                </p>
                <span className='d-block border-bottom border-main-100 my-32' />
                <h3 className='mb-16'>What You Will Learn:</h3>
                <ul className='list-dotted d-flex flex-column gap-24'>
                  <li>
                    Foundations of Python: Understand the basics of Python
                    programming, including syntax, variables, and data types.
                    Learn how to write, debug, and execute Python scripts.
                  </li>
                  <li>
                    Data Structures and Algorithms: Master Python's built-in
                    data structures such as lists, dictionaries, and sets.
                    Implement algorithms for sorting, searching, and
                    manipulating data efficiently.
                  </li>
                  <li>
                    Object-Oriented Programming (OOP): Gain proficiency in OOP
                    concepts like classes, objects, inheritance, and
                    polymorphism, which are crucial for developing complex and
                    modular programs.
                  </li>
                  <li>
                    File Handling and I/O Operations: Learn how to read from and
                    write to files, manage file directories, and handle
                    exceptions for robust file operations.
                  </li>
                  <li>
                    Libraries and Frameworks: Explore essential Python libraries
                    such as NumPy, Pandas, Matplotlib, and Seaborn for data
                    manipulation and visualization. Get an introduction to web
                    frameworks like Flask and Django.
                  </li>
                  <li>
                    Data Science and Machine Learning: Dive into data analysis
                    and visualization. Use Scikit-learn for building and
                    evaluating machine learning models.
                  </li>
                  <li>
                    Project Development: Apply your skills in real-world
                    scenarios with hands-on projects. Develop a comprehensive
                    capstone project that showcases your mastery of Python.
                  </li>
                </ul>
                <span className='d-block border-bottom border-main-100 my-32' />
                <h4 className='mb-16'>Why Choose This Course:</h4>
                <ul className='list-dotted d-flex flex-column gap-24'>
                  <li>
                    Expert Instruction: Learn from Dr. Jane Smith, an
                    experienced software developer and educator, who brings
                    real-world insights and practical knowledge to the
                    classroom.
                  </li>
                  <li>
                    Hands-On Learning: Engage in interactive exercises and
                    projects that reinforce your learning and provide practical
                    experience.
                  </li>
                  <li>
                    Flexible Learning: Study at your own pace with lifetime
                    access to all course materials, including video lectures,
                    coding exercises, and downloadable resources.
                  </li>
                  <li>
                    Comprehensive Curriculum: Cover all essential aspects of
                    Python programming, from the basics to advanced topics,
                    ensuring a well-rounded understanding of the language.
                  </li>
                  <li>
                    Supportive Community: Benefit from a supportive learning
                    environment with access to the course forum, where you can
                    ask questions, share insights, and collaborate with fellow
                    learners.
                  </li>
                </ul>
                <span className='d-block border-bottom border-main-100 my-32' />
                <h5 className='mb-16'>Ideal For:</h5>
                <ul className='list-dotted d-flex flex-column gap-24'>
                  <li>
                    Beginners with no prior programming experience looking to
                    start a career in software development or data science.
                  </li>
                  <li>
                    Intermediate programmers who want to deepen their
                    understanding of Python and explore advanced topics.
                  </li>
                  <li>
                    Professionals seeking to automate tasks, analyze data, or
                    develop web applications using Python.
                  </li>
                </ul>
                <span className='d-block border-bottom border-main-100 my-32' />
                <h6 className='mb-16'>Enroll Today:</h6>
                <ul className='list-dotted d-flex flex-column gap-24'>
                  <li>
                    Take the first step towards mastering Python. Enroll now and
                    start your journey to becoming a proficient Python
                    programmer!
                  </li>
                </ul>
                <p className='mt-24 text-neutral-700'>
                  This detailed overview should give potential students a clear
                  understanding of what they can expect from the course and the
                  benefits of enrolling. Feel free to adjust any part of it to
                  better fit your specific course offerings. Let me know if you
                  need further customization or additional details!
                </p>
              </div>
            </div>
            {/* Details Content End */}
            {/* Review Start */}
            <div className='border border-neutral-30 rounded-12 bg-white p-32 mt-24'>
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
                      <span className='text-gray-900 flex-shrink-0'>5</span>
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
                    <span className='text-gray-900 flex-shrink-0'>90%</span>
                  </div>
                  <div className='flex-align gap-20 mb-8'>
                    <div className='flex-align gap-8'>
                      <span className='text-lg fw-medium text-warning-600 d-flex'>
                        <i className='ph-fill ph-star' />
                      </span>
                      <span className='text-gray-900 flex-shrink-0'>5</span>
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
                    <span className='text-gray-900 flex-shrink-0'>75%</span>
                  </div>
                  <div className='flex-align gap-20 mb-8'>
                    <div className='flex-align gap-8'>
                      <span className='text-lg fw-medium text-warning-600 d-flex'>
                        <i className='ph-fill ph-star' />
                      </span>
                      <span className='text-gray-900 flex-shrink-0'>5</span>
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
                    <span className='text-gray-900 flex-shrink-0'>67%</span>
                  </div>
                  <div className='flex-align gap-20 mb-8'>
                    <div className='flex-align gap-8'>
                      <span className='text-lg fw-medium text-warning-600 d-flex'>
                        <i className='ph-fill ph-star' />
                      </span>
                      <span className='text-gray-900 flex-shrink-0'>5</span>
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
                    <span className='text-gray-900 flex-shrink-0'>44%</span>
                  </div>
                  <div className='flex-align gap-20'>
                    <div className='flex-align gap-8'>
                      <span className='text-lg fw-medium text-warning-600 d-flex'>
                        <i className='ph-fill ph-star' />
                      </span>
                      <span className='text-gray-900 flex-shrink-0'>5</span>
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
                    <span className='text-gray-900 flex-shrink-0'>21%</span>
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
              <div className='border border-neutral-30 rounded-12 bg-main-25 p-32'>
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
                    className='common-input rounded-pill bg-white border-neutral-30 py-16'
                    placeholder='Join the discussion...'
                  />
                </div>
              </div>
              {/* Review Item */}
              {/* Review Item */}
              <div className='border border-neutral-30 rounded-12 bg-main-25 p-32 mt-24'>
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
              <div className='border border-neutral-30 rounded-12 bg-main-25 p-32 mt-24'>
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
                See All Reviews
                <i className='ph-bold ph-arrow-up-right d-flex text-lg' />
              </button>
            </div>
            {/* Review End */}
            {/* Review Form Start */}
            <div className='border border-neutral-30 rounded-12 bg-white p-32 mt-24'>
              <form action='#' id='commentForm'>
                <h5 className='mb-0'>Write a Review</h5>
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
                    className='common-input bg-main-25 rounded-pill'
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
                    className='common-input bg-main-25 rounded-pill'
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
                    className='common-input bg-main-25 rounded-24'
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
            {/* Review Form End */}
          </div>
          <div className='col-xl-4'>
            <div className='course-details__sidebar border border-neutral-30 rounded-12 bg-white p-24'>
              <div
                className='accordion common-accordion style-three'
                id='accordionExampleTwo'
              >
                <div className='accordion-item'>
                  <h2 className='accordion-header bg-main-25'>
                    <button
                      className='accordion-button bg-main-25'
                      type='button'
                      data-bs-toggle='collapse'
                      data-bs-target='#collapseOneTwo'
                      aria-expanded='true'
                      aria-controls='collapseOneTwo'
                    >
                      Introduction to Python
                    </button>
                  </h2>
                  <div
                    id='collapseOneTwo'
                    className='accordion-collapse collapse show'
                    data-bs-parent='#accordionExampleTwo'
                  >
                    <div className='accordion-body p-0 bg-main-25'>
                      <div className='curriculam-item'>
                        <Link
                          to='#'
                          className='text-neutral-500 fw-medium hover-text-main-600 d-block'
                        >
                          <span className='flex-align gap-12'>
                            <i className='text-xl d-flex ph-bold ph-video-camera' />
                            <span className='text-line-1'>What is Python?</span>
                          </span>
                        </Link>
                        <div className='flex-between gap-8 mt-24'>
                          <Link
                            to='/lesson-details'
                            className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                            tabIndex={0}
                          >
                            View Profile
                            <i className='ph ph-arrow-right' />
                          </Link>
                          <span className='flex-align gap-12 flex-shrink-0'>
                            30:25
                            <i className='text-xl d-flex ph ph-lock-key' />
                          </span>
                        </div>
                      </div>
                      <div className='curriculam-item'>
                        <Link
                          to='#'
                          className='text-neutral-500 fw-medium hover-text-main-600 d-block'
                        >
                          <span className='flex-align gap-12'>
                            <i className='text-xl d-flex ph-bold ph-video-camera' />
                            <span className='text-line-1'>
                              Setting up your Python environment
                            </span>
                          </span>
                        </Link>
                        <div className='flex-between gap-8 mt-24'>
                          <Link
                            to='/lesson-details'
                            className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                            tabIndex={0}
                          >
                            View Profile
                            <i className='ph ph-arrow-right' />
                          </Link>
                          <span className='flex-align gap-12 flex-shrink-0'>
                            30:25
                            <i className='text-xl d-flex ph ph-lock-key' />
                          </span>
                        </div>
                      </div>
                      <div className='curriculam-item'>
                        <Link
                          to='#'
                          className='text-neutral-500 fw-medium hover-text-main-600 d-block'
                        >
                          <span className='flex-align gap-12'>
                            <i className='text-xl d-flex ph-bold ph-video-camera' />
                            <span className='text-line-1'>
                              Writing your first Python program
                            </span>
                          </span>
                        </Link>
                        <div className='flex-between gap-8 mt-24'>
                          <Link
                            to='/lesson-details'
                            className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                            tabIndex={0}
                          >
                            View Profile
                            <i className='ph ph-arrow-right' />
                          </Link>
                          <span className='flex-align gap-12 flex-shrink-0'>
                            30:25
                            <i className='text-xl d-flex ph ph-lock-key' />
                          </span>
                        </div>
                      </div>
                      <div className='curriculam-item'>
                        <Link
                          to='#'
                          className='text-neutral-500 fw-medium hover-text-main-600 d-block'
                        >
                          <span className='flex-align gap-12'>
                            <i className='text-xl d-flex ph-bold ph-video-camera' />
                            <span className='text-line-1'>
                              Understanding Python syntax and structure
                            </span>
                          </span>
                        </Link>
                        <div className='flex-between gap-8 mt-24'>
                          <Link
                            to='/lesson-details'
                            className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                            tabIndex={0}
                          >
                            View Profile
                            <i className='ph ph-arrow-right' />
                          </Link>
                          <span className='flex-align gap-12 flex-shrink-0'>
                            30:25
                            <i className='text-xl d-flex ph ph-lock-key' />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='accordion-item'>
                  <h2 className='accordion-header bg-main-25'>
                    <button
                      className='accordion-button bg-main-25 collapsed'
                      type='button'
                      data-bs-toggle='collapse'
                      data-bs-target='#collapseTwoTwo'
                      aria-expanded='false'
                      aria-controls='collapseTwoTwo'
                    >
                      Core Python Programming
                    </button>
                  </h2>
                  <div
                    id='collapseTwoTwo'
                    className='accordion-collapse collapse'
                    data-bs-parent='#accordionExampleTwo'
                  >
                    <div className='accordion-body p-0 bg-main-25'>
                      <div className='curriculam-item'>
                        <Link
                          to='#'
                          className='text-neutral-500 fw-medium hover-text-main-600 d-block'
                        >
                          <span className='flex-align gap-12'>
                            <i className='text-xl d-flex ph-bold ph-video-camera' />
                            <span className='text-line-1'>What is Python?</span>
                          </span>
                        </Link>
                        <div className='flex-between gap-8 mt-24'>
                          <Link
                            to='/lesson-details'
                            className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                            tabIndex={0}
                          >
                            View Profile
                            <i className='ph ph-arrow-right' />
                          </Link>
                          <span className='flex-align gap-12 flex-shrink-0'>
                            30:25
                            <i className='text-xl d-flex ph ph-lock-key' />
                          </span>
                        </div>
                      </div>
                      <div className='curriculam-item'>
                        <Link
                          to='#'
                          className='text-neutral-500 fw-medium hover-text-main-600 d-block'
                        >
                          <span className='flex-align gap-12'>
                            <i className='text-xl d-flex ph-bold ph-video-camera' />
                            <span className='text-line-1'>
                              Setting up your Python environment
                            </span>
                          </span>
                        </Link>
                        <div className='flex-between gap-8 mt-24'>
                          <Link
                            to='/lesson-details'
                            className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                            tabIndex={0}
                          >
                            View Profile
                            <i className='ph ph-arrow-right' />
                          </Link>
                          <span className='flex-align gap-12 flex-shrink-0'>
                            30:25
                            <i className='text-xl d-flex ph ph-lock-key' />
                          </span>
                        </div>
                      </div>
                      <div className='curriculam-item'>
                        <Link
                          to='#'
                          className='text-neutral-500 fw-medium hover-text-main-600 d-block'
                        >
                          <span className='flex-align gap-12'>
                            <i className='text-xl d-flex ph-bold ph-video-camera' />
                            <span className='text-line-1'>
                              Writing your first Python program
                            </span>
                          </span>
                        </Link>
                        <div className='flex-between gap-8 mt-24'>
                          <Link
                            to='/lesson-details'
                            className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                            tabIndex={0}
                          >
                            View Profile
                            <i className='ph ph-arrow-right' />
                          </Link>
                          <span className='flex-align gap-12 flex-shrink-0'>
                            30:25
                            <i className='text-xl d-flex ph ph-lock-key' />
                          </span>
                        </div>
                      </div>
                      <div className='curriculam-item'>
                        <Link
                          to='#'
                          className='text-neutral-500 fw-medium hover-text-main-600 d-block'
                        >
                          <span className='flex-align gap-12'>
                            <i className='text-xl d-flex ph-bold ph-video-camera' />
                            <span className='text-line-1'>
                              Understanding Python syntax and structure
                            </span>
                          </span>
                        </Link>
                        <div className='flex-between gap-8 mt-24'>
                          <Link
                            to='/lesson-details'
                            className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                            tabIndex={0}
                          >
                            View Profile
                            <i className='ph ph-arrow-right' />
                          </Link>
                          <span className='flex-align gap-12 flex-shrink-0'>
                            30:25
                            <i className='text-xl d-flex ph ph-lock-key' />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='accordion-item'>
                  <h2 className='accordion-header bg-main-25'>
                    <button
                      className='accordion-button bg-main-25 collapsed'
                      type='button'
                      data-bs-toggle='collapse'
                      data-bs-target='#collapseThreeTwo'
                      aria-expanded='false'
                      aria-controls='collapseThreeTwo'
                    >
                      Data Structures
                    </button>
                  </h2>
                  <div
                    id='collapseThreeTwo'
                    className='accordion-collapse collapse'
                    data-bs-parent='#accordionExampleTwo'
                  >
                    <div className='accordion-body p-0 bg-main-25'>
                      <div className='curriculam-item'>
                        <Link
                          to='#'
                          className='text-neutral-500 fw-medium hover-text-main-600 d-block'
                        >
                          <span className='flex-align gap-12'>
                            <i className='text-xl d-flex ph-bold ph-video-camera' />
                            <span className='text-line-1'>What is Python?</span>
                          </span>
                        </Link>
                        <div className='flex-between gap-8 mt-24'>
                          <Link
                            to='/lesson-details'
                            className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                            tabIndex={0}
                          >
                            View Profile
                            <i className='ph ph-arrow-right' />
                          </Link>
                          <span className='flex-align gap-12 flex-shrink-0'>
                            30:25
                            <i className='text-xl d-flex ph ph-lock-key' />
                          </span>
                        </div>
                      </div>
                      <div className='curriculam-item'>
                        <Link
                          to='#'
                          className='text-neutral-500 fw-medium hover-text-main-600 d-block'
                        >
                          <span className='flex-align gap-12'>
                            <i className='text-xl d-flex ph-bold ph-video-camera' />
                            <span className='text-line-1'>
                              Setting up your Python environment
                            </span>
                          </span>
                        </Link>
                        <div className='flex-between gap-8 mt-24'>
                          <Link
                            to='/lesson-details'
                            className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                            tabIndex={0}
                          >
                            View Profile
                            <i className='ph ph-arrow-right' />
                          </Link>
                          <span className='flex-align gap-12 flex-shrink-0'>
                            30:25
                            <i className='text-xl d-flex ph ph-lock-key' />
                          </span>
                        </div>
                      </div>
                      <div className='curriculam-item'>
                        <Link
                          to='#'
                          className='text-neutral-500 fw-medium hover-text-main-600 d-block'
                        >
                          <span className='flex-align gap-12'>
                            <i className='text-xl d-flex ph-bold ph-video-camera' />
                            <span className='text-line-1'>
                              Writing your first Python program
                            </span>
                          </span>
                        </Link>
                        <div className='flex-between gap-8 mt-24'>
                          <Link
                            to='/lesson-details'
                            className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                            tabIndex={0}
                          >
                            View Profile
                            <i className='ph ph-arrow-right' />
                          </Link>
                          <span className='flex-align gap-12 flex-shrink-0'>
                            30:25
                            <i className='text-xl d-flex ph ph-lock-key' />
                          </span>
                        </div>
                      </div>
                      <div className='curriculam-item'>
                        <Link
                          to='#'
                          className='text-neutral-500 fw-medium hover-text-main-600 d-block'
                        >
                          <span className='flex-align gap-12'>
                            <i className='text-xl d-flex ph-bold ph-video-camera' />
                            <span className='text-line-1'>
                              Understanding Python syntax and structure
                            </span>
                          </span>
                        </Link>
                        <div className='flex-between gap-8 mt-24'>
                          <Link
                            to='/lesson-details'
                            className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                            tabIndex={0}
                          >
                            View Profile
                            <i className='ph ph-arrow-right' />
                          </Link>
                          <span className='flex-align gap-12 flex-shrink-0'>
                            30:25
                            <i className='text-xl d-flex ph ph-lock-key' />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='accordion-item'>
                  <h2 className='accordion-header bg-main-25'>
                    <button
                      className='accordion-button bg-main-25 collapsed'
                      type='button'
                      data-bs-toggle='collapse'
                      data-bs-target='#collapseFourTwo'
                      aria-expanded='false'
                      aria-controls='collapseFourTwo'
                    >
                      Advanced Python Concepts
                    </button>
                  </h2>
                  <div
                    id='collapseFourTwo'
                    className='accordion-collapse collapse'
                    data-bs-parent='#accordionExampleTwo'
                  >
                    <div className='accordion-body p-0 bg-main-25'>
                      <div className='curriculam-item'>
                        <Link
                          to='#'
                          className='text-neutral-500 fw-medium hover-text-main-600 d-block'
                        >
                          <span className='flex-align gap-12'>
                            <i className='text-xl d-flex ph-bold ph-video-camera' />
                            <span className='text-line-1'>What is Python?</span>
                          </span>
                        </Link>
                        <div className='flex-between gap-8 mt-24'>
                          <Link
                            to='/lesson-details'
                            className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                            tabIndex={0}
                          >
                            View Profile
                            <i className='ph ph-arrow-right' />
                          </Link>
                          <span className='flex-align gap-12 flex-shrink-0'>
                            30:25
                            <i className='text-xl d-flex ph ph-lock-key' />
                          </span>
                        </div>
                      </div>
                      <div className='curriculam-item'>
                        <Link
                          to='#'
                          className='text-neutral-500 fw-medium hover-text-main-600 d-block'
                        >
                          <span className='flex-align gap-12'>
                            <i className='text-xl d-flex ph-bold ph-video-camera' />
                            <span className='text-line-1'>
                              Setting up your Python environment
                            </span>
                          </span>
                        </Link>
                        <div className='flex-between gap-8 mt-24'>
                          <Link
                            to='/lesson-details'
                            className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                            tabIndex={0}
                          >
                            View Profile
                            <i className='ph ph-arrow-right' />
                          </Link>
                          <span className='flex-align gap-12 flex-shrink-0'>
                            30:25
                            <i className='text-xl d-flex ph ph-lock-key' />
                          </span>
                        </div>
                      </div>
                      <div className='curriculam-item'>
                        <Link
                          to='#'
                          className='text-neutral-500 fw-medium hover-text-main-600 d-block'
                        >
                          <span className='flex-align gap-12'>
                            <i className='text-xl d-flex ph-bold ph-video-camera' />
                            <span className='text-line-1'>
                              Writing your first Python program
                            </span>
                          </span>
                        </Link>
                        <div className='flex-between gap-8 mt-24'>
                          <Link
                            to='/lesson-details'
                            className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                            tabIndex={0}
                          >
                            View Profile
                            <i className='ph ph-arrow-right' />
                          </Link>
                          <span className='flex-align gap-12 flex-shrink-0'>
                            30:25
                            <i className='text-xl d-flex ph ph-lock-key' />
                          </span>
                        </div>
                      </div>
                      <div className='curriculam-item'>
                        <Link
                          to='#'
                          className='text-neutral-500 fw-medium hover-text-main-600 d-block'
                        >
                          <span className='flex-align gap-12'>
                            <i className='text-xl d-flex ph-bold ph-video-camera' />
                            <span className='text-line-1'>
                              Understanding Python syntax and structure
                            </span>
                          </span>
                        </Link>
                        <div className='flex-between gap-8 mt-24'>
                          <Link
                            to='/lesson-details'
                            className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                            tabIndex={0}
                          >
                            View Profile
                            <i className='ph ph-arrow-right' />
                          </Link>
                          <span className='flex-align gap-12 flex-shrink-0'>
                            30:25
                            <i className='text-xl d-flex ph ph-lock-key' />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='accordion-item'>
                  <h2 className='accordion-header bg-main-25'>
                    <button
                      className='accordion-button bg-main-25 collapsed'
                      type='button'
                      data-bs-toggle='collapse'
                      data-bs-target='#collapseFiveTwo'
                      aria-expanded='false'
                      aria-controls='collapseFiveTwo'
                    >
                      Working with Libraries
                    </button>
                  </h2>
                  <div
                    id='collapseFiveTwo'
                    className='accordion-collapse collapse'
                    data-bs-parent='#accordionExampleTwo'
                  >
                    <div className='accordion-body p-0 bg-main-25'>
                      <div className='curriculam-item'>
                        <Link
                          to='#'
                          className='text-neutral-500 fw-medium hover-text-main-600 d-block'
                        >
                          <span className='flex-align gap-12'>
                            <i className='text-xl d-flex ph-bold ph-video-camera' />
                            <span className='text-line-1'>What is Python?</span>
                          </span>
                        </Link>
                        <div className='flex-between gap-8 mt-24'>
                          <Link
                            to='/lesson-details'
                            className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                            tabIndex={0}
                          >
                            View Profile
                            <i className='ph ph-arrow-right' />
                          </Link>
                          <span className='flex-align gap-12 flex-shrink-0'>
                            30:25
                            <i className='text-xl d-flex ph ph-lock-key' />
                          </span>
                        </div>
                      </div>
                      <div className='curriculam-item'>
                        <Link
                          to='#'
                          className='text-neutral-500 fw-medium hover-text-main-600 d-block'
                        >
                          <span className='flex-align gap-12'>
                            <i className='text-xl d-flex ph-bold ph-video-camera' />
                            <span className='text-line-1'>
                              Setting up your Python environment
                            </span>
                          </span>
                        </Link>
                        <div className='flex-between gap-8 mt-24'>
                          <Link
                            to='/lesson-details'
                            className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                            tabIndex={0}
                          >
                            View Profile
                            <i className='ph ph-arrow-right' />
                          </Link>
                          <span className='flex-align gap-12 flex-shrink-0'>
                            30:25
                            <i className='text-xl d-flex ph ph-lock-key' />
                          </span>
                        </div>
                      </div>
                      <div className='curriculam-item'>
                        <Link
                          to='#'
                          className='text-neutral-500 fw-medium hover-text-main-600 d-block'
                        >
                          <span className='flex-align gap-12'>
                            <i className='text-xl d-flex ph-bold ph-video-camera' />
                            <span className='text-line-1'>
                              Writing your first Python program
                            </span>
                          </span>
                        </Link>
                        <div className='flex-between gap-8 mt-24'>
                          <Link
                            to='/lesson-details'
                            className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                            tabIndex={0}
                          >
                            View Profile
                            <i className='ph ph-arrow-right' />
                          </Link>
                          <span className='flex-align gap-12 flex-shrink-0'>
                            30:25
                            <i className='text-xl d-flex ph ph-lock-key' />
                          </span>
                        </div>
                      </div>
                      <div className='curriculam-item'>
                        <Link
                          to='#'
                          className='text-neutral-500 fw-medium hover-text-main-600 d-block'
                        >
                          <span className='flex-align gap-12'>
                            <i className='text-xl d-flex ph-bold ph-video-camera' />
                            <span className='text-line-1'>
                              Understanding Python syntax and structure
                            </span>
                          </span>
                        </Link>
                        <div className='flex-between gap-8 mt-24'>
                          <Link
                            to='/lesson-details'
                            className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                            tabIndex={0}
                          >
                            View Profile
                            <i className='ph ph-arrow-right' />
                          </Link>
                          <span className='flex-align gap-12 flex-shrink-0'>
                            30:25
                            <i className='text-xl d-flex ph ph-lock-key' />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='accordion-item'>
                  <h2 className='accordion-header bg-main-25'>
                    <button
                      className='accordion-button bg-main-25 collapsed'
                      type='button'
                      data-bs-toggle='collapse'
                      data-bs-target='#collapseSixTwo'
                      aria-expanded='false'
                      aria-controls='collapseSixTwo'
                    >
                      Project and Capstone
                    </button>
                  </h2>
                  <div
                    id='collapseSixTwo'
                    className='accordion-collapse collapse'
                    data-bs-parent='#accordionExampleTwo'
                  >
                    <div className='accordion-body p-0 bg-main-25'>
                      <div className='curriculam-item'>
                        <Link
                          to='#'
                          className='text-neutral-500 fw-medium hover-text-main-600 d-block'
                        >
                          <span className='flex-align gap-12'>
                            <i className='text-xl d-flex ph-bold ph-video-camera' />
                            <span className='text-line-1'>What is Python?</span>
                          </span>
                        </Link>
                        <div className='flex-between gap-8 mt-24'>
                          <Link
                            to='/lesson-details'
                            className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                            tabIndex={0}
                          >
                            View Profile
                            <i className='ph ph-arrow-right' />
                          </Link>
                          <span className='flex-align gap-12 flex-shrink-0'>
                            30:25
                            <i className='text-xl d-flex ph ph-lock-key' />
                          </span>
                        </div>
                      </div>
                      <div className='curriculam-item'>
                        <Link
                          to='#'
                          className='text-neutral-500 fw-medium hover-text-main-600 d-block'
                        >
                          <span className='flex-align gap-12'>
                            <i className='text-xl d-flex ph-bold ph-video-camera' />
                            <span className='text-line-1'>
                              Setting up your Python environment
                            </span>
                          </span>
                        </Link>
                        <div className='flex-between gap-8 mt-24'>
                          <Link
                            to='/lesson-details'
                            className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                            tabIndex={0}
                          >
                            View Profile
                            <i className='ph ph-arrow-right' />
                          </Link>
                          <span className='flex-align gap-12 flex-shrink-0'>
                            30:25
                            <i className='text-xl d-flex ph ph-lock-key' />
                          </span>
                        </div>
                      </div>
                      <div className='curriculam-item'>
                        <Link
                          to='#'
                          className='text-neutral-500 fw-medium hover-text-main-600 d-block'
                        >
                          <span className='flex-align gap-12'>
                            <i className='text-xl d-flex ph-bold ph-video-camera' />
                            <span className='text-line-1'>
                              Writing your first Python program
                            </span>
                          </span>
                        </Link>
                        <div className='flex-between gap-8 mt-24'>
                          <Link
                            to='/lesson-details'
                            className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                            tabIndex={0}
                          >
                            View Profile
                            <i className='ph ph-arrow-right' />
                          </Link>
                          <span className='flex-align gap-12 flex-shrink-0'>
                            30:25
                            <i className='text-xl d-flex ph ph-lock-key' />
                          </span>
                        </div>
                      </div>
                      <div className='curriculam-item'>
                        <Link
                          to='#'
                          className='text-neutral-500 fw-medium hover-text-main-600 d-block'
                        >
                          <span className='flex-align gap-12'>
                            <i className='text-xl d-flex ph-bold ph-video-camera' />
                            <span className='text-line-1'>
                              Understanding Python syntax and structure
                            </span>
                          </span>
                        </Link>
                        <div className='flex-between gap-8 mt-24'>
                          <Link
                            to='/lesson-details'
                            className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                            tabIndex={0}
                          >
                            View Profile
                            <i className='ph ph-arrow-right' />
                          </Link>
                          <span className='flex-align gap-12 flex-shrink-0'>
                            30:25
                            <i className='text-xl d-flex ph ph-lock-key' />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LessonDetails;
