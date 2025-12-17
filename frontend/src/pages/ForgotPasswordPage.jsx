import Breadcrumb from "../components/Breadcrumb";
import FooterOne from "../components/FooterOne";
import HeaderOne from "../components/HomePageforStudent/HeaderOne";
import ForgotPasswordInner from "../components/Authen/ForgotPasswordInner";
import Animation from "../helper/Animation";
import Preloader from "../helper/Preloader";

const ForgotPasswordPage = () => {
  return (
    <>
      {/* Preloader */}
      <Preloader />

      {/* Animation */}
      <Animation />

      {/* HeaderOne */}
      <HeaderOne />

      {/* Breadcrumb */}
      <Breadcrumb title={"Quên Mật Khẩu"} />

      {/* ForgotPasswordInner */}
      <ForgotPasswordInner />

      {/* FooterOne */}
      <FooterOne />
    </>
  );
};

export default ForgotPasswordPage;

