import React from "react";
import { Link } from "react-router-dom";

const ChildFuture = () => {
  return (
    <section className='z-1 overflow-hidden'>
      <div className='container'>
        <div>
          <div className='d-flex justify-content-between mb-60 align-items-center flex-wrap gap-20'>
            <div>
              <div
                className='fw-semibold text-main-800 text-xl d-flex align-content-center gap-8 mb-16 flex-wrap'
                data-aos='fade-down'
              >
                <span>
                  <i className='ph-bold ph-book-open' />
                </span>
                <span>Unlocking Your Child's Futures</span>
              </div>
              <h2 className='fw-semibold heading-three text-neutral-700 mb-2 wow bounceIn'>
                Best Learning Platform For Kid`s
              </h2>
            </div>
            <div className='max-w-416-px'>
              <p className='tw-text-base fw-normal text-neutral-700 mb-40 wow bounceInUp'>
                Explore new skills, deepen existing passions, and get lost in
                creativity. What you find just might...
              </p>
              <Link
                to='/course'
                className='fw-semibold py-16 px-32 border border-main-600 rounded-pill hover-bg-main-50 '
              >
                Browse Courses
              </Link>
            </div>
          </div>
          <div className='pt-30'>
            <div className='row gy-4'>
              <div
                className='col-lg-4 col-md-6'
                data-aos='fade-up'
                data-aos-duration={700}
              >
                <div className='animation-item position-relative margin-top-94px padding-block-end-90px'>
                  <img
                    src='assets/images/bg/child-futures-six-bg-img3.png'
                    alt=''
                    className=' position-absolute translate-middle inset-inline-start-50-percent top-50 z-n1'
                  />
                  <div className='position-relative mb-24 transform-translate-y-94px text-center'>
                    <img
                      src='assets/images/shapes/child-future-head-bg-img1.png'
                      alt=''
                      className='z-1'
                    />
                    <div className=''>
                      <img
                        src='assets/images/thumbs/child-img1.png'
                        alt=''
                        className=' animate__wobble position-absolute translate-middle inset-inline-start-50-percent top-50'
                      />
                    </div>
                  </div>
                  <div className='text-center margin-top--94px'>
                    <span className='text-18 fw-semibold text-neutral-900 mb-12'>
                      2-3 Years
                    </span>
                    <h3 className='mb-16'>Play Group</h3>
                    <p className='text-16 fw-normal text-neutral-900 max-w-240-px mx-auto text-line-3'>
                      A safe and joyful space where 2-3-year-olds learn, play,
                      and grow together!
                    </p>
                  </div>
                </div>
              </div>
              <div
                className='col-lg-4 col-md-6'
                data-aos='fade-up'
                data-aos-duration={700}
              >
                <div className='animation-item position-relative margin-top-94px padding-block-end-90px'>
                  <img
                    src='assets/images/bg/child-futures-six-bg-img2.png'
                    alt=''
                    className=' position-absolute translate-middle inset-inline-start-50-percent top-50 z-n1'
                  />
                  <div className='position-relative mb-24 transform-translate-y-94px text-center'>
                    <img
                      src='assets/images/shapes/child-future-head-bg-img2.png'
                      alt=''
                      className='z-1'
                    />
                    <div className=''>
                      <img
                        src='assets/images/thumbs/child-img2.png'
                        alt=''
                        className=' animate__wobble position-absolute translate-middle inset-inline-start-50-percent top-50'
                      />
                    </div>
                  </div>
                  <div className='text-center margin-top--94px'>
                    <span className='text-18 fw-semibold text-neutral-900 mb-12'>
                      2-3 Years
                    </span>
                    <h3 className='mb-16'>Junior KG</h3>
                    <p className='text-16 fw-normal text-neutral-900 max-w-240-px mx-auto text-line-3'>
                      Engaging and interactive learning for 3-4-year-olds,
                      building a strong foundation for growth!
                    </p>
                  </div>
                </div>
              </div>
              <div
                className='col-lg-4 col-md-6'
                data-aos='fade-up'
                data-aos-duration={700}
              >
                <div className='animation-item position-relative margin-top-94px padding-block-end-90px'>
                  <img
                    src='assets/images/bg/child-futures-six-bg-img1.png'
                    alt=''
                    className=' position-absolute translate-middle inset-inline-start-50-percent top-50 z-n1'
                  />
                  <div className='position-relative mb-24 transform-translate-y-94px text-center'>
                    <img
                      src='assets/images/shapes/child-future-head-bg-img3.png'
                      alt=''
                      className='z-1'
                    />
                    <div className=''>
                      <img
                        src='assets/images/thumbs/child-img3.png'
                        alt=''
                        className=' animate__wobble position-absolute translate-middle inset-inline-start-50-percent top-50'
                      />
                    </div>
                  </div>
                  <div className='text-center margin-top--94px'>
                    <span className='text-18 fw-semibold text-neutral-900 mb-12'>
                      4-5 Years
                    </span>
                    <h3 className='mb-16'>Senior KG</h3>
                    <p className='text-16 fw-normal text-neutral-900 max-w-240-px mx-auto text-line-3'>
                      A dynamic program for 4-5-year-olds, fostering critical
                      thinking and readiness.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChildFuture;
