import BrandTwo from "../components/BrandTwo";
import Breadcrumb from "../components/Breadcrumb";
import CertificateOne from "../components/CertificateOne";
import FAQInnerOne from "../components/FAQInnerOne";
import FooterOne from "../components/FooterOne";
import HeaderOne from "../components/HeaderOne";
import TestimonialsThree from "../components/TestimonialsThree";
import Animation from "../helper/Animation";
import Preloader from "../helper/Preloader";

const FaqPage = () => {
  return (
    <>
      {/* Preloader */}
      <Preloader />

      {/* Animation */}
      <Animation />

      {/* HeaderTwo */}
      <HeaderOne />

      {/* Breadcrumb */}
      <Breadcrumb title={"FAQ"} />

      {/* FAQInnerOne */}
      <FAQInnerOne />

      {/* TestimonialsThree */}
      <TestimonialsThree />

      {/* BrandTwo */}
      <BrandTwo />

      {/* CertificateOne */}
      <CertificateOne />

      {/* FooterOne */}
      <FooterOne />
    </>
  );
};

export default FaqPage;
