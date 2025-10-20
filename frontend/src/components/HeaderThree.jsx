import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Select from "react-select";

const HeaderThree = () => {
  let { pathname } = useLocation();
  const [scroll, setScroll] = useState(false);
  const [isMenuActive, setIsMenuActive] = useState(false);

  useEffect(() => {
    window.onscroll = () => {
      if (window.pageYOffset < 150) {
        setScroll(false);
      } else if (window.pageYOffset > 150) {
        setScroll(true);
      }
      return () => (window.onscroll = null);
    };
  }, []);

  const options = [
    { value: 1, label: "Physics" },
    { value: 2, label: "Math" },
    { value: 3, label: "Biology" },
    { value: 4, label: "English" },
    { value: 5, label: "Higher Math" },
    { value: 6, label: "Social Science" },
    { value: 7, label: "Chemistry" },
  ];

  const [selectedOption, setSelectedOption] = useState(options[0]);

  const toggleMenu = () => {
    setIsMenuActive(!isMenuActive);
    if (!isMenuActive) {
      document.body.classList.add("scroll-hide-sm");
    } else {
      document.body.classList.remove("scroll-hide-sm");
    }
  };

  const closeMenu = () => {
    setIsMenuActive(false);
    document.body.classList.remove("scroll-hide-sm");
  };

  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmenuClick = (index) => {
    if (windowWidth < 992) {
      setActiveSubmenu((prevIndex) => (prevIndex === index ? null : index));
    }
  };

  const menuItems = [
    {
      label: "Home",
      links: [
        { to: "/", label: "Home LMS" },
        { to: "/index-2", label: "Home Online Course" },
        { to: "/index-3", label: "Home University" },
        { to: "/index-4", label: "Home Tutor" },
        { to: "/index-5", label: "Home Kindergarten" },
        { to: "/index-6", label: " Home Kindergarten two" },
      ],
    },
    {
      label: "Courses",
      links: [
        { to: "/course", label: "Course Grid View" },
        { to: "/course-list-view", label: "Course List View" },
        { to: "/course-details", label: "Course Details" },
        { to: "/lesson-details", label: "Lesson Details" },
      ],
    },
    {
      label: "Pages",
      links: [
        { to: "/about", label: "About" },
        { to: "/about-two", label: "About Two" },
        { to: "/about-three", label: "About Three" },
        { to: "/about-four", label: "About Four" },
        { to: "/product", label: "Product" },
        { to: "/product-details", label: "Product Details" },
        { to: "/cart", label: "Cart" },
        { to: "/checkout", label: "Checkout" },
        { to: "/pricing-plan", label: "Pricing Plan" },
        { to: "/instructor", label: "Instructor" },
        { to: "/instructor-two", label: "Instructor Two" },
        { to: "/instructor-details", label: "Instructor Details" },
        { to: "/tutor", label: "Premium Tutors" },
        { to: "/tutor-details", label: "Premium Tutors Details" },
        { to: "/faq", label: "FAQ" },
        { to: "/tuition-jobs", label: "Tuition Jobs" },
        { to: "/events", label: "Events" },
        { to: "/event-details", label: "Event Details" },
        { to: "/apply-admission", label: "Apply Admission" },
        { to: "/gallery", label: "Gallery" },
        { to: "/privacy-policy", label: "Privacy Policy" },
        { to: "/favorite-course", label: "Favorite Course" },
        { to: "/find-tutors", label: "Find Best Tutors" },
        { to: "/book-online-class", label: "Book Online Class" },
      ],
    },

    {
      label: "Blog",
      links: [
        { to: "/blog", label: "Blog Grid" },
        { to: "/blog-list", label: "Blog List" },
        { to: "/blog-classic", label: "Blog Classic" },
        { to: "/blog-details", label: "Blog Details" },
      ],
    },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <>
      <div className={`side-overlay ${isMenuActive ? "show" : ""}`}></div>
      <header
        className={`header position-absolute z-2 w-100 top-0 ${
          scroll ? "fixed-header" : ""
        }`}
      >
        <div className='container container--xl'>
          <nav className='header-inner flex-between gap-8'>
            <div className='header-content-wrapper flex-align flex-grow-1'>
              {/* Logo Start */}
              <div className='logo'>
                <Link to='/' className='link'>
                  <img src='assets/images/logo/logo.png' alt='Logo' />
                </Link>
              </div>
              {/* Logo End  */}
              {/* Select Start */}
              <div className='d-sm-block d-none'>
                <div className='header-select  rounded-pill position-relative'>
                  <div className='custom__select'>
                    <Select
                      classNames={{
                        control: (state) =>
                          state.isFocused
                            ? " border-focus"
                            : "border-neutral-30",
                      }}
                      value={selectedOption}
                      onChange={setSelectedOption}
                      options={options}
                    />
                  </div>
                </div>
              </div>
              {/* Select End */}
              {/* Menu Start  */}
              <div className='header-menu d-lg-block d-none'>
                <ul className='nav-menu flex-align'>
                  {menuItems.map((item, index) =>
                    item.links ? (
                      <li
                        key={`menu-item-${index}`}
                        className='nav-menu__item has-submenu'
                      >
                        <span to='#' className='nav-menu__link'>
                          {item.label}
                        </span>
                        <ul className={`nav-submenu scroll-sm`}>
                          {item.links.map((link, linkIndex) => (
                            <li
                              key={`submenu-item-${linkIndex}`}
                              className={`nav-submenu__item ${
                                pathname === link.to && "activePage"
                              }`}
                            >
                              <Link
                                to={link.to}
                                className='nav-submenu__link hover-bg-neutral-30'
                              >
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                    ) : (
                      <li
                        key={`menu-contact-${index}`}
                        className={`nav-menu__item ${
                          pathname === item.to && "activePage"
                        }`}
                      >
                        <Link to={item.to} className='nav-menu__link'>
                          {item.label}
                        </Link>
                      </li>
                    )
                  )}
                </ul>
              </div>
              {/* Menu End  */}
            </div>
            {/* Header Right start */}
            <div className='header-right flex-align'>
              <form
                action='#'
                className='search-form position-relative d-xl-block d-none'
              >
                <input
                  type='text'
                  className='common-input rounded-pill bg-white pe-48 border-neutral-30'
                  placeholder='Search...'
                />
                <button
                  type='submit'
                  className='w-36 h-36 bg-main-600 hover-bg-main-700 rounded-circle flex-center text-md text-white position-absolute top-50 translate-middle-y inset-inline-end-0 me-8'
                >
                  <i className='ph-bold ph-magnifying-glass' />
                </button>
              </form>
              <Link
                to='#'
                className='info-action w-44 h-44 bg-white hover-bg-main-600 rounded-circle flex-center text-xl text-neutral-500 hover-text-white position-relative me-6'
              >
                <i className='ph-bold ph-shopping-cart-simple' />
                <span className='w-22 h-22 flex-center rounded-circle bg-main-two-600 text-white text-xs position-absolute top-n6 end-n4'>
                  1
                </span>
              </Link>
              <Link
                to='/sign-in'
                className='info-action w-52 h-52 bg-white hover-bg-main-600 border border-neutral-30 rounded-circle flex-center text-2xl text-neutral-500 hover-text-white hover-border-main-600'
              >
                <i className='ph ph-user-circle' />
              </Link>
              <button
                type='button'
                className='toggle-mobileMenu d-lg-none text-neutral-200 flex-center'
                onClick={toggleMenu}
              >
                <i className='ph ph-list' />
              </button>
            </div>

            {/* Header Right End  */}
          </nav>
        </div>
      </header>

      <div
        className={`mobile-menu scroll-sm d-lg-none d-block ${
          isMenuActive ? "active" : ""
        }`}
      >
        <button type='button' className='close-button' onClick={closeMenu}>
          <i className='ph ph-x' />{" "}
        </button>
        <div className='mobile-menu__inner'>
          <Link to='/' className='mobile-menu__logo'>
            <img src='assets/images/logo/logo.png' alt='Logo' />
          </Link>
          <div className='mobile-menu__menu'>
            <ul className='nav-menu flex-align nav-menu--mobile'>
              {menuItems.map((item, index) =>
                item.links ? (
                  <li
                    key={`menu-item-${index}`}
                    className={`nav-menu__item has-submenu ${
                      activeSubmenu === index ? "activePage" : ""
                    }`}
                    onClick={() => handleSubmenuClick(index)}
                  >
                    <span className='nav-menu__link'>{item.label}</span>
                    <ul className={`nav-submenu scroll-sm`}>
                      {item.links.map((link, linkIndex) => (
                        <li key={linkIndex} className='nav-submenu__item'>
                          <Link
                            to={link.to}
                            className='nav-submenu__link hover-bg-neutral-30'
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                ) : (
                  <li
                    className={`nav-menu__item ${
                      pathname === item.to && "activePage"
                    }`}
                    key={index}
                  >
                    <Link to={item.to} className='nav-menu__link'>
                      {item.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
            <div className='d-sm-none d-block mt-24'>
              <div className='header-select mobile   rounded-pill position-relative'>
                <div className='custom__select'>
                  <Select
                    classNames={{
                      control: (state) =>
                        state.isFocused ? " border-focus" : "border-neutral-30",
                    }}
                    value={selectedOption}
                    onChange={setSelectedOption}
                    options={options}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeaderThree;
