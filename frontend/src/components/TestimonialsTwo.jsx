import { useRef } from "react";
import Slider from "react-slick";

const TestimonialsTwo = () => {
  const sliderRef = useRef(null);
  const settings = {
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 2000,
    speed: 900,
    dots: false,
    pauseOnHover: true,
    arrows: false,
    draggable: true,
    infinite: true,

    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          arrows: false,
        },
      },
    ],
  };
  return (
    <section className='testimonials-two py-120 position-relative z-1'>
      <div className='container'>
        <div className='section-heading text-center'>
          <div className='flex-align d-inline-flex gap-8 mb-16 wow bounceInDown'>
            <span className='text-main-600 text-2xl d-flex'>
              <i className='ph-bold ph-book' />
            </span>
            <h5 className='text-main-600 mb-0'>
              Testimonials from Happy Learners
            </h5>
          </div>
          <h2 className='mb-24 wow bounceIn'>What Our Students Say</h2>
          <p className=' wow bounceInUp'>
            Our students' success stories speak volumes. Here are just a few
            testimonials from our satisfied learners
          </p>
        </div>
        <Slider
          ref={sliderRef}
          {...settings}
          className='testimonials-two-slider'
        >
          <div
            className='testimonials-two-item bg-main-25 rounded-12 p-32'
            data-aos='fade-up'
            data-aos-duration={400}
          >
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
            <p className='text-neutral-700 text-xl'>
              "I've taken several courses through, and each one has exceeded my
              expectations. I've gained valuable skills that have helped me
              advance in my career. Highly recommend!"
            </p>
            <div className='flex-between gap-24 flex-wrap pt-28 mt-28 border-top border-neutral-50 mt-28 border-dashed border-0'>
              <div className='flex-align gap-24 '>
                <img
                  src='assets/images/thumbs/testi-img1.png'
                  alt=''
                  className='w-60 h-60 object-fit-cover rounded-circle'
                />
                <div className=''>
                  <h5 className='mb-8 fw-medium'>John D.</h5>
                  <span className='text-neutral-700'>Graphic Designer</span>
                </div>
              </div>
              <span className='quate text-48 d-flex opacity-25'>
                <img src='assets/images/icons/quote-icon.png' alt='' />
              </span>
            </div>
          </div>
          <div
            className='testimonials-two-item bg-main-25 rounded-12 p-32'
            data-aos='fade-up'
            data-aos-duration={600}
          >
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
            <p className='text-neutral-700 text-xl'>
              "I was initially skeptical about online learning, but changed my
              perspective completely. The courses are well-designed, and the
              flexibility to learn at my own pace is invaluable."
            </p>
            <div className='flex-between gap-24 flex-wrap pt-28 mt-28 border-top border-neutral-50 mt-28 border-dashed border-0'>
              <div className='flex-align gap-24 '>
                <img
                  src='assets/images/thumbs/testi-img2.png'
                  alt=''
                  className='w-60 h-60 object-fit-cover rounded-circle'
                />
                <div className=''>
                  <h5 className='mb-8 fw-medium'>Sarah L.</h5>
                  <span className='text-neutral-700'>UI/UX Designer</span>
                </div>
              </div>
              <span className='quate text-48 d-flex opacity-25'>
                <img src='assets/images/icons/quote-icon.png' alt='' />
              </span>
            </div>
          </div>
          <div
            className='testimonials-two-item bg-main-25 rounded-12 p-32'
            data-aos='fade-up'
            data-aos-duration={600}
          >
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
            <p className='text-neutral-700 text-xl'>
              "I was at first doubtful about web based learning, yet adjusted my
              viewpoint totally. The courses are very much planned to learn at
              my own speed is important."
            </p>
            <div className='flex-between gap-24 flex-wrap pt-28 mt-28 border-top border-neutral-50 mt-28 border-dashed border-0'>
              <div className='flex-align gap-24 '>
                <img
                  src='assets/images/thumbs/user-two-img3.png'
                  alt=''
                  className='w-60 h-60 object-fit-cover rounded-circle'
                />
                <div className=''>
                  <h5 className='mb-8 fw-medium'>John Doe</h5>
                  <span className='text-neutral-700'>Front End Developer</span>
                </div>
              </div>
              <span className='quate text-48 d-flex opacity-25'>
                <img src='assets/images/icons/quote-icon.png' alt='' />
              </span>
            </div>
          </div>
        </Slider>
        <div className='flex-center gap-16 mt-40'>
          <button
            type='button'
            id='testimonials-two-prev'
            onClick={() => sliderRef.current.slickPrev()}
            className=' slick-arrow flex-center rounded-circle border border-gray-100 hover-border-main-600 text-xl hover-bg-main-600 hover-text-white transition-1 w-48 h-48'
          >
            <i className='ph ph-caret-left' />
          </button>
          <button
            type='button'
            id='testimonials-two-next'
            onClick={() => sliderRef.current.slickNext()}
            className=' slick-arrow flex-center rounded-circle border border-gray-100 hover-border-main-600 text-xl hover-bg-main-600 hover-text-white transition-1 w-48 h-48'
          >
            <i className='ph ph-caret-right' />
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsTwo;
