const InfoTwo = () => {
  return (
    <section className='info-two half-bg'>
      <div className='container'>
        <div className='bg-white box-shadow-md rounded-16 p-16'>
          <div className='row gy-4 justify-content-center'>
            <div
              className='col-xl-4 col-sm-6'
              data-aos='fade-up'
              data-aos-duration={400}
            >
              <div className='info-two-item flex-align animation-item h-100 gap-28 border border-neutral-30 rounded-12 bg-main-25'>
                <span className='flex-shrink-0'>
                  <img
                    src='assets/images/icons/info-two-icon1.png'
                    className='animate__heartBeat'
                    alt=''
                  />
                </span>
                <div>
                  <h4 className='mb-16'>Scholarship Facility</h4>
                  <p className='text-neutral-700'>
                    These facilities provide students with an inspiring{" "}
                  </p>
                </div>
              </div>
            </div>
            <div
              className='col-xl-4 col-sm-6'
              data-aos='fade-up'
              data-aos-duration={600}
            >
              <div className='info-two-item flex-align animation-item h-100 gap-28 border border-neutral-30 rounded-12 bg-main-two-25'>
                <span className='flex-shrink-0'>
                  <img
                    src='assets/images/icons/info-two-icon2.png'
                    className='animate__heartBeat'
                    alt=''
                  />
                </span>
                <div>
                  <h4 className='mb-16'>Esteemed Faculty</h4>
                  <p className='text-neutral-700'>
                    Our university boasts a team of renowned faculty members
                  </p>
                </div>
              </div>
            </div>
            <div
              className='col-xl-4 col-sm-6'
              data-aos='fade-up'
              data-aos-duration={800}
            >
              <div className='info-two-item flex-align animation-item h-100 gap-28 border border-neutral-30 rounded-12 bg-main-three-25'>
                <span className='flex-shrink-0'>
                  <img
                    src='assets/images/icons/info-two-icon3.png'
                    className='animate__heartBeat'
                    alt=''
                  />
                </span>
                <div>
                  <h4 className='mb-16'>Diverse Programs</h4>
                  <p className='text-neutral-700'>
                    From undergraduate degrees to postgraduate research{" "}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InfoTwo;
