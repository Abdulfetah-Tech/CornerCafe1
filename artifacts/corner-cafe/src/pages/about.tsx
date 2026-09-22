import { ArrowUpRight, Clock3, Mail, MapPin, Phone } from 'lucide-react';
import { useGetCafeProfile, getGetCafeProfileQueryKey } from '@workspace/api-client-react';
import { ErrorNotice, LoadingBlock, SectionLabel } from '@/components/site-shell';

export default function AboutPage() {
  const profileQuery = useGetCafeProfile({ query: { queryKey: getGetCafeProfileQueryKey() } });
  const profile = profileQuery.data;

  return (
    <div>
      <section className="bg-primary px-5 py-16 text-primary-foreground sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <div>
            <SectionLabel>Our corner of Sheger city</SectionLabel>
            <h1 className="mt-5 max-w-3xl font-display text-5xl font-bold leading-[0.92] tracking-[-0.05em] sm:text-7xl">Small room.<br /><span className="text-accent">Big welcome.</span></h1>
          </div>
          <p className="max-w-md text-base leading-7 text-primary-foreground/72 lg:pb-1">{profile?.description || 'A neighborhood cafe built around good food, kind service, and the simple pleasure of having somewhere to go.'}</p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        {profileQuery.isLoading && <div className="py-16"><LoadingBlock lines={5} /></div>}
        {profileQuery.isError && <div className="py-16"><ErrorNotice message="We could not load our details right now." /></div>}
        {profile && (
          <>
            <section className="grid gap-10 border-b border-foreground/10 py-16 sm:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
              <div><SectionLabel>The short version</SectionLabel><h2 className="mt-4 font-display text-4xl font-bold leading-tight">A place for the in-between moments.</h2></div>
              <div className="space-y-5 text-base leading-8 text-muted-foreground">
                <p>{profile.description}</p>
                <p>Corner Cafe is for the first coffee before the city gets loud, the plate shared without ceremony, and the familiar hello that makes a regular out of a passerby.</p>
                <p>Come as you are. We’ll put something good in front of you.</p>
              </div>
            </section>

            {profile.heroImageUrl && (
              <section className="grid gap-8 border-b border-foreground/10 py-16 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <img src={profile.heroImageUrl} alt={profile.heroImageAlt || 'Corner Cafe'} className="aspect-[4/3] w-full rounded-3xl object-cover" width="408" height="544" loading="lazy" referrerPolicy="no-referrer" data-testid="img-about-cafe" />
                <div>
                  <SectionLabel>From the cafe</SectionLabel>
                  <h2 className="mt-4 font-display text-4xl font-bold leading-tight">See what is waiting at the counter.</h2>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">The listing photo gives you a first look. Come by and make the corner yours.</p>
                </div>
              </section>
            )}

            <section className="grid gap-10 py-16 sm:py-24 lg:grid-cols-[1fr_0.8fr] lg:gap-24">
              <div>
                <SectionLabel>Plan your visit</SectionLabel>
                <h2 className="mt-4 font-display text-4xl font-bold">Open when you need a corner.</h2>
                <div className="mt-8 divide-y divide-foreground/10 rounded-2xl border border-foreground/10 bg-card">
                  {profile.hours.length === 0 && <p className="p-6 text-sm text-muted-foreground" data-testid="empty-hours">Hours are being updated. Please contact us before visiting.</p>}
                  {profile.hours.map((entry, index) => (
                    <div key={`${entry.day}-${index}`} className="flex items-center justify-between gap-4 px-5 py-4 text-sm" data-testid={`row-hours-${index}`}>
                      <span className="font-semibold">{entry.day}</span><span className="font-mono-ui text-xs text-muted-foreground">{entry.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative overflow-hidden rounded-3xl bg-accent p-7 sm:p-9">
                <div className="absolute -bottom-12 -right-12 h-44 w-44 rounded-full border-[22px] border-primary/15" />
                <MapPin className="relative h-7 w-7 text-primary" />
                <p className="relative mt-8 font-display text-3xl font-bold leading-tight">Find us at the turn.</p>
                <p className="relative mt-4 text-sm leading-6 text-foreground/70" data-testid="text-about-address">{profile.address}</p>
                <a href={profile.mapUrl || '#'} target="_blank" rel="noreferrer" className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:-translate-y-0.5 transition-transform" data-testid="link-about-directions">
                  Open directions <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </section>

            <section className="mb-16 grid gap-4 border-t border-foreground/10 pt-8 sm:grid-cols-3 sm:mb-24">
              {profile.phone && <a href={`tel:${profile.phone}`} className="flex items-start gap-3 rounded-2xl p-4 hover:bg-muted" data-testid="link-about-phone"><Phone className="mt-0.5 h-5 w-5 text-secondary" /><span><span className="block font-mono-ui text-[9px] uppercase tracking-[0.16em] text-muted-foreground">Call us</span><span className="mt-1 block text-sm font-semibold">{profile.phone}</span></span></a>}
              {profile.email && <a href={`mailto:${profile.email}`} className="flex items-start gap-3 rounded-2xl p-4 hover:bg-muted" data-testid="link-about-email"><Mail className="mt-0.5 h-5 w-5 text-secondary" /><span><span className="block font-mono-ui text-[9px] uppercase tracking-[0.16em] text-muted-foreground">Write us</span><span className="mt-1 block break-all text-sm font-semibold">{profile.email}</span></span></a>}
              <div className="flex items-start gap-3 rounded-2xl p-4"><Clock3 className="mt-0.5 h-5 w-5 text-secondary" /><span><span className="block font-mono-ui text-[9px] uppercase tracking-[0.16em] text-muted-foreground">Stay awhile</span><span className="mt-1 block text-sm font-semibold">Good things take time.</span></span></div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
