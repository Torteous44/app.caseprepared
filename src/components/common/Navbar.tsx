import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "../../styles/common/Navbar.module.css";
import { useAuth } from "../../contexts/AuthContext";
import { useModal } from "../../contexts/ModalContext";

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { openModal } = useModal();

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

  return (
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

        {!isAuthenticated && (
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
        )}

        <div className={styles.navCta}>
          {isAuthenticated ? (
            <>
              <Link to="/profile" className={styles.navButton}>
                Profile
              </Link>
              <button className={styles.navButton} onClick={logout}>
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
      </div>
    </nav>
  );
};

export default Navbar;
