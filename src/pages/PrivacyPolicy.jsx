import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import { ROUTE_SEO } from "../seo/routes";
import { LEGAL } from "../legal/legalConfig";
import LegalLayout, { A, H2, H3, PrivacyEmail, UL } from "../legal/LegalLayout";

const TOC = [
  ["scope", "Who we are and what this covers"],
  ["collect", "Information we collect"],
  ["use", "How we use information"],
  ["tracking", "Cookies, Meta Pixel and analytics"],
  ["storage", "Storage, security and retention"],
  ["sharing", "Who we share information with"],
  ["rights", "Your choices and rights"],
  ["children", "Children"],
  ["changes", "Changes to this policy"],
  ["contact", "Contact us"],
];

export default function PrivacyPolicy() {
  return (
    <>
      <SEO path="/privacy-policy" {...ROUTE_SEO["/privacy-policy"]} />
      <LegalLayout
        title="Privacy Policy"
        toc={TOC}
        intro={
          <>
            This policy explains what personal information yAtIverse collects, why we collect it, who we share it with, and the
            choices you have. We try to collect only what we need and to say plainly what we do with it.
          </>
        }
      >
        <H2 id="scope">1. Who we are and what this covers</H2>
        <p>
          yAtIverse (“we”, “us”, “our”){LEGAL.entityName ? <> is operated by {LEGAL.entityName}</> : null}. This policy applies to <strong>yativerse.ai</strong>, our campaign
          and landing pages, our waitlist and early-access sign-ups, the yAtIverse app and dashboard, our emails, and information
          you send us through lead forms on Facebook and Instagram (Meta Instant Forms).
        </p>
        <p>
          It does not cover other companies’ websites or apps that we link to, or the way Meta, Google or other platforms handle
          information under their own policies.
        </p>

        <H2 id="collect">2. Information we collect</H2>

        <H3>A. Information you give us on our website</H3>
        <UL>
          <li><strong>Name and email address</strong> when you join the waitlist, request early access, subscribe to updates, create an account, or contact us.</li>
          <li><strong>Optional details</strong> you choose to share, such as your role, the device you use (for example iPhone, Mac or Android), which yAtI Flow model you are interested in, and whether you agree to receive marketing emails.</li>
          <li><strong>Messages</strong> you send us, and our replies.</li>
        </UL>

        <H3>B. Information you give us through Meta Instant Forms</H3>
        <p>
          If you tap one of our ads on Facebook or Instagram and complete a lead form, you submit information (such as your
          <strong> name and email address</strong>) to Meta first. Meta then makes that submission available to us. Meta handles the
          form under <A href="https://www.facebook.com/privacy/policy/">its own privacy policy</A>; we use what we receive as
          described in this policy.
        </p>

        <H3>C. Account and product information</H3>
        <p>
          If you create a yAtIverse account, we collect your sign-in details (through Google Firebase Authentication, including
          Google sign-in if you choose it), your profile and settings, and billing details handled by Stripe if you buy a plan. If you
          connect a service such as Gmail, Google Calendar, Slack or HubSpot, we access only the data needed to provide the feature
          you turned on, and you can disconnect it at any time.
        </p>

        <H3>D. Information collected automatically</H3>
        <UL>
          <li>Device and browser type, IP address, approximate location, pages viewed, links clicked, referring site, and the date and time of your visit.</li>
          <li><strong>Campaign details</strong>: if you arrive from an ad, we keep the tracking parameters in the link (such as utm_source, utm_campaign, fbclid or gclid) and save them with your sign-up so we know which campaign brought you.</li>
          <li>Information from cookies and similar technologies. See Section 4.</li>
        </UL>

        <H2 id="use">3. How we use information</H2>
        <UL>
          <li><strong>Early-access communication</strong>: confirming your sign-up, telling you when yAtI Flow orders and early access open, and sending launch and onboarding details.</li>
          <li><strong>Product updates</strong>: sending news and offers about yAtIverse if you opted in or are otherwise allowed to receive them. You can stop these at any time.</li>
          <li><strong>Responding to you</strong>: answering questions, support requests and privacy requests.</li>
          <li><strong>Running the service</strong>: creating and securing accounts, processing payments, preventing spam and abuse, and fixing problems.</li>
          <li><strong>Improving our website and ads</strong>: understanding how people use our pages and which ads lead to sign-ups, so we can improve the product and spend our advertising budget wisely.</li>
          <li><strong>Legal reasons</strong>: meeting legal obligations and protecting our rights.</li>
        </UL>
        <p>We do not use your name or email to build profiles for sale to others.</p>

        <H2 id="tracking">4. Cookies, Meta Pixel and analytics</H2>
        <p>
          Our website uses cookies, local storage and similar technologies, and tools from other companies, to make the site work,
          measure traffic and measure our advertising. We currently use:
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["Meta Pixel", "Records visits and actions on our site (for example a page view or a waitlist sign-up) and sends them to Meta so we can measure how our Facebook and Instagram ads perform and improve how they are delivered. Meta may match this to people who have Meta accounts."],
            ["Google Analytics 4", "Counts visits and shows how people move through our pages, using cookies and your IP address, so we can improve the site."],
            ["Google Tag Manager", "Loads and manages the tags above, and any other measurement tags we add."],
            ["First-party storage", "Small items saved in your browser: your sign-in session, whether you already joined the waitlist or closed a pop-up, and the campaign link you arrived from."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="font-semibold text-white">{t}</p>
              <p className="mt-1 text-sm leading-6 text-white/70">{d}</p>
            </div>
          ))}
        </div>
        <p>
          We do not intentionally send your name or email address to these tools. Page addresses and campaign parameters are sent,
          and Meta and Google may collect further technical information themselves.
        </p>
        <H3>Your choices</H3>
        <UL>
          <li>Change cookie settings in your browser, or use a browser or extension that blocks trackers. Blocking essential storage can stop sign-in from working.</li>
          <li>Manage ads on Facebook and Instagram in <A href="https://www.facebook.com/adpreferences/ad_settings">Meta ad preferences</A>.</li>
          <li>Opt out of Google Analytics with the <A href="https://tools.google.com/dlpage/gaoptout">Google Analytics opt-out add-on</A>, and learn how Google uses data from sites like ours <A href="https://policies.google.com/technologies/partner-sites">here</A>.</li>
          <li>Opt out of interest-based advertising from many companies at <A href="https://optout.aboutads.info">optout.aboutads.info</A>.</li>
        </UL>
        <p>
          More detail is in our <Link className="text-brand-gold underline underline-offset-2" to="/cookie-policy">Cookie Policy</Link>.
        </p>

        <H2 id="storage">5. Storage, security and retention</H2>
        <H3>Where it is stored</H3>
        <p>
          Waitlist and sign-up records are stored in our database on Microsoft Azure. We send email through Azure Communication
          Services. Account sign-in uses Google Firebase Authentication. Our service providers may process information in the
          United States or other countries where they operate.
        </p>
        <H3>How we protect it</H3>
        <p>
          We use encrypted connections (HTTPS), restrict access to the systems that hold personal information, and use providers
          that apply industry-standard security. No method of transmission or storage is completely secure, so we cannot guarantee
          absolute security.
        </p>
        <H3>How long we keep it</H3>
        <UL>
          <li>
            <strong>Waitlist and lead information</strong>: until you unsubscribe or ask us to delete it, or until{" "}
            {LEGAL.waitlistRetention ? <>{LEGAL.waitlistRetention} after the early-access program ends</> : "we no longer need it for the early-access program"}
            , whichever comes first.
          </li>
          <li><strong>Account information</strong>: while your account is open, and for a limited time afterward where needed for security, accounting or legal reasons.</li>
          <li><strong>Messages to us</strong>: as long as needed to handle your request and keep a reasonable record.</li>
          <li><strong>Analytics and advertising data</strong>: for the period set in each provider’s tools and policies.</li>
        </UL>
        <p>If you ask us to delete your information, we remove it unless the law requires us to keep it.</p>

        <H2 id="sharing">6. Who we share information with</H2>
        <p>We do not sell your personal information for money. We share it only as follows:</p>
        <UL>
          <li><strong>Service providers</strong> that help us run yAtIverse and act on our instructions: cloud hosting and database (Microsoft Azure), our website hosting provider, email delivery (Azure Communication Services), authentication (Google Firebase), payments (Stripe), and tools you choose to connect (Gmail, Google Calendar, Slack, HubSpot).</li>
          <li><strong>Advertising and analytics providers</strong> (Meta and Google) through the tools in Section 4. Under some state laws, this kind of sharing can count as “sharing” for targeted advertising. You can opt out as described in Sections 4 and 7.</li>
          <li><strong>Legal and safety</strong>: when required by law, or to protect the rights, safety or property of users, the public or us.</li>
          <li><strong>Business changes</strong>: if yAtIverse is involved in a merger, financing or sale of assets, information may transfer to the new owner, who must honor this policy.</li>
        </UL>

        <H2 id="rights">7. Your choices and rights</H2>
        <H3>Opt out of marketing emails</H3>
        <p>
          You can unsubscribe from marketing emails at any time with the unsubscribe link in the email, or by emailing us. We will
          still send messages needed to run your account or reply to your requests.
        </p>
        <H3>Access, correction and deletion</H3>
        <p>You can ask us to:</p>
        <UL>
          <li>tell you what personal information we hold about you and give you a copy;</li>
          <li>correct information that is wrong;</li>
          <li>delete your information, including your waitlist or lead record and your account;</li>
          <li>stop using your information for targeted advertising or sharing it with advertising partners.</li>
        </UL>
        <p>
          Email <PrivacyEmail /> from the address you signed up with, and tell us what you would like us to do. We may need to
          confirm it is you. We aim to respond within 45 days, or sooner if the law requires. If we cannot do what you ask, we will
          explain why.
        </p>
        <H3>Residents of certain states</H3>
        <p>
          Depending on where you live (for example California, Texas and other U.S. states with privacy laws), you may have the
          rights above, the right not to be treated unfairly for using them, and the right to appeal a decision by emailing us with
          “Appeal” in the subject line. You can ask someone to make a request for you where the law allows.
        </p>
        <H3>Information held by Meta and Google</H3>
        <p>
          Deleting your information from our systems does not delete it from Meta, Google or other platforms. To manage or delete
          information they hold, use their own privacy tools.
        </p>

        <H2 id="children">8. Children</H2>
        <p>
          yAtIverse is not directed to children under 13, and we do not knowingly collect personal information from them. If you
          believe a child has given us information, contact us and we will delete it.
        </p>

        <H2 id="changes">9. Changes to this policy</H2>
        <p>
          We may update this policy as yAtIverse and our tools change. We will post the new version here with a new “Last updated”
          date, and we will tell you directly if the changes are significant.
        </p>

        <H2 id="contact">10. Contact us</H2>
        <p>For privacy questions, access or deletion requests, or to opt out of marketing:</p>
        <ul className="space-y-1">
          {LEGAL.entityName && <li><strong>Company:</strong> {LEGAL.entityName}</li>}
          <li><strong>Email:</strong> <PrivacyEmail /></li>
          {LEGAL.mailingAddress && <li><strong>Mailing address:</strong> <span className="whitespace-pre-line">{LEGAL.mailingAddress}</span></li>}
        </ul>
      </LegalLayout>
    </>
  );
}
