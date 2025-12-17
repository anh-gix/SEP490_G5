import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import loginImage from "../../assets/Login_img/ảnhlogin.png";

const ForgotPasswordInner = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const validateEmail = () => {
    if (!email) {
      setError('Email là bắt buộc');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email không hợp lệ');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authService.sendForgotPasswordCode(email);
      setSuccess(response.message || 'Mã xác thực đã được gửi đến email của bạn');
      
      // Chuyển sang trang nhập mã sau 2 giây
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 2000);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='account py-120 position-relative'>
      <div className='container'>
        <div className='row gy-4 align-items-center'>
          <div className='col-lg-6'>
            <div className='bg-main-25 border border-neutral-30 rounded-8 p-32'>
              <div className='mb-40'>
                <h3 className='mb-16 text-neutral-500'>Quên Mật Khẩu</h3>
                <p className='text-neutral-500'>
                  Nhập email của bạn để nhận mã xác thực đặt lại mật khẩu
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {error && (
                  <div className='alert alert-danger mb-24'>
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className='alert alert-success mb-24'>
                    {success}
                    <div className='mt-8 small text-neutral-600'>
                      Đang chuyển hướng...
                    </div>
                  </div>
                )}
                
                <div className='mb-24'>
                  <label
                    htmlFor='email'
                    className='fw-medium text-lg text-neutral-500 mb-16'
                  >
                    Nhập Email Của Bạn
                  </label>
                  <input
                    type='email'
                    className={`common-input rounded-pill ${error ? 'border-danger' : ''}`}
                    id='email'
                    name='email'
                    value={email}
                    onChange={handleChange}
                    placeholder='Nhập Email...'
                    disabled={isLoading || success}
                  />
                </div>

                <div className='mt-40'>
                  <button
                    type='submit'
                    disabled={isLoading || success}
                    className='btn btn-main rounded-pill flex-center gap-8 w-100'
                  >
                    {isLoading ? 'Đang gửi mã...' : 'Gửi Mã Xác Thực'}
                    <i className='ph-bold ph-arrow-up-right d-flex text-lg' />
                  </button>
                </div>

                <div className='mt-24 text-center'>
                  <Link
                    to='/sign-in'
                    className='text-main-600 hover-text-decoration-underline'
                  >
                    <i className='ph-bold ph-arrow-left me-8' />
                    Quay lại đăng nhập
                  </Link>
                </div>
              </form>
            </div>
          </div>
          <div className='col-lg-6 d-lg-block d-none'>
            <div className='account-img'>
              <img src={loginImage} alt='Quên Mật Khẩu' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordInner;

