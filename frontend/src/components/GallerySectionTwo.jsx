import { Link } from "react-router-dom";

const GallerySectionTwo = () => {
  return (
    <section className='py-120'>
      <div className='container'>
        <div className='max-w-611 text-center mx-auto mb-60'>
          <div
            className='text-20 fw-semibold text-main-600 d-flex gap-8 mb-16 justify-content-center'
            data-aos='fade-down'
          >
            <span>
              <i className='ph-bold ph-book' />
            </span>
            <span>Highlights Activities</span>
          </div>
          <h2 className='text-neutral-700 mb-24 wow bounceIn'>
            Showcasing Gallery
          </h2>
          <p className='text-16 fw-normal wow bounceInUp'>
            We showcase the unforgettable moments, inspiring events, and dynamic
            experiences that make our community truly unique.
          </p>
        </div>
        <div className=' mb-40'>
          <div className='row gy-4'>
            <div className='col-xl-4'>
              <div
                className='item-hover position-relative wow bounceIn'
                data-wow-duration='3s'
              >
                <img
                  src='assets/images/thumbs/gallery-five-img1.png'
                  alt=''
                  className='w-100 h-100'
                />
                <div className='bg-color-main-500 w-100 h-100 d-flex align-items-center justify-content-center position-absolute top-0 start-0 transfrom-scale-0 group-hover-transform transition-04'>
                  <a
                    href='https://www.instagram.com'
                    className='text-68 text-white'
                  >
                    <i className='ph ph-instagram-logo' />
                  </a>
                </div>
              </div>
            </div>
            <div className='col-xl-8'>
              <div
                className='item-hover mb-24 position-relative wow bounceIn'
                data-wow-duration='3s'
              >
                <img
                  src='assets/images/thumbs/gallery-five-im2.png'
                  alt=''
                  className='w-100 h-100'
                />
                <div className='bg-color-main-500 w-100 h-100 d-flex align-items-center justify-content-center position-absolute top-0 start-0 transfrom-scale-0 group-hover-transform transition-04'>
                  <a
                    href='https://www.instagram.com'
                    className='text-68 text-white'
                  >
                    <i className='ph ph-instagram-logo' />
                  </a>
                </div>
              </div>
              <div className='d-flex gap-16 flex-wrap'>
                <div
                  className='item-hover position-relative'
                  data-aos='fade-right'
                >
                  <img
                    src='assets/images/thumbs/gallery-five-img3.png'
                    alt=''
                    className='w-100 h-100'
                  />
                  <div className='bg-color-main-500 w-100 h-100 d-flex align-items-center justify-content-center position-absolute top-0 start-0 transfrom-scale-0 group-hover-transform transition-04'>
                    <a
                      href='https://www.instagram.com'
                      className='text-68 text-white'
                    >
                      <i className='ph ph-instagram-logo' />
                    </a>
                  </div>
                </div>
                <div
                  className='item-hover position-relative'
                  data-aos='fade-left'
                >
                  <img
                    src='assets/images/thumbs/gallery-five-img4.png'
                    alt=''
                    className='w-100 h-100'
                  />
                  <div className='bg-color-main-500 w-100 h-100 d-flex align-items-center justify-content-center position-absolute top-0 start-0 transfrom-scale-0 group-hover-transform transition-04'>
                    <a
                      href='https://www.instagram.com'
                      className='text-68 text-white'
                    >
                      <i className='ph ph-instagram-logo' />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='justify-content-center text-center mx-auto'>
          <Link
            to='#'
            className='border-main-600 border py-16 fw-semibold text-16 px-32 d-inline-flex rounded-pill hover-bg-main-50 align-items-center gap-8 wow bounceIn'
            data-wow-duration='3s'
          >
            See All Image
            <span>
              <i className='ph-bold ph-arrow-up-right' />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default GallerySectionTwo;
