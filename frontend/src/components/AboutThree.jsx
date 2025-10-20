import CountUp from "react-countup";
import { Link } from "react-router-dom";
import { useInView } from "react-intersection-observer";

const AboutThree = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  return (
    <section className='about-three py-120 position-relative z-1 bg-main-25 overflow-hidden'>
      <div className='position-relative'>
        <div className='container'>
          <div className='row gy-xl-0 gy-5 flex-wrap-reverse align-items-center'>
            <div className='col-xl-6 pe-xl-5'>
              <div className='about-three-thumbs position-relative me-xxl-5'>
                <div className='row gy-4'>
                  <div className='col-sm-8'>
                    <img
                      src='assets/images/thumbs/about-three-img1.png'
                      alt=''
                      className='about-three-thumbs__one rounded-16 w-100'
                      data-tilt=''
                      data-tilt-max={16}
                      data-tilt-speed={500}
                      data-tilt-perspective={5000}
                    />
                  </div>
                  <div className='col-sm-4'>
                    <div
                      className='bg-main-three-600 rounded-16 text-center py-24 px-2 mb-24'
                      data-tilt=''
                      data-tilt-max={10}
                      data-tilt-speed={500}
                      data-tilt-perspective={5000}
                      data-tilt-transition='1s'
                      data-tilt-full-page-listening=''
                    >
                      <div ref={ref}>
                        {inView && (
                          <h1 className='mb-16 text-white counter'>
                            <CountUp end={26} />K
                          </h1>
                        )}
                      </div>
                      <span className='text-white'>
                        Students Active Our University
                      </span>
                      <div className='enrolled-students style-two mt-12'>
                        <img
                          src='assets/images/thumbs/enroll-student-img1.png'
                          alt=''
                          className='w-32 h-32 rounded-circle object-fit-cove transition-2'
                        />
                        <img
                          src='assets/images/thumbs/enroll-student-img2.png'
                          alt=''
                          className='w-32 h-32 rounded-circle object-fit-cove transition-2'
                        />
                        <img
                          src='assets/images/thumbs/enroll-student-img3.png'
                          alt=''
                          className='w-32 h-32 rounded-circle object-fit-cove transition-2'
                        />
                        <img
                          src='assets/images/thumbs/enroll-student-img4.png'
                          alt=''
                          className='w-32 h-32 rounded-circle object-fit-cove transition-2'
                        />
                        <img
                          src='assets/images/thumbs/enroll-student-img5.png'
                          alt=''
                          className='w-32 h-32 rounded-circle object-fit-cove transition-2'
                        />
                        <img
                          src='assets/images/thumbs/enroll-student-img6.png'
                          alt=''
                          className='w-32 h-32 rounded-circle object-fit-cove transition-2'
                        />
                      </div>
                    </div>
                    <img
                      src='assets/images/thumbs/about-three-img2.png'
                      alt=''
                      className='about-three-thumbs__two rounded-16 w-100'
                      data-tilt=''
                      data-tilt-max={10}
                      data-tilt-speed={500}
                      data-tilt-perspective={5000}
                      data-tilt-full-page-listening=''
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className='col-xl-6'>
              <div className='about-three-content'>
                <div className='mb-40'>
                  <div className='flex-align d-inline-flex gap-8 mb-16 wow bounceInDown'>
                    <span className='text-main-600 text-2xl d-flex'>
                      <i className='ph-bold ph-book-open' />
                    </span>
                    <h5 className='text-main-600 mb-0'>About University Us</h5>
                  </div>
                  <h2 className='mb-24 wow bounceInRight'>
                    Our Commitment to Diversity Leadership and Governance
                  </h2>
                  <p className='text-neutral-500 text-line-2 wow bounceInUp'>
                    We embrace innovation and creativity as catalysts for
                    positive change, driving forward-thinking research, teaching
                    methodologies
                  </p>
                </div>
                <div className='grid-cols-2'>
                  <div
                    className='flex-align align-items-start gap-20 animation-item'
                    data-aos='fade-up'
                    data-aos-duration={600}
                  >
                    <span className='flex-shrink-0 w-60 h-60 flex-center d-inline-flex bg-white text-main-600 text-40 rounded-16 box-shadow-md'>
                      <img
                        src='assets/images/icons/choose-us-icon1.png'
                        className='animate__swing'
                        alt=''
                      />
                    </span>
                    <div className='flex-grow-1'>
                      <h6 className='text-neutral-800 text-xl fw-medium mb-8'>
                        Undergraduate
                      </h6>
                      <div className='flex-align gap-8 text-neutral-500'>
                        <i className='d-flex text-lg ph-bold ph-clock' />
                        Onsite
                      </div>
                    </div>
                  </div>
                  <div
                    className='flex-align align-items-start gap-20 animation-item'
                    data-aos='fade-up'
                    data-aos-duration={800}
                  >
                    <span className='flex-shrink-0 w-60 h-60 flex-center d-inline-flex bg-white text-main-600 text-40 rounded-16 box-shadow-md'>
                      <img
                        src='assets/images/icons/choose-us-icon2.png'
                        className='animate__swing'
                        alt=''
                      />
                    </span>
                    <div className='flex-grow-1'>
                      <h6 className='text-neutral-800 text-xl fw-medium mb-8'>
                        Graduate
                      </h6>
                      <div className='flex-align gap-8 text-neutral-500'>
                        <i className='d-flex text-lg ph-bold ph-clock' />
                        Onsite
                      </div>
                    </div>
                  </div>
                  <div
                    className='flex-align align-items-start gap-20 animation-item'
                    data-aos='fade-up'
                    data-aos-duration={1000}
                  >
                    <span className='flex-shrink-0 w-60 h-60 flex-center d-inline-flex bg-white text-main-600 text-40 rounded-16 box-shadow-md'>
                      <img
                        src='assets/images/icons/choose-us-icon3.png'
                        className='animate__swing'
                        alt=''
                      />
                    </span>
                    <div className='flex-grow-1'>
                      <h6 className='text-neutral-800 text-xl fw-medium mb-8'>
                        Post Graduate
                      </h6>
                      <div className='flex-align gap-8 text-neutral-500'>
                        <i className='d-flex text-lg ph-bold ph-clock' />
                        Onsite
                      </div>
                    </div>
                  </div>
                  <div
                    className='flex-align align-items-start gap-20 animation-item'
                    data-aos='fade-up'
                    data-aos-duration={1200}
                  >
                    <span className='flex-shrink-0 w-60 h-60 flex-center d-inline-flex bg-white text-main-600 text-40 rounded-16 box-shadow-md'>
                      <img
                        src='assets/images/icons/choose-us-icon4.png'
                        className='animate__swing'
                        alt=''
                      />
                    </span>
                    <div className='flex-grow-1'>
                      <h6 className='text-neutral-800 text-xl fw-medium mb-8'>
                        Online education
                      </h6>
                      <div className='flex-align gap-8 text-neutral-500'>
                        <i className='d-flex text-lg ph-bold ph-clock' />
                        Onsite
                      </div>
                    </div>
                  </div>
                </div>
                <div className='pt-40 border-top border-neutral-50 mt-40 border-dashed border-0'>
                  <Link
                    to='/about'
                    className='btn btn-main rounded-pill flex-align d-inline-flex gap-8'
                  >
                    Read More
                    <i className='ph-bold ph-arrow-up-right d-flex text-lg' />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutThree;
