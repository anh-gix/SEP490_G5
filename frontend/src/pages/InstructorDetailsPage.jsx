import Breadcrumb from "../components/Breadcrumb";
import CertificateOne from "../components/CertificateOne";
import CourseAllOne from "../components/CourseAllOne";
import FooterOne from "../components/FooterOne";
import HeaderOne from "../components/HeaderOne";
import InstructorDetails from "../components/InstructorDetails";
import TestimonialsTwo from "../components/TestimonialsTwo";
import Animation from "../helper/Animation";
import Preloader from "../helper/Preloader";

const InstructorDetailsPage = () => {
  return (
    <>
      {/* Preloader */}
      <Preloader />

      {/* Animation */}
      <Animation />

      {/* HeaderOne */}
      <HeaderOne />

      {/* Breadcrumb */}
      <Breadcrumb title={"Instructors Details"} />

      {/* InstructorDetails */}
      <InstructorDetails />

      {/* CourseAllOne */}
      <CourseAllOne />

      {/* TestimonialsTwo */}
      <TestimonialsTwo />

      {/* CertificateOne */}
      <CertificateOne />

      {/* FooterOne */}
      <FooterOne />
    </>
  );
};

export default InstructorDetailsPage;
