import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const SignUpInner = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    roleId: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { register, error: authError, clearError } = useAuth();
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    clearError();
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username) {
      newErrors.username = 'Tên người dùng là bắt buộc';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    }
    
    if (!formData.address) {
      newErrors.address = 'Địa chỉ là bắt buộc';
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
    try {
      // Tạo username từ firstName và lastName nếu chưa có
      const userData = {
        ...formData,
        username: formData.username || `${formData.firstName}_${formData.lastName}`
      };
      
      await register(userData);
      navigate('/'); // Redirect to home page after successful registration
    } catch (error) {
      console.error('Registration failed:', error);
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
                <h3 className='mb-16 text-neutral-500'>Bắt đầu nào!</h3>
                <p className='text-neutral-500'>
                  Vui lòng nhập địa chỉ Email để bắt đầu đăng ký trực tuyến
                </p>
              </div>
              <form onSubmit={handleSubmit}>
                {authError && (
                  <div className='alert alert-danger mb-24'>
                    {authError}
                  </div>
                )}
                
                <div className='row gy-4'>
                  <div className='col-sm-12'>
                    <label
                      htmlFor='username'
                      className='fw-medium text-lg text-neutral-500 mb-16'
                    >
                      Tên người dùng
                    </label>
                    <input
                      type='text'
                      className={`common-input rounded-pill ${errors.username ? 'border-danger' : ''}`}
                      id='username'
                      name='username'
                      value={formData.username}
                      onChange={handleChange}
                      placeholder='Nhập tên người dùng...'
                    />
                    {errors.username && (
                      <div className='text-danger mt-8 small'>
                        {errors.username}
                      </div>
                    )}
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
                      className={`common-input rounded-pill ${errors.email ? 'border-danger' : ''}`}
                      id='email'
                      name='email'
                      value={formData.email}
                      onChange={handleChange}
                      placeholder='Nhập Email của bạn...'
                    />
                    {errors.email && (
                      <div className='text-danger mt-8 small'>
                        {errors.email}
                      </div>
                    )}
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
                        className={`common-input rounded-pill pe-44 ${errors.password ? 'border-danger' : ''}`}
                        id='password'
                        name='password'
                        value={formData.password}
                        onChange={handleChange}
                        placeholder='Nhập Mật khẩu của bạn...'
                      />
                      <span
                        className={`toggle-password position-absolute top-50 inset-inline-end-0 me-16 translate-middle-y ph-bold ${
                          passwordVisible ? "ph-eye" : "ph-eye-closed"
                        }`}
                        onClick={togglePasswordVisibility}
                      ></span>
                    </div>
                    {errors.password && (
                      <div className='text-danger mt-8 small'>
                        {errors.password}
                      </div>
                    )}
                  </div>
                  
                  <div className='col-sm-12'>
                    <label
                      htmlFor='phone'
                      className='fw-medium text-lg text-neutral-500 mb-16'
                    >
                      Số điện thoại
                    </label>
                    <input
                      type='tel'
                      className={`common-input rounded-pill ${errors.phone ? 'border-danger' : ''}`}
                      id='phone'
                      name='phone'
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder='Nhập số điện thoại...'
                    />
                    {errors.phone && (
                      <div className='text-danger mt-8 small'>
                        {errors.phone}
                      </div>
                    )}
                  </div>
                  
                  <div className='col-sm-12'>
                    <label
                      htmlFor='address'
                      className='fw-medium text-lg text-neutral-500 mb-16'
                    >
                      Địa chỉ
                    </label>
                    <input
                      type='text'
                      className={`common-input rounded-pill ${errors.address ? 'border-danger' : ''}`}
                      id='address'
                      name='address'
                      value={formData.address}
                      onChange={handleChange}
                      placeholder='Nhập địa chỉ...'
                    />
                    {errors.address && (
                      <div className='text-danger mt-8 small'>
                        {errors.address}
                      </div>
                    )}
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
                        disabled={isLoading}
                        className='btn btn-main rounded-pill flex-center gap-8'
                      >
                        {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
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
