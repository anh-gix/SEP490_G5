const BookOnlineClassInner = () => {
  return (
    <section className='py-120'>
      <div className='container'>
        <div className='border border-neutral-30 rounded-12 bg-main-25 p-24 bg-main-25'>
          <form action='#'>
            <h3 className='mb-24'>Book online class</h3>
            {/* Find Tutors Start */}
            <div className='border border-neutral-30 rounded-12 bg-white p-24'>
              <h5 className='mb-0'>Fill Up Info</h5>
              <span className='d-block border border-main-50 my-24 border-dashed' />
              <div className='row gy-4'>
                <div className='col-sm-6'>
                  <label
                    htmlFor='name'
                    className='text-neutral-700 text-lg fw-medium mb-12'
                  >
                    {" "}
                    Name <span className='text-danger-600'>*</span>{" "}
                  </label>
                  <input
                    type='text'
                    className='common-input bg-main-25 rounded-pill border-transparent focus-border-main-600'
                    id='name'
                    placeholder='Enter Name...'
                  />
                </div>
                <div className='col-sm-6'>
                  <label
                    htmlFor='email'
                    className='text-neutral-700 text-lg fw-medium mb-12'
                  >
                    Email <span className='text-danger-600'>*</span>{" "}
                  </label>
                  <input
                    type='email'
                    className='common-input bg-main-25 rounded-pill border-transparent focus-border-main-600'
                    id='email'
                    placeholder='Enter Your Email...'
                  />
                </div>
                <div className='col-sm-6'>
                  <label
                    htmlFor='Phone'
                    className='text-neutral-700 text-lg fw-medium mb-12'
                  >
                    Mobile Number <span className='text-danger-600'>*</span>{" "}
                  </label>
                  <input
                    type='tel'
                    className='common-input bg-main-25 rounded-pill border-transparent focus-border-main-600'
                    id='Phone'
                    placeholder='Enter Your Number...'
                  />
                </div>
                <div className='col-sm-6'>
                  <label
                    htmlFor='selectClass'
                    className='text-neutral-700 text-lg fw-medium mb-12'
                  >
                    Select Class
                    <span className='text-danger-600'>*</span>{" "}
                  </label>
                  <select
                    className='common-input bg-main-25 rounded-pill border-transparent focus-border-main-600 form-select py-14'
                    id='selectClass'
                    defaultValue='Select Class'
                  >
                    <option value='Select Class'>Select Class</option>
                    <option value='Online Class'>Online Class</option>
                    <option value='offline Class'>offline Class</option>
                  </select>
                </div>
                <div className='col-sm-12'>
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
                    Book A Class
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

export default BookOnlineClassInner;
