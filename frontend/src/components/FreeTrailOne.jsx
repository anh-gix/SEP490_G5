import CountUp from "react-countup";
import { Link } from "react-router-dom";
import { useInView } from "react-intersection-observer";

const FreeTrailOne = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  return (
    <section className='free-trails py-120 position-relative z-1 bg-main-25 overflow-hidden'>
      <div className='position-relative'>
        <div className='container'>
          <div className='row gy-xl-0 gy-5 flex-wrap-reverse align-items-center'>
            <div className='col-lg-6'>
              <div className='position-relative wow bounceIn'>
                <img
                  src='assets/images/thumbs/trail-img.png'
                  alt=''
                  data-tilt=''
                  data-tilt-max={8}
                  data-tilt-speed={500}
                  data-tilt-perspective={5000}
                  data-tilt-transition='1s'
                  data-tilt-full-page-listening=''
                />
                <div className='w-120 h-120 bg-main-two-600 rounded-circle border border-white d-flex flex-column align-items-center justify-content-center position-absolute start-50 top-0 translate-middle-x mt-28'>
                  <div ref={ref}>
                    {inView && (
                      <h1 className='text-white mb-0 fw-medium counter counter'>
                        <CountUp end={12} />K
                      </h1>
                    )}
                  </div>
                  <span className='text-white text-secondary'>Community</span>
                </div>
              </div>
            </div>
            <div className='col-lg-6'>
              <div className='mb-40'>
                <div className='flex-align d-inline-flex gap-8 mb-16 wow bounceInDown'>
                  <span className='text-main-600 text-2xl d-flex'>
                    <i className='ph-bold ph-book-open' />
                  </span>
                  <h5 className='text-main-600 mb-0'>
                    Request a Class for FREE Trial
                  </h5>
                </div>
                <h2 className='mb-24 wow bounceInRight'>
                  Experience Personalized Learning Today
                </h2>
                <p className='text-neutral-500 text-line-2 wow bounceInUp'>
                  Ready to experience the benefits of personalized tutoring
                  firsthand? Sign up for a FREE trial class today and see how
                  our expert tutors can help you.
                </p>
              </div>
              <ul className='grid-cols-2'>
                <li
                  className='flex-align gap-8'
                  data-aos='fade-left'
                  data-aos-duration={200}
                >
                  <img src='assets/images/icons/check2.png' alt='' />
                  <span className='text-neutral-500 text-md fw-medium'>
                    Fill Out the Form
                  </span>
                </li>
                <li
                  className='flex-align gap-8'
                  data-aos='fade-left'
                  data-aos-duration={400}
                >
                  <img src='assets/images/icons/check2.png' alt='' />
                  <span className='text-neutral-500 text-md fw-medium'>
                    Schedule Your Class
                  </span>
                </li>
                <li
                  className='flex-align gap-8'
                  data-aos='fade-left'
                  data-aos-duration={600}
                >
                  <img src='assets/images/icons/check2.png' alt='' />
                  <span className='text-neutral-500 text-md fw-medium'>
                    Meet Your Tutor{" "}
                  </span>
                </li>
                <li
                  className='flex-align gap-8'
                  data-aos='fade-left'
                  data-aos-duration={800}
                >
                  <img src='assets/images/icons/check2.png' alt='' />
                  <span className='text-neutral-500 text-md fw-medium'>
                    Start The Class
                  </span>
                </li>
              </ul>
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

export default FreeTrailOne;
