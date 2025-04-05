import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/Navbar.module.css";

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

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
          <Link to="/" className={styles.logoText}>
            Case Prepared
          </Link>
        </div>

        <ul className={styles.navLinks}>
          <li className={styles.navItem}>
            <Link to="/interviews" className={styles.navLink}>
              Interviews
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link to="/" className={styles.navLink}>
              Resources
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link to="/" className={styles.navLink}>
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
          <button className={styles.loginButton}>Log in</button>
          <button className={styles.signupButton}>Sign up</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
