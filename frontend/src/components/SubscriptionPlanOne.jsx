import { Link } from "react-router-dom";

const SubscriptionPlanOne = () => {
  return (
    <section className='favorite-course py-120'>
      <div className='container'>
        <div className='section-heading text-center'>
          <div className='flex-align d-inline-flex gap-8 mb-16'>
            <span className='text-main-600 text-2xl d-flex'>
              <i className='ph-bold ph-book-open' />
            </span>
            <h5 className='text-main-600 mb-0'>Subscription Plan</h5>
          </div>
          <h2 className='mb-24'>Affordable Pricing Packages</h2>
          <p className=''>
            We embrace innovation and creativity as catalysts for positive
            change, driving forward-thinking research, teaching methodologies
          </p>
        </div>
        <div className='mb-40 d-flex align-items-center gap-24 justify-content-center'>
          <span className='text-neutral-700 fw-semibold'>Monthly</span>
          <div className='form-check form-switch'>
            <input
              className='form-check-input shadow-none py-10 px-24'
              type='checkbox'
              role='switch'
            />
          </div>
          <span className='text-neutral-700 fw-semibold'>
            Yearly <span className='text-main-600'>(Save 30%) </span>{" "}
          </span>
        </div>
        <div className='row gy-4'>
          <div
            className='col-xl-4 col-md-6 aos-init'
            data-aos='fade-up'
            data-aos-duration={600}
          >
            <div className='bg-white border border-neutral-30 animation-item rounded-16 p-12'>
              <div className='bg-main-25 p-32 rounded-16 transition-2 border border-neutral-30 overflow-hidden position-relative'>
                <span className='positioned-rotation text-main-600 fw-bold text-lg bg-white d-block text-center p-6'>
                  Basic Plan
                </span>
                <div className='w-84 h-84 bg-white p-16 box-shadow-md rounded-circle mx-auto d-inline-flex align-items-center justify-content-center position-relative text-main-600 text-44  border border-neutral-30'>
                  <i className='ph ph-house' />
                </div>
                <h1 className='display-4 fw-bold mb-0 mt-32 text-neutral-700 transition-2'>
                  $99<span className='text-sm fw-normal'>/Per month</span>{" "}
                </h1>
                <span className='d-block border border-neutral-30 my-24 border-dashed' />
                <ul className='d-flex flex-column gap-16'>
                  <li
                    className='flex-align gap-12 aos-init aos-animate text-neutral-700'
                    data-aos='fade-left'
                    data-aos-duration={200}
                  >
                    <img src='assets/images/icons/check.png' alt='' />
                    <span className='text-neutral-500 text-md fw-medium'>
                      Up to 05 users monthly
                    </span>
                  </li>
                  <li
                    className='flex-align gap-12 aos-init aos-animate text-neutral-700'
                    data-aos='fade-left'
                    data-aos-duration={400}
                  >
                    <img src='assets/images/icons/check.png' alt='' />
                    <span className='text-neutral-500 text-md fw-medium'>
                      Free 5 host &amp; domain
                    </span>
                  </li>
                  <li
                    className='flex-align gap-12 aos-init aos-animate text-neutral-700'
                    data-aos='fade-left'
                    data-aos-duration={600}
                  >
                    <img src='assets/images/icons/check.png' alt='' />
                    <span className='text-neutral-500 text-md fw-medium'>
                      Custom infrastructure
                    </span>
                  </li>
                  <li
                    className='flex-align gap-12 aos-init aos-animate text-neutral-700'
                    data-aos='fade-left'
                    data-aos-duration={800}
                  >
                    <img src='assets/images/icons/check.png' alt='' />
                    <span className='text-neutral-500 text-md fw-medium'>
                      Access to all our room
                    </span>
                  </li>
                  <li
                    className='flex-align gap-12 aos-init aos-animate text-neutral-700'
                    data-aos='fade-left'
                    data-aos-duration={800}
                  >
                    <i className='text-danger-600 ph-bold ph-x' />
                    <span className='text-neutral-500 text-md fw-medium'>
                      24/7 dedicated Support
                    </span>
                  </li>
                  <li
                    className='flex-align gap-12 aos-init aos-animate text-neutral-700'
                    data-aos='fade-left'
                    data-aos-duration={800}
                  >
                    <i className='text-danger-600 ph-bold ph-x' />
                    <span className='text-neutral-500 text-md fw-medium'>
                      Unlimited updates
                    </span>
                  </li>
                </ul>
                <div className='mt-40'>
                  <Link
                    to='/sign-in'
                    className='btn btn-main rounded-pill flex-align gap-8'
                  >
                    Get Started
                    <i className='ph-bold ph-arrow-up-right d-flex text-lg' />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div
            className='col-xl-4 col-md-6 aos-init'
            data-aos='fade-up'
            data-aos-duration={800}
          >
            <div className='bg-white border border-neutral-30 animation-item rounded-16 p-12'>
              <div className='bg-main-25 p-32 rounded-16 transition-2 border border-neutral-30 overflow-hidden position-relative'>
                <span className='positioned-rotation text-main-600 fw-bold text-lg bg-white d-block text-center p-6'>
                  Standard Plan
                </span>
                <div className='w-84 h-84 bg-white p-16 box-shadow-md rounded-circle mx-auto d-inline-flex align-items-center justify-content-center position-relative text-main-600 text-44  border border-neutral-30'>
                  <i className='ph-bold ph-tag' />
                </div>
                <h1 className='display-4 fw-bold mb-0 mt-32 text-neutral-700 transition-2'>
                  $129<span className='text-sm fw-normal'>/Per month</span>{" "}
                </h1>
                <span className='d-block border border-neutral-30 my-24 border-dashed' />
                <ul className='d-flex flex-column gap-16'>
                  <li
                    className='flex-align gap-12 aos-init aos-animate text-neutral-700'
                    data-aos='fade-left'
                    data-aos-duration={200}
                  >
                    <img src='assets/images/icons/check.png' alt='' />
                    <span className='text-neutral-500 text-md fw-medium'>
                      Up to 05 users monthly
                    </span>
                  </li>
                  <li
                    className='flex-align gap-12 aos-init aos-animate text-neutral-700'
                    data-aos='fade-left'
                    data-aos-duration={400}
                  >
                    <img src='assets/images/icons/check.png' alt='' />
                    <span className='text-neutral-500 text-md fw-medium'>
                      Free 5 host &amp; domain
                    </span>
                  </li>
                  <li
                    className='flex-align gap-12 aos-init aos-animate text-neutral-700'
                    data-aos='fade-left'
                    data-aos-duration={600}
                  >
                    <img src='assets/images/icons/check.png' alt='' />
                    <span className='text-neutral-500 text-md fw-medium'>
                      Custom infrastructure
                    </span>
                  </li>
                  <li
                    className='flex-align gap-12 aos-init aos-animate text-neutral-700'
                    data-aos='fade-left'
                    data-aos-duration={800}
                  >
                    <img src='assets/images/icons/check.png' alt='' />
                    <span className='text-neutral-500 text-md fw-medium'>
                      Access to all our room
                    </span>
                  </li>
                  <li
                    className='flex-align gap-12 aos-init aos-animate text-neutral-700'
                    data-aos='fade-left'
                    data-aos-duration={800}
                  >
                    <img src='assets/images/icons/check.png' alt='' />
                    <span className='text-neutral-500 text-md fw-medium'>
                      24/7 dedicated Support
                    </span>
                  </li>
                  <li
                    className='flex-align gap-12 aos-init aos-animate text-neutral-700'
                    data-aos='fade-left'
                    data-aos-duration={800}
                  >
                    <i className='text-danger-600 ph-bold ph-x' />
                    <span className='text-neutral-500 text-md fw-medium'>
                      Unlimited updates
                    </span>
                  </li>
                </ul>
                <div className='mt-40'>
                  <Link
                    to='/sign-in'
                    className='btn btn-main rounded-pill flex-align gap-8'
                  >
                    Get Started
                    <i className='ph-bold ph-arrow-up-right d-flex text-lg' />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div
            className='col-xl-4 col-md-6 aos-init'
            data-aos='fade-up'
            data-aos-duration={1000}
          >
            <div className='bg-white border border-neutral-30 animation-item rounded-16 p-12'>
              <div className='bg-main-25 p-32 rounded-16 transition-2 border border-neutral-30 overflow-hidden position-relative'>
                <span className='positioned-rotation text-main-600 fw-bold text-lg bg-white d-block text-center p-6'>
                  Premium Plan
                </span>
                <div className='w-84 h-84 bg-white p-16 box-shadow-md rounded-circle mx-auto d-inline-flex align-items-center justify-content-center position-relative text-main-600 text-44  border border-neutral-30'>
                  <i className='ph-bold ph-piggy-bank' />
                </div>
                <h1 className='display-4 fw-bold mb-0 mt-32 text-neutral-700 transition-2'>
                  $199<span className='text-sm fw-normal'>/Per month</span>{" "}
                </h1>
                <span className='d-block border border-neutral-30 my-24 border-dashed' />
                <ul className='d-flex flex-column gap-16'>
                  <li
                    className='flex-align gap-12 aos-init aos-animate text-neutral-700'
                    data-aos='fade-left'
                    data-aos-duration={200}
                  >
                    <img src='assets/images/icons/check.png' alt='' />
                    <span className='text-neutral-500 text-md fw-medium'>
                      Up to 05 users monthly
                    </span>
                  </li>
                  <li
                    className='flex-align gap-12 aos-init aos-animate text-neutral-700'
                    data-aos='fade-left'
                    data-aos-duration={400}
                  >
                    <img src='assets/images/icons/check.png' alt='' />
                    <span className='text-neutral-500 text-md fw-medium'>
                      Free 5 host &amp; domain
                    </span>
                  </li>
                  <li
                    className='flex-align gap-12 aos-init aos-animate text-neutral-700'
                    data-aos='fade-left'
                    data-aos-duration={600}
                  >
                    <img src='assets/images/icons/check.png' alt='' />
                    <span className='text-neutral-500 text-md fw-medium'>
                      Custom infrastructure
                    </span>
                  </li>
                  <li
                    className='flex-align gap-12 aos-init aos-animate text-neutral-700'
                    data-aos='fade-left'
                    data-aos-duration={800}
                  >
                    <img src='assets/images/icons/check.png' alt='' />
                    <span className='text-neutral-500 text-md fw-medium'>
                      Access to all our room
                    </span>
                  </li>
                  <li
                    className='flex-align gap-12 aos-init aos-animate text-neutral-700'
                    data-aos='fade-left'
                    data-aos-duration={800}
                  >
                    <img src='assets/images/icons/check.png' alt='' />
                    <span className='text-neutral-500 text-md fw-medium'>
                      24/7 dedicated Support
                    </span>
                  </li>
                  <li
                    className='flex-align gap-12 aos-init aos-animate text-neutral-700'
                    data-aos='fade-left'
                    data-aos-duration={800}
                  >
                    <img src='assets/images/icons/check.png' alt='' />
                    <span className='text-neutral-500 text-md fw-medium'>
                      Unlimited updates
                    </span>
                  </li>
                </ul>
                <div className='mt-40'>
                  <Link
                    to='/sign-in'
                    className='btn btn-main rounded-pill flex-align gap-8'
                  >
                    Get Started
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

export default SubscriptionPlanOne;
