import Breadcrumb from "../components/Breadcrumb";
import CertificateOne from "../components/CertificateOne";
import FooterOne from "../components/FooterOne";
import HeaderOne from "../components/HeaderOne";
import SubscriptionPlanOne from "../components/SubscriptionPlanOne";
import Animation from "../helper/Animation";
import Preloader from "../helper/Preloader";

const PricingPlanPage = () => {
  return (
    <>
      {/* Preloader */}
      <Preloader />

      {/* Animation */}
      <Animation />

      {/* HeaderTwo */}
      <HeaderOne />

      {/* Breadcrumb */}
      <Breadcrumb title={"Subscription Plan"} />

      {/* SubscriptionPlanOne */}
      <SubscriptionPlanOne />

      {/* CertificateOne */}
      <CertificateOne />

      {/* FooterOne */}
      <FooterOne />
    </>
  );
};

export default PricingPlanPage;
