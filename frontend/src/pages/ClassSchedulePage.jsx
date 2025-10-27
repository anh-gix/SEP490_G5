import Breadcrumb from "../components/Breadcrumb";
import FooterOne from "../components/FooterOne";
import HeaderOne from "../components/HeaderOne";
import ClassScheduleInner from "../components/teaher/ClassScheduleInner";
import Animation from "../helper/Animation";
import Preloader from "../helper/Preloader";

const ClassSchedulePage = () => {
  return (
    <>
      {/* Preloader */}
      <Preloader />

      {/* Animation */}
      <Animation />

      {/* HeaderOne */}
      <HeaderOne />

      {/* Breadcrumb */}
      <Breadcrumb title={"Lịch học"} />

      {/* ClassScheduleInner */}
      <ClassScheduleInner />

      {/* FooterOne */}
      <FooterOne />
    </>
  );
};

export default ClassSchedulePage;
