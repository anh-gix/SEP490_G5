import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const BannerFive = () => {
  const textRef = useRef(null);

  useEffect(() => {
    const textEl = textRef.current;
    if (textEl) {
      const text = textEl.innerText;
      textEl.innerHTML = text
        .split("")
        .map(
          (char, i) =>
            `<span style="transform:rotate(${i * 11.5}deg)">${char}</span>`
        )
        .join("");
    }
  }, []);

  return (
    <section
      className='padding-top-100-px bg-img position-relative z-1'
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
        className='animation-scalation d-sm-block d-none top-35-percent right-5-percent position-absolute z-n1'
      />
      <img
        src='assets/images/shapes/shape6.png'
        alt=''
        className='animation-scalation d-sm-block d-none left-3-percent bottom-18-percent position-absolute z-n1'
      />
      <img
        src='assets/images/shapes/shape5.png'
        alt=''
        className='animation-walking d-sm-block d-none bottom-10-percent left-17-percent position-absolute z-n1'
      />
      <img
        src='assets/images/shapes/shape4.png'
        alt=''
        className='animation-scalation d-sm-block d-none left-7-percent bottom-10-percent position-absolute z-n1'
      />
      <img
        src='assets/images/shapes/shape4.png'
        alt=''
        className='animation-scalation d-sm-block d-none bottom-14-percent left-65-percent position-absolute z-n1'
      />
      <img
        src='assets/images/shapes/shape4.png'
        alt=''
        className='animation-scalation d-sm-block d-none top-55-percent left-30-percent position-absolute z-n1'
      />
      <img
        src='assets/images/shapes/shape3.png'
        alt=''
        className='animation-walking d-sm-block d-none top-55-percent left-57-percent position-absolute z-n1'
      />
      <img
        src='assets/images/shapes/curve-arrow.png'
        alt=''
        className='animate__wobble__two d-sm-block d-none left-75-percent top-18-percent position-absolute z-n1'
      />
      <div className='circle static-circle border-main-600 border top-18-percent left-83-percent position-absolute'>
        <div className='circle__badge'>
          <div className='px-12 py-12 border-main-600 border rounded-circle d-inline-block'>
            <span className='px-10 py-10 flex-shrink-0 text-white bg-main-600 rounded-circle justify-content-center align-items-center d-inline-flex'>
              <i className='ph-bold ph-arrow-up-right'></i>
            </span>
          </div>
        </div>
        <div ref={textRef} className='circle__text text-main-600 fw-semibold'>
          <p>EXPLORE MORE . EXPLORE MORE .</p>
        </div>
      </div>
      <div>
        <img
          src='assets/images/thumbs/banner-5-img1.png'
          alt=''
          className='position-absolute top-0 start-0 z-n1 ms-148-px d-xl-block d-none tw-max-width-22 padding-top-100-px wow bounceIn'
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
          src='assets/images/thumbs/banner-5-img2.png'
          alt=''
          className='position-absolute bottom-0 end-0  z-n1 me-148-px d-xl-block d-none tw-max-width-22 wow bounceIn'
          data-wow-duration='3s'
        />
      </div>
    </section>
  );
};

export default BannerFive;
