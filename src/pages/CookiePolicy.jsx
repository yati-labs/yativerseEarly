import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import LegalLayout, { A, H2, PrivacyEmail, UL } from "../legal/LegalLayout";

export default function CookiePolicy() {
  return (
    <>
      <SEO
        title="Cookie Policy"
        description="How yAtIverse uses cookies, local storage, Meta Pixel and Google Analytics, and how to control them."
        path="/cookie-policy"
      />
      <LegalLayout
        title="Cookie Policy"
        intro={
          <>
            This policy explains how yAtIverse uses cookies and similar technologies, including advertising and analytics tools. It
            works together with our <Link className="text-brand-gold underline underline-offset-2" to="/privacy-policy">Privacy Policy</Link>.
          </>
        }
      >
        <H2 id="types">1. What we use</H2>
        <UL>
          <li><strong>Essential storage.</strong> Items in your browser that keep you signed in, remember whether you already joined the waitlist or closed a pop-up, and keep the campaign link you arrived from so we can attribute your sign-up. These are first-party and needed for the site to work properly.</li>
          <li><strong>Analytics.</strong> Google Analytics 4 and Google Tag Manager measure visits and how people move through our pages.</li>
          <li><strong>Advertising measurement.</strong> The Meta Pixel records actions on our site (such as a page view or a waitlist sign-up) and sends them to Meta so we can measure our Facebook and Instagram ads and improve how they are delivered.</li>
        </UL>
        <p>Analytics and advertising tools may set their own cookies. We do not control how long those last. Each provider’s policy explains this.</p>

        <H2 id="control">2. Your choices</H2>
        <UL>
          <li>Block or delete cookies in your browser settings. Blocking essential storage can stop sign-in from working.</li>
          <li>Manage Facebook and Instagram ads in <A href="https://www.facebook.com/adpreferences/ad_settings">Meta ad preferences</A>.</li>
          <li>Opt out of Google Analytics with the <A href="https://tools.google.com/dlpage/gaoptout">browser add-on</A>.</li>
          <li>Opt out of interest-based ads from many companies at <A href="https://optout.aboutads.info">optout.aboutads.info</A>.</li>
        </UL>

        <H2 id="updates">3. Updates</H2>
        <p>We may update this policy when our tools or the law change. The date at the top shows the latest version.</p>

        <H2 id="contact">4. Contact</H2>
        <p>Questions about cookies or tracking: <PrivacyEmail />.</p>
      </LegalLayout>
    </>
  );
}
