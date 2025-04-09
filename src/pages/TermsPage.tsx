import React, { useEffect } from "react";
import styles from "../styles/TermsPage.module.css";

const TermsPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Replace placeholders like [Date], [13/16/18], [your local currency or USD], [Your Jurisdiction]
  // with actual values or make them dynamic if needed.
  const lastUpdatedDate = "October 26, 2023"; // Example Date
  const ageRequirement = "18"; // Example Age
  const currency = "USD"; // Example Currency
  const jurisdiction = "State of Delaware, USA"; // Example Jurisdiction
  const contactEmail = "contact@caseprepared.com"; // Example Email

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Terms and Conditions</h1>
        <p className={styles.lastUpdated}>Last Updated: {lastUpdatedDate}</p>
      </div>

      <div className={styles.content}>
        <p>
          Welcome to <strong>caseprepared.com</strong> (hereinafter referred to
          as "the Platform," "we," "us," or "our"). The following Terms and
          Conditions govern your use of the Platform, including any content,
          functionality, and services offered on or through the Platform. By
          accessing or using the Platform, you agree to be bound by these Terms
          and Conditions. If you do not agree with any part of these Terms, you
          must not access the Platform.
        </p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          1.1 By using or accessing the Platform, you confirm that you can form
          a binding contract with us and that you accept these Terms and
          Conditions.
        </p>
        <p>
          1.2 If you are using the Platform on behalf of a company or other
          legal entity, you represent that you have the authority to bind that
          entity to these Terms.
        </p>

        <h2>2. Changes to the Terms</h2>
        <p>
          2.1 We reserve the right to modify or replace these Terms at any time,
          and such modifications or replacements will become effective upon
          posting the updated Terms on the Platform.
        </p>
        <p>
          2.2 We will use reasonable efforts to provide notice of any material
          changes, but it is your responsibility to review these Terms
          periodically.
        </p>

        <h2>3. Eligibility and Account Registration</h2>
        <p>
          3.1 You must be at least {ageRequirement} years old to use the
          Platform. If you are under the required age, you must not use the
          Platform.
        </p>
        <p>
          3.2 Certain features may require you to create an account. You agree
          to provide accurate, current, and complete information during the
          registration process and to update such information to keep it
          accurate and complete.
        </p>
        <p>
          3.3 You are responsible for maintaining the confidentiality of your
          account credentials and all activities that occur under your account.
          If you suspect any unauthorized use of your account, you must notify
          us immediately.
        </p>

        <h2>4. Use of the Platform</h2>
        <h3>4.1 Permitted Use:</h3>
        <p>
          You may use the Platform for your personal or internal business
          purposes related to interview preparation, subject to compliance with
          these Terms and applicable laws.
        </p>
        <h3>4.2 Prohibited Conduct:</h3>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Platform for any illegal or unauthorized purpose.</li>
          <li>
            Post or transmit any content that is unlawful, harmful, threatening,
            defamatory, or otherwise objectionable.
          </li>
          <li>
            Interfere with or disrupt the Platform or its servers, networks, or
            other infrastructure.
          </li>
          <li>
            Reverse engineer, decompile, disassemble, or otherwise attempt to
            discover the source code of the Platform or any part thereof.
          </li>
          <li>
            Collect or store personal data of other users without their explicit
            consent.
          </li>
        </ul>

        <h2>5. Intellectual Property</h2>
        <h3>5.1 Ownership:</h3>
        <p>
          The Platform, including all intellectual property rights such as
          software, text, graphics, logos, and trademarks, is owned by or
          licensed to caseprepared.com. All rights not expressly granted in
          these Terms are reserved.
        </p>
        <h3>5.2 User-Generated Content:</h3>
        <ul>
          <li>
            If you post or submit content (e.g., comments, forum posts), you
            grant us a non-exclusive, worldwide, royalty-free, sublicensable
            license to use, reproduce, and display such content for the
            operation and promotion of the Platform.
          </li>
          <li>
            You represent and warrant that you have all necessary rights to post
            or submit content and that such content does not infringe any
            third-party rights.
          </li>
        </ul>

        <h2>6. Payments and Subscriptions</h2>
        <h3>6.1 Fees:</h3>
        <p>
          Certain features or services (e.g., premium mock interviews, advanced
          analytics) may require payment of fees. All fees are stated in{" "}
          {currency} unless otherwise specified, and are non-refundable unless
          required by law.
        </p>
        <h3>6.2 Billing:</h3>
        <p>
          If you sign up for a subscription service, you agree to pay all
          applicable fees and authorize us to charge the payment method you
          provide for all such fees.
        </p>
        <h3>6.3 Subscription Auto-Renewal:</h3>
        <p>
          Subscriptions may automatically renew unless canceled according to the
          instructions provided on the Platform. You can manage or cancel your
          subscription through your account settings.
        </p>

        <h2>7. Disclaimers</h2>
        <h3>7.1 No Professional Advice:</h3>
        <p>
          The Platform provides educational content and tools related to
          interview preparation. We do not guarantee that use of the Platform
          will result in any specific employment or consulting outcomes.
        </p>
        <h3>7.2 Availability:</h3>
        <p>
          We strive to keep the Platform available, but technical issues,
          maintenance, or upgrades may result in temporary interruptions. We do
          not warrant that the Platform will be error-free or uninterrupted.
        </p>

        <h2>8. Limitation of Liability</h2>
        <p>
          8.1 To the fullest extent permitted by law, in no event shall
          caseprepared.com, its directors, employees, or affiliates be liable
          for any indirect, incidental, consequential, or punitive damages
          arising out of or related to your use or inability to use the
          Platform.
        </p>
        <p>
          8.2 Our total liability for any claim arising out of or relating to
          these Terms or the Platform shall not exceed the total amount paid by
          you, if any, for accessing the Platform within the twelve-month period
          preceding the event giving rise to such liability.
        </p>

        <h2>9. Indemnification</h2>
        <p>
          9.1 You agree to indemnify and hold harmless caseprepared.com, its
          affiliates, and their respective officers, employees, and agents from
          and against any claims, liabilities, damages, or expenses (including
          reasonable attorneys' fees) arising from your breach of these Terms or
          your misuse of the Platform.
        </p>

        <h2>10. Termination</h2>
        <p>
          10.1 We may terminate or suspend your access to the Platform at any
          time, with or without cause, including if we believe you have violated
          these Terms.
        </p>
        <p>
          10.2 Upon termination, all rights granted to you under these Terms
          will cease, and you must immediately discontinue use of the Platform.
        </p>

        <h2>11. Governing Law and Dispute Resolution</h2>
        <p>
          11.1 These Terms shall be governed by and construed in accordance with
          the laws of {jurisdiction}, without regard to conflict-of-law
          principles.
        </p>
        <p>
          11.2 Any disputes arising out of or connected with these Terms shall
          be subject to the exclusive jurisdiction of the courts located in{" "}
          {jurisdiction}, and you consent to personal jurisdiction in those
          courts.
        </p>

        <h2>12. Miscellaneous</h2>
        <h3>12.1 Entire Agreement:</h3>
        <p>
          These Terms, along with any other agreements or policies referenced
          herein, constitute the entire agreement between you and
          caseprepared.com regarding the use of the Platform.
        </p>
        <h3>12.2 Severability:</h3>
        <p>
          If any provision of these Terms is found to be invalid or
          unenforceable, that provision shall be enforced to the maximum extent
          permissible, and the remaining provisions shall remain in full force
          and effect.
        </p>
        <h3>12.3 No Waiver:</h3>
        <p>
          Our failure to enforce any right or provision of these Terms shall not
          be deemed a waiver of such right or provision.
        </p>
        <h3>12.4 Contact Us:</h3>
        <p>
          If you have any questions about these Terms or the Platform, you may
          contact us at <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
        </p>
      </div>
    </div>
  );
};

export default TermsPage;
