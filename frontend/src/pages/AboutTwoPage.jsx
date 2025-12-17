import AboutTwo from "../components/HomePageforStudent/AboutTwo";
import Breadcrumb from "../components/Breadcrumb";
import CertificateTwo from "../components/HomePageforStudent/CertificateTwo";
import FeaturesTwo from "../components/HomePageforStudent/FeaturesTwo";
import FooterThree from "../components/FooterThree";
import HeaderOne from "../components/HeaderOne";
import InfoSectionOne from "../components/HomePageforStudent/InfoSectionOne";
import JoinCommunityOne from "../components/HomePageforStudent/JoinCommunityOne";
import TestimonialsTwo from "../components/HomePageforStudent/TestimonialsTwo";
import Animation from "../helper/Animation";
import Preloader from "../helper/Preloader";

const AboutTwoPage = () => {
  return (
    <>
      {/* Preloader */}
      <Preloader />

      {/* Animation */}
      <Animation />

      {/* HeaderTwo */}
      <HeaderOne />

      {/* Breadcrumb */}
      <Breadcrumb title={"About Us 02"} />

      {/* FeaturesTwo */}
      <FeaturesTwo />

      {/* InfoSectionOne */}
      <InfoSectionOne />

      {/* AboutTwo */}
      <AboutTwo />

      {/* CertificateTwo */}
      <CertificateTwo />

      {/* JoinCommunityOne */}
      <JoinCommunityOne />

      {/* TestimonialsTwo */}
      <TestimonialsTwo />

      {/* FooterThree */}
      <FooterThree />
    </>
  );
};

export default AboutTwoPage;
