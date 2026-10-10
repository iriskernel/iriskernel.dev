import { site } from "@/content/site";
import { EmailLink } from "./EmailLink";
import { LinkIconView } from "./Icons";
import { Panel } from "./Panel";

export function Contact() {
  return (
    <Panel id="contact" title="Contact">
      <p>{site.contact.line}</p>
      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {site.email && (
          <li className="inline-flex items-center gap-2">
            <LinkIconView icon="email" />
            <EmailLink user={site.email.user} domain={site.email.domain} />
          </li>
        )}
        {site.links.map((link) => (
          <li key={link.href}>
            <a href={link.href} className="inline-flex items-center gap-2 text-ac2 hover:underline">
              <LinkIconView icon={link.icon} />
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
