import HeaderOne from "../components/HeaderOne";
import AboutOne from "../components/AboutOne";
import BannerOne from "../components/BannerOne";
import BlogOne from "../components/BlogOne";
import BrandOne from "../components/BrandOne";
import CertificateOne from "../components/CertificateOne";
import ChooseUsOne from "../components/ChooseUsOne";
import CounterOne from "../components/CounterOne";
import ExploreCourseOne from "../components/ExploreCourseOne";
import FeaturesOne from "../components/FeaturesOne";
import FooterOne from "../components/FooterOne";
import InstructorOne from "../components/InstructorOne";
import TestimonialsOne from "../components/TestimonialsOne";
import Animation from "../helper/Animation";
import Preloader from "../helper/Preloader";

const HomePageOne = () => {
  return (
    <>
      {/* Preloader */}
      <Preloader />

      {/* HeaderOne */}
      <HeaderOne />

      {/* Animation */}
      <Animation />

      {/* BannerOne */}
      <BannerOne />

      {/* BrandOne */}
      <BrandOne />

      {/* FeaturesOne */}
      <FeaturesOne />

      {/* ExploreCourseOne */}
      <ExploreCourseOne />

      {/* AboutOne */}
      <AboutOne />

      {/* InstructorOne */}
      <InstructorOne />

      {/* CHooseUsOne */}
      <ChooseUsOne />

      {/* CounterOne */}
      <CounterOne />

      {/* TestimonialsOne */}
      <TestimonialsOne />

      {/* BlogOne */}
      <BlogOne />

      {/* CertificateOne */}
      <CertificateOne />

      {/* FooterOne */}
      <FooterOne />
    </>
  );
};

export default HomePageOne;
