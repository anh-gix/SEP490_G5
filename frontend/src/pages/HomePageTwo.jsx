import AboutTwo from "../components/HomePageforStudent/AboutTwo";
import BannerTwo from "../components/HomePageforStudent/BannerTwo";
import CategoryOne from "../components/HomePageforStudent/CategoryOne";
import CertificateTwo from "../components/HomePageforStudent/CertificateTwo";
import FaqOne from "../components/HomePageforStudent/FaqOne";
import FeaturesTwo from "../components/HomePageforStudent/FeaturesTwo";
import FooterTwo from "../components/HomePageforStudent/FooterTwo";
import HeaderOne from "../components/HomePageforStudent/HeaderOne";
import InfoSectionOne from "../components/HomePageforStudent/InfoSectionOne";
import JoinCommunityOne from "../components/HomePageforStudent/JoinCommunityOne";
import TestimonialsTwo from "../components/HomePageforStudent/TestimonialsTwo";
import Animation from "../helper/Animation";
import Preloader from "../helper/Preloader";

const HomePageTwo = () => {
  return (
    <>
      {/* HeaderOne */}
      <HeaderOne />

      {/* Preloader */}
      <Preloader />

      {/* Animation */}
      <Animation />

      {/* BannerTwo */}
      <BannerTwo />

      {/* InfoSectionOne */}
      <InfoSectionOne />

      {/* CategoryOne */}
      <CategoryOne />

      {/* AboutTwo */}
      <AboutTwo />

      {/* FeaturesTwo */}
      <FeaturesTwo />

      {/* CertificateTwo */}
      <CertificateTwo />


      {/* TestimonialsTwo */}
      <TestimonialsTwo />

      {/* FaqOne */}
      <FaqOne />

      {/* FooterTwo */}
      <FooterTwo />
    </>
  );
};

export default HomePageTwo;
