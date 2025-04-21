import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../styles/common/Navbar.module.css";
import { useAuth } from "../../contexts/AuthContext";
import { useModal } from "../../contexts/ModalContext";

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { openModal } = useModal();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close mobile menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [navigate]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}>
        <div className={styles.container}>
          <div className={styles.logo}>
            <Link
              to={isAuthenticated ? "/interviews" : "/"}
              className={styles.logoText}
            >
              <img
                src="/assets/Logo Text.svg"
                alt="Case Prepared"
                className={styles.logoImage}
              />
            </Link>
          </div>

          <ul className={styles.navLinks}>
            <li className={styles.navItem}>
              <Link to="/interviews" className={styles.navLink}>
                Interviews
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link to="/resources" className={styles.navLink}>
                Resources
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link to="/pricing" className={styles.navLink}>
                Pricing
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link to="/about" className={styles.navLink}>
                About
              </Link>
            </li>
          </ul>

          <div className={styles.navCta}>
            {isAuthenticated ? (
              <>
                <Link to="/profile" className={styles.navButton}>
                  Profile
                </Link>
                <button className={styles.navButton} onClick={handleLogout}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button
                  className={styles.loginButton}
                  onClick={() => openModal("login")}
                >
                  Log in
                </button>
                <button
                  className={styles.signupButton}
                  onClick={() => openModal("register")}
                >
                  Sign up
                </button>
              </>
            )}
          </div>

          <button
            className={styles.mobileMenuToggle}
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <div className={styles.hamburgerIcon}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.open : ""}`}
      >
        <div className={styles.mobileMenuHeader}>
          <div className={styles.mobileLogo}>
            <img
              src="/assets/Logo Text.svg"
              alt="Case Prepared"
              className={styles.mobileLogoImage}
            />
          </div>
          <button
            className={styles.closeButton}
            onClick={toggleMobileMenu}
            aria-label="Close mobile menu"
          >
            <span>×</span>
          </button>
        </div>

        {!isAuthenticated ? (
          <div className={styles.mobileButtonsContainer}>
            <button
              className={styles.demoButton}
              onClick={() => {
                toggleMobileMenu();
                openModal("login");
              }}
            >
              Log in
            </button>
            <button
              className={styles.trialButton}
              onClick={() => {
                toggleMobileMenu();
                openModal("register");
              }}
            >
              Sign up
            </button>
          </div>
        ) : (
          <div className={styles.mobileButtonsContainer}>
            <Link
              to="/profile"
              className={styles.demoButton}
              onClick={toggleMobileMenu}
            >
              Profile
            </Link>
            <button
              className={styles.trialButton}
              onClick={() => {
                toggleMobileMenu();
                handleLogout();
              }}
            >
              Sign out
            </button>
          </div>
        )}

        <nav className={styles.mobileNav}>
          <ul className={styles.mobileNavLinks}>
            <li className={styles.mobileNavItem}>
              <Link
                to="/interviews"
                className={styles.mobileNavLink}
                onClick={toggleMobileMenu}
              >
                Interviews
                <span className={styles.arrowIcon}>→</span>
              </Link>
            </li>
            <li className={styles.mobileNavItem}>
              <Link
                to="/resources"
                className={styles.mobileNavLink}
                onClick={toggleMobileMenu}
              >
                Resources
                <span className={styles.arrowIcon}>→</span>
              </Link>
            </li>
            <li className={styles.mobileNavItem}>
              <Link
                to="/pricing"
                className={styles.mobileNavLink}
                onClick={toggleMobileMenu}
              >
                Pricing
                <span className={styles.arrowIcon}>→</span>
              </Link>
            </li>
            <li className={styles.mobileNavItem}>
              <Link
                to="/about"
                className={styles.mobileNavLink}
                onClick={toggleMobileMenu}
              >
                About
                <span className={styles.arrowIcon}>→</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Navbar;
