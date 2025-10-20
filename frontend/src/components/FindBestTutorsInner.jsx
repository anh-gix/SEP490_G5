const FindBestTutorsInner = () => {
  return (
    <section className='py-120'>
      <div className='container'>
        <div className='border border-neutral-30 rounded-12 bg-main-25 p-24 bg-main-25'>
          <form action='#'>
            <h3 className='mb-24'>Find Best Tutors</h3>
            {/* Find Tutors Start */}
            <div className='border border-neutral-30 rounded-12 bg-white p-24'>
              <h5 className='mb-0'>Fill Up Info</h5>
              <span className='d-block border border-main-50 my-24 border-dashed' />
              <div className='row gy-4'>
                <div className='col-sm-6'>
                  <label
                    htmlFor='location'
                    className='text-neutral-700 text-lg fw-medium mb-12'
                  >
                    Location{" "}
                  </label>
                  <input
                    type='text'
                    className='common-input bg-main-25 rounded-pill border-transparent focus-border-main-600'
                    id='location'
                    placeholder='Enter location...'
                  />
                </div>
                <div className='col-sm-6'>
                  <label
                    htmlFor='selectLanguage'
                    className='text-neutral-700 text-lg fw-medium mb-12'
                  >
                    Select Language <span className='text-danger-600'>*</span>{" "}
                  </label>
                  <select
                    className='common-input bg-main-25 rounded-pill border-transparent focus-border-main-600 form-select py-14'
                    id='selectLanguage'
                    defaultValue='Select language'
                  >
                    <option value='Select language'>Select language</option>
                    <option value='Bangla'>Bangla</option>
                    <option value='Urdhu'>Urdhu</option>
                    <option value='English'>English</option>
                    <option value='Spenish'>Spenish</option>
                  </select>
                </div>
                <div className='col-sm-12'>
                  <label className='text-neutral-700 text-lg fw-medium mb-12'>
                    Gender <span className='text-danger-600'>*</span>{" "}
                  </label>
                  <div className='flex-align gap-24'>
                    <div className='form-check common-check common-radio mb-0'>
                      <input
                        className='form-check-input'
                        type='radio'
                        name='gender'
                        id='Male'
                      />
                      <label
                        className='form-check-label fw-normal flex-grow-1'
                        htmlFor='Male'
                      >
                        Male
                      </label>
                    </div>
                    <div className='form-check common-check common-radio mb-0'>
                      <input
                        className='form-check-input'
                        type='radio'
                        name='gender'
                        id='Female'
                      />
                      <label
                        className='form-check-label fw-normal flex-grow-1'
                        htmlFor='Female'
                      >
                        Female
                      </label>
                    </div>
                  </div>
                </div>
                <div className='col-sm-6'>
                  <label
                    htmlFor='selectDep'
                    className='text-neutral-700 text-lg fw-medium mb-12'
                  >
                    Select Department <span className='text-danger-600'>*</span>{" "}
                  </label>
                  <select
                    className='common-input bg-main-25 rounded-pill border-transparent focus-border-main-600 form-select py-14'
                    id='selectDep'
                    defaultValue='Select Department'
                  >
                    <option value='Select Department'>Select Department</option>
                    <option value='Arts'>Arts</option>
                    <option value='Science'>Science</option>
                    <option value='Commerce'>Commerce</option>
                  </select>
                </div>
                <div className='col-sm-6'>
                  <label
                    htmlFor='selectSub'
                    className='text-neutral-700 text-lg fw-medium mb-12'
                  >
                    Select Department <span className='text-danger-600'>*</span>{" "}
                  </label>
                  <select
                    className='common-input bg-main-25 rounded-pill border-transparent focus-border-main-600 form-select py-14'
                    id='selectSub'
                    defaultValue='Select Subject'
                  >
                    <option value='Select Subject'>Select Subject</option>
                    <option value='English'>English</option>
                    <option value='Bangla'>Bangla</option>
                    <option value='Social Science'>Social Science</option>
                    <option value='Ecomomics'>Ecomomics</option>
                    <option value='Math'>Math</option>
                  </select>
                </div>
                <div className='col-sm-6'>
                  <label
                    htmlFor='selectCountry'
                    className='text-neutral-700 text-lg fw-medium mb-12'
                  >
                    Select Country <span className='text-danger-600'>*</span>{" "}
                  </label>
                  <select
                    className='common-input bg-main-25 rounded-pill border-transparent focus-border-main-600 form-select py-14'
                    id='selectCountry'
                    defaultValue='Select Country'
                  >
                    <option value='Select Country'>Select Country</option>
                    <option value='Bangladesh'>Bangladesh</option>
                    <option value='Pakistan'>Pakistan</option>
                    <option value='Bhutan'>Bhutan</option>
                    <option value='Nepal'>Nepal</option>
                    <option value='Australia'>Australia</option>
                    <option value='England'>England</option>
                  </select>
                </div>
                <div className='col-sm-12'>
                  <button
                    type='submit'
                    className='btn btn-main rounded-pill flex-center gap-8 mt-16'
                  >
                    Find Now
                    <i className='ph-bold ph-arrow-up-right d-flex text-lg' />
                  </button>
                </div>
              </div>
            </div>
            {/* Find Tutors End */}
          </form>
        </div>
      </div>
    </section>
  );
};

export default FindBestTutorsInner;
