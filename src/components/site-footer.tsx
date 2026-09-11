import { identity, positioning } from '@/content/facts';
import { EmailIcon, GitHubIcon, GitLabIcon, LinkedInIcon } from './icons';

const links = [
  { href: `mailto:${identity.email}`, label: 'Email', Icon: EmailIcon, external: false },
  { href: identity.linkedin, label: 'LinkedIn', Icon: LinkedInIcon, external: true },
  { href: identity.github, label: 'GitHub', Icon: GitHubIcon, external: true },
  { href: 'https://gitlab.com/hannatiaraaa', label: 'GitLab', Icon: GitLabIcon, external: true },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <p className="legend">Contact</p>
        <p className="mt-3 max-w-xl text-body text-ink-muted">
          {positioning.availability} in field-service, operations, HR/payroll or fintech software. I answer every
          message that names the role and the country you can employ from.
        </p>

        <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
          {links.map(({ href, label, Icon, external }) => (
            <li key={label}>
              <a
                href={href}
                {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                className="flex items-center gap-2 text-meta text-ink-muted transition-colors hover:text-ink"
              >
                <Icon className="text-[1.05rem]" />
                {label}
                {external && <span className="sr-only">(opens in a new tab)</span>}
              </a>
            </li>
          ))}
        </ul>

        <p className="mt-8 font-mono text-micro text-ink-faint">
          {identity.location} · {identity.timezone} · Remote since {identity.remoteSince} ·{' '}
          {new Date().getFullYear()} {identity.name}
        </p>
      </div>
    </footer>
  );
}
