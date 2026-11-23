import SEO from "../components/SEO";
import { ROUTE_SEO } from "../seo/routes";
import LegalLayout, { PrivacyEmail } from "../legal/LegalLayout";

// Placeholder until the final Terms of Use are approved. Not linked from the footer; exists so
// older links do not land on a blank page.
export default function Terms() {
  return (
    <>
      <SEO path="/terms" {...ROUTE_SEO["/terms"]} />
      <LegalLayout title="Terms of Use" intro="We are finalizing our Terms of Use and will publish them here before orders open.">
        <p>Questions in the meantime: <PrivacyEmail />. To see how we handle your information today, read our Privacy Policy.</p>
      </LegalLayout>
    </>
  );
}
