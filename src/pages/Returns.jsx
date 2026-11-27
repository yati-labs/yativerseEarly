import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import LegalLayout, { H2, UL } from "../legal/LegalLayout";
import { LEGAL } from "../legal/legalConfig";
import { FLAGS } from "../lib/catalog";

// Returns, defects, cancellation and early-termination terms. Source: the approved terms document
// ("yAtIverse: Returns, Defects, Cancellation and Early-Termination Terms"). The values below are the draft
// defaults. Change them here once the approver decides, then set VITE_POLICY_APPROVED=true to remove the draft banner.
const T = {
  returnDays: 30,
  warrantyMonths: 12,
  refundBusinessDays: 10,
  graceDays: 7,
  exportDays: 30,
  reminderDays: 30,
};

const SUPPORT = LEGAL.privacyEmail;

export default function Returns() {
  return (
    <>
      <SEO title="Returns, Warranty and Cancellation" description="How returns, warranty claims, plan cancellation and commitments work for Thread devices, Capture and Spark." path="/returns" noindex={!FLAGS.policyApproved} />
      <LegalLayout
        title="Returns, Warranty and Cancellation"
        intro="How returns, defects, cancellation and early termination work for Thread devices and for the Capture and Spark plans. Prices are in US dollars. We ship within the United States."
        toc={[["returns", "Device returns"], ["warranty", "Defects and warranty"], ["commitment", "Capture commitment"], ["cancel-capture", "Cancelling Capture"], ["cancel-spark", "Cancelling Spark"], ["changes", "Plan changes and usage"], ["billing", "Billing and failed payments"], ["refunds", "Refunds, taxes and disputes"], ["data", "Your data when you cancel"]]}
      >
        {!FLAGS.policyApproved && (
          <p className="rounded-xl border border-yellow-400/40 bg-yellow-400/10 p-4 text-sm text-yellow-100">
            Draft: these terms are pending final approval and may change before orders open.
          </p>
        )}

        <H2 id="returns">1. Device returns</H2>
        <UL>
          <li>You may return a Thread device within <strong>{T.returnDays} days of delivery</strong> for a refund of the device price you paid.</li>
          <li>The device must include its accessories and packaging and must not be damaged beyond normal handling. Start a return by emailing <a className="underline" href={`mailto:${SUPPORT}`}>{SUPPORT}</a> with your order number.</li>
          <li>You pay return shipping unless the device is defective.</li>
          <li>We refund to the original payment method within {T.refundBusinessDays} business days after we receive and check the device. Your bank may take longer to show it.</li>
          <li><strong>If you return the device within the window:</strong> the lower device price depended on your Capture commitment, so the commitment, the Spark full-bundle saving and any related early-termination amount end with the return. Your Capture and Spark plans end immediately, and plan charges already billed for the current month are refunded.</li>
          <li>Taxes and shipping paid at purchase are refunded with the device price. Top-ups are not refundable once used.</li>
        </UL>

        <H2 id="warranty">2. Defects and warranty</H2>
        <UL>
          <li>Thread devices have a <strong>{T.warrantyMonths}-month limited warranty</strong> from delivery against defects in materials and workmanship under normal use.</li>
          <li>If a device arrives defective or stops working under normal use during the warranty, contact us. We will, at our choice, repair it, replace it, or refund the device price. We pay shipping both ways for warranty claims.</li>
          <li>A refund for a defective device ends the Capture commitment without any early-termination amount.</li>
          <li>The warranty does not cover damage from drops, liquids, unauthorized repair, misuse, normal wear, or loss. It does not exclude rights you have under the law where you live.</li>
        </UL>

        <H2 id="commitment">3. Capture commitment</H2>
        <UL>
          <li><strong>6-month commitment:</strong> you pay for Capture for 6 months, billed monthly, and the device is <strong>$119 (Thread One) or $149 (Thread Max)</strong> instead of $149 or $179.</li>
          <li><strong>12-month commitment (Capture Starter only):</strong> Capture Starter is <strong>free for months 1 to 3</strong>, then <strong>$19 per month</strong>, with at least <strong>9 paid months</strong> in the 12-month term. The device price is the same as the 6-month option.</li>
          <li>Capture Plus and Capture Pro are available with the 6-month commitment only and stay at their listed prices.</li>
          <li>Your commitment is shown at checkout, in your order confirmation email and in your dashboard, with dates and amounts.</li>
          <li>You can upgrade your Capture plan during the commitment. Upgrading does not restart it. During a free period, an upgrade starts only after you accept the new price.</li>
          <li>First-100 early signup prices, if you qualify, apply to plan charges only. They never reduce the device price and do not restart if you upgrade or add a device.</li>
          <li>A <strong>full bundle</strong> is a Thread device with a Capture commitment and a Spark plan. It earns an extra 10% off the device and the combined monthly plans, each rounded up to the next whole dollar.</li>
        </UL>

        <H2 id="cancel-capture">4. Cancelling Capture and early termination</H2>
        <UL>
          <li>You can cancel Capture online in your dashboard at any time, in the same way you signed up. We send a confirmation email. You can also email <a className="underline" href={`mailto:${SUPPORT}`}>{SUPPORT}</a>.</li>
          <li><strong>At the end of the commitment:</strong> Capture does not renew into another commitment. If you do not cancel, it continues month to month at the regular price until you cancel. We email you at least {T.reminderDays} days before the commitment ends with the date, the regular price and how to cancel.</li>
          <li><strong>Before the end of the commitment:</strong> you may cancel at any time, but the months left in your commitment stay payable, billed monthly as scheduled. For example, on a 6-month Starter commitment, cancelling after 2 months leaves 4 months at $19 ($76) payable.</li>
          <li>If Capture ends, the full-bundle plan saving ends from the next billing month, because the bundle needs both plans active.</li>
          <li>No early-termination amount is charged if you return the device in the return window, if a warranty refund applies, or if we materially change or discontinue the service during your commitment.</li>
        </UL>

        <H2 id="cancel-spark">5. Cancelling Spark</H2>
        <UL>
          <li>Spark is billed monthly with no commitment. Cancel online in your dashboard any time. Cancellation takes effect at the end of the billing month you have already paid for, and we do not refund part of a month.</li>
          <li>If you cancel Spark while Capture stays active, the full-bundle saving on Capture ends from the next billing month and Capture continues at its non-bundle price. Your Capture commitment and Founder OS access continue.</li>
          <li>First-100 introductory and feedback prices do not restart if you cancel and rejoin.</li>
        </UL>

        <H2 id="changes">6. Plan changes, top-ups and usage</H2>
        <UL>
          <li>Upgrades take effect right away. Downgrades take effect at the next billing month.</li>
          <li>We never upgrade you automatically, add overage charges or buy extra minutes for you. If you run out of Capture minutes, your notes and exports stay available and we show you your options.</li>
          <li>Capture minutes are shared across your workspace. Buying a second device does not add another free minute allowance or another promotion.</li>
        </UL>

        <H2 id="billing">7. Billing and failed payments</H2>
        <UL>
          <li>Capture and Spark are billed monthly to the card you provide. The device is charged once at purchase.</li>
          <li>If a payment fails we retry it and email you. After {T.graceDays} days without a successful payment, access to paid features is paused until you pay.</li>
          <li>Your dashboard shows each upcoming charge and when prices change, for example the end of an introductory period.</li>
        </UL>

        <H2 id="refunds">8. Refunds, taxes and disputes</H2>
        <UL>
          <li>Refunds go to the original payment method. Sales tax is calculated from your shipping address and shown before you pay. Refunds include the tax we collected on the refunded item.</li>
          <li>If you have a billing problem, please contact us first at <a className="underline" href={`mailto:${SUPPORT}`}>{SUPPORT}</a>. We aim to reply within 2 business days.</li>
        </UL>

        <H2 id="data">9. Your data when you cancel</H2>
        <p>You can export your notes and transcripts for {T.exportDays} days after your plans end. After that we delete them as described in our <Link className="underline" to="/privacy-policy">Privacy Policy</Link>.</p>

        {(LEGAL.entityName || LEGAL.mailingAddress) && (
          <p className="text-sm text-white/70">
            {LEGAL.entityName}{LEGAL.entityName && LEGAL.mailingAddress ? ", " : ""}{LEGAL.mailingAddress}
          </p>
        )}
      </LegalLayout>
    </>
  );
}
