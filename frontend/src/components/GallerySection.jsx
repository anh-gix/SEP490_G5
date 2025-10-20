import LightGallery from "lightgallery/react";
import lgThumbnail from "lightgallery/plugins/thumbnail";
import lgZoom from "lightgallery/plugins/zoom";
const GallerySection = () => {
  return (
    <section className='gallery py-120'>
      <div className='container'>
        <div className='container'>
          <div className='section-heading text-center'>
            <div className='flex-align d-inline-flex gap-8 mb-16'>
              <span className='text-main-600 text-2xl d-flex'>
                <i className='ph-bold ph-book-open' />
              </span>
              <h5 className='text-main-600 mb-0'>Gallery</h5>
            </div>
            <h2 className='mb-24'>Explore Our Gallery</h2>
            <p className=''>
              Students can register for the workshops through the EduAll
              platform. Limited seats are available
            </p>
          </div>
          <div className='text-center'>
            <div
              className='nav-tab-wrapper bg-white border border-neutral-40 p-16 mb-40 d-inline-block'
              data-aos='zoom-out'
            >
              <ul
                className='nav nav-pills common-tab edit gap-16'
                id='pills-tab'
                role='tablist'
              >
                <li className='nav-item' role='presentation'>
                  <button
                    className='nav-link rounded-pill bg-main-25 text-md fw-medium text-neutral-500 flex-center w-100 gap-8 active'
                    id='pills-education-tab'
                    data-bs-toggle='pill'
                    data-bs-target='#pills-education'
                    type='button'
                    role='tab'
                    aria-controls='pills-education'
                    aria-selected='true'
                  >
                    <i className='text-xl d-flex text-main-600 ph-bold ph-squares-four' />
                    Online Education
                  </button>
                </li>
                <li className='nav-item' role='presentation'>
                  <button
                    className='nav-link rounded-pill bg-main-25 text-md fw-medium text-neutral-500 flex-center w-100 gap-8'
                    id='pills-University-tab'
                    data-bs-toggle='pill'
                    data-bs-target='#pills-University'
                    type='button'
                    role='tab'
                    aria-controls='pills-University'
                    aria-selected='false'
                  >
                    <i className='text-xl d-flex text-main-600 ph-bold ph-magic-wand' />
                    University
                  </button>
                </li>
                <li className='nav-item' role='presentation'>
                  <button
                    className='nav-link rounded-pill bg-main-25 text-md fw-medium text-neutral-500 flex-center w-100 gap-8'
                    id='pills-Tutors-tab'
                    data-bs-toggle='pill'
                    data-bs-target='#pills-Tutors'
                    type='button'
                    role='tab'
                    aria-controls='pills-Tutors'
                    aria-selected='false'
                  >
                    <i className='text-xl d-flex text-main-600 ph-bold ph-code' />
                    Tutors
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className='tab-content' id='pills-tabContent'>
            <div
              className='tab-pane fade show active'
              id='pills-education'
              role='tabpanel'
              aria-labelledby='pills-education-tab'
              tabIndex={0}
            >
              {/* Masonry Start */}

              <div className='masonry'>
                <LightGallery speed={500} plugins={[lgThumbnail, lgZoom]}>
                  <a
                    className='masonry__item position-relative rounded-12 overflow-hidden'
                    href='assets/images/thumbs/gallery-img1.png'
                  >
                    <img
                      alt='img1'
                      src='assets/images/thumbs/gallery-img1.png'
                    />
                  </a>
                  <a
                    className='masonry__item position-relative rounded-12 overflow-hidden'
                    href='assets/images/thumbs/gallery-img2.png'
                  >
                    <img
                      alt='img2'
                      src='assets/images/thumbs/gallery-img2.png'
                    />
                  </a>
                  <a
                    className='masonry__item position-relative rounded-12 overflow-hidden'
                    href='assets/images/thumbs/gallery-img3.png'
                  >
                    <img
                      alt='img2'
                      src='assets/images/thumbs/gallery-img3.png'
                    />
                  </a>
                  <a
                    className='masonry__item position-relative rounded-12 overflow-hidden'
                    href='assets/images/thumbs/gallery-img4.png'
                  >
                    <img
                      alt='img2'
                      src='assets/images/thumbs/gallery-img4.png'
                    />
                  </a>
                  <a
                    className='masonry__item position-relative rounded-12 overflow-hidden'
                    href='assets/images/thumbs/gallery-img5.png'
                  >
                    <img
                      alt='img2'
                      src='assets/images/thumbs/gallery-img5.png'
                    />
                  </a>
                  <a
                    className='masonry__item position-relative rounded-12 overflow-hidden'
                    href='assets/images/thumbs/gallery-img6.png'
                  >
                    <img
                      alt='img2'
                      src='assets/images/thumbs/gallery-img6.png'
                    />
                  </a>
                  <a
                    className='masonry__item position-relative rounded-12 overflow-hidden'
                    href='assets/images/thumbs/gallery-img7.png'
                  >
                    <img
                      alt='img2'
                      src='assets/images/thumbs/gallery-img7.png'
                    />
                  </a>
                  <a
                    className='masonry__item position-relative rounded-12 overflow-hidden'
                    href='assets/images/thumbs/gallery-img8.png'
                  >
                    <img
                      alt='img2'
                      src='assets/images/thumbs/gallery-img8.png'
                    />
                  </a>
                  <a
                    className='masonry__item position-relative rounded-12 overflow-hidden'
                    href='assets/images/thumbs/gallery-img9.png'
                  >
                    <img
                      alt='img2'
                      src='assets/images/thumbs/gallery-img9.png'
                    />
                  </a>
                </LightGallery>
              </div>
              {/* Masonry End */}
            </div>
            <div
              className='tab-pane fade'
              id='pills-University'
              role='tabpanel'
              aria-labelledby='pills-University-tab'
              tabIndex={0}
            >
              {/* Masonry Start */}
              <div className='masonry'>
                <LightGallery speed={500} plugins={[lgThumbnail, lgZoom]}>
                  <a
                    className='masonry__item position-relative rounded-12 overflow-hidden'
                    href='assets/images/thumbs/gallery-img1.png'
                  >
                    <img
                      alt='img1'
                      src='assets/images/thumbs/gallery-img1.png'
                    />
                  </a>
                  <a
                    className='masonry__item position-relative rounded-12 overflow-hidden'
                    href='assets/images/thumbs/gallery-img2.png'
                  >
                    <img
                      alt='img2'
                      src='assets/images/thumbs/gallery-img2.png'
                    />
                  </a>
                  <a
                    className='masonry__item position-relative rounded-12 overflow-hidden'
                    href='assets/images/thumbs/gallery-img3.png'
                  >
                    <img
                      alt='img2'
                      src='assets/images/thumbs/gallery-img3.png'
                    />
                  </a>
                  <a
                    className='masonry__item position-relative rounded-12 overflow-hidden'
                    href='assets/images/thumbs/gallery-img4.png'
                  >
                    <img
                      alt='img2'
                      src='assets/images/thumbs/gallery-img4.png'
                    />
                  </a>
                  <a
                    className='masonry__item position-relative rounded-12 overflow-hidden'
                    href='assets/images/thumbs/gallery-img5.png'
                  >
                    <img
                      alt='img2'
                      src='assets/images/thumbs/gallery-img5.png'
                    />
                  </a>
                  <a
                    className='masonry__item position-relative rounded-12 overflow-hidden'
                    href='assets/images/thumbs/gallery-img6.png'
                  >
                    <img
                      alt='img2'
                      src='assets/images/thumbs/gallery-img6.png'
                    />
                  </a>
                  <a
                    className='masonry__item position-relative rounded-12 overflow-hidden'
                    href='assets/images/thumbs/gallery-img7.png'
                  >
                    <img
                      alt='img2'
                      src='assets/images/thumbs/gallery-img7.png'
                    />
                  </a>
                  <a
                    className='masonry__item position-relative rounded-12 overflow-hidden'
                    href='assets/images/thumbs/gallery-img8.png'
                  >
                    <img
                      alt='img2'
                      src='assets/images/thumbs/gallery-img8.png'
                    />
                  </a>
                  <a
                    className='masonry__item position-relative rounded-12 overflow-hidden'
                    href='assets/images/thumbs/gallery-img9.png'
                  >
                    <img
                      alt='img2'
                      src='assets/images/thumbs/gallery-img9.png'
                    />
                  </a>
                </LightGallery>
              </div>
              {/* Masonry End */}
            </div>
            <div
              className='tab-pane fade'
              id='pills-Tutors'
              role='tabpanel'
              aria-labelledby='pills-Tutors-tab'
              tabIndex={0}
            >
              {/* Masonry Start */}
              <div className='masonry'>
                <LightGallery speed={500} plugins={[lgThumbnail, lgZoom]}>
                  <a
                    className='masonry__item position-relative rounded-12 overflow-hidden'
                    href='assets/images/thumbs/gallery-img1.png'
                  >
                    <img
                      alt='img1'
                      src='assets/images/thumbs/gallery-img1.png'
                    />
                  </a>
                  <a
                    className='masonry__item position-relative rounded-12 overflow-hidden'
                    href='assets/images/thumbs/gallery-img2.png'
                  >
                    <img
                      alt='img2'
                      src='assets/images/thumbs/gallery-img2.png'
                    />
                  </a>
                  <a
                    className='masonry__item position-relative rounded-12 overflow-hidden'
                    href='assets/images/thumbs/gallery-img3.png'
                  >
                    <img
                      alt='img2'
                      src='assets/images/thumbs/gallery-img3.png'
                    />
                  </a>
                  <a
                    className='masonry__item position-relative rounded-12 overflow-hidden'
                    href='assets/images/thumbs/gallery-img4.png'
                  >
                    <img
                      alt='img2'
                      src='assets/images/thumbs/gallery-img4.png'
                    />
                  </a>
                  <a
                    className='masonry__item position-relative rounded-12 overflow-hidden'
                    href='assets/images/thumbs/gallery-img5.png'
                  >
                    <img
                      alt='img2'
                      src='assets/images/thumbs/gallery-img5.png'
                    />
                  </a>
                  <a
                    className='masonry__item position-relative rounded-12 overflow-hidden'
                    href='assets/images/thumbs/gallery-img6.png'
                  >
                    <img
                      alt='img2'
                      src='assets/images/thumbs/gallery-img6.png'
                    />
                  </a>
                  <a
                    className='masonry__item position-relative rounded-12 overflow-hidden'
                    href='assets/images/thumbs/gallery-img7.png'
                  >
                    <img
                      alt='img2'
                      src='assets/images/thumbs/gallery-img7.png'
                    />
                  </a>
                  <a
                    className='masonry__item position-relative rounded-12 overflow-hidden'
                    href='assets/images/thumbs/gallery-img8.png'
                  >
                    <img
                      alt='img2'
                      src='assets/images/thumbs/gallery-img8.png'
                    />
                  </a>
                  <a
                    className='masonry__item position-relative rounded-12 overflow-hidden'
                    href='assets/images/thumbs/gallery-img9.png'
                  >
                    <img
                      alt='img2'
                      src='assets/images/thumbs/gallery-img9.png'
                    />
                  </a>
                </LightGallery>
              </div>
              {/* Masonry End */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
