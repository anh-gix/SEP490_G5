const JoinCommunityOne = () => {
  return (
    <section className='join-community'>
      <div className='container container--lg'>
        <div className='bg-main-25 rounded-20 py-120 px-8'>
          <div className='container'>
            <div className='row gy-4 align-items-center'>
              <div className='col-lg-6'>
                <div className='join-community__content'>
                  <div className='mb-40'>
                    <h2 className='mb-24 wow bounceIn'>
                      Tham Gia Cộng Đồng EduAll: Bắt Đầu Ngay
                    </h2>
                    <p className='text-neutral-500 text-line-2 wow bounceInUp'>
                      Sẵn sàng khám phá các khóa học của chúng tôi trực tiếp? Đăng ký
                      bài học thử miễn phí ngay hôm nay và trải nghiệm sự thú vị.
                    </p>
                  </div>
                  <form action='#'>
                    <div
                      className='mb-24 position-relative'
                      data-aos='fade-up-left'
                      data-aos-duration={400}
                    >
                      <input
                        type='text'
                        className='bg-white text-black border border-transparent focus-border-main-600 h-48 rounded-pill px-16 ps-60 outline-0 w-100'
                        placeholder='Nhập tên...'
                      />
                      <span className='bg-white text-neutral-200 text-2xl flex-center w-48 h-48 rounded-circle border border-main-25 border-4 position-absolute inset-inline-start-0 top-50 translate-middle-y'>
                        <i className='ph-bold ph-user-circle' />
                      </span>
                    </div>
                    <div
                      className='mb-24 position-relative'
                      data-aos='fade-up-left'
                      data-aos-duration={600}
                    >
                      <input
                        type='email'
                        className='bg-white text-black border border-transparent focus-border-main-600 h-48 rounded-pill px-16 ps-60 outline-0 w-100'
                        placeholder='Nhập Email'
                      />
                      <span className='bg-white text-neutral-200 text-2xl flex-center w-48 h-48 rounded-circle border border-main-25 border-4 position-absolute inset-inline-start-0 top-50 translate-middle-y'>
                        <i className='ph-bold ph-envelope-open' />
                      </span>
                    </div>
                    <div
                      className='mb-24 position-relative'
                      data-aos='fade-up-left'
                      data-aos-duration={800}
                    >
                      <select className='bg-white text-black border border-transparent focus-border-main-600 h-48 rounded-pill px-16 ps-60 outline-0 w-100 text-neutral-300'>
                        <option value={1}>Nhà Phát Triển Front End</option>
                        <option value={1}>Nhà Phát Triển Back End</option>
                        <option value={1}>Nhà Thiết Kế UX/UI</option>
                      </select>
                      <span className='bg-white text-neutral-200 text-2xl flex-center w-48 h-48 rounded-circle border border-main-25 border-4 position-absolute inset-inline-start-0 top-50 translate-middle-y'>
                        <i className='ph-bold ph-book' />
                      </span>
                    </div>
                    <div
                      className='mt-40 position-relative'
                      data-aos='fade-up-left'
                      data-aos-duration={1000}
                    >
                      <button
                        type='submit'
                        className='btn btn-main rounded-pill flex-align d-inline-flex gap-8'
                      >
                        Tham Gia Ngay
                        <i className='ph-bold ph-arrow-up-right d-flex text-lg' />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              <div className='col-lg-6'>
                <div className='join-community__thumb text-end position-relative'>
                  <img
                    src='assets/images/thumbs/join-community-img.png'
                    alt=''
                    className='wow bounceIn'
                    data-tilt=''
                    data-tilt-max={12}
                    data-tilt-speed={500}
                    data-tilt-perspective={5000}
                    data-tilt-full-page-listening=''
                  />
                  <div className='offer-message style-two px-24 py-12 rounded-12 bg-white fw-medium flex-align d-inline-flex gap-16 box-shadow-lg animation-upDown'>
                    <span className='banner-box__icon flex-shrink-0 w-48 h-48 bg-purple-400 text-white text-2xl flex-center rounded-circle'>
                      <i className='ph-bold ph-users' />
                    </span>
                    <div className='text-start'>
                      <h6 className='mb-4'>56K</h6>
                      <span className=''>Tất Cả Học Viên</span>
                    </div>
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

export default JoinCommunityOne;

