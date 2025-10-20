import { Link } from "react-router-dom";

const BannerSix = () => {
  return (
    <section
      className='padding-top-100-px bg-img position-relative z-1 overflow-hidden'
      style={{ backgroundImage: "url(assets/images/bg/banner-5-bg-img1.png)" }}
    >
      <img
        src='assets/images/shapes/shape1.png'
        alt=''
        className='animation-rotation d-sm-block d-none left-32-percent top-18-percent position-absolute'
      />
      <img
        src='assets/images/shapes/shape2.png'
        alt=''
        className='animation-scalation d-sm-block d-none inset-block-start-50-percent right-5-percent position-absolute z-n10'
      />
      <img
        src='assets/images/shapes/shape6.png'
        alt=''
        className='animation-scalation d-sm-block d-none left-3-percent bottom-18-percent position-absolute z-n10'
      />
      <img
        src='assets/images/shapes/shape5.png'
        alt=''
        className='animation-walking d-sm-block d-none inset-block-start-20-percent inset-inline-start-8-percent position-absolute z-n1'
      />
      <img
        src='assets/images/shapes/shape1.png'
        alt=''
        className='animation-rotation d-sm-block d-none inset-block-end-26-percent inset-inline-start-25-percent position-absolute z-n10'
      />
      <img
        src='assets/images/shapes/shape4.png'
        alt=''
        className='animation-scalation d-sm-block d-none top-55-percent inset-inline-start-35-percent position-absolute z-n10'
      />
      <img
        src='assets/images/shapes/shape3.png'
        alt=''
        className='animation-walking d-sm-block d-none top-55-percent left-57-percent position-absolute z-n10'
      />
      <img
        src='assets/images/shapes/curve-arrow.png'
        alt=''
        className='animate__wobble__two d-sm-block d-none inset-inline-start-70-percent top-18-percent position-absolute z-n1'
      />
      <div>
        <img
          src='assets/images/thumbs/banner-six-img1.png'
          alt=''
          className='position-absolute z-n1 ms-8-persent padding-top-162-px d-xl-block d-none tw-max-width-22 wow bounceIn'
          data-wow-duration='3s'
        />
      </div>
      <div className='py-120'>
        <div className='container'>
          <div className='tw-max-width-742-px mx-auto text-center z-2'>
            <div className='mb-40'>
              <div
                className='text-main-600 fw-semibold text-xl d-flex align-items-center gap-8 mb-16 justify-content-center flex-wrap'
                data-aos='fade-down'
              >
                <span>
                  <i className='ph-bold ph-book-open' />
                </span>
                <span>Unlocking Your Child's Futures</span>
              </div>
              <h2 className='fw-semibold text-neutral-700 display2 line-height-96 mb-24 wow bounceInLeft'>
                Building a
                <span
                  className='text-success-600 wow bounceInRight'
                  data-wow-duration='2s'
                >
                  Brighter
                </span>
                <span
                  className='text-warning-800 wow bounceInUp'
                  data-wow-duration='2s'
                >
                  Future
                </span>
                for Your Child
              </h2>
              <p className='fw-normal text-xl max-w-646 mx-auto text-center font-size-20-px wow bounceInUp'>
                We are dedicated to nurturing young minds, empowering them with
                knowledge, skills, and confidence to excel.
              </p>
            </div>
            <div className='d-flex align-items-center mx-auto justify-content-center gap-24 flex-wrap'>
              <Link
                to='#'
                className='px-32 py-16 bg-main-600 text-white fw-semibold rounded-pill hover-bg-main-800 '
                data-aos='fade-right'
              >
                Get Start Today
                <span>
                  <i className='ph-bold ph-arrow-up-right' />
                </span>
              </Link>
              <Link
                to='#'
                className='px-32 py-16 text-main-600 border-main-600 border fw-semibold rounded-pill hover-bg-main-50'
                data-aos='fade-left'
              >
                Find Courses
                <span>
                  <i className='ph-bold ph-arrow-up-right' />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className=''>
        <img
          src='assets/images/thumbs/banner-six-img2.png'
          alt=''
          className='position-absolute end-0  z-n1 inset-block-start-50-persent me-8-persent d-xl-block d-none tw-max-width-22 wow bounceIn'
          data-wow-duration='3s'
        />
      </div>
      <div className='position-absolute start-0 bottom-0 w-100 z-index-n9'>
        <img
          src='assets/images/shapes/cloud-shap-img1.png'
          alt=''
          className='w-100'
        />
      </div>
    </section>
  );
};

export default BannerSix;
