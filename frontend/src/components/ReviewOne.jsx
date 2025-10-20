import Slider from "react-slick";

const ReviewOne = () => {
  const settings = {
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 2000,
    speed: 900,
    dots: true,
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
    <section className='review py-120 bg-main-25 overflow-hidden'>
      <div className='container'>
        <div className='section-heading text-center'>
          <div className='flex-align d-inline-flex gap-8 mb-16 wow fadeInDown'>
            <span className='text-main-600 text-2xl d-flex'>
              <i className='ph-bold ph-book-open' />
            </span>
            <h5 className='text-main-600 mb-0'>People Love Us!</h5>
          </div>
          <h2 className='mb-24 wow fadeIn'>What Our Satisfied Say</h2>
          <p className='wow fadeInUp'>
            Our students' success stories speak volumes. Here are just a few
            testimonials from our satisfied learners
          </p>
        </div>
        <div className='position-relative z-1'>
          <img
            src='assets/images/shapes/shape2.png'
            alt=''
            className='shape two style-left animation-scalation'
          />
          <img
            src='assets/images/shapes/shape6.png'
            alt=''
            className='shape four style-top animation-scalation'
          />
          <img
            src='assets/images/shapes/shape2.png'
            alt=''
            className='shape four style-right animation-scalation'
          />
          <div className='row gy-4'>
            <div
              className='col-lg-6'
              data-aos='fade-up'
              data-aos-duration={600}
            >
              <div className='bg-white p-32 rounded-12 box-shadow-md'>
                <h4 className='text-center mb-32'>
                  What our Parents say about us
                </h4>
                <Slider {...settings} className='review-slider'>
                  <div className='rounded-12 p-32 text-center transition-2 item-hover bg-main-25 hover-bg-main-600'>
                    <span className='w-120 h-120 rounded-circle overflow-hidden d-inline-flex'>
                      <img
                        src='assets/images/thumbs/testimonials-three-img1.png'
                        alt=''
                        className='cover-img'
                      />
                    </span>
                    <h4 className='mt-24 mb-8 item-hover__text transition-2'>
                      Robiul Hasan
                    </h4>
                    <span className='text-neutral-500 d-block item-hover__text transition-2'>
                      Front End Developer
                    </span>
                    <ul className='flex-align d-inline-flex gap-8 my-24'>
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
                        <i className='ph-fill ph-star' />
                      </li>
                    </ul>
                    <p className='text-xl-res item-hover__text transition-2'>
                      "I've taken several courses through, and each one has
                      exceeded my expectations. I've gained valuable skills that
                      have helped me advance in my career. Highly recommend!"
                    </p>
                  </div>
                  <div className='rounded-12 p-32 text-center transition-2 item-hover bg-main-two-25 hover-bg-main-two-600'>
                    <span className='w-120 h-120 rounded-circle overflow-hidden d-inline-flex'>
                      <img
                        src='assets/images/thumbs/testimonials-three-img4.png'
                        alt=''
                        className='cover-img'
                      />
                    </span>
                    <h4 className='mt-24 mb-8 item-hover__text transition-2'>
                      Floyd Miles
                    </h4>
                    <span className='text-neutral-500 d-block item-hover__text transition-2'>
                      Doctor
                    </span>
                    <ul className='flex-align d-inline-flex gap-8 my-24'>
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
                        <i className='ph-fill ph-star' />
                      </li>
                    </ul>
                    <p className='text-xl-res item-hover__text transition-2'>
                      "I've taken several courses through, and each one has
                      exceeded my expectations. I've gained valuable skills that
                      have helped me advance in my career. Highly recommend!"
                    </p>
                  </div>
                  <div className='rounded-12 p-32 text-center transition-2 item-hover bg-main-25 hover-bg-main-600'>
                    <span className='w-120 h-120 rounded-circle overflow-hidden d-inline-flex'>
                      <img
                        src='assets/images/thumbs/testimonials-three-img3.png'
                        alt=''
                        className='cover-img'
                      />
                    </span>
                    <h4 className='mt-24 mb-8 item-hover__text transition-2'>
                      Nora Fatehi
                    </h4>
                    <span className='text-neutral-500 d-block item-hover__text transition-2'>
                      Engineer
                    </span>
                    <ul className='flex-align d-inline-flex gap-8 my-24'>
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
                        <i className='ph-fill ph-star' />
                      </li>
                    </ul>
                    <p className='text-xl-res item-hover__text transition-2'>
                      "I've taken several courses through, and each one has
                      exceeded my expectations. I've gained valuable skills that
                      have helped me advance in my career. Highly recommend!"
                    </p>
                  </div>
                </Slider>
              </div>
            </div>
            <div
              className='col-lg-6'
              data-aos='fade-up'
              data-aos-duration={1000}
            >
              <div className='bg-white p-32 rounded-12 box-shadow-md'>
                <h4 className='text-center mb-32'>
                  What our Tutors say about us
                </h4>
                <Slider {...settings} className='review-slider-two'>
                  <div className='rounded-12 p-32 text-center transition-2 item-hover bg-main-25 hover-bg-main-600'>
                    <span className='w-120 h-120 rounded-circle overflow-hidden d-inline-flex'>
                      <img
                        src='assets/images/thumbs/testimonials-three-img2.png'
                        alt=''
                        className='cover-img'
                      />
                    </span>
                    <h4 className='mt-24 mb-8 item-hover__text transition-2'>
                      Kathryn Murphy
                    </h4>
                    <span className='text-neutral-500 d-block item-hover__text transition-2'>
                      Graphic Designer
                    </span>
                    <ul className='flex-align d-inline-flex gap-8 my-24'>
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
                        <i className='ph-fill ph-star' />
                      </li>
                    </ul>
                    <p className='text-xl-res item-hover__text transition-2'>
                      "I've taken several courses through, and each one has
                      exceeded my expectations. I've gained valuable skills that
                      have helped me advance in my career. Highly recommend!"
                    </p>
                  </div>
                  <div className='rounded-12 p-32 text-center transition-2 item-hover bg-main-two-25 hover-bg-main-two-600'>
                    <span className='w-120 h-120 rounded-circle overflow-hidden d-inline-flex'>
                      <img
                        src='assets/images/thumbs/testimonials-three-img3.png'
                        alt=''
                        className='cover-img'
                      />
                    </span>
                    <h4 className='mt-24 mb-8 item-hover__text transition-2'>
                      Sarah L.
                    </h4>
                    <span className='text-neutral-500 d-block item-hover__text transition-2'>
                      WP Developer
                    </span>
                    <ul className='flex-align d-inline-flex gap-8 my-24'>
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
                        <i className='ph-fill ph-star' />
                      </li>
                    </ul>
                    <p className='text-xl-res item-hover__text transition-2'>
                      "I've taken several courses through, and each one has
                      exceeded my expectations. I've gained valuable skills that
                      have helped me advance in my career. Highly recommend!"
                    </p>
                  </div>
                  <div className='rounded-12 p-32 text-center transition-2 item-hover bg-main-25 hover-bg-main-600'>
                    <span className='w-120 h-120 rounded-circle overflow-hidden d-inline-flex'>
                      <img
                        src='assets/images/thumbs/testimonials-three-img3.png'
                        alt=''
                        className='cover-img'
                      />
                    </span>
                    <h4 className='mt-24 mb-8 item-hover__text transition-2'>
                      Nora Fatehi
                    </h4>
                    <span className='text-neutral-500 d-block item-hover__text transition-2'>
                      Engineer
                    </span>
                    <ul className='flex-align d-inline-flex gap-8 my-24'>
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
                        <i className='ph-fill ph-star' />
                      </li>
                    </ul>
                    <p className='text-xl-res item-hover__text transition-2'>
                      "I've taken several courses through, and each one has
                      exceeded my expectations. I've gained valuable skills that
                      have helped me advance in my career. Highly recommend!"
                    </p>
                  </div>
                </Slider>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewOne;
