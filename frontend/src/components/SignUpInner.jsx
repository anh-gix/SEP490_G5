import { useState } from "react";
import { Link } from "react-router-dom";

const SignUpInner = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  return (
    <div className='account py-120 position-relative'>
      <div className='container'>
        <div className='row gy-4 align-items-center'>
          <div className='col-lg-6'>
            <div className='bg-main-25 border border-neutral-30 rounded-8 p-32'>
              <div className='mb-40'>
                <h3 className='mb-16 text-neutral-500'>Let's Get Started!</h3>
                <p className='text-neutral-500'>
                  Please Enter your Email Address to Start your Online
                  Application
                </p>
              </div>
              <form action='#'>
                <div className='row gy-4'>
                  <div className='col-sm-6'>
                    <label
                      htmlFor='fname'
                      className='fw-medium text-lg text-neutral-500 mb-16'
                    >
                      First Name
                    </label>
                    <input
                      type='text'
                      className='common-input rounded-pill'
                      id='fname'
                      placeholder='Enter Your First Name'
                    />
                  </div>
                  <div className='col-sm-6'>
                    <label
                      htmlFor='lname'
                      className='fw-medium text-lg text-neutral-500 mb-16'
                    >
                      Last Name
                    </label>
                    <input
                      type='text'
                      className='common-input rounded-pill'
                      id='lname'
                      placeholder='Enter Your Last Name'
                    />
                  </div>
                  <div className='col-sm-12'>
                    <label
                      htmlFor='email'
                      className='fw-medium text-lg text-neutral-500 mb-16'
                    >
                      Enter Your Email ID
                    </label>
                    <input
                      type='email'
                      className='common-input rounded-pill'
                      id='email'
                      placeholder='Enter Your Email...'
                    />
                  </div>
                  <div className='col-sm-12'>
                    <label
                      htmlFor='password'
                      className='fw-medium text-lg text-neutral-500 mb-16'
                    >
                      Password
                    </label>
                    <div className='position-relative'>
                      <input
                        type={passwordVisible ? "text" : "password"}
                        className='common-input rounded-pill pe-44'
                        id='password'
                        placeholder='Enter Your Password...'
                      />
                      <span
                        className={`toggle-password position-absolute top-50 inset-inline-end-0 me-16 translate-middle-y ph-bold ${
                          passwordVisible ? "ph-eye" : "ph-eye-closed"
                        }`}
                        onClick={togglePasswordVisibility}
                      ></span>
                    </div>
                  </div>
                  <div className='col-sm-12'>
                    <p className='text-neutral-500 mt-8'>
                      Have an accounts?{" "}
                      <Link
                        to='/sign-in'
                        className='fw-semibold text-main-600 hover-text-decoration-underline'
                      >
                        Sign In
                      </Link>
                    </p>
                  </div>
                  <div className='col-sm-12'>
                    <div className='mt-20'>
                      <button
                        type='submit'
                        className='btn btn-main rounded-pill flex-center gap-8'
                      >
                        Sign UP
                        <i className='ph-bold ph-arrow-up-right d-flex text-lg' />
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
          <div className='col-lg-6 d-lg-block d-none'>
            <div className='account-img'>
              <img src='assets/images/thumbs/account-img.png' alt='' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpInner;
