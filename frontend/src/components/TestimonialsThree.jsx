import { useRef } from "react";
import Slider from "react-slick";

const TestimonialsThree = () => {
  const sliderRef = useRef(null);
  const settings = {
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 2000,
    speed: 900,
    dots: false,
    pauseOnHover: true,
    arrows: false,
    draggable: false,
    infinite: true,
    centerMode: true,
    centerPadding: "0px",

    responsive: [
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 2,
          arrows: false,
        },
      },
      {
        breakpoint: 575,
        settings: {
          slidesToShow: 1,
          arrows: false,
        },
      },
    ],
  };
  return (
    <section className='testimonials-three py-120 bg-main-25 position-relative z-1 overflow-hidden'>
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
      <img
        src='assets/images/shapes/shape4.png'
        alt=''
        className='shape one animation-scalation'
      />
      <div className='container'>
        <div className='row gy-4 align-items-center flex-wrap-reverse'>
          <div className='col-xl-7'>
            <Slider
              ref={sliderRef}
              {...settings}
              className='testimonials-three-slider'
            >
              <div className='testimonials-three-item bg-white p-24 rounded-12 box-shadow-md'>
                <div className='w-90 h-90 rounded-circle position-relative mb-4'>
                  <img
                    src='assets/images/thumbs/testimonials-three-img2.png'
                    alt=''
                    className='cover-img rounded-circle'
                  />
                  <span className='w-40 h-40 bg-main-two-600 flex-center border border-white border-2 rounded-circle position-absolute inset-block-end-0 inset-inline-end-0 mt--5 me--5'>
                    <img src='assets/images/icons/quote-two-icon.png' alt='' />
                  </span>
                </div>
                <p className='text-neutral-500 my-24'>
                  Attending [University Name] was one of the best decisions I've
                  made. The{" "}
                </p>
                <ul className='flex-align gap-8 mb-16'>
                  <li className='text-warning-600 text-xl d-flex'>
                    <i className='ph-fill ph-star' />
                  </li>
                  <li className='text-warning-600 text-xl d-flex'>
                    <i className='ph-fill ph-star' />
                  </li>
                  <li className='text-warning-600 text-xl d-flex'>
                    <i className='ph-fill ph-star' />
                  </li>
                  <li className='text-warning-600 text-xl d-flex'>
                    <i className='ph-fill ph-star' />
                  </li>
                  <li className='text-warning-600 text-xl d-flex'>
                    <i className='ph-fill ph-star-half' />
                  </li>
                </ul>
                <h4 className='mb-16 text-lg'>Ronald Richards</h4>
                <span className='text-neutral-500'>Student</span>
              </div>
              <div className='testimonials-three-item bg-white p-24 rounded-12 box-shadow-md'>
                <div className='w-90 h-90 rounded-circle position-relative mb-4'>
                  <img
                    src='assets/images/thumbs/testimonials-three-img1.png'
                    alt=''
                    className='cover-img rounded-circle'
                  />
                  <span className='w-40 h-40 bg-main-two-600 flex-center border border-white border-2 rounded-circle position-absolute inset-block-end-0 inset-inline-end-0 mt--5 me--5'>
                    <img src='assets/images/icons/quote-two-icon.png' alt='' />
                  </span>
                </div>
                <p className='text-neutral-500 my-24'>
                  "The faculty at are not only experts in their fields but
                  teaching students."
                </p>
                <ul className='flex-align gap-8 mb-16'>
                  <li className='text-warning-600 text-xl d-flex'>
                    <i className='ph-fill ph-star' />
                  </li>
                  <li className='text-warning-600 text-xl d-flex'>
                    <i className='ph-fill ph-star' />
                  </li>
                  <li className='text-warning-600 text-xl d-flex'>
                    <i className='ph-fill ph-star' />
                  </li>
                  <li className='text-warning-600 text-xl d-flex'>
                    <i className='ph-fill ph-star' />
                  </li>
                  <li className='text-warning-600 text-xl d-flex'>
                    <i className='ph-fill ph-star-half' />
                  </li>
                </ul>
                <h4 className='mb-16 text-lg'>Brooklyn Simmons</h4>
                <span className='text-neutral-500'>Student</span>
              </div>
              <div className='testimonials-three-item bg-white p-24 rounded-12 box-shadow-md'>
                <div className='w-90 h-90 rounded-circle position-relative mb-4'>
                  <img
                    src='assets/images/thumbs/testimonials-three-img3.png'
                    alt=''
                    className='cover-img rounded-circle'
                  />
                  <span className='w-40 h-40 bg-main-two-600 flex-center border border-white border-2 rounded-circle position-absolute inset-block-end-0 inset-inline-end-0 mt--5 me--5'>
                    <img src='assets/images/icons/quote-two-icon.png' alt='' />
                  </span>
                </div>
                <p className='text-neutral-500 my-24'>
                  As a faculty member at [University Name], I've had the
                  privilege of working
                </p>
                <ul className='flex-align gap-8 mb-16'>
                  <li className='text-warning-600 text-xl d-flex'>
                    <i className='ph-fill ph-star' />
                  </li>
                  <li className='text-warning-600 text-xl d-flex'>
                    <i className='ph-fill ph-star' />
                  </li>
                  <li className='text-warning-600 text-xl d-flex'>
                    <i className='ph-fill ph-star' />
                  </li>
                  <li className='text-warning-600 text-xl d-flex'>
                    <i className='ph-fill ph-star' />
                  </li>
                  <li className='text-warning-600 text-xl d-flex'>
                    <i className='ph-fill ph-star-half' />
                  </li>
                </ul>
                <h4 className='mb-16 text-lg'>Courtney Henry</h4>
                <span className='text-neutral-500'>Student</span>
              </div>
              <div className='testimonials-three-item bg-white p-24 rounded-12 box-shadow-md'>
                <div className='w-90 h-90 rounded-circle position-relative mb-4'>
                  <img
                    src='assets/images/thumbs/testimonials-three-img3.png'
                    alt=''
                    className='cover-img rounded-circle'
                  />
                  <span className='w-40 h-40 bg-main-two-600 flex-center border border-white border-2 rounded-circle position-absolute inset-block-end-0 inset-inline-end-0 mt--5 me--5'>
                    <img src='assets/images/icons/quote-two-icon.png' alt='' />
                  </span>
                </div>
                <p className='text-neutral-500 my-24'>
                  "The faculty at are not only experts in their fields but
                  teaching students."
                </p>
                <ul className='flex-align gap-8 mb-16'>
                  <li className='text-warning-600 text-xl d-flex'>
                    <i className='ph-fill ph-star' />
                  </li>
                  <li className='text-warning-600 text-xl d-flex'>
                    <i className='ph-fill ph-star' />
                  </li>
                  <li className='text-warning-600 text-xl d-flex'>
                    <i className='ph-fill ph-star' />
                  </li>
                  <li className='text-warning-600 text-xl d-flex'>
                    <i className='ph-fill ph-star' />
                  </li>
                  <li className='text-warning-600 text-xl d-flex'>
                    <i className='ph-fill ph-star-half' />
                  </li>
                </ul>
                <h4 className='mb-16 text-lg'>Brooklyn Simmons</h4>
                <span className='text-neutral-500'>Student</span>
              </div>
            </Slider>
          </div>
          <div className='col-xl-5 ps-xl-5'>
            <div className='flex-align d-inline-flex gap-8 mb-16 wow bounceInDown'>
              <span className='text-main-600 text-2xl d-flex'>
                <i className='ph-bold ph-book-open' />
              </span>
              <h5 className='text-main-600 mb-0'>Testimonials</h5>
            </div>
            <h2 className='mb-24 wow bounceInRight'>What Our Community Says</h2>
            <p className='text-neutral-500 text-line-4 wow bounceInUp'>
              Welcome to our testimonial section, where members of our
              university community share their experiences and insights about
              life at EduAll. We invite you to join us and be part of our
              inspiring journey of learning, growth, and achievement.
            </p>
            <div className='flex-align gap-16 mt-40'>
              <button
                type='button'
                id='testimonials-three-prev'
                onClick={() => sliderRef.current.slickPrev()}
                className=' slick-arrow flex-center rounded-circle border border-gray-100 hover-border-main-600 text-xl hover-bg-main-600 hover-text-white transition-1 w-48 h-48'
              >
                <i className='ph ph-caret-left' />
              </button>
              <button
                type='button'
                id='testimonials-three-next'
                onClick={() => sliderRef.current.slickNext()}
                className=' slick-arrow flex-center rounded-circle border border-gray-100 hover-border-main-600 text-xl hover-bg-main-600 hover-text-white transition-1 w-48 h-48'
              >
                <i className='ph ph-caret-right' />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsThree;
