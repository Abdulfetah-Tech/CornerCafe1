import { useAuth, useClerk, useUser } from '@clerk/react';
import { useEffect, useRef, type ReactNode } from 'react';
import { BarChart3, BookOpen, CalendarDays, ChevronRight, CircleHelp, LogOut, Settings2, Store } from 'lucide-react';
import { Link, Redirect, useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';

export function errorMessage(error: unknown, fallback = 'Something did not save. Please try again.') {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') return error.message;
  return fallback;
}

const nav = [
  { href: '/owner', label: 'Overview', icon: BarChart3 },
  { href: '/owner/profile', label: 'Cafe profile', icon: Store },
  { href: '/owner/menu', label: 'Menu', icon: BookOpen },
  { href: '/owner/reservations', label: 'Reservations', icon: CalendarDays },
  { href: '/owner/inquiries', label: 'Inquiries', icon: CircleHelp },
];

function ClerkCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const previousUser = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const nextUser = user?.id ?? null;
      if (previousUser.current !== undefined && previousUser.current !== nextUser) queryClient.clear();
      previousUser.current = nextUser;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

export function OwnerGate({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) {
    return <div className="owner-grid min-h-[100dvh] bg-background p-6"><div className="mx-auto mt-24 max-w-5xl animate-pulse space-y-4"><div className="h-8 w-48 rounded bg-muted" /><div className="h-32 rounded-3xl bg-muted" /></div></div>;
  }
  if (!isSignedIn) return <Redirect to="/sign-in" />;
  return <OwnerFrame>{children}</OwnerFrame>;
}

export function OwnerFrame({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();
  const initials = (user?.firstName?.[0] ?? user?.emailAddresses[0]?.emailAddress?.[0] ?? 'O').toUpperCase();

  return (
    <div className="owner-grid min-h-[100dvh] bg-background text-foreground">
      <ClerkCacheInvalidator />
      <div className="mx-auto flex min-h-[100dvh] max-w-[1480px]">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-foreground/10 bg-primary px-5 py-6 text-primary-foreground lg:flex">
          <Link href="/" className="group flex items-center gap-3" data-testid="link-owner-brand">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent text-accent-foreground shadow-[4px_4px_0_hsl(var(--secondary))] transition-transform group-hover:-rotate-3">
              <span className="font-display text-2xl font-bold">C</span>
            </span>
            <span><strong className="block font-display text-xl leading-none">Corner Cafe</strong><small className="mt-1 block font-mono-ui text-[9px] uppercase tracking-[0.2em] text-primary-foreground/60">Owner desk</small></span>
          </Link>
          <p className="mt-12 px-3 font-mono-ui text-[10px] uppercase tracking-[0.22em] text-primary-foreground/50">Workspace</p>
          <nav className="mt-3 space-y-1" aria-label="Owner navigation">
            {nav.map(({ href, label, icon: Icon }) => {
              const active = location === href || (href !== '/owner' && location.startsWith(href));
              return <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${active ? 'bg-primary-foreground text-primary' : 'text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground'}`} data-testid={`link-owner-${label.toLowerCase().replace(' ', '-')}`}><Icon className="h-4 w-4" />{label}{active && <ChevronRight className="ml-auto h-4 w-4" />}</Link>;
            })}
          </nav>
          <div className="mt-auto border-t border-primary-foreground/15 pt-5">
            <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground" data-testid="link-view-site"><Settings2 className="h-4 w-4" />View public site</Link>
            <button type="button" onClick={() => signOut({ redirectUrl: import.meta.env.BASE_URL || '/' })} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground" data-testid="button-owner-signout"><LogOut className="h-4 w-4" />Sign out</button>
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          <header className="flex min-h-[78px] items-center justify-between border-b border-foreground/10 bg-background/85 px-5 backdrop-blur sm:px-8">
            <div><p className="font-mono-ui text-[10px] uppercase tracking-[0.2em] text-secondary">Corner Cafe / owner</p><p className="mt-1 font-display text-xl font-bold sm:text-2xl">Good morning{user?.firstName ? `, ${user.firstName}` : ''}.</p></div>
            <div className="flex items-center gap-3"><div className="hidden text-right sm:block"><p className="text-sm font-semibold">{user?.fullName ?? 'Cafe owner'}</p><p className="text-xs text-muted-foreground">{user?.primaryEmailAddress?.emailAddress ?? 'Verified account'}</p></div><span className="grid h-10 w-10 place-items-center rounded-full bg-secondary font-display text-lg font-bold text-secondary-foreground" data-testid="avatar-owner">{initials}</span></div>
          </header>
          <div className="border-b border-foreground/10 bg-card/70 px-5 py-3 lg:hidden"><div className="flex gap-2 overflow-x-auto">{nav.map(({ href, label }) => <Link key={href} href={href} className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-bold ${location === href ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`} data-testid={`link-mobile-owner-${label.toLowerCase().replace(' ', '-')}`}>{label}</Link>)}</div></div>
          <div className="p-5 sm:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}