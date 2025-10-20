import React, { useRef } from "react";
import Slider from "react-slick";

const TestimonialsFour = () => {
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
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
          arrows: false,
        },
      },
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
    <section className='instructor py-120 position-relative z-1'>
      <div className='max-w-632-px text-center mx-auto mb-60'>
        <div
          className='text-20 fw-semibold text-main-600 d-flex gap-8 mb-16 justify-content-center'
          data-aos='fade-down'
        >
          <span>
            <i className='ph-bold ph-book-open' />
          </span>
          <span>Testimonials</span>
        </div>
        <h2 className='text-neutral-700 mb-24 wow bounceIn'>
          What Our Community Says
        </h2>
        <p className='text-16 fw-normal wow bounceInUp'>
          Welcome to our testimonial section, where members of our university
          community share their experiences and insights about life at EduAll.
        </p>
      </div>
      <Slider className='testimonial-five-slider' ref={sliderRef} {...settings}>
        <div data-aos='zoom-in' data-aos-duration={400}>
          <div className='instructor-item max-w-636-px scale-hover-item bg-white rounded-16 p-12 border border-neutral-30 hover-border-main-600 border px-32 py-32 hover-bg-main-05 transition-04'>
            <ul className='d-flex ailgn gap-8'>
              <li className='text-20 text-warning-400'>
                <i className='ph-fill ph-star' />
              </li>
              <li className='text-20 text-warning-400'>
                <i className='ph-fill ph-star' />
              </li>
              <li className='text-20 text-warning-400'>
                <i className='ph-fill ph-star' />
              </li>
              <li className='text-20 text-warning-400'>
                <i className='ph-fill ph-star' />
              </li>
              <li className='text-20 text-warning-400'>
                <i className='ph-fill ph-star-half' />
              </li>
            </ul>
            <p className='mb-32'>
              "I was initially skeptical about online learning, but changed my
              perspective completely. The courses are well-designed, and the
              flexibility to learn at my own pace is invaluable."
            </p>
            <div className='d-flex align-items-center justify-content-between'>
              <div className='d-flex align-items-center gap-20'>
                <img
                  src='assets/images/thumbs/testimonial-five-img1.png'
                  alt=''
                />
                <div>
                  <h6 className='mb-0 mb-8'>Jane Cooper</h6>
                  <span>President of Sales</span>
                </div>
              </div>
              <img src='assets/images/icons/testimonial-five.png' alt='' />
            </div>
          </div>
        </div>
        <div data-aos='zoom-in' data-aos-duration={800}>
          <div className='instructor-item max-w-636-px scale-hover-item bg-white rounded-16 p-12 border border-neutral-30 hover-border-main-600 border px-32 py-32 hover-bg-main-05 transition-04'>
            <ul className='d-flex ailgn gap-8'>
              <li className='text-20 text-warning-400'>
                <i className='ph-fill ph-star' />
              </li>
              <li className='text-20 text-warning-400'>
                <i className='ph-fill ph-star' />
              </li>
              <li className='text-20 text-warning-400'>
                <i className='ph-fill ph-star' />
              </li>
              <li className='text-20 text-warning-400'>
                <i className='ph-fill ph-star' />
              </li>
              <li className='text-20 text-warning-400'>
                <i className='ph-fill ph-star-half' />
              </li>
            </ul>
            <p className='mb-32'>
              "I was initially skeptical about online learning, but changed my
              perspective completely. The courses are well-designed, and the
              flexibility to learn at my own pace is invaluable."
            </p>
            <div className='d-flex align-items-center justify-content-between'>
              <div className='d-flex align-items-center gap-20'>
                <img
                  src='assets/images/thumbs/testimonial-five-img2.png'
                  alt=''
                />
                <div>
                  <h6 className='mb-0 mb-8'>Jane Cooper</h6>
                  <span>President of Sales</span>
                </div>
              </div>
              <img src='assets/images/icons/testimonial-five.png' alt='' />
            </div>
          </div>
        </div>
        <div data-aos='zoom-in' data-aos-duration={1200}>
          <div className='instructor-item max-w-636-px scale-hover-item bg-white rounded-16 p-12 border border-neutral-30 hover-border-main-600 border px-32 py-32 hover-bg-main-05 transition-04'>
            <ul className='d-flex ailgn gap-8'>
              <li className='text-20 text-warning-400'>
                <i className='ph-fill ph-star' />
              </li>
              <li className='text-20 text-warning-400'>
                <i className='ph-fill ph-star' />
              </li>
              <li className='text-20 text-warning-400'>
                <i className='ph-fill ph-star' />
              </li>
              <li className='text-20 text-warning-400'>
                <i className='ph-fill ph-star' />
              </li>
              <li className='text-20 text-warning-400'>
                <i className='ph-fill ph-star-half' />
              </li>
            </ul>
            <p className='mb-32'>
              "I was initially skeptical about online learning, but changed my
              perspective completely. The courses are well-designed, and the
              flexibility to learn at my own pace is invaluable."
            </p>
            <div className='d-flex align-items-center justify-content-between'>
              <div className='d-flex align-items-center gap-20'>
                <img
                  src='assets/images/thumbs/testimonial-five-img3.png'
                  alt=''
                />
                <div>
                  <h6 className='mb-0 mb-8'>Jane Cooper</h6>
                  <span>President of Sales</span>
                </div>
              </div>
              <img src='assets/images/icons/testimonial-five.png' alt='' />
            </div>
          </div>
        </div>
        <div data-aos='zoom-in' data-aos-duration={400}>
          <div className='instructor-item max-w-636-px scale-hover-item bg-white rounded-16 p-12 border border-neutral-30 hover-border-main-600 border px-32 py-32 hover-bg-main-05 transition-04'>
            <ul className='d-flex ailgn gap-8'>
              <li className='text-20 text-warning-400'>
                <i className='ph-fill ph-star' />
              </li>
              <li className='text-20 text-warning-400'>
                <i className='ph-fill ph-star' />
              </li>
              <li className='text-20 text-warning-400'>
                <i className='ph-fill ph-star' />
              </li>
              <li className='text-20 text-warning-400'>
                <i className='ph-fill ph-star' />
              </li>
              <li className='text-20 text-warning-400'>
                <i className='ph-fill ph-star-half' />
              </li>
            </ul>
            <p className='mb-32'>
              "I was initially skeptical about online learning, but changed my
              perspective completely. The courses are well-designed, and the
              flexibility to learn at my own pace is invaluable."
            </p>
            <div className='d-flex align-items-center justify-content-between'>
              <div className='d-flex align-items-center gap-20'>
                <img
                  src='assets/images/thumbs/testimonial-five-img2.png'
                  alt=''
                />
                <div>
                  <h6 className='mb-0 mb-8'>Jane Cooper</h6>
                  <span>President of Sales</span>
                </div>
              </div>
              <img src='assets/images/icons/testimonial-five.png' alt='' />
            </div>
          </div>
        </div>
      </Slider>
      <div className='flex-align gap-16 mt-40 justify-content-center'>
        <button
          type='button'
          id='testimonial-five-prev'
          onClick={() => sliderRef.current.slickPrev()}
          className=' slick-arrow flex-center rounded-circle border border-gray-100 hover-border-main-600 text-xl hover-bg-main-600 hover-text-white transition-1 w-48 h-48'
          data-aos='fade-right'
        >
          <i className='ph ph-caret-left' />
        </button>
        <button
          type='button'
          id='testimonial-five-next'
          onClick={() => sliderRef.current.slickNext()}
          className=' slick-arrow flex-center rounded-circle border border-gray-100 hover-border-main-600 text-xl hover-bg-main-600 hover-text-white transition-1 w-48 h-48'
          data-aos='fade-left'
        >
          <i className='ph ph-caret-right' />
        </button>
      </div>
    </section>
  );
};

export default TestimonialsFour;
