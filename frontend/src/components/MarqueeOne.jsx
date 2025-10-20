import React from "react";
import Marquee from "react-fast-marquee";

const MarqueeOne = () => {
  return (
    <div className='py-24 bg-main-05 overflow-hidden'>
      <div className='marquee-area'>
        <div className='container-fluid p-0'>
          <div className='slider__marquee style2'>
            <div className='marquee_mode'>
              <Marquee>
                <div className='item d-flex gap-32'>
                  <img src='assets/images/icons/marquee-star-img.png' alt='' />
                  <img src='assets/images/logo/marquee-img-1.png' alt='' />
                </div>
                <div className='item d-flex gap-32'>
                  <img src='assets/images/icons/marquee-star-img.png' alt='' />
                  <img src='assets/images/logo/marquee-img-2.png' alt='' />
                </div>
                <div className='item d-flex gap-32'>
                  <img src='assets/images/icons/marquee-star-img.png' alt='' />
                  <img src='assets/images/logo/marquee-img-6.png' alt='' />
                </div>
                <div className='item d-flex gap-32'>
                  <img src='assets/images/icons/marquee-star-img.png' alt='' />
                  <img src='assets/images/logo/marquee-img-3.png' alt='' />
                </div>
                <div className='item d-flex gap-32'>
                  <img src='assets/images/icons/marquee-star-img.png' alt='' />
                  <img src='assets/images/logo/marquee-img-3.png' alt='' />
                </div>
              </Marquee>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarqueeOne;
