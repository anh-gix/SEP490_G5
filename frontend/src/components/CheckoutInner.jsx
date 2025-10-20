const CheckoutInner = () => {
  return (
    <div className='py-120'>
      <div className='container'>
        <form action='#'>
          <div className='row'>
            <div className='col-lg-8'>
              <div className='border border-neutral-30 rounded-12 bg-main-25 p-32 bg-main-25'>
                <h4 className='mb-12'>Billing address</h4>
                <div className='d-flex align-items-center justify-content-between'>
                  <div className='text-neutral-500 text-md'>
                    Transaction ID:{" "}
                    <span className='text-neutral-700'>25246584</span>
                  </div>
                  <div className='text-neutral-500 text-md'>
                    Total Payable Amount:{" "}
                    <span className='text-neutral-700'>$1115</span>
                  </div>
                </div>
                <span className='d-block border border-neutral-30 my-24 border-dashed' />
                <div className='row gy-4'>
                  <div className='col-sm-6 col-xs-6'>
                    <input
                      type='text'
                      className='common-input bg-white rounded-pill border-neutral-40 focus-border-main-600 placeholder-text-neutral-100'
                      placeholder='Enter Name'
                    />
                  </div>
                  <div className='col-sm-6 col-xs-6'>
                    <input
                      type='email'
                      className='common-input bg-white rounded-pill border-neutral-40 focus-border-main-600 placeholder-text-neutral-100'
                      placeholder='Enter Email'
                    />
                  </div>
                  <div className='col-sm-6 col-xs-6'>
                    <input
                      type='tel'
                      className='common-input bg-white rounded-pill border-neutral-40 focus-border-main-600 placeholder-text-neutral-100'
                      placeholder='Enter Phone Number'
                    />
                  </div>
                  <div className='col-sm-6 col-xs-6'>
                    <select className='common-input form-select bg-white rounded-pill border-neutral-40 focus-border-main-600 placeholder-text-neutral-100'>
                      <option value=''>USA</option>
                      <option value=''>UK</option>
                      <option value=''>Canada</option>
                      <option value=''>Banlgadesh</option>
                    </select>
                  </div>
                  <div className='col-sm-12'>
                    <textarea
                      className='common-input bg-white rounded-24 border-neutral-40 focus-border-main-600 placeholder-text-neutral-100'
                      placeholder='Enter address'
                      defaultValue={""}
                    />
                  </div>
                </div>
              </div>
              <div className='border border-neutral-30 rounded-12 bg-main-25 p-32 bg-main-25 mt-24'>
                <h4 className='mb-12'>Payment methods</h4>
                <div className='d-flex align-items-center gap-24 flex-wrap'>
                  <div className='form-check common-check common-radio mb-0'>
                    <input
                      className='form-check-input'
                      type='radio'
                      name='card'
                      id='creditCard'
                    />
                    <label
                      className='form-check-label fw-normal flex-grow-1'
                      htmlFor='creditCard'
                    >
                      Credit card
                    </label>
                  </div>
                  <div className='form-check common-check common-radio mb-0'>
                    <input
                      className='form-check-input'
                      type='radio'
                      name='card'
                      id='Debitcard'
                    />
                    <label
                      className='form-check-label fw-normal flex-grow-1'
                      htmlFor='Debitcard'
                    >
                      Debit card
                    </label>
                  </div>
                  <div className='form-check common-check common-radio mb-0'>
                    <input
                      className='form-check-input'
                      type='radio'
                      name='card'
                      id='PayPal'
                    />
                    <label
                      className='form-check-label fw-normal flex-grow-1'
                      htmlFor='PayPal'
                    >
                      PayPal
                    </label>
                  </div>
                </div>
                <span className='d-block border border-neutral-30 my-24 border-dashed' />
                <div className='row gy-4'>
                  <div className='col-sm-12'>
                    <label
                      htmlFor='cardNumber'
                      className='text-neutral-700 text-lg fw-medium mb-12'
                    >
                      Card number
                    </label>
                    <input
                      type='text'
                      className='common-input bg-white rounded-pill border-neutral-40 focus-border-main-600 placeholder-text-neutral-100'
                      id='cardNumber'
                      placeholder='2456 1665 5155 5151'
                    />
                  </div>
                  <div className='col-sm-6 col-xs-6'>
                    <label
                      htmlFor='Expirydate'
                      className='text-neutral-700 text-lg fw-medium mb-12'
                    >
                      Expiry date
                    </label>
                    <input
                      type='date'
                      className='common-input bg-white rounded-pill border-neutral-40 focus-border-main-600 placeholder-text-neutral-100'
                      id='Expirydate'
                    />
                  </div>
                  <div className='col-sm-6 col-xs-6'>
                    <label
                      htmlFor='cvv'
                      className='text-neutral-700 text-lg fw-medium mb-12'
                    >
                      CVC / CVV
                    </label>
                    <input
                      type='text'
                      className='common-input bg-white rounded-pill border-neutral-40 focus-border-main-600 placeholder-text-neutral-100'
                      id='cvv'
                      placeholder='3 digits'
                    />
                  </div>
                  <div className='col-sm-12'>
                    <label
                      htmlFor='nameCard'
                      className='text-neutral-700 text-lg fw-medium mb-12'
                    >
                      Name on card
                    </label>
                    <input
                      type='text'
                      className='common-input bg-white rounded-pill border-neutral-40 focus-border-main-600 placeholder-text-neutral-100'
                      id='nameCard'
                      placeholder='Jab Archur'
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className='col-lg-4'>
              <div className='border border-neutral-30 rounded-12 bg-main-25 p-24 bg-main-25'>
                <span className='text-neutral-700 text-lg mb-12'>Price</span>
                <div className='flex-align align-items-start flex-wrap gap-8'>
                  <div className='flex-align gap-12 text-neutral-700'>
                    <span className='text-2xl d-flex'>
                      <i className='ph-bold ph-tag' />
                    </span>
                    <span className=''>From</span>
                    <h2 className='mb-0'>$99.99</h2>
                  </div>
                  <button
                    type='button'
                    className='text-neutral-500 text-sm'
                    data-bs-toggle='tooltip'
                    data-bs-placement='top'
                    data-bs-title='Initial Price'
                  >
                    <i className='ph-bold ph-info' />
                  </button>
                </div>
                <span className='d-block border border-neutral-30 my-24 border-dashed' />
                <div className='d-flex flex-column gap-24'>
                  <div className='d-flex align-items-center justify-content-between gap-4'>
                    <span className='text-neutral-500'>Base Price</span>
                    <span className='text-neutral-700 fw-medium'>$39.99</span>
                  </div>
                  <div className='d-flex align-items-center justify-content-between gap-4'>
                    <span className='text-neutral-500'>State Tax</span>
                    <span className='text-neutral-700 fw-medium'>$5</span>
                  </div>
                  <div className='d-flex align-items-center justify-content-between gap-4'>
                    <span className='text-neutral-500'>Shipping</span>
                    <span className='text-neutral-700 fw-medium'>Free</span>
                  </div>
                </div>
                <span className='d-block border border-neutral-30 my-24 border-dashed' />
                <div className='my-24 position-relative'>
                  <input
                    type='email'
                    className='form-control bg-white shadow-none border border-neutral-30 rounded-pill h-48 ps-24 pe-44 focus-border-main-600'
                    placeholder='DISCOUNT9'
                  />
                  <button
                    type='submit'
                    className='w-36 h-36 flex-center rounded-circle bg-main-600 text-white hover-bg-main-800 position-absolute top-50 translate-middle-y inset-inline-end-0 me-8'
                  >
                    <i className='ph ph-arrow-right' />
                  </button>
                </div>
                <div className='d-flex align-items-center justify-content-between gap-4'>
                  <span className='text-neutral-500'>Discount</span>
                  <span className='text-main-two-600 fw-medium'>-$9</span>
                </div>
                <span className='d-block border border-neutral-30 my-24 border-dashed' />
                <div className='d-flex align-items-center justify-content-between gap-4'>
                  <span className='text-neutral-500'>Total</span>
                  <span className='text-main-600 fw-medium'>$35.99</span>
                </div>
                <span className='d-block border border-neutral-30 mt-24 border-dashed' />
                <button
                  type='submit'
                  className='btn btn-main rounded-pill w-100 mt-40'
                >
                  Check Out
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutInner;
