import { useGetOwnerSummary, getGetOwnerSummaryQueryKey } from '@workspace/api-client-react';
import { ArrowUpRight, BookOpen, CalendarClock, CircleHelp, Store } from 'lucide-react';
import { Link } from 'wouter';
import { errorMessage } from '@/components/owner-shell';

function Metric({ label, value, note, icon: Icon, href }: { label: string; value?: number; note: string; icon: typeof Store; href: string }) {
  return (
    <Link href={href} className="owner-panel group rounded-3xl border border-foreground/10 bg-card p-5 transition-transform hover:-translate-y-1" data-testid={`card-summary-${label.toLowerCase().replaceAll(' ', '-')}`}>
      <div className="flex items-start justify-between"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-accent/60 text-primary"><Icon className="h-5 w-5" /></span><ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></div>
      <p className="mt-7 font-mono-ui text-4xl font-medium tracking-tight">{value ?? '—'}</p>
      <p className="mt-1 font-semibold">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </Link>
  );
}

export default function OwnerDashboard() {
  const summaryQuery = useGetOwnerSummary({ query: { queryKey: getGetOwnerSummaryQueryKey(), retry: 1 }, request: { credentials: 'include' } });
  const summary = summaryQuery.data;

  return (
    <div className="space-y-8" data-testid="page-owner-dashboard">
      <section className="flex flex-col justify-between gap-5 border-b border-foreground/10 pb-7 sm:flex-row sm:items-end">
        <div><p className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-secondary">Today at the table</p><h1 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">The owner desk.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Keep the room welcoming, the menu current, and every request answered.</p></div>
        <Link href="/owner/profile" className="inline-flex items-center justify-center gap-2 rounded-full bg-secondary px-5 py-3 text-sm font-bold text-secondary-foreground shadow-[3px_3px_0_hsl(var(--primary))]" data-testid="link-dashboard-profile">Update cafe details <ArrowUpRight className="h-4 w-4" /></Link>
      </section>
      {summaryQuery.isLoading && <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 animate-pulse">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-48 rounded-3xl bg-muted" />)}</div>}
      {summaryQuery.isError && <div className="rounded-2xl border border-secondary/30 bg-secondary/10 p-5" data-testid="error-owner-summary"><p className="font-display text-xl font-semibold">The desk is taking a minute.</p><p className="mt-1 text-sm text-muted-foreground">{errorMessage(summaryQuery.error, 'We could not load the owner summary.')} Try refreshing this page.</p></div>}
      {!summaryQuery.isLoading && !summaryQuery.isError && summary && <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Pending reservations" value={summary.pendingReservations} note="Requests waiting for a reply" icon={CalendarClock} href="/owner/reservations" />
        <Metric label="New inquiries" value={summary.newInquiries} note="Messages not yet reviewed" icon={CircleHelp} href="/owner/inquiries" />
        <Metric label="Published dishes" value={summary.publishedMenuItems} note={`Visible from ${summary.totalMenuItems} menu items`} icon={BookOpen} href="/owner/menu" />
        <Metric label="Cafe profile" value={1} note="Verified public listing" icon={Store} href="/owner/profile" />
      </div>}
      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="owner-panel rounded-3xl border border-foreground/10 bg-primary p-6 text-primary-foreground sm:p-8"><p className="font-mono-ui text-[10px] uppercase tracking-[0.2em] text-accent">A useful rhythm</p><h2 className="mt-3 max-w-md font-display text-3xl font-bold leading-tight">Answer the next person who is already thinking about Corner Cafe.</h2><div className="mt-8 grid gap-3 sm:grid-cols-3">{[['01', 'Review', 'Requests arrive here first.'], ['02', 'Decide', 'Keep each status current.'], ['03', 'Publish', 'Let the public menu speak.']].map(([number, title, copy]) => <div key={number} className="border-l border-primary-foreground/25 pl-4"><span className="font-mono-ui text-xs text-accent">{number}</span><p className="mt-2 font-semibold">{title}</p><p className="mt-1 text-xs leading-5 text-primary-foreground/60">{copy}</p></div>)}</div></div>
        <div className="owner-panel rounded-3xl border border-foreground/10 bg-card p-6 sm:p-8"><p className="font-mono-ui text-[10px] uppercase tracking-[0.2em] text-secondary">Quick actions</p><div className="mt-5 divide-y divide-foreground/10">{[['Add a menu item', '/owner/menu', 'Keep the counter interesting.'], ['Check reservations', '/owner/reservations', 'Confirm who is joining us.'], ['Read inquiries', '/owner/inquiries', 'Close the loop with a reply.']].map(([title, href, copy]) => <Link href={href} key={href} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0" data-testid={`link-quick-${title.toLowerCase().replaceAll(' ', '-')}`}><span><strong className="block text-sm">{title}</strong><small className="mt-1 block text-xs text-muted-foreground">{copy}</small></span><ArrowUpRight className="h-4 w-4 text-secondary" /></Link>)}</div></div>
      </section>
    </div>
  );
}