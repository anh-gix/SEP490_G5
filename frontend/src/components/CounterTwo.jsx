import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";

const CounterTwo = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  return (
    <section className='counter-three py-120 bg-main-25'>
      <div className='container'>
        <div className='p-16 rounded-16 bg-white'>
          <div className='row gy-4'>
            <div
              className='col-xl-3 col-sm-6 col-xs-6'
              data-aos='fade-up'
              data-aos-duration={200}
            >
              <div className='counter-three-item animation-item h-100 text-center px-16 py-32 rounded-12 bg-main-25 border border-neutral-30'>
                <span className='w-80 h-80 flex-center d-inline-flex bg-white text-main-600 text-40 rounded-circle box-shadow-md mb-24'>
                  <i className='animate__wobble ph ph-users' />
                </span>

                <div ref={ref}>
                  {inView && (
                    <h1 className='display-four mb-16 text-neutral-700 counter'>
                      <CountUp end={10} />K
                    </h1>
                  )}
                </div>
                <span className='text-neutral-500 text-lg'>
                  Total Instructors{" "}
                </span>
              </div>
            </div>
            <div
              className='col-xl-3 col-sm-6 col-xs-6'
              data-aos='fade-up'
              data-aos-duration={400}
            >
              <div className='counter-three-item animation-item h-100 text-center px-16 py-32 rounded-12 bg-main-two-25 border border-neutral-30'>
                <span className='w-80 h-80 flex-center d-inline-flex bg-white text-main-two-600 text-40 rounded-circle box-shadow-md mb-24'>
                  <i className='animate__wobble ph ph-users-three' />
                </span>

                <div ref={ref}>
                  {inView && (
                    <h1 className='display-four mb-16 text-neutral-700 counter'>
                      <CountUp end={55} />K
                    </h1>
                  )}
                </div>
                <span className='text-neutral-500 text-lg'>
                  Students till date
                </span>
              </div>
            </div>
            <div
              className='col-xl-3 col-sm-6 col-xs-6'
              data-aos='fade-up'
              data-aos-duration={600}
            >
              <div className='counter-three-item animation-item h-100 text-center px-16 py-32 rounded-12 bg-main-25 border border-neutral-30'>
                <span className='w-80 h-80 flex-center d-inline-flex bg-white text-main-600 text-40 rounded-circle box-shadow-md mb-24'>
                  <i className='animate__wobble ph ph-thumbs-up' />
                </span>

                <div ref={ref}>
                  {inView && (
                    <h1 className='display-four mb-16 text-neutral-700 counter'>
                      <CountUp end={48} />K
                    </h1>
                  )}
                </div>
                <span className='text-neutral-500 text-lg'>
                  Satisfaction Rate
                </span>
              </div>
            </div>
            <div
              className='col-xl-3 col-sm-6 col-xs-6'
              data-aos='fade-up'
              data-aos-duration={800}
            >
              <div className='counter-three-item animation-item h-100 text-center px-16 py-32 rounded-12 bg-main-two-25 border border-neutral-30'>
                <span className='w-80 h-80 flex-center d-inline-flex bg-white text-main-two-600 text-40 rounded-circle box-shadow-md mb-24'>
                  <i className='animate__wobble ph ph-envelope-simple-open' />
                </span>

                <div ref={ref}>
                  {inView && (
                    <h1 className='display-four mb-16 text-neutral-700 counter'>
                      <CountUp end={550} />K
                    </h1>
                  )}
                </div>
                <span className='text-neutral-500 text-lg'>Total Campuses</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CounterTwo;
