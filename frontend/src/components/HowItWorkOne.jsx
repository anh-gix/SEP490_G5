import { Link } from "react-router-dom";

const HowItWorkOne = () => {
  return (
    <section className='how-it-work py-120 position-relative z-1 overflow-hidden'>
      <img
        src='assets/images/shapes/shape2.png'
        alt=''
        className='shape two animation-scalation'
      />
      <img
        src='assets/images/shapes/shape6.png'
        alt=''
        className='shape four animation-scalation'
      />
      <div className='container'>
        <div className='row gy-4 align-items-center flex-wrap-reverse'>
          <div className='col-lg-6'>
            <div className='row gy-4 how-it-work-wrapper'>
              <div
                className='col-sm-6'
                data-aos='fade-up'
                data-aos-duration={400}
              >
                <div className='p-40 rounded-12 animation-item item-hover hover-bg-main-600 transition-2 bg-main-25 '>
                  <span className='w-80 h-80 mb-32 flex-center bg-white box-shadow-md rounded-12 item-hover__bg'>
                    <img
                      src='assets/images/icons/how-it-work-icon1.png'
                      alt=''
                      className='animate__wobble'
                    />
                  </span>
                  <h4 className='mb-16 item-hover__text transition-2'>
                    Search for Tutors{" "}
                  </h4>
                  <p className='item-hover__text text-neutral-500 transition-2'>
                    Post Tuition by creating Account or without Account.
                  </p>
                </div>
              </div>
              <div
                className='col-sm-6'
                data-aos='fade-up'
                data-aos-duration={600}
              >
                <div className='p-40 rounded-12 animation-item item-hover hover-bg-main-two-600 transition-2 bg-main-two-25 '>
                  <span className='w-80 h-80 mb-32 flex-center bg-white box-shadow-md rounded-12 item-hover__bg'>
                    <img
                      src='assets/images/icons/how-it-work-icon2.png'
                      alt=''
                      className='animate__wobble'
                    />
                  </span>
                  <h4 className='mb-16 item-hover__text transition-2'>
                    Get Free Session
                  </h4>
                  <p className='item-hover__text text-neutral-500 transition-2'>
                    Get free one day demo session with the tutor...
                  </p>
                </div>
              </div>
              <div
                className='col-sm-6'
                data-aos='fade-up'
                data-aos-duration={800}
              >
                <div className='p-40 rounded-12 animation-item item-hover hover-bg-main-two-600 transition-2 bg-main-two-25 '>
                  <span className='w-80 h-80 mb-32 flex-center bg-white box-shadow-md rounded-12 item-hover__bg'>
                    <img
                      src='assets/images/icons/how-it-work-icon3.png'
                      alt=''
                      className='animate__wobble'
                    />
                  </span>
                  <h4 className='mb-16 item-hover__text transition-2'>
                    Hire your tutor
                  </h4>
                  <p className='item-hover__text text-neutral-500 transition-2'>
                    If you like the demo session, confirm the teacher.
                  </p>
                </div>
              </div>
              <div
                className='col-sm-6'
                data-aos='fade-up'
                data-aos-duration={1000}
              >
                <div className='p-40 rounded-12 animation-item item-hover hover-bg-main-three-600 transition-2 bg-main-three-25 '>
                  <span className='w-80 h-80 mb-32 flex-center bg-white box-shadow-md rounded-12 item-hover__bg'>
                    <img
                      src='assets/images/icons/how-it-work-icon4.png'
                      alt=''
                      className='animate__wobble'
                    />
                  </span>
                  <h4 className='mb-16 item-hover__text transition-2'>
                    Get results
                  </h4>
                  <p className='item-hover__text text-neutral-500 transition-2'>
                    Gain knowledge, boost confidence and improve...
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className='col-lg-6 ps-lg-5'>
            <div className='mb-40'>
              <div className='flex-align d-inline-flex gap-8 mb-16 wow bounceInDown'>
                <span className='text-main-600 text-2xl d-flex'>
                  <i className='ph-bold ph-book-open' />
                </span>
                <h5 className='text-main-600 mb-0'>For Students/Guardians</h5>
              </div>
              <h2 className='mb-24 wow bounceInRight'>Here's how it works</h2>
              <p className='text-neutral-500 text-xl wow bounceInUp'>
                We strive to make the tutoring process simple, effective, and
                stress-free for both students and parents. We carefully match
                the student with a tutor who specializes in the relevant subject
                area.
              </p>
              <div className='pt-40 border-top border-neutral-50 mt-40 border-dashed border-0'>
                <Link
                  to='/sign-up'
                  className='btn btn-main rounded-pill flex-align d-inline-flex gap-8'
                >
                  Register Now
                  <i className='ph-bold ph-arrow-up-right d-flex text-lg' />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorkOne;
