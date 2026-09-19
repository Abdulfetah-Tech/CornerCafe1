import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowUpRight, Clock3, Instagram, MapPin, Menu, Phone, X } from 'lucide-react';
import {
  getGetCafeProfileQueryKey,
  getHealthCheckQueryKey,
  useGetCafeProfile,
  useHealthCheck,
} from '@workspace/api-client-react';

const fallbackProfile = {
  name: 'Corner Cafe',
  tagline: 'Good food. Familiar faces.',
  description: 'A small neighborhood table in Sheger city.',
  address: 'Sheger city, Ethiopia',
  mapUrl: '#',
  phone: null,
  email: null,
  instagramUrl: null,
  hours: [],
};

const navigation = [
  { href: '/', label: 'Home' },
  { href: '/menu', label: 'Menu' },
  { href: '/reserve', label: 'Reserve' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function SiteShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const profileQuery = useGetCafeProfile({
    query: { queryKey: getGetCafeProfileQueryKey() },
  });
  const healthQuery = useHealthCheck({
    query: { queryKey: getHealthCheckQueryKey(), staleTime: 60_000 },
  });
  const profile = profileQuery.data ?? fallbackProfile;
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-[100dvh] overflow-x-hidden">
      <header className="sticky top-0 z-40 border-b border-foreground/10 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-[74px] max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            onClick={closeMenu}
            className="group flex items-center gap-3"
            data-testid="link-brand-home"
          >
            <span className="relative grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-[4px_4px_0_hsl(var(--secondary))] transition-transform duration-200 group-hover:rotate-6">
              <span className="font-display text-xl font-bold">C</span>
            </span>
            <span>
              <span className="block font-display text-lg font-bold leading-none tracking-tight">{profile.name}</span>
              <span className="mt-1 block font-mono-ui text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Sheger city</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  location === item.href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground/70 hover:bg-accent/60 hover:text-foreground'
                }`}
                data-testid={`link-nav-${item.label.toLowerCase()}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/reserve"
              className="hidden items-center gap-2 rounded-full bg-secondary px-4 py-2.5 text-sm font-bold text-secondary-foreground shadow-[3px_3px_0_hsl(var(--primary))] transition-transform hover:-translate-y-0.5 sm:flex"
              data-testid="link-header-reserve"
            >
              Save a seat <ArrowUpRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className="grid h-10 w-10 place-items-center rounded-full border border-foreground/15 md:hidden"
              aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
              data-testid="button-mobile-menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="border-t border-foreground/10 bg-background px-5 py-4 md:hidden">
            <nav className="mx-auto grid max-w-6xl gap-1" aria-label="Mobile navigation">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={`rounded-xl px-4 py-3 text-base font-semibold ${
                    location === item.href ? 'bg-primary text-primary-foreground' : 'hover:bg-accent/50'
                  }`}
                  data-testid={`link-mobile-nav-${item.label.toLowerCase()}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="page-in">{children}</main>

      <footer className="mt-20 bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.2fr_0.8fr_1fr]">
          <div>
            <p className="font-display text-3xl font-bold">{profile.name}</p>
            <p className="mt-3 max-w-xs text-sm leading-6 text-primary-foreground/70">
              {profile.tagline || 'Good food. Familiar faces.'} A little corner of Sheger city to come back to.
            </p>
            <div className="mt-6 flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[0.17em] text-primary-foreground/60">
              <span className={`h-2 w-2 rounded-full ${healthQuery.isError ? 'bg-secondary' : 'bg-accent'}`} />
              {healthQuery.isLoading ? 'Checking the kitchen' : healthQuery.isError ? 'Back soon' : 'Kitchen online'}
            </div>
          </div>
          <div>
            <p className="font-mono-ui text-[10px] uppercase tracking-[0.2em] text-accent">Find us</p>
            <p className="mt-4 flex gap-2 text-sm leading-6 text-primary-foreground/80">
              <MapPin className="mt-1 h-4 w-4 shrink-0 text-accent" />
              <span data-testid="text-footer-address">{profile.address}</span>
            </p>
            {profile.phone && (
              <a
                href={`tel:${profile.phone}`}
                className="mt-3 flex items-center gap-2 text-sm text-primary-foreground/80 hover:text-accent"
                data-testid="link-footer-phone"
              >
                <Phone className="h-4 w-4 text-accent" /> {profile.phone}
              </a>
            )}
          </div>
          <div>
            <p className="font-mono-ui text-[10px] uppercase tracking-[0.2em] text-accent">Stay close</p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-sm">
              <Link href="/menu" className="hover:text-accent" data-testid="link-footer-menu">Browse the menu</Link>
              <Link href="/reserve" className="hover:text-accent" data-testid="link-footer-reserve">Reserve a table</Link>
              {profile.instagramUrl && (
                <a href={profile.instagramUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-accent" data-testid="link-footer-instagram">
                  <Instagram className="h-4 w-4" /> Instagram
                </a>
              )}
            </div>
            {profile.hours.length > 0 && (
              <p className="mt-7 flex items-center gap-2 text-xs text-primary-foreground/60">
                <Clock3 className="h-4 w-4 text-accent" /> {profile.hours[0].day}: {profile.hours[0].hours}
              </p>
            )}
          </div>
        </div>
        <div className="border-t border-primary-foreground/15 px-5 py-4 text-center font-mono-ui text-[9px] uppercase tracking-[0.18em] text-primary-foreground/50">
          Corner Cafe · Sheger city · Made for lingering
        </div>
      </footer>
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono-ui text-[10px] font-medium uppercase tracking-[0.22em] text-secondary">
      {children}
    </p>
  );
}

export function LoadingBlock({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3 animate-pulse" data-testid="loading-block">
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className={`h-4 rounded-full bg-muted ${index === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}

export function ErrorNotice({ message = 'We could not bring that over right now.' }: { message?: string }) {
  return (
    <div className="rounded-2xl border border-secondary/30 bg-secondary/10 p-5" data-testid="error-notice">
      <p className="font-display text-xl font-semibold">A small kitchen hiccup.</p>
      <p className="mt-1 text-sm text-muted-foreground">{message} Please try again in a moment.</p>
    </div>
  );
}
