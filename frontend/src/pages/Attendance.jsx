import BlogListInner from "../components/BlogListInner";
import Breadcrumb from "../components/Breadcrumb";
import CertificateOne from "../components/CertificateOne";
import FooterOne from "../components/FooterOne";
import HeaderOne from "../components/HeaderOne";
import Animation from "../helper/Animation";
import Preloader from "../helper/Preloader";
import AttendanceInner from "../components/teaher/AttendanceInner";

const Attendance = () => {
  return (
    <>
      {/* Preloader */}
      <Preloader />

      {/* Animation */}
      <Animation />

      {/* HeaderOne */}
      <HeaderOne />

      {/* Breadcrumb */}
      <Breadcrumb title={"Attendance"} />

      {/* BlogListInner */}
      <AttendanceInner />

      {/* <CertificateOne /> */}
      

      {/* FooterOne */}
      <FooterOne />
    </>
  );
};

export default Attendance;
