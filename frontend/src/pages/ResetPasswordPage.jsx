import Breadcrumb from "../components/Breadcrumb";
import FooterOne from "../components/FooterOne";
import HeaderOne from "../components/HomePageforStudent/HeaderOne";
import ResetPasswordInner from "../components/Authen/ResetPasswordInner";
import Animation from "../helper/Animation";
import Preloader from "../helper/Preloader";

const ResetPasswordPage = () => {
  return (
    <>
      {/* Preloader */}
      <Preloader />

      {/* Animation */}
      <Animation />

      {/* HeaderOne */}
      <HeaderOne />

      {/* Breadcrumb */}
      <Breadcrumb title={"Đặt Lại Mật Khẩu"} />

      {/* ResetPasswordInner */}
      <ResetPasswordInner />

      {/* FooterOne */}
      <FooterOne />
    </>
  );
};

export default ResetPasswordPage;

