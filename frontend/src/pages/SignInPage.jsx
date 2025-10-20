import Breadcrumb from "../components/Breadcrumb";
import FooterOne from "../components/FooterOne";
import HeaderOne from "../components/HeaderOne";
import SignInInner from "../components/SignInInner";
import Animation from "../helper/Animation";
import Preloader from "../helper/Preloader";

const SignInPage = () => {
  return (
    <>
      {/* Preloader */}
      <Preloader />

      {/* Animation */}
      <Animation />

      {/* HeaderTwo */}
      <HeaderOne />

      {/* Breadcrumb */}
      <Breadcrumb title={"Sign In"} />

      {/* SignInInner */}
      <SignInInner />

      {/* FooterOne */}
      <FooterOne />
    </>
  );
};

export default SignInPage;
