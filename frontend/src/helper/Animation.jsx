import { useEffect } from "react";
import Aos from "aos";
import "aos/dist/aos.css";

const Animation = () => {
  useEffect(() => {
    Aos.init({
      duration: 1200,
      easing: "ease",
      once: true, // only animate once when scrolling down
      offset: 0,
    });
  }, []);

  return null;
};

export default Animation;
