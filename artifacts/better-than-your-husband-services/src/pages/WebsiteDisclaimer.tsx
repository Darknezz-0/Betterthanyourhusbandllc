const disclaimerText = `Website Disclaimer

Effective Date: September 26, 2026

Better Than Your Husband Services LLC (“Better Than Your Husband,” “we,” “us,” or “our”) provides the information on this website, betterthanyourhusbandllc.com, for general informational purposes.

By using this website, you acknowledge the following:

1. General Information

Information on this website is intended to provide general information about Better Than Your Husband Services LLC, the services we may provide, and how to contact us.

Website information is not a substitute for a professional inspection, evaluation, diagnosis, engineering opinion, architectural advice, legal advice, or other specialized professional advice.

2. Services Are Not Guaranteed

The appearance of a service on this website does not guarantee that Better Than Your Husband will perform that service for every customer or property.

Whether a project can be accepted may depend on the specific circumstances, including:

The requested scope of work

Property conditions

Location

Safety considerations

Applicable laws and regulations

Licensing or permitting requirements

Required equipment or materials

Our capabilities and availability


We reserve the right to decline or modify a requested project when appropriate.

3. Estimates and Pricing

Information concerning pricing, estimates, materials, or project costs on this website should not be considered a guaranteed final price unless specifically confirmed in writing for a particular project.

Actual project costs may vary based on the scope of work, measurements, materials, labor, property conditions, hidden conditions, customer-requested changes, and other circumstances.

A submitted quote request does not constitute an agreement to perform work.

4. Property Conditions

Information provided through this website, including photographs and project descriptions, may not reveal hidden or pre-existing conditions.

These may include hidden damage, rot, water damage, structural issues, concealed utilities, improper previous work, or other conditions that may affect the scope, cost, safety, or feasibility of a project.

Such conditions may result in changes to the scope of work or price.

5. Photographs and Examples

Photographs and examples displayed on this website may illustrate previous work, materials, services, or general project concepts.

Actual results may vary depending on the property, materials, existing conditions, project requirements, and other circumstances.

6. Third-Party Websites and Services

This website may contain links to third-party websites, including social media platforms and other services.

Better Than Your Husband Services LLC does not control third-party websites and is not responsible for their content, availability, security, privacy practices, or policies.

A link to a third-party website does not necessarily constitute an endorsement of that website or its services.

7. Website Availability and Accuracy

We make reasonable efforts to keep the information on this website accurate and current.

However, we do not guarantee that all information will always be complete, accurate, current, error-free, or available.

Website content, services, service areas, and other information may be changed or updated without notice.

8. No Professional Advice

Nothing on this website should be interpreted as professional advice specific to a customer's property or situation.

When a project involves matters requiring specialized expertise, licensing, engineering, architectural services, inspections, permits, or other professional services, customers should consult an appropriately qualified professional.

9. Limitation of Responsibility

To the fullest extent permitted by applicable law, Better Than Your Husband Services LLC and its owners, employees, contractors, agents, and service providers are not responsible for losses or damages resulting solely from a person's reliance on general information provided on this website.

This disclaimer does not exclude or limit liability that cannot legally be excluded or limited under applicable law.

Services actually performed by Better Than Your Husband may be governed by separate estimates, proposals, service agreements, work authorizations, warranties, and other project-specific documents.

10. Related Policies

This Website Disclaimer should be read together with the other policies governing use of this website, including:

Privacy Policy

Terms & Conditions

Service Disclaimer

Quote & Estimate Disclaimer

Accessibility Statement

Cookie & Tracking Disclosure


11. Contact Us

Better Than Your Husband Services LLC
Phone: 913-346-0205
Email: BetterThanYourHusbandLLC@gmail.com

Last Updated: September 26, 2026`;

export function WebsiteDisclaimer() {
  return (
    <main className="bg-background px-5 pb-16 pt-16 sm:px-8 sm:pb-24 lg:px-12">
      <article className="mx-auto max-w-3xl" data-testid="website-disclaimer">
        {disclaimerText.split(/\n\n/).map((block, index) => {
          if (index === 0) {
            return <h1 key={index} className="mb-8 font-display text-4xl leading-tight sm:text-6xl">{block}</h1>;
          }
          if (index === 1) {
            return <p key={index} className="mb-8 border-l-2 border-primary bg-[#efe8dc] px-5 py-4 font-mono-brand text-[10px] uppercase tracking-[.14em] text-[#4e4a42]">{block}</p>;
          }
          if (/^\d+\. /.test(block)) {
            return <h2 key={index} className="mb-5 mt-10 border-t border-border pt-8 font-display text-2xl sm:text-3xl">{block}</h2>;
          }
          return <p key={index} className="mb-5 whitespace-pre-line text-sm leading-8 text-muted-foreground">{block}</p>;
        })}
      </article>
    </main>
  );
}