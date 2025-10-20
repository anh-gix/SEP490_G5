import Breadcrumb from "../components/Breadcrumb";
import CertificateOne from "../components/CertificateOne";
import FooterOne from "../components/FooterOne";
import HeaderOne from "../components/HeaderOne";
import InstructorAllTwo from "../components/InstructorAllTwo";
import Animation from "../helper/Animation";
import Preloader from "../helper/Preloader";

const InstructorTwoPage = () => {
  return (
    <>
      {/* Preloader */}
      <Preloader />

      {/* Animation */}
      <Animation />

      {/* HeaderTwo */}
      <HeaderOne />

      {/* Breadcrumb */}
      <Breadcrumb title={"Instructors 02"} />

      {/* InstructorAllTwo */}
      <InstructorAllTwo />

      {/* CertificateOne */}
      <CertificateOne />

      {/* FooterOne */}
      <FooterOne />
    </>
  );
};

export default InstructorTwoPage;
