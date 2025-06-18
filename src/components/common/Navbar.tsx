import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../styles/common/Navbar.module.css";
import { useAuth } from "../../contexts/AuthContext";

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout } = useAuth();
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
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}>
        <div className={styles.container}>
          <div className={styles.logo}>
            <Link to="/interviews" className={styles.logoText}>
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
              <Link to="/profile" className={styles.navLink}>
                Profile
              </Link>
            </li>
          </ul>

          <div className={styles.navCta}>
            <button className={styles.logoutButton} onClick={handleLogout}>
              Sign out
            </button>
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
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Navbar;
