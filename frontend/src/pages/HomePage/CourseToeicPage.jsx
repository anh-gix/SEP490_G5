import Breadcrumb from "../../components/Breadcrumb";
import CertificateOne from "../../components/CertificateOne";
import CourseGridView from "../../components/CourseDetail/CourseGridView";
import FooterOne from "../../components/FooterOne";
import HeaderOne from "../../components/HomePageforStudent/HeaderOne";
import Animation from "../../helper/Animation";
import Preloader from "../../helper/Preloader";

const CourseToeicPage = () => {
  return (
    <>
      <Preloader />
      <Animation />
      <HeaderOne />
      <Breadcrumb title={"Khóa học TOEIC"} />
      <CourseGridView initialType='toeic' />
      <CertificateOne />
      <FooterOne />
    </>
  );
};

export default CourseToeicPage;

