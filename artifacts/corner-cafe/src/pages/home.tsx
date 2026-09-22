import { useMemo } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Leaf, MapPin, Sparkles } from 'lucide-react';
import { Link } from 'wouter';
import {
  getListMenuItemsQueryKey,
  useGetCafeProfile,
  useListMenuItems,
} from '@workspace/api-client-react';
import { ErrorNotice, LoadingBlock, SectionLabel } from '@/components/site-shell';

const fallbackProfile = {
  name: 'Corner Cafe',
  tagline: 'Good food. Familiar faces.',
  description: 'A little table in Sheger city for slow mornings, full plates, and conversations that run long.',
  address: 'Sheger city, Ethiopia',
  mapUrl: '#',
  heroImageUrl: 'https://lh3.googleusercontent.com/grass-cs/ACvplmMSufzx2tLHCl1hCbEMfLSIGNSEhlU1R36clfv0pSR3OFOIC94_pKgJe64Fauh6mWBcgVoMayD_gGX6W-W2VEvJHUhBkIrbAkBHqK9OH7wko1C7Ld_WowCHsayykb8ZSrP5w_nwVF83Lxnf=w408-h544-k-no',
  heroImageAlt: 'Corner Cafe pastry display and floral arrangement',
};

function formatPrice(price: number, currency: string) {
  return `${currency || 'ETB'} ${price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export default function HomePage() {
  const profileQuery = useGetCafeProfile();
  const menuQuery = useListMenuItems({
    query: { queryKey: getListMenuItemsQueryKey(), staleTime: 60_000 },
  });
  const profile = profileQuery.data ?? fallbackProfile;
  const featuredItems = useMemo(
    () => (menuQuery.data ?? []).filter((item) => item.featured).slice(0, 3),
    [menuQuery.data],
  );

  return (
    <div>
      <section className="relative overflow-hidden bg-secondary pb-16 pt-12 text-secondary-foreground sm:pb-24 sm:pt-20">
        <div className="pointer-events-none absolute -right-24 -top-20 h-72 w-72 rounded-full border-[36px] border-accent/35 sm:h-96 sm:w-96" />
        <div className="pointer-events-none absolute bottom-0 left-[47%] hidden h-px w-1/2 bg-secondary-foreground/20 md:block" />
        <div className="mx-auto grid max-w-6xl items-end gap-12 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <div className="relative z-10 rise-in">
            <SectionLabel>Corner Cafe · Est. around the corner</SectionLabel>
            <h1 className="mt-5 max-w-3xl font-display text-[3.7rem] font-bold leading-[0.92] tracking-[-0.055em] sm:text-7xl lg:text-[6.6rem]">
              Come for<br />
              <span className="text-accent">the good</span><br />
              part.
            </h1>
            <p className="mt-7 max-w-md text-base leading-7 text-secondary-foreground/80 sm:text-lg">
              {profile.description}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/menu"
                className="group inline-flex items-center gap-3 rounded-full bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-1"
                data-testid="link-hero-menu"
              >
                See what’s cooking <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-full border border-secondary-foreground/35 px-5 py-3.5 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
                data-testid="link-hero-about"
              >
                Our corner <ArrowDownRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="relative min-h-[320px] rise-in delay-2 lg:min-h-[440px]">
            <div className="absolute right-[4%] top-[3%] h-[88%] w-[69%] rotate-[4deg] rounded-[2rem] border-8 border-secondary-foreground/90 bg-secondary-foreground/10 p-2 shadow-2xl sm:w-[62%]">
              {profile.heroImageUrl ? (
                <img
                  src={profile.heroImageUrl}
                  alt={profile.heroImageAlt || 'Corner Cafe'}
                  className="h-full w-full rounded-[1.35rem] object-cover"
                  width="408"
                  height="544"
                  loading="eager"
                  referrerPolicy="no-referrer"
                  data-testid="img-home-hero"
                />
              ) : (
                <div className="grid h-full place-items-center rounded-[1.35rem] bg-primary/30 p-8 text-center font-display text-3xl font-bold text-secondary-foreground">
                  A table worth walking to.
                </div>
              )}
            </div>
            <div className="absolute bottom-[12%] left-[1%] max-w-[170px] rotate-[-8deg] font-display text-2xl font-semibold leading-tight text-secondary-foreground/90 sm:text-3xl">
              Made for your usual.
            </div>
            <div className="absolute bottom-0 right-0 w-4/5 border-t border-secondary-foreground/30 pt-4 font-mono-ui text-[10px] uppercase tracking-[0.18em] text-secondary-foreground/65">
              Morning light / midday plates / evening stories
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
          <div className="rise-in">
            <SectionLabel>A table worth walking to</SectionLabel>
            <h2 className="mt-4 max-w-sm font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Your neighborhood, <span className="text-secondary">on a plate.</span>
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-7 text-muted-foreground">
              We keep the room easy, the welcome personal, and the menu full of things you’ll think about tomorrow.
            </p>
            <Link href="/reserve" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-primary underline decoration-secondary decoration-2 underline-offset-4 hover:text-secondary" data-testid="link-story-reserve">
              Pull up a chair <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { number: '01', title: 'Slow starts', body: 'Coffee that gives you a reason not to rush.', icon: Sparkles },
              { number: '02', title: 'Full plates', body: 'Comforting food with a little Sheger spark.', icon: Leaf },
              { number: '03', title: 'Local rhythm', body: 'A corner made brighter by familiar faces.', icon: MapPin },
            ].map(({ number, title, body, icon: Icon }, index) => (
              <div key={number} className={`border-t-2 border-primary pt-5 rise-in delay-${index + 1}`}>
                <div className="flex items-center justify-between">
                  <span className="font-mono-ui text-xs text-secondary">{number}</span>
                  <Icon className="h-5 w-5 text-secondary" />
                </div>
                <h3 className="mt-12 font-display text-2xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary px-5 py-20 text-primary-foreground sm:px-8 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <SectionLabel>From the menu</SectionLabel>
              <h2 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">Good things, currently.</h2>
            </div>
            <Link href="/menu" className="inline-flex items-center gap-2 text-sm font-bold text-accent hover:text-primary-foreground" data-testid="link-featured-menu">
              View full menu <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10">
            {menuQuery.isLoading && <div className="grid gap-4 sm:grid-cols-3"><LoadingBlock lines={4} /><LoadingBlock lines={4} /><LoadingBlock lines={4} /></div>}
            {menuQuery.isError && <ErrorNotice message="The menu board is taking a minute to wake up." />}
            {!menuQuery.isLoading && !menuQuery.isError && featuredItems.length === 0 && (
              <div className="rounded-2xl border border-primary-foreground/20 p-8 text-primary-foreground/75" data-testid="empty-featured-menu">
                New favorites are being written on the board. Check the full menu soon.
              </div>
            )}
            {featuredItems.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-3">
                {featuredItems.map((item) => (
                  <article key={item.id} className="hover-lift rounded-2xl border border-primary-foreground/15 bg-primary-foreground/[0.07] p-5" data-testid={`card-featured-item-${item.id}`}>
                    <div className="flex items-start justify-between gap-4">
                      <span className="font-mono-ui text-[10px] uppercase tracking-[0.17em] text-accent">{item.category}</span>
                      <span className="font-mono-ui text-xs text-primary-foreground/75">{formatPrice(item.price, item.currency)}</span>
                    </div>
                    <h3 className="mt-10 font-display text-2xl font-semibold">{item.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-primary-foreground/65">{item.description}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {profile.heroImageUrl && (
        <section className="mx-auto grid max-w-6xl gap-8 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="overflow-hidden rounded-3xl border border-foreground/10 bg-card shadow-[0_18px_45px_hsl(229_31%_17%_/_0.08)]">
            <img src={profile.heroImageUrl} alt={profile.heroImageAlt || 'Corner Cafe'} className="aspect-[4/3] w-full object-cover" width="408" height="544" loading="lazy" referrerPolicy="no-referrer" data-testid="img-home-story" />
          </div>
          <div>
            <SectionLabel>A look inside</SectionLabel>
            <h2 className="mt-4 max-w-lg font-display text-4xl font-bold leading-tight sm:text-5xl">A real corner for the good part of the day.</h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground">See the counter, find your way here, and make a plan for the next plate.</p>
            <Link href="/about" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-primary underline decoration-secondary decoration-2 underline-offset-4 hover:text-secondary" data-testid="link-home-photo-about">
              See the cafe <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-3xl border border-foreground/10 bg-card p-7 sm:p-10">
          <SectionLabel>Make it a plan</SectionLabel>
          <h2 className="mt-4 max-w-md font-display text-4xl font-bold leading-tight sm:text-5xl">
            Meet here. <span className="text-secondary">Stay awhile.</span>
          </h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground">
            Bring the people you like, or bring a book and keep the table to yourself. Either way, we’ll have something warm ready.
          </p>
          <Link href="/reserve" className="mt-8 inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-3 text-sm font-bold text-secondary-foreground hover:translate-x-1 transition-transform" data-testid="link-home-reserve">
            Reserve a table <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-accent p-7 sm:p-10">
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full border-[18px] border-primary/15" />
          <div className="relative">
            <SectionLabel>Find your way</SectionLabel>
            <h3 className="mt-4 max-w-xs font-display text-3xl font-bold">Right where the neighborhood turns.</h3>
            <p className="mt-6 flex items-start gap-2 text-sm leading-6 text-foreground/75">
              <MapPin className="mt-1 h-4 w-4 shrink-0 text-primary" /> {profile.address}
            </p>
            <a href={profile.mapUrl || '#'} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 text-sm font-bold underline decoration-primary decoration-2 underline-offset-4" data-testid="link-home-directions">
              Get directions <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
