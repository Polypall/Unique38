import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Terms and Conditions — Unique" },
      { name: "description", content: "Terms and Conditions for using Unique." },
    ],
  }),
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="rounded-3xl border border-border/60 bg-card p-8 shadow-soft">
          <h1 className="font-display text-4xl font-semibold">Terms and Conditions</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: May 16, 2026</p>
          <p className="mt-4 text-muted-foreground">
            Please read these terms and conditions carefully before using Our Service.
          </p>

          <section className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/90">
            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground">Interpretation and Definitions</h2>
              <h3 className="mt-4 font-semibold text-foreground">Interpretation</h3>
              <p className="mt-2 text-muted-foreground">
                The words whose initial letters are capitalized have meanings defined under the following conditions.
                The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
              </p>
              <h3 className="mt-4 font-semibold text-foreground">Definitions</h3>
              <p className="mt-2 text-muted-foreground">For the purposes of these Terms and Conditions:</p>
              <ul className="mt-3 space-y-3 text-muted-foreground">
                {[
                  { term: "Affiliate", def: 'means an entity that controls, is controlled by, or is under common control with a party, where "control" means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.' },
                  { term: "Country", def: "refers to: Louisiana, United States" },
                  { term: "Company", def: '(referred to as either "the Company", "We", "Us" or "Our" in these Terms and Conditions) refers to Unique.' },
                  { term: "Device", def: "means any device that can access the Service such as a computer, a cell phone or a digital tablet." },
                  { term: "Service", def: "refers to the Website." },
                  { term: "Terms and Conditions", def: '(also referred to as "Terms") means these Terms and Conditions, including any documents expressly incorporated by reference, which govern Your access to and use of the Service and form the entire agreement between You and the Company regarding the Service.' },
                  { term: "Third-Party Social Media Service", def: "means any services or content (including data, information, products or services) provided by a third party that is displayed, included, made available, or linked to through the Service." },
                  { term: "Website", def: "refers to Unique, accessible from https://github.com/Polypall/Unique" },
                  { term: "You", def: "means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable." },
                ].map(({ term, def }) => (
                  <li key={term} className="pl-4 border-l-2 border-brand-purple/30">
                    <strong className="text-foreground">{term}</strong> — {def}
                  </li>
                ))}
              </ul>
            </div>

            {[
              {
                title: "Acknowledgment",
                body: `These are the Terms and Conditions governing the use of this Service and the agreement between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.\n\nYour access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.\n\nBy accessing or using the Service You agree to be bound by these Terms and Conditions. If You disagree with any part of these Terms and Conditions then You may not access the Service.\n\nYou represent that you are over the age of 18. The Company does not permit those under 18 to use the Service.\n\nYour access to and use of the Service is also subject to Our Privacy Policy, which describes how We collect, use, and disclose personal information. Please read Our Privacy Policy carefully before using Our Service.`,
              },
              {
                title: "Links to Other Websites",
                body: `Our Service may contain links to third-party websites or services that are not owned or controlled by the Company.\n\nThe Company has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party websites or services. You further acknowledge and agree that the Company shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods or services available on or through any such websites or services.\n\nWe strongly advise You to read the terms and conditions and privacy policies of any third-party websites or services that You visit.`,
              },
              {
                title: "Termination",
                body: `We may terminate or suspend Your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if You breach these Terms and Conditions.\n\nUpon termination, Your right to use the Service will cease immediately.`,
              },
              {
                title: "Limitation of Liability",
                body: `Notwithstanding any damages that You might incur, the entire liability of the Company and any of its suppliers under any provision of these Terms and Your exclusive remedy for all of the foregoing shall be limited to the amount actually paid by You through the Service or 100 USD if You haven't purchased anything through the Service.\n\nTo the maximum extent permitted by applicable law, in no event shall the Company or its suppliers be liable for any special, incidental, indirect, or consequential damages whatsoever (including, but not limited to, damages for loss of profits, loss of data or other information, for business interruption, for personal injury, loss of privacy arising out of or in any way related to the use of or inability to use the Service, third-party software and/or third-party hardware used with the Service, or otherwise in connection with any provision of these Terms), even if the Company or any supplier has been advised of the possibility of such damages and even if the remedy fails of its essential purpose.`,
              },
              {
                title: '"AS IS" and "AS AVAILABLE" Disclaimer',
                body: `The Service is provided to You "AS IS" and "AS AVAILABLE" and with all faults and defects without warranty of any kind. To the maximum extent permitted under applicable law, the Company, on its own behalf and on behalf of its Affiliates and its and their respective licensors and service providers, expressly disclaims all warranties, whether express, implied, statutory or otherwise, with respect to the Service, including all implied warranties of merchantability, fitness for a particular purpose, title and non-infringement, and warranties that may arise out of course of dealing, course of performance, usage or trade practice.`,
              },
              {
                title: "Governing Law",
                body: `The laws of the Country, excluding its conflicts of law rules, shall govern these Terms and Your use of the Service. Your use of the Application may also be subject to other local, state, national, or international laws.`,
              },
              {
                title: "Disputes Resolution",
                body: `If You have any concern or dispute about the Service, You agree to first try to resolve the dispute informally by contacting the Company.`,
              },
              {
                title: "For European Union (EU) Users",
                body: `If You are a European Union consumer, you will benefit from any mandatory provisions of the law of the country in which You are resident.`,
              },
              {
                title: "United States Legal Compliance",
                body: `You represent and warrant that (i) You are not located in a country that is subject to the United States government embargo, or that has been designated by the United States government as a "terrorist supporting" country, and (ii) You are not listed on any United States government list of prohibited or restricted parties.`,
              },
              {
                title: "Severability and Waiver",
                body: `If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law and the remaining provisions will continue in full force and effect.\n\nExcept as provided herein, the failure to exercise a right or to require performance of an obligation under these Terms shall not affect a party's ability to exercise such right or require such performance at any time thereafter nor shall the waiver of a breach constitute a waiver of any subsequent breach.`,
              },
              {
                title: "Translation Interpretation",
                body: `These Terms and Conditions may have been translated if We have made them available to You on our Service. You agree that the original English text shall prevail in the case of a dispute.`,
              },
              {
                title: "Changes to These Terms and Conditions",
                body: `We reserve the right, at Our sole discretion, to modify or replace these Terms at any time. If a revision is material We will make reasonable efforts to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at Our sole discretion.\n\nBy continuing to access or use Our Service after those revisions become effective, You agree to be bound by the revised terms. If You do not agree to the new terms, in whole or in part, please stop using the Service.`,
              },
            ].map(({ title, body }) => (
              <div key={title}>
                <h2 className="font-display text-2xl font-semibold text-foreground">{title}</h2>
                {body.split("\n\n").map((para, i) => (
                  <p key={i} className="mt-3 text-muted-foreground">{para}</p>
                ))}
              </div>
            ))}

            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground">Contact Us</h2>
              <p className="mt-3 text-muted-foreground">
                If you have any questions about these Terms and Conditions, You can contact us by visiting this page on our website:{" "}
                <a
                  href="https://polypall.github.io/Ucreate/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground underline underline-offset-4 hover:text-brand-purple"
                >
                  https://polypall.github.io/Ucreate/
                </a>
              </p>
            </div>
          </section>

          <div className="mt-10 border-t border-border/60 pt-6">
            <Link
              to="/"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-gradient-brand px-6 text-sm font-semibold text-foreground shadow-soft hover:opacity-90"
            >
              ← Back to Unique
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
