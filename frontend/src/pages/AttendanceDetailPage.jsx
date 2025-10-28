import Breadcrumb from "../components/Breadcrumb";
import FooterOne from "../components/FooterOne";
import HeaderOne from "../components/HeaderOne";
import AttendanceDetailInner from "../components/teaher/AttendanceDetailInner";
import Animation from "../helper/Animation";
import Preloader from "../helper/Preloader";

const AttendanceDetailPage = () => {
  return (
    <>
      {/* Preloader */}
      <Preloader />

      {/* Animation */}
      <Animation />

      {/* HeaderOne */}
      <HeaderOne />

      {/* Breadcrumb */}
      <Breadcrumb title={"Điểm danh chi tiết"} />

      {/* AttendanceDetailInner */}
      <AttendanceDetailInner />

      {/* FooterOne */}
      <FooterOne />
    </>
  );
};

export default AttendanceDetailPage;
