import BannerFive from "../components/BannerFive";
import CounterFour from "../components/CounterFour";
import FeaturesThree from "../components/FeaturesThree";
import FooterFour from "../components/FooterFour";
import GallerySectionTwo from "../components/GallerySectionTwo";
import HeaderThree from "../components/HeaderThree";
import InstructorTwo from "../components/InstructorTwo";
import KidsCourses from "../components/KidsCourses";
import MarqueeOne from "../components/MarqueeOne";
import PopularTwo from "../components/PopularTwo";
import TestimonialsFour from "../components/TestimonialsFour";
import Animation from "../helper/Animation";
import Preloader from "../helper/Preloader";

const HomePageFive = () => {
  return (
    <>
      {/* Preloader */}
      <Preloader />

      {/* Animation */}
      <Animation />

      {/* HeaderThree */}
      <HeaderThree />

      {/* BannerFive */}
      <BannerFive />

      {/* FeaturesThree */}
      <FeaturesThree />

      {/* KidsCourses */}
      <KidsCourses />

      {/* CounterFour */}
      <CounterFour />

      {/* MarqueeOne */}
      <MarqueeOne />

      {/* GallerySectionTwo */}
      <GallerySectionTwo />

      {/* InstructorTwo */}
      <InstructorTwo />

      {/* PopularTwo */}
      <PopularTwo />

      {/* TestimonialsFour */}
      <TestimonialsFour />

      {/* FooterFour */}
      <FooterFour />
    </>
  );
};

export default HomePageFive;
