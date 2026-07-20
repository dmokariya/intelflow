import { LegalLayout } from "../legal-layout";

export default function Privacy() {
  return <LegalLayout kicker="LEGAL" title="Privacy policy">
    <p className="legal-callout">IntelFlow is presently a local pre-launch product. Advertising, production analytics and account services are not active in this build. This policy will be updated before those services are enabled.</p>
    <h2>Who operates IntelFlow</h2><p>IntelFlow is a product of Swarnim Capital, a sole proprietorship operating from 537, Florence Excellence, Vasna Bhayli, Vadodara, Gujarat 391410, India. Privacy enquiries may be sent to <a href="mailto:hello@swarnimcapital.com">hello@swarnimcapital.com</a>.</p>
    <h2>Information used in the local version</h2><p>The current guest experience stores selected interests, bookmarks and onboarding status in the browser or application storage on your device. IntelFlow does not receive this locally stored information unless a future account or synchronisation feature is enabled.</p>
    <h2>Technical information</h2><p>A hosting provider may process ordinary request logs such as IP address, device/browser information, timestamps and requested pages for security, reliability and abuse prevention. We will minimise retention and restrict access to legitimate operational purposes.</p>
    <h2>Accounts, analytics and advertising</h2><p>These capabilities are planned but not active in the local build. Before activation, IntelFlow will disclose the providers used, categories of data processed, purposes, retention practices, user choices and any legally required consent mechanism. The Google Play Data Safety declaration will be aligned with actual application behaviour.</p>
    <h2>Data retention and deletion</h2><p>Guest preferences remain on the device until the user clears application/browser data or resets their interests. If accounts are introduced, IntelFlow will provide in-app and web-accessible account deletion and will explain any information retained for security or legal compliance.</p>
    <h2>Your choices</h2><p>You may clear local application data through your browser or device settings. Requests concerning personal data, correction, access or deletion may be sent to the support address above. Identity verification may be required before completing a request.</p>
    <h2>Security and changes</h2><p>Reasonable safeguards will be used, but no internet service can promise absolute security. Material changes will be reflected through a revised effective date and, where appropriate, an in-product notice or consent request.</p>
  </LegalLayout>;
}
