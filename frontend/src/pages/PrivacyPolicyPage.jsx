import Breadcrumb from "../components/Breadcrumb";
import CertificateOne from "../components/CertificateOne";
import FooterOne from "../components/FooterOne";
import HeaderOne from "../components/HeaderOne";
import PrivacyPolicyInner from "../components/PrivacyPolicyInner";
import Animation from "../helper/Animation";
import Preloader from "../helper/Preloader";

const PrivacyPolicyPage = () => {
  return (
    <>
      {/* Preloader */}
      <Preloader />

      {/* Animation */}
      <Animation />

      {/* HeaderTwo */}
      <HeaderOne />

      {/* Breadcrumb */}
      <Breadcrumb title={"Privacy Policy"} />

      {/* PrivacyPolicyInner */}
      <PrivacyPolicyInner />

      {/* CertificateOne */}
      <CertificateOne />

      {/* FooterOne */}
      <FooterOne />
    </>
  );
};

export default PrivacyPolicyPage;
