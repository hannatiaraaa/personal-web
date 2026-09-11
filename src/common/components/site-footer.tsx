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
    <footer className='border-line bg-surface-sunk/40 mt-24 border-t'>
      <div className='mx-auto max-w-5xl px-5 py-10 sm:px-8'>
        <p className='legend'>Contact</p>
        <p className='text-body text-ink-muted mt-3 max-w-xl'>
          {positioning.availability} in any research, product, or technology industry. I answer every message that names
          the role and the country you can employ from.
        </p>

        <ul className='mt-5 flex flex-wrap gap-x-5 gap-y-2'>
          {links.map(({ href, label, Icon, external }) => (
            <li key={label}>
              <a
                href={href}
                {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                className='text-meta text-ink-muted hover:text-ink flex items-center gap-2 transition-colors'
              >
                <Icon className='text-[1.05rem]' />
                {label}
                {external && <span className='sr-only'>(opens in a new tab)</span>}
              </a>
            </li>
          ))}
        </ul>

        <p className='text-meta text-ink-faint mt-6 max-w-xl'>
          My public repositories are from 2020–2023. Everything since is in private company repositories, which is why
          the case studies are written out here rather than linked to a commit.
        </p>

        {/* No year. The page is statically rendered, so `new Date()` here is
            build time — the footer would keep claiming last year until someone
            redeployed, and a stale date is worse than no date. */}
        <p className='text-micro text-ink-faint mt-8 font-mono'>
          {identity.location} · {identity.timezone} · Remote since {identity.remoteSince} · © {identity.name}
        </p>
      </div>
    </footer>
  );
}
