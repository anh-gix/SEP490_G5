import { useState } from "react";
import ModalVideo from "react-modal-video";
import { Link } from "react-router-dom";
const EventDetailsOne = () => {
  let [isOpen, setIsOpen] = useState(false);
  let [count, setCount] = useState(1);
  return (
    <section className='course-list-view py-120 bg-white'>
      <div className='container container--lg'>
        <img
          src='assets/images/thumbs/event-details-img.png'
          alt=''
          className='rounded-12'
        />
        <div className='container'>
          <div className='mt-60'>
            <div className='row gy-4'>
              <div className='col-lg-8'>
                <h1 className='display-4 mb-24 fw-semibold'>
                  Career Guidance Workshops for Students
                </h1>
                <p className='text-neutral-700'>
                  Navigating the path to a successful career can be challenging,
                  but our Career Guidance Workshops are here to help. Designed
                  for high school and college students, these workshops provide
                  invaluable insights into various career paths, equip students
                  with essential skills, and connect them with industry
                  professionals.
                </p>
                <span className='d-block border-bottom border-top-0 border-dashed border-main-100 my-32' />
                <h2 className='mb-16'>Introduction to Career Planning</h2>
                <ul className='list-dotted d-flex flex-column gap-8'>
                  <li>Understanding the importance of career planning</li>
                  <li>Assessing personal strengths, interests, and values</li>
                  <li>Setting short-term and long-term career goals</li>
                </ul>
                <span className='d-block border-bottom border-top-0 border-dashed border-main-100 my-32' />
                <h3 className='mb-16'>Exploring Career Options</h3>
                <ul className='list-dotted d-flex flex-column gap-8'>
                  <li>
                    Overview of different career fields (e.g., STEM, arts,
                    business, healthcare)
                  </li>
                  <li>Detailed sessions on specific professions</li>
                  <li>Guest speakers from various industries</li>
                </ul>
                <p className='mt-16 text-neutral-700'>
                  These courses are commonly offered in both in-person and
                  online formats. Online courses often include video lectures,
                  interactive coding exercises, and discussion forums.
                </p>
                <div className='my-32'>
                  <div className='row gy-4'>
                    <div className='col-6'>
                      <img
                        src='assets/images/thumbs/event-detail-img1.png'
                        alt=''
                        className='rounded-16'
                      />
                    </div>
                    <div className='col-6'>
                      <img
                        src='assets/images/thumbs/event-detail-img2.png'
                        alt=''
                        className='rounded-16'
                      />
                    </div>
                  </div>
                </div>
                <h4 className='mb-16'>Skills Development</h4>
                <ul className='list-dotted d-flex flex-column gap-8'>
                  <li>Resume writing and cover letter preparation</li>
                  <li>Interview techniques and practice sessions</li>
                  <li>Networking skills and using LinkedIn effectively</li>
                </ul>
                <p className='mt-16 text-neutral-700'>
                  Most Web Development Fundamentals courses do not have strict
                  prerequisites. They are often open to beginners, but having
                  some basic computer literacy and familiarity with web browsing
                  is beneficial
                </p>
                <span className='d-block border-bottom border-top-0 border-dashed border-main-100 my-32' />
                <h5 className='mb-16'>Educational Pathways</h5>
                <ul className='list-dotted d-flex flex-column gap-8'>
                  <li>Choosing the right college or university</li>
                  <li>
                    Understanding different degree programs and certifications
                  </li>
                  <li>
                    Exploring scholarships, internships, and apprenticeship
                    opportunities
                  </li>
                </ul>
                <p className='mt-16 text-neutral-700'>
                  Web Development Fundamentals courses can vary in length,
                  ranging from a few weeks to a few months. It depends on the
                  depth of content covered and the pace of the course.
                </p>
                <div className='position-relative my-32'>
                  <img
                    src='assets/images/thumbs/event-detail-img3.png'
                    className='rounded-12 cover-img'
                    alt=''
                  />
                  <span
                    onClick={() => setIsOpen(true)}
                    className='play-button position-absolute start-50 top-50 translate-middle z-1 w-72 h-72 flex-center bg-main-two-600 text-white rounded-circle text-2xl'
                  >
                    <i className='ph-fill ph-play' />
                  </span>
                </div>
                <h6 className='mb-16'>Benefits</h6>
                <ul className='list-dotted d-flex flex-column gap-8'>
                  <li>
                    Personalized Guidance: Tailored advice based on individual
                    interests and strengths
                  </li>
                  <li>
                    Industry Connections: Direct interaction with professionals
                    and potential mentors
                  </li>
                  <li>
                    Skill Enhancement: Development of critical career skills
                    such as resume writing and interviewing
                  </li>
                  <li>
                    Informed Decisions: Better understanding of various career
                    paths and educational requirements
                  </li>
                  <li>
                    Confidence Building: Increased confidence in career planning
                    and decision-making
                  </li>
                </ul>
                <p className='mt-16 text-neutral-700'>
                  Students can register for the workshops through the EduAll
                  platform. Limited seats are available, so early registration
                  is recommended.
                </p>
              </div>
              <div className='col-lg-4'>
                <div className='bg-white box-shadow-md rounded-12 p-12 d-flex flex-column gap-12 border border-neutral-30 mt--200px'>
                  <div className='rounded-12 overflow-hidden'>
                    <div className='position-relative'>
                      <img
                        src='assets/images/thumbs/event-detail-img4.png'
                        className='rounded-12 cover-img'
                        alt=''
                      />
                      <span
                        onClick={() => setIsOpen(true)}
                        className='play-button position-absolute start-50 top-50 translate-middle z-1 w-72 h-72 flex-center bg-main-600 text-white rounded-circle text-2xl'
                      >
                        <i className='ph-fill ph-play' />
                      </span>
                      <h3 className='text-white bg-main-two-600 mb-0 px-32 py-16 rounded-top-start-8px position-absolute inset-inline-end-0 inset-block-end-0 fw-medium'>
                        $199
                      </h3>
                    </div>
                  </div>
                  <div className='rounded-12 bg-main-25 p-24 '>
                    <div className=' flex-between flex-wrap gap-16 border-bottom border-dashed border-top-0 border-end-0 border-start-0 border-neutral-40 pb-16 mb-16'>
                      <div className='flex-align gap-12'>
                        <span className='text-neutral-700 text-2xl d-flex'>
                          <i className='ph-bold ph-calendar-dot' />
                        </span>
                        <span className='text-neutral-700 text-lg fw-normal'>
                          Start Date
                        </span>
                      </div>
                      <span className='text-lg fw-medium text-neutral-700'>
                        12/05/24
                      </span>
                    </div>
                    <div className=' flex-between flex-wrap gap-16 border-bottom border-dashed border-top-0 border-end-0 border-start-0 border-neutral-40 pb-16 mb-16'>
                      <div className='flex-align gap-12'>
                        <span className='text-neutral-700 text-2xl d-flex'>
                          {" "}
                          <i className='ph-bold ph-clock' />
                        </span>
                        <span className='text-neutral-700 text-lg fw-normal'>
                          Start Time
                        </span>
                      </div>
                      <span className='text-lg fw-medium text-neutral-700'>
                        05:00 PM
                      </span>
                    </div>
                    <div className=' flex-between flex-wrap gap-16 border-bottom border-dashed border-top-0 border-end-0 border-start-0 border-neutral-40 pb-16 mb-16'>
                      <div className='flex-align gap-12'>
                        <span className='text-neutral-700 text-2xl d-flex'>
                          <i className='ph-bold ph-calendar-dot' />
                        </span>
                        <span className='text-neutral-700 text-lg fw-normal'>
                          End Time
                        </span>
                      </div>
                      <span className='text-lg fw-medium text-neutral-700'>
                        08:00 PM
                      </span>
                    </div>
                    <div className=' flex-between flex-wrap gap-16 border-bottom border-dashed border-top-0 border-end-0 border-start-0 border-neutral-40 pb-16 mb-16'>
                      <div className='flex-align gap-12'>
                        <span className='text-neutral-700 text-2xl d-flex'>
                          {" "}
                          <i className='ph-bold ph-clock' />
                        </span>
                        <span className='text-neutral-700 text-lg fw-normal'>
                          End Date
                        </span>
                      </div>
                      <span className='text-lg fw-medium text-neutral-700'>
                        20/05/24
                      </span>
                    </div>
                    <div className=' flex-between flex-wrap gap-16 border-bottom border-dashed border-top-0 border-end-0 border-start-0 border-neutral-40 pb-16 mb-16'>
                      <div className='flex-align gap-12'>
                        <span className='text-neutral-700 text-2xl d-flex'>
                          <i className='ph-bold ph-users-three' />
                        </span>
                        <span className='text-neutral-700 text-lg fw-normal'>
                          Ongoing
                        </span>
                      </div>
                      <span className='text-lg fw-medium text-neutral-700'>
                        5.5k
                      </span>
                    </div>
                    <div className=' flex-between flex-wrap gap-16'>
                      <div className='flex-align gap-12'>
                        <span className='text-neutral-700 text-2xl d-flex'>
                          {" "}
                          <i className='ph-bold ph-map-pin-line' />{" "}
                        </span>
                        <span className='text-neutral-700 text-lg fw-normal'>
                          Location
                        </span>
                      </div>
                      <span className='text-lg fw-medium text-neutral-700'>
                        Coppell, Virginia
                      </span>
                    </div>
                  </div>
                  <div className='rounded-12 bg-main-25 p-24 '>
                    <div className=' flex-between flex-wrap gap-16 border-bottom border-dashed border-top-0 border-end-0 border-start-0 border-neutral-40 pb-16 mb-16'>
                      <h2 className='mb-0'>$199</h2>
                      <div className='border border-neutral-30 rounded-pill p-4 bg-white max-w-176 w-100 d-flex justify-content-between'>
                        <button
                          onClick={() => setCount(count - 1)}
                          disabled={count === 1}
                          type='button'
                          className='quantity__minus item-active-effect transition-1 flex-shrink-0 text-main-600 text-xl hover-text-white w-44 h-44 rounded-circle bg-main-50 hover-bg-main-600 hover-border-main-600 hover-text-white flex-center'
                        >
                          <i className='ph-bold ph-minus' />
                        </button>
                        <input
                          type='text'
                          className='quantity__input flex-grow-1 common-input border-0 text-center text-32 fw-semibold text-neutral-700 p-0'
                          value={count}
                          onChange={(e) => setCount(e.target.value)}
                        />
                        <button
                          onClick={() => setCount(count + 1)}
                          type='button'
                          className='quantity__plus item-active-effect transition-1 flex-shrink-0 text-main-600 text-xl hover-text-white w-44 h-44 rounded-circle bg-main-50 hover-bg-main-600 hover-border-main-600 hover-text-white flex-center'
                        >
                          <i className='ph-bold ph-plus' />
                        </button>
                      </div>
                    </div>
                    <div className=' flex-between flex-wrap gap-16 border-bottom border-dashed border-top-0 border-end-0 border-start-0 border-neutral-40 pb-16 mb-16'>
                      <div className='flex-align gap-12'>
                        <span className='text-neutral-700 text-2xl d-flex'>
                          <i className='ph-bold ph-file-text' />
                        </span>
                        <span className='text-neutral-700 text-lg fw-normal'>
                          Total Quantity
                        </span>
                      </div>
                      <span className='text-lg fw-medium text-neutral-700'>
                        01
                      </span>
                    </div>
                    <div className=' flex-between flex-wrap gap-16'>
                      <div className='flex-align gap-12'>
                        <span className='text-neutral-700 text-2xl d-flex'>
                          {" "}
                          <i className='ph-bold ph-tag' />
                        </span>
                        <span className='text-neutral-700 text-lg fw-normal'>
                          Total Price
                        </span>
                      </div>
                      <span className='text-lg fw-medium text-neutral-700'>
                        $199
                      </span>
                    </div>
                  </div>
                  <span className='d-block border-bottom border-top-0 border-dashed border-main-100 my-32' />
                  <Link
                    to='/contact'
                    className='btn btn-main rounded-pill flex-center gap-8'
                  >
                    Join Now
                    <i className='ph-bold ph-arrow-up-right d-flex text-lg' />
                  </Link>
                  <ul className='social-list flex-center gap-8 mt-24'>
                    <li className='social-list__item'>
                      <a
                        href='https://www.facebook.com'
                        className='text-main-600 text-xl hover-text-white w-44 h-44 rounded-circle bg-main-50 hover-bg-main-600 hover-border-main-600 hover-text-white flex-center'
                      >
                        <i className='ph-bold ph-facebook-logo' />
                      </a>
                    </li>
                    <li className='social-list__item'>
                      <a
                        href='https://www.twitter.com'
                        className='text-main-600 text-xl hover-text-white w-44 h-44 rounded-circle bg-main-50 hover-bg-main-600 hover-border-main-600 hover-text-white flex-center'
                      >
                        <i className='ph-bold ph-twitter-logo' />
                      </a>
                    </li>
                    <li className='social-list__item'>
                      <a
                        href='https://www.linkedin.com'
                        className='text-main-600 text-xl hover-text-white w-44 h-44 rounded-circle bg-main-50 hover-bg-main-600 hover-border-main-600 hover-text-white flex-center'
                      >
                        <i className='ph-bold ph-instagram-logo' />
                      </a>
                    </li>
                    <li className='social-list__item'>
                      <a
                        href='https://www.pinterest.com'
                        className='text-main-600 text-xl hover-text-white w-44 h-44 rounded-circle bg-main-50 hover-bg-main-600 hover-border-main-600 hover-text-white flex-center'
                      >
                        <i className='ph-bold ph-pinterest-logo' />
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ModalVideo
        channel='youtube'
        autoplay
        isOpen={isOpen}
        videoId='XxVg_s8xAms'
        onClose={() => setIsOpen(false)}
        allowFullScreen
      />
    </section>
  );
};

export default EventDetailsOne;
