import { Link } from "react-router-dom";

const Breadcrumb = ({ title }) => {
  return (
    <section className='breadcrumb py-120 bg-main-25 position-relative z-1 overflow-hidden mb-0'>
      <img
        src='assets/images/shapes/shape1.png'
        alt=''
        className='shape one animation-rotation d-md-block d-none'
      />
      <img
        src='assets/images/shapes/shape2.png'
        alt=''
        className='shape two animation-scalation d-md-block d-none'
      />
      <img
        src='assets/images/shapes/shape3.png'
        alt=''
        className='shape eight animation-walking d-md-block d-none'
      />
      <img
        src='assets/images/shapes/shape5.png'
        alt=''
        className='shape six animation-walking d-md-block d-none'
      />
      <img
        src='assets/images/shapes/shape4.png'
        alt=''
        className='shape four animation-scalation'
      />
      <img
        src='assets/images/shapes/shape4.png'
        alt=''
        className='shape nine animation-scalation'
      />
      <div className='container'>
        <div className='row justify-content-center'>
          <div className='col-lg-8'>
            <div className='breadcrumb__wrapper'>
              <h1 className='breadcrumb__title display-4 fw-semibold text-center'>
                {" "}
                {title}
              </h1>
              <ul className='breadcrumb__list d-flex align-items-center justify-content-center gap-4'>
                <li className='breadcrumb__item'>
                  <Link
                    to='/'
                    className='breadcrumb__link text-neutral-500 hover-text-main-600 fw-medium'
                  >
                    <i className='text-lg d-inline-flex ph-bold ph-house' />{" "}
                    Home
                  </Link>
                </li>

                <li className='breadcrumb__item '>
                  <i className='text-neutral-500 d-flex ph-bold ph-caret-right' />
                </li>
                <li className='breadcrumb__item'>
                  <span className='text-main-two-600'> {title} </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Breadcrumb;
