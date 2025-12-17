import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authService } from "../../services/authService";
import loginImage from "../../assets/Login_img/ảnhlogin.png";

const ResetPasswordInner = () => {
  const [formData, setFormData] = useState({
    code: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  // Redirect nếu không có email
  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Xóa lỗi khi người dùng bắt đầu nhập
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.code) {
      newErrors.code = 'Mã xác thực là bắt buộc';
    } else if (!/^\d{6}$/.test(formData.code)) {
      newErrors.code = 'Mã xác thực phải là 6 chữ số';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'Mật khẩu mới là bắt buộc';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});
    setSuccess('');

    try {
      const response = await authService.resetPassword({
        email,
        code: formData.code,
        newPassword: formData.newPassword
      });
      
      setSuccess(response.message || 'Đặt lại mật khẩu thành công!');
      
      // Chuyển về trang đăng nhập sau 2 giây
      setTimeout(() => {
        navigate('/sign-in');
      }, 2000);
    } catch (err) {
      setErrors({ 
        general: err.message || 'Có lỗi xảy ra. Vui lòng thử lại.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className='account py-120 position-relative'>
      <div className='container'>
        <div className='row gy-4 align-items-center'>
          <div className='col-lg-6'>
            <div className='bg-main-25 border border-neutral-30 rounded-8 p-32'>
              <div className='mb-40'>
                <h3 className='mb-16 text-neutral-500'>Đặt Lại Mật Khẩu</h3>
                <p className='text-neutral-500'>
                  Nhập mã xác thực đã được gửi đến email <strong>{email}</strong> và mật khẩu mới của bạn
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {errors.general && (
                  <div className='alert alert-danger mb-24'>
                    {errors.general}
                  </div>
                )}
                
                {success && (
                  <div className='alert alert-success mb-24'>
                    {success}
                    <div className='mt-8 small text-neutral-600'>
                      Đang chuyển hướng đến trang đăng nhập...
                    </div>
                  </div>
                )}
                
                <div className='mb-24'>
                  <label
                    htmlFor='code'
                    className='fw-medium text-lg text-neutral-500 mb-16'
                  >
                    Mã Xác Thực (6 chữ số)
                  </label>
                  <input
                    type='text'
                    className={`common-input rounded-pill ${errors.code ? 'border-danger' : ''}`}
                    id='code'
                    name='code'
                    value={formData.code}
                    onChange={handleChange}
                    placeholder='Nhập mã 6 chữ số...'
                    maxLength={6}
                    disabled={isLoading || success}
                  />
                  {errors.code && (
                    <div className='text-danger mt-8 small'>
                      {errors.code}
                    </div>
                  )}
                </div>
                
                <div className='mb-24'>
                  <label
                    htmlFor='newPassword'
                    className='fw-medium text-lg text-neutral-500 mb-16'
                  >
                    Mật Khẩu Mới
                  </label>
                  <div className='position-relative'>
                    <input
                      type={passwordVisible ? "text" : "password"}
                      className={`common-input rounded-pill pe-44 ${errors.newPassword ? 'border-danger' : ''}`}
                      id='newPassword'
                      name='newPassword'
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder='Nhập mật khẩu mới...'
                      disabled={isLoading || success}
                    />
                    <span
                      className={`toggle-password position-absolute top-50 inset-inline-end-0 me-16 translate-middle-y ph-bold ${
                        passwordVisible ? "ph-eye" : "ph-eye-closed"
                      }`}
                      onClick={togglePasswordVisibility}
                    ></span>
                  </div>
                  {errors.newPassword && (
                    <div className='text-danger mt-8 small'>
                      {errors.newPassword}
                    </div>
                  )}
                </div>

                <div className='mb-24'>
                  <label
                    htmlFor='confirmPassword'
                    className='fw-medium text-lg text-neutral-500 mb-16'
                  >
                    Xác Nhận Mật Khẩu Mới
                  </label>
                  <div className='position-relative'>
                    <input
                      type={confirmPasswordVisible ? "text" : "password"}
                      className={`common-input rounded-pill pe-44 ${errors.confirmPassword ? 'border-danger' : ''}`}
                      id='confirmPassword'
                      name='confirmPassword'
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder='Nhập lại mật khẩu mới...'
                      disabled={isLoading || success}
                    />
                    <span
                      className={`toggle-password position-absolute top-50 inset-inline-end-0 me-16 translate-middle-y ph-bold ${
                        confirmPasswordVisible ? "ph-eye" : "ph-eye-closed"
                      }`}
                      onClick={toggleConfirmPasswordVisibility}
                    ></span>
                  </div>
                  {errors.confirmPassword && (
                    <div className='text-danger mt-8 small'>
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>

                <div className='mt-40'>
                  <button
                    type='submit'
                    disabled={isLoading || success}
                    className='btn btn-main rounded-pill flex-center gap-8 w-100'
                  >
                    {isLoading ? 'Đang xử lý...' : 'Đặt Lại Mật Khẩu'}
                    <i className='ph-bold ph-arrow-up-right d-flex text-lg' />
                  </button>
                </div>

                <div className='mt-24 text-center'>
                  <Link
                    to='/forgot-password'
                    className='text-warning-600 hover-text-decoration-underline me-16'
                  >
                    <i className='ph-bold ph-arrow-left me-8' />
                    Gửi lại mã
                  </Link>
                  <span className='text-neutral-300'>|</span>
                  <Link
                    to='/sign-in'
                    className='text-main-600 hover-text-decoration-underline ms-16'
                  >
                    Quay lại đăng nhập
                  </Link>
                </div>
              </form>
            </div>
          </div>
          <div className='col-lg-6 d-lg-block d-none'>
            <div className='account-img'>
              <img src={loginImage} alt='Đặt Lại Mật Khẩu' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordInner;
