import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import loginImage from "../../assets/Login_img/ảnhlogin.png";

const SignInInner = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { login, error: authError, clearError } = useAuth();
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
    
    // Xóa lỗi khi người dùng bắt đầu nhập
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
      const userData = await login(formData);
      
      // Navigate theo role
      const roleName = userData.roleId?.name;
      
      switch(roleName) {
        case 'Student':
          navigate('/student/dashboard');
          break;
        case 'Teacher':
        case 'Subject Leader':
          navigate('/teacher/dashboard');
          break;
        case 'Academic Staff':
          navigate('/academic/dashboard');
          break;
        case 'Center Head':
          navigate('/center-head/dashboard');
          break;
        default:
          navigate('/'); // Fallback to home page
      }
    } catch (error) {
      console.error('Đăng nhập thất bại:', error);
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
                <h3 className='mb-16 text-neutral-500'>Chào Mừng Trở Lại!</h3>
                <p className='text-neutral-500'>
                  Đăng nhập vào tài khoản của bạn và tham gia với chúng tôi
                </p>
              </div>
              <form onSubmit={handleSubmit}>
                {authError && (
                  <div className='alert alert-danger mb-24'>
                    {authError}
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
                    className={`common-input rounded-pill ${errors.email ? 'border-danger' : ''}`}
                    id='email'
                    name='email'
                    value={formData.email}
                    onChange={handleChange}
                    placeholder='Nhập Email...'
                  />
                  {errors.email && (
                    <div className='text-danger mt-8 small'>
                      {errors.email}
                    </div>
                  )}
                </div>
                
                <div className='mb-16'>
                  <label
                    htmlFor='password'
                    className='fw-medium text-lg text-neutral-500 mb-16'
                  >
                    Nhập Mật Khẩu Của Bạn
                  </label>
                  <div className='position-relative'>
                    <input
                      type={passwordVisible ? "text" : "password"}
                      className={`common-input rounded-pill pe-44 ${errors.password ? 'border-danger' : ''}`}
                      id='password'
                      name='password'
                      value={formData.password}
                      onChange={handleChange}
                      placeholder='Nhập Mật Khẩu...'
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
                <div className='mb-16 text-end'>
                  <Link
                    to='/forgot-password'
                    className='text-warning-600 hover-text-decoration-underline'
                  >
                    Quên Mật Khẩu
                  </Link>
                </div>
                <div className='mt-40'>
                  <button
                    type='submit'
                    disabled={isLoading}
                    className='btn btn-main rounded-pill flex-center gap-8 mt-40'
                  >
                    {isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                    <i className='ph-bold ph-arrow-up-right d-flex text-lg' />
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div className='col-lg-6 d-lg-block d-none'>
            <div className='account-img'>
              <img src={loginImage} alt='Đăng Nhập' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInInner;
