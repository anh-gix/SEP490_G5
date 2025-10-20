import { Link } from "react-router-dom";

const BannerTwo = () => {
  return (
    <section className='banner-two pt-80 position-relative overflow-hidden'>
      <img
        src='assets/images/shapes/banner-two-shape-1.png'
        className='position-absolute inset-block-end-0 inset-inline-end-0 w-100 h-100 d-lg-block d-none z-n1'
        alt=''
        data-tilt=''
        data-tilt-speed={500}
        data-tilt-max={6}
        data-tilt-perspective={5000}
        data-tilt-full-page-listening=''
        data-tilt-scale='1.03'
      />
      <img
        src='assets/images/shapes/shape8.png'
        alt=''
        className='shape three animation-rotation z-n1'
      />
      <img
        src='assets/images/shapes/shape8.png'
        alt=''
        className='shape five animation-scalation'
      />
      <div className='container'>
        <div className='row gy-5 align-items-center'>
          <div className='col-xl-6'>
            <div className='banner-content pe-md-4'>
              <div className='flex-align gap-8 mb-16' data-aos='fade-down'>
                <span className='text-main-600 text-2xl d-flex'>
                  <i className='ph-bold ph-book' />
                </span>
                <h5 className='text-main-600 mb-0'>Elevate Your Learning</h5>
              </div>
              <h1 className='display2 mb-24 wow bounceInLeft'>
                Learn,
                <span
                  className='text-main-two-600 wow bounceInRight'
                  data-wow-duration='2s'
                  data-wow-delay='.5s'
                >
                  Grow,{" "}
                </span>
                <span
                  className='text-main-three-600 wow bounceInLeft'
                  data-wow-duration='1s'
                  data-wow-delay='.5s'
                >
                  Achieve
                </span>{" "}
                And Succeed
              </h1>
              <p className='text-neutral-500 text-line-2 wow bounceInUp'>
                Welcome to EduAll, where learning knows no bounds. Whether
                you're a student, professional, or lifelong learner...
              </p>
              <div className='buttons-wrapper flex-align flex-wrap gap-24 mt-40'>
                <Link
                  to='/course'
                  className='btn btn-main rounded-pill flex-align gap-8'
                  data-aos='fade-right'
                >
                  Browse Courses
                  <i className='ph-bold ph-arrow-up-right d-flex text-lg' />
                </Link>
                <Link
                  to='/about'
                  className='btn btn-outline-main rounded-pill flex-align gap-8'
                  data-aos='fade-left'
                >
                  About Us
                  <i className='ph-bold ph-arrow-up-right d-flex text-lg' />
                </Link>
              </div>
            </div>
          </div>
          <div className='col-xl-6'>
            <div className='banner-thumb position-relative'>
              <img
                src='assets/images/thumbs/banner-img-2.png'
                alt=''
                className='banner-thumb__img rounded-12'
                data-aos='fade-up'
              />
              <img
                src='assets/images/shapes/shape9.png'
                className='position-absolute inset-block-end-0 start-0 z-n1'
                alt=''
                data-tilt=''
                data-tilt-max={16}
                data-tilt-speed={500}
              />
              <img
                src='assets/images/shapes/shape10.png'
                className='position-absolute inset-block-start-0 start-0 z-n1 showHideTwo'
                alt=''
                data-tilt=''
                data-tilt-max={16}
                data-tilt-speed={500}
                data-tilt-perspective={5000}
                data-tilt-startx={100}
                data-tilt-full-page-listening=''
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerTwo;
