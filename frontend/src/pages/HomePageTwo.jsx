import AboutTwo from "../components/AboutTwo";
import BannerTwo from "../components/BannerTwo";
import CategoryOne from "../components/CategoryOne";
import CertificateTwo from "../components/CertificateTwo";
import ExploreCourseTwo from "../components/ExploreCourseTwo";
import FaqOne from "../components/FaqOne";
import FeaturesTwo from "../components/FeaturesTwo";
import FooterTwo from "../components/FooterTwo";
import HeaderOne from "../components/HeaderOne";
import InfoSectionOne from "../components/InfoSectionOne";
import JoinCommunityOne from "../components/JoinCommunityOne";
import TestimonialsTwo from "../components/TestimonialsTwo";
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

      {/* ExploreCourseTwo */}
      <ExploreCourseTwo />

      {/* TestimonialsTwo */}
      <TestimonialsTwo />

      {/* JoinCommunityOne */}
      <JoinCommunityOne />

      {/* FaqOne */}
      <FaqOne />

      {/* FooterTwo */}
      <FooterTwo />
    </>
  );
};

export default HomePageTwo;
