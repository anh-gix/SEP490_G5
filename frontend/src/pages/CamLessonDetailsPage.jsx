import Breadcrumb from "../components/Breadcrumb";
import CertificateOne from "../components/CertificateOne";
import LessonDetails from "../components/CourseDetail/LessonDetails";
import FooterOne from "../components/FooterOne";
import HeaderOne from "../components/HomePageforStudent/HeaderOne";
import Animation from "../helper/Animation";
import Preloader from "../helper/Preloader";

const CamLessonDetailsPage = () => {
  return (
    <>
      <Preloader />
      <Animation />
      <HeaderOne />
      <Breadcrumb title={"Chi tiết Cam Session"} />
      <LessonDetails />
      <CertificateOne />
      <FooterOne />
    </>
  );
};

export default CamLessonDetailsPage;

