const CertificateThree = () => {
  return (
    <div className='certificate overflow-hidden'>
      <div className='container container--lg'>
        <div className='certificate-box px-16 bg-main-600 rounded-16'>
          <div className='container'>
            <div className='position-relative py-80'>
              <div className='row align-items-center'>
                <div className='col-xl-6'>
                  <div className='certificate__content'>
                    <h2 className='text-white mb-16 fw-medium wow bounceInRight'>
                      Subscribe for newsletters
                    </h2>
                    <p className='text-white wow bounceInUp'>
                      Subscribe Our Newsletter For Latest Updates
                    </p>
                    <form
                      action='#'
                      className='position-relative mt-40 wow bounceInRight'
                    >
                      <input
                        type='text'
                        className='common-input rounded-pill pe-44'
                        placeholder='Enter Email...'
                      />
                      <button
                        type='submit'
                        className='w-32 h-32 bg-main-600 hover-bg-main-700 rounded-circle flex-center text-lg text-white position-absolute top-50 translate-middle-y inset-inline-end-0 me-8'
                      >
                        <i className='ph ph-paper-plane-tilt' />
                      </button>
                    </form>
                    <div className='flex-align gap-8 text-white mt-24 wow bounceInUp'>
                      <i className=' text-2xl ph-fill ph-check-circle' />
                      <p className=''>I agree with privacy policy and terms</p>
                    </div>
                  </div>
                </div>
                <div className='col-xl-6 d-xl-block d-none'>
                  <div className='certificate__thumb' data-aos='fade-up'>
                    <img
                      src='assets/images/thumbs/newsletter-two-img.png'
                      alt=''
                      data-tilt=''
                      data-tilt-max={8}
                      data-tilt-speed={500}
                      data-tilt-perspective={5000}
                      data-tilt-full-page-listening=''
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateThree;
