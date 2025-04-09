import React, { useEffect } from "react";
import styles from "../styles/PrivacyPolicyPage.module.css";

const PrivacyPolicyPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Replace placeholders like [Date], [Email Address], [Company Address], [13/16/18]
  // with actual values or make them dynamic if needed.
  const lastUpdatedDate = "October 26, 2023"; // Example Date
  const contactEmail = "privacy@caseprepared.com"; // Example Email
  const companyAddress = "123 Tech Lane, Innovation City, CA 94043"; // Example Address
  const ageRequirement = "18"; // Example Age

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.lastUpdated}>Last Updated: {lastUpdatedDate}</p>
      </div>

      <div className={styles.content}>
        <p>
          At <strong>caseprepared.com</strong> (hereinafter "we," "us," or
          "our"), we respect your privacy and are committed to protecting your
          personal data. This Privacy Policy explains how we collect, use,
          disclose, and safeguard your information when you use our website or
          related services (collectively, the "Services").
        </p>
        <p>
          By accessing or using our Services, you agree to the terms in this
          Privacy Policy. If you do not agree, please refrain from using our
          Services.
        </p>

        <h2>1. Information We Collect</h2>
        <h3>1.1 Personal Information</h3>
        <p>
          We may collect personal information that you voluntarily provide to us
          when you:
        </p>
        <ul>
          <li>Register for an account on our platform.</li>
          <li>Subscribe to a newsletter or request information.</li>
          <li>
            Participate in any interactive features (such as forums or user
            discussions).
          </li>
          <li>Purchase any paid services or subscriptions.</li>
        </ul>
        <p>Such information may include:</p>
        <ul>
          <li>Name</li>
          <li>Email address</li>
          <li>Billing information (credit card number, billing address)</li>
          <li>
            Profile details (e.g., education background, professional interests)
          </li>
        </ul>

        <h3>1.2 Usage Data</h3>
        <p>
          When you access or use our Services, we automatically collect certain
          information about your device and usage, such as:
        </p>
        <ul>
          <li>IP address</li>
          <li>Browser type and version</li>
          <li>Pages viewed and time spent</li>
          <li>Access times and dates</li>
          <li>Referring/exit pages</li>
        </ul>
        <p>
          We collect this information using cookies, web beacons, and similar
          tracking technologies.
        </p>

        <h3>1.3 Cookies and Similar Technologies</h3>
        <p>We may use cookies or similar tracking technologies to:</p>
        <ul>
          <li>Remember your preferences and settings.</li>
          <li>Understand how you interact with our Services.</li>
          <li>Customize and improve your user experience.</li>
          <li>Measure and analyze the performance of our Services.</li>
        </ul>
        <p>
          You can control cookies through your browser settings. Note that some
          features of our Services may not function properly if cookies are
          disabled.
        </p>

        <h2>2. How We Use Your Information</h2>
        <p>We use the collected information for purposes such as:</p>
        <ul>
          <li>
            <strong>Account Management:</strong> Creating and maintaining your
            user account, including billing and customer support.
          </li>
          <li>
            <strong>Service Delivery:</strong> Providing access to our case
            interview materials, mock interview tools, or other features you
            request.
          </li>
          <li>
            <strong>Improvement and Personalization:</strong> Analyzing usage
            trends and personalizing content or recommendations.
          </li>
          <li>
            <strong>Communications:</strong> Sending you updates, newsletters,
            marketing messages, and transactional emails. You can opt out of
            non-essential emails at any time.
          </li>
          <li>
            <strong>Security:</strong> Detecting, preventing, and addressing
            technical issues or potential illegal activities.
          </li>
        </ul>

        <h2>3. Legal Basis for Processing (If Applicable)</h2>
        <p>
          Depending on your jurisdiction (e.g., the European Economic Area under
          GDPR), our legal bases for processing personal data may include:
        </p>
        <ul>
          <li>
            <strong>Consent:</strong> You have given clear consent for us to
            process your personal data for a specific purpose.
          </li>
          <li>
            <strong>Contract Performance:</strong> Processing is necessary to
            perform a contract you are party to, or to take steps at your
            request before entering a contract.
          </li>
          <li>
            <strong>Legitimate Interests:</strong> Processing is necessary for
            our legitimate interests, such as improving our Services, unless
            overridden by your data-protection interests.
          </li>
        </ul>

        <h2>4. How We Share Your Information</h2>
        <p>We may share your personal data with:</p>
        <ul>
          <li>
            <strong>Service Providers:</strong> Third-party vendors who perform
            tasks on our behalf (e.g., payment processors, hosting providers,
            analytics services).
          </li>
          <li>
            <strong>Business Transfers:</strong> In the event of a merger,
            acquisition, or asset sale, user information may be transferred as
            part of that transaction.
          </li>
          <li>
            <strong>Legal Compliance:</strong> If required by law or a legal
            process, or to protect our rights, users, or the public.
          </li>
        </ul>
        <p>
          We do not sell your personal data to third parties for direct
          marketing purposes.
        </p>

        <h2>5. Data Retention</h2>
        <p>
          We retain your personal information only for as long as is necessary
          to fulfill the purposes outlined in this Privacy Policy, unless a
          longer retention period is required or permitted by law. Once the
          retention period expires, we will either delete or anonymize your
          personal data in a secure manner.
        </p>

        <h2>6. Security Measures</h2>
        <p>
          We implement appropriate technical and organizational measures to
          protect against unauthorized access, alteration, disclosure, or
          destruction of personal data. However, no transmission of data over
          the internet or electronic storage method can be guaranteed to be 100%
          secure. You acknowledge that you provide your information at your own
          risk.
        </p>

        <h2>7. Your Rights and Choices</h2>
        <h3>7.1 Account Information</h3>
        <p>
          You can review and update certain personal information in your account
          profile at any time. If you wish to delete your account, please
          contact us at <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
          We may retain certain information as required by law or for legitimate
          business purposes.
        </p>
        <h3>7.2 Marketing Communications</h3>
        <p>
          You can opt out of receiving marketing emails by following the
          unsubscribe link in each email or by contacting us directly. Even if
          you opt out of marketing, we may still send you non-promotional
          communications related to your account (e.g., billing, service
          updates).
        </p>
        <h3>7.3 GDPR and Other Regulations (If Applicable)</h3>
        <p>
          Depending on your location, you may have additional rights such as:
        </p>
        <ul>
          <li>The right to access, correct, or erase your personal data.</li>
          <li>
            The right to restrict or object to the processing of your data.
          </li>
          <li>The right to data portability.</li>
        </ul>
        <p>
          To exercise these rights, please contact us at
          <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
        </p>

        <h2>8. International Transfers</h2>
        <p>
          Your personal data may be transferred to, stored, or processed in a
          country different from your own. We will ensure that such transfers
          comply with applicable data protection laws and that appropriate
          safeguards are in place.
        </p>

        <h2>9. Third-Party Links</h2>
        <p>
          Our Services may contain links to third-party websites. We are not
          responsible for the privacy practices of such external sites. We
          encourage you to read their privacy policies before sharing any
          personal information.
        </p>

        <h2>10. Children's Privacy</h2>
        <p>
          Our Services are not directed to individuals under the age of{" "}
          {ageRequirement}. We do not knowingly collect personal information
          from minors without verifiable parental consent. If you believe we
          have collected information from a minor without appropriate consent,
          please contact us, and we will take steps to delete such information.
        </p>

        <h2>11. Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. When we do, we
          will notify you of any significant changes.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
