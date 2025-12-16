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
                <h3 className='mb-16 text-neutral-500'>Bắt đầu nào!</h3>
                <p className='text-neutral-500'>
                  Vui lòng nhập thông tin để bắt đầu đăng ký trực tuyến
                </p>
              </div>
              <form action='#'>
                <div className='row gy-4'>
                  <div className='col-sm-6'>
                    <label
                      htmlFor='fname'
                      className='fw-medium text-lg text-neutral-500 mb-16'
                    >
                      Tên
                    </label>
                    <input
                      type='text'
                      className='common-input rounded-pill'
                      id='fname'
                      placeholder='Nhập tên của bạn'
                    />
                  </div>
                  <div className='col-sm-6'>
                    <label
                      htmlFor='lname'
                      className='fw-medium text-lg text-neutral-500 mb-16'
                    >
                      Họ
                    </label>
                    <input
                      type='text'
                      className='common-input rounded-pill'
                      id='lname'
                      placeholder='Nhập họ của bạn'
                    />
                  </div>
                  <div className='col-sm-12'>
                    <label
                      htmlFor='email'
                      className='fw-medium text-lg text-neutral-500 mb-16'
                    >
                      Nhập Email của bạn
                    </label>
                    <input
                      type='email'
                      className='common-input rounded-pill'
                      id='email'
                      placeholder='Nhập Email của bạn...'
                    />
                  </div>
                  <div className='col-sm-12'>
                    <label
                      htmlFor='password'
                      className='fw-medium text-lg text-neutral-500 mb-16'
                    >
                      Mật khẩu
                    </label>
                    <div className='position-relative'>
                      <input
                        type={passwordVisible ? "text" : "password"}
                        className='common-input rounded-pill pe-44'
                        id='password'
                        placeholder='Nhập Mật khẩu của bạn...'
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
                      Đã có tài khoản?{" "}
                      <Link
                        to='/sign-in'
                        className='fw-semibold text-main-600 hover-text-decoration-underline'
                      >
                        Đăng nhập
                      </Link>
                    </p>
                  </div>
                  <div className='col-sm-12'>
                    <div className='mt-20'>
                      <button
                        type='submit'
                        className='btn btn-main rounded-pill flex-center gap-8'
                      >
                        Đăng ký
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
