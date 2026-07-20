import { LegalLayout } from "../legal-layout";

export default function Disclosure() {
  return <LegalLayout kicker="EDITORIAL TRANSPARENCY" title="News & summary disclosure">
    <p className="legal-callout">IntelFlow does not claim ownership of third-party reporting. Every production brief will identify and link to its original publisher.</p>
    <h2>How stories are selected</h2><p>IntelFlow collects permitted RSS metadata and other authorised source material, assigns one or more topic tags, identifies closely related coverage and ranks stories using recency, selected interests, geographic relevance and source diversity.</p>
    <h2>How briefs are produced</h2><p>The initial system uses automated extractive methods to select and condense important sentences. It does not use paid generative-AI APIs. Automated processing can still produce incomplete or awkward results, so the linked original article is the authoritative reference.</p>
    <h2>Images and copyright</h2><p>Production images will be displayed only where a feed, licence, publisher permission or applicable law supports use. Rights remain with their respective owners. Rights-holders may request correction or removal by contacting IntelFlow with the relevant URL and evidence of ownership.</p>
    <h2>Corrections</h2><p>IntelFlow may update a brief when a publisher corrects its article, when later reporting materially changes the story, or when an automated result is misleading. Affected material may be temporarily removed while a complaint is reviewed.</p>
    <h2>Source neutrality</h2><p>Inclusion is not endorsement. IntelFlow aims to avoid rewarding sensational headlines and to expose users to multiple relevant sources. No ranking system is perfectly neutral, and feedback about systematic errors is welcome.</p>
  </LegalLayout>;
}
