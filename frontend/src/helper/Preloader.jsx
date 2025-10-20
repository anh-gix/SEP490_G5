import { useEffect, useState } from "react";

const Preloader = () => {
  let [active, setActive] = useState(true);
  useEffect(() => {
    setTimeout(function () {
      setActive(false);
    }, 500);
  }, []);

  return (
    <>
      {active ? (
        <div className='loader-mask'>
          <div className='preloader'>
            <img src='assets/images/icons/preloader.gif' alt='' />
          </div>
        </div>
      ) : (
        <div></div>
      )}
    </>
  );
};

export default Preloader;
