import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import authService from "../../services/authService";

const Profile = () => {
  const { user, loading, error, updateProfile, clearError } = useAuth();
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [pwdValues, setPwdValues] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });
  const [pwdSubmitting, setPwdSubmitting] = useState(false);
  const [pwdMessage, setPwdMessage] = useState("");

  const initialValues = useMemo(
    () => ({
      name: user?.name || user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    }),
    [user]
  );

  useEffect(() => {
    setFormValues(initialValues);
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (submitMessage) setSubmitMessage("");
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");
    try {
      const payload = {
        name: formValues.name,
        email: formValues.email,
        phone: formValues.phone,
      };
      await updateProfile(payload);
      setSubmitMessage("Cập nhật hồ sơ thành công.");
    } catch (err) {
      setSubmitMessage(err?.message || "Cập nhật hồ sơ thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPwdValues((prev) => ({ ...prev, [name]: value }));
    if (pwdMessage) setPwdMessage("");
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    setPwdMessage("");
    if (!pwdValues.currentPassword || !pwdValues.newPassword || !pwdValues.confirmNewPassword) {
      setPwdMessage("Vui lòng điền đầy đủ các trường.");
      return;
    }
    if (pwdValues.newPassword.length < 6) {
      setPwdMessage("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    if (pwdValues.newPassword !== pwdValues.confirmNewPassword) {
      setPwdMessage("Xác nhận mật khẩu không khớp.");
      return;
    }
    try {
      setPwdSubmitting(true);
      await authService.changePassword({
        currentPassword: pwdValues.currentPassword,
        newPassword: pwdValues.newPassword
      });
      setPwdMessage("Đổi mật khẩu thành công.");
      setPwdValues({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: ""
      });
    } catch (err) {
      setPwdMessage(err?.message || "Đổi mật khẩu thất bại.");
    } finally {
      setPwdSubmitting(false);
    }
  };

  if (loading && !user) {
    return (
      <div className='container container--xl py-40'>
        <div className='bg-white border border-neutral-30 rounded-16 p-24'>
          <div className='text-center py-32'>Đang tải hồ sơ...</div>
        </div>
      </div>
    );
  }

  return (
    <div className='container container--xl py-40'>
      <div className='mb-24'>
        <div className='bg-white border border-neutral-30 rounded-16 p-24 d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-16'>
          <div>
            <h4 className='mb-4'>Hồ sơ của tôi</h4>
            <p className='mb-0 text-neutral-600'>Quản lý thông tin cá nhân và cập nhật chi tiết liên hệ của bạn.</p>
          </div>
          <div className='d-flex align-items-center gap-8'>
            <span className='badge bg-main-25 text-main-700 rounded-pill px-12 py-8'>
              <i className='ph ph-shield-check me-6' /> Tài khoản bảo mật
            </span>
          </div>
        </div>
      </div>
      <div className='row g-24'>
        <div className='col-12 col-lg-4'>
          <div className='bg-white border border-neutral-30 rounded-16 overflow-hidden h-100'>
            <div className='bg-main-25' style={{ height: 88 }} />
            <div className='p-24 pt-0'>
              <div className='d-flex align-items-end justify-content-between' style={{ marginTop: -32 }}>
                <div className='d-flex align-items-center gap-12'>
                  <div className='w-96 h-96 rounded-circle bg-white border border-neutral-30 flex-center shadow-sm'>
                    <div className='w-84 h-84 rounded-circle bg-main-50 text-main-700 flex-center text-2xl fw-semibold'>
                      {(user?.name || user?.fullName || user?.username || "N")[0]}
                    </div>
                  </div>
                  <div className='pb-8'>
                    <div className='text-lg fw-semibold'>
                      {user?.name || user?.fullName || user?.username || "Người dùng"}
                    </div>
                    {user?.role && (
                      <div className='text-sm text-neutral-600'>Vai trò: {user.role}</div>
                    )}
                  </div>
                </div>
                <button type='button' className='btn bg-white border border-neutral-30 hover-bg-neutral-50 rounded-8 px-12 py-8 text-sm'>
                  <i className='ph ph-pencil-simple me-6' /> Đổi ảnh
                </button>
              </div>
              <div className='mt-20 pt-16 border-top border-neutral-30'>
                {user?.username && (
                  <div className='text-sm text-neutral-700 d-flex align-items-center'>
                    <i className='ph ph-identification-badge me-8 text-neutral-500' />
                    <span>Tên đăng nhập:&nbsp;</span>
                    <span className='fw-medium'>{user.username}</span>
                  </div>
                )}
                {user?.email && (
                  <div className='text-sm text-neutral-700 mt-10 d-flex align-items-center'>
                    <i className='ph ph-envelope me-8 text-neutral-500' />
                    <span>Email:&nbsp;</span>
                    <span className='fw-medium'>{user.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className='col-12 col-lg-8'>
          <div className='bg-white border border-neutral-30 rounded-16 p-24'>
            <div className='d-flex align-items-center justify-content-between mb-8'>
              <h5 className='mb-0'>Thông tin cá nhân</h5>
              <span className='text-xs text-neutral-500'>Cập nhật lần cuối: {new Date().toLocaleDateString()}</span>
            </div>
            <p className='text-neutral-600 mb-20'>Những thông tin này giúp chúng tôi cá nhân hóa trải nghiệm của bạn.</p>
            <form onSubmit={handleSubmit} className='row g-16'>
              <div className='col-12 col-md-6'>
                <label className='text-sm text-neutral-600 mb-8 d-block'>Họ và tên</label>
                <div className='position-relative'>
                  <i className='ph ph-user text-neutral-500 position-absolute' style={{ top: 14, insetInlineStart: 12 }} />
                  <input
                    name='name'
                    value={formValues.name}
                    onChange={handleChange}
                    type='text'
                    className='common-input border-neutral-30 ps-36'
                    placeholder='Nhập họ và tên'
                  />
                </div>
              </div>
              <div className='col-12 col-md-6'>
                <label className='text-sm text-neutral-600 mb-8 d-block'>Email</label>
                <div className='position-relative'>
                  <i className='ph ph-envelope text-neutral-500 position-absolute' style={{ top: 14, insetInlineStart: 12 }} />
                  <input
                    name='email'
                    value={formValues.email}
                    onChange={handleChange}
                    type='email'
                    className='common-input border-neutral-30 ps-36'
                    placeholder='you@example.com'
                  />
                </div>
              </div>
              <div className='col-12 col-md-6'>
                <label className='text-sm text-neutral-600 mb-8 d-block'>Số điện thoại</label>
                <div className='position-relative'>
                  <i className='ph ph-phone text-neutral-500 position-absolute' style={{ top: 14, insetInlineStart: 12 }} />
                  <input
                    name='phone'
                    value={formValues.phone}
                    onChange={handleChange}
                    type='tel'
                    className='common-input border-neutral-30 ps-36'
                    placeholder='0123 456 789'
                  />
                </div>
              </div>
              <div className='col-12'>
                <div className='d-flex align-items-center justify-content-between mt-8 pt-12 border-top border-neutral-30'>
                  <span className='text-sm text-neutral-600'>
                    Hãy kiểm tra kỹ trước khi lưu thay đổi.
                  </span>
                  <div className='d-flex align-items-center gap-10'>
                    <button
                      type='button'
                      className='btn bg-white border border-neutral-30 hover-bg-neutral-50 rounded-8 px-16 py-10'
                      onClick={() => setFormValues(initialValues)}
                      disabled={isSubmitting}
                    >
                      Đặt lại
                    </button>
                    <button
                      type='submit'
                      className='btn bg-main-600 hover-bg-main-700 text-white rounded-8 px-20 py-12'
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </div>
                </div>
                <div className='mt-10'>
                  {submitMessage && (
                    <span className={`text-sm ${submitMessage.includes("thất bại") ? "text-danger-600" : "text-success"}`}>
                      {submitMessage}
                    </span>
                  )}
                  {error && !submitMessage && (
                    <span className='text-sm text-danger-600'>
                      {error}
                    </span>
                  )}
                </div>
              </div>
            </form>
          </div>
          <div className='bg-white border border-neutral-30 rounded-16 p-24 mt-24'>
            <div className='d-flex align-items-center justify-content-between mb-8'>
              <h5 className='mb-0'>Đổi mật khẩu</h5>
              <span className='text-xs text-neutral-500'>Giữ mật khẩu an toàn và khó đoán.</span>
            </div>
            <p className='text-neutral-600 mb-20'>Hãy nhập mật khẩu hiện tại và đặt mật khẩu mới cho tài khoản của bạn.</p>
            <form onSubmit={handleSubmitPassword} className='row g-16'>
              <div className='col-12 col-md-6'>
                <label className='text-sm text-neutral-600 mb-8 d-block'>Mật khẩu hiện tại</label>
                <div className='position-relative'>
                  <i className='ph ph-lock-key text-neutral-500 position-absolute' style={{ top: 14, insetInlineStart: 12 }} />
                  <input
                    name='currentPassword'
                    value={pwdValues.currentPassword}
                    onChange={handlePasswordChange}
                    type='password'
                    className='common-input border-neutral-30 ps-36'
                    placeholder='Nhập mật khẩu hiện tại'
                  />
                </div>
              </div>
              <div className='col-12 col-md-6'>
                <label className='text-sm text-neutral-600 mb-8 d-block'>Mật khẩu mới</label>
                <div className='position-relative'>
                  <i className='ph ph-lock text-neutral-500 position-absolute' style={{ top: 14, insetInlineStart: 12 }} />
                  <input
                    name='newPassword'
                    value={pwdValues.newPassword}
                    onChange={handlePasswordChange}
                    type='password'
                    className='common-input border-neutral-30 ps-36'
                    placeholder='Ít nhất 6 ký tự'
                  />
                </div>
              </div>
              <div className='col-12 col-md-6'>
                <label className='text-sm text-neutral-600 mb-8 d-block'>Xác nhận mật khẩu mới</label>
                <div className='position-relative'>
                  <i className='ph ph-lock text-neutral-500 position-absolute' style={{ top: 14, insetInlineStart: 12 }} />
                  <input
                    name='confirmNewPassword'
                    value={pwdValues.confirmNewPassword}
                    onChange={handlePasswordChange}
                    type='password'
                    className='common-input border-neutral-30 ps-36'
                    placeholder='Nhập lại mật khẩu mới'
                  />
                </div>
              </div>
              <div className='col-12'>
                <div className='d-flex align-items-center justify-content-between mt-8 pt-12 border-top border-neutral-30'>
                  <span className='text-sm text-neutral-600'>
                    Mẹo: Trộn chữ hoa, chữ thường, số và ký tự đặc biệt.
                  </span>
                  <div className='d-flex align-items-center gap-10'>
                    <button
                      type='button'
                      className='btn bg-white border border-neutral-30 hover-bg-neutral-50 rounded-8 px-16 py-10'
                      onClick={() => setPwdValues({ currentPassword: "", newPassword: "", confirmNewPassword: "" })}
                      disabled={pwdSubmitting}
                    >
                      Xóa
                    </button>
                    <button
                      type='submit'
                      className='btn bg-main-600 hover-bg-main-700 text-white rounded-8 px-20 py-12'
                      disabled={pwdSubmitting}
                    >
                      {pwdSubmitting ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                    </button>
                  </div>
                </div>
                <div className='mt-10'>
                  {pwdMessage && (
                    <span className={`text-sm ${pwdMessage.includes("thất bại") || pwdMessage.includes("không") ? "text-danger-600" : "text-success"}`}>
                      {pwdMessage}
                    </span>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;


