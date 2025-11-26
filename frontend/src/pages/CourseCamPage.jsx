import Breadcrumb from "../components/Breadcrumb";
import CertificateOne from "../components/CertificateOne";
import CourseGridView from "../components/CourseDetail/CourseGridView";
import FooterOne from "../components/FooterOne";
import HeaderOne from "../components/HomePageforStudent/HeaderOne";
import Animation from "../helper/Animation";
import Preloader from "../helper/Preloader";

const CourseCamPage = () => {
  return (
    <>
      <Preloader />
      <Animation />
      <HeaderOne />
      <Breadcrumb title={"Khóa học Tiếng Anh Trẻ Em"} />
      <CourseGridView initialType='cam' />
      <CertificateOne />
      <FooterOne />
    </>
  );
};

export default CourseCamPage;

