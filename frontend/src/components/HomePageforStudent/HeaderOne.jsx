import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Select from "react-select";
import { useAuth } from "../../contexts/AuthContext";
const HeaderOne = () => {
  let { pathname } = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [scroll, setScroll] = useState(false);
  const [isMenuActive, setIsMenuActive] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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

  const handleUserIconClick = (e) => {
    if (isAuthenticated) {
      e.preventDefault();
      setIsUserMenuOpen((prev) => !prev);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
      navigate("/sign-in");
    } catch (error) {
      setIsUserMenuOpen(false);
    }
  };

  const menuItems = [
    {
      label: "Home",
      links: [
        { to: "/", label: "Home LMS" },
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
      label: "Lịch Học",
      links: [
        { to: "/attendance", label: "About" },
        { to: "/student/dashboard", label: "Khóa học của tôi" },
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
    { to: "/exams", label: "Đề thi IELTS" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <>
      <div className={`side-overlay ${isMenuActive ? "show" : ""}`}></div>
      <header className={`header ${scroll ? "fixed-header" : ""}`}>
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
                <div className='header-select   rounded-pill position-relative'>
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
                  className='common-input rounded-pill bg-main-25 pe-48 border-neutral-30'
                  placeholder='Search...'
                />
                <button
                  type='submit'
                  className='w-36 h-36 bg-main-600 hover-bg-main-700 rounded-circle flex-center text-md text-white position-absolute top-50 translate-middle-y inset-inline-end-0 me-8'
                >
                  <i className='ph-bold ph-magnifying-glass' />
                </button>
              </form>
              <div className='position-relative'>
                {isAuthenticated ? (
                  <>
                    <Link
                      to='#'
                      className='info-action w-52 h-52 bg-main-25 hover-bg-main-600 border border-neutral-30 rounded-circle flex-center text-2xl text-neutral-500 hover-text-white hover-border-main-600'
                      onClick={handleUserIconClick}
                    >
                      <i className='ph ph-user-circle' />
                    </Link>
                    {isUserMenuOpen && (
                      <div className='position-absolute mt-8 inset-inline-end-0 z-10' style={{ zIndex: 9999 }}>
                        <div className='bg-white border border-neutral-30 rounded-8 shadow-lg py-8 min-w-400 z-10' style={{ minWidth: 200 }}>
                          <div className='px-16 py-8 border-bottom border-neutral-30'>
                            <span className='text-sm text-neutral-600'>
                             Xin chào, {user?.name || user?.username || "Tài khoản"}!
                            </span>
                          </div>
                          <ul className='list-unstyled my-0'>
                            <li>
                              <Link
                                to='/profile'
                                className='d-block px-16 py-10 hover-bg-neutral-30 text-neutral-700'
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <i className='ph ph-user me-8' /> Profile
                              </Link>
                            </li>
                            <li>
                              <button
                                type='button'
                                className='w-100 text-start px-16 py-10 hover-bg-neutral-30 text-danger-600'
                                onClick={handleLogout}
                              >
                                <i className='ph ph-sign-out me-8' /> Logout
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to='/sign-in'
                    className='info-action w-52 h-52 bg-main-25 hover-bg-main-600 border border-neutral-30 rounded-circle flex-center text-2xl text-neutral-500 hover-text-white hover-border-main-600'
                  >
                    <i className='ph ph-user-circle' />
                  </Link>
                )}
              </div>
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
              <div className='header-select mobile  rounded-pill position-relative'>
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

export default HeaderOne;
