import Breadcrumb from "../components/Breadcrumb";
import CertificateOne from "../components/CertificateOne";
import CheckoutInner from "../components/CheckoutInner";
import FooterOne from "../components/FooterOne";
import HeaderOne from "../components/HeaderOne";
import Animation from "../helper/Animation";
import Preloader from "../helper/Preloader";

const CheckoutPage = () => {
  return (
    <>
      {/* Preloader */}
      <Preloader />

      {/* Animation */}
      <Animation />

      {/* HeaderTwo */}
      <HeaderOne />

      {/* Breadcrumb */}
      <Breadcrumb title={"Checkout"} />

      {/* CheckoutInner */}
      <CheckoutInner />

      {/* CertificateOne */}
      <CertificateOne />

      {/* FooterOne */}
      <FooterOne />
    </>
  );
};

export default CheckoutPage;
