import { useMemo, useState } from 'react';
import { ArrowRight, ChefHat, Search, UtensilsCrossed } from 'lucide-react';
import { Link } from 'wouter';
import { getListMenuItemsQueryKey, useListMenuItems } from '@workspace/api-client-react';
import { ErrorNotice, LoadingBlock, SectionLabel } from '@/components/site-shell';

function formatPrice(price: number, currency: string) {
  return `${currency || 'ETB'} ${price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const menuQuery = useListMenuItems({
    query: { queryKey: getListMenuItemsQueryKey(), staleTime: 60_000 },
  });
  const items = menuQuery.data ?? [];
  const categories = useMemo(() => ['All', ...Array.from(new Set(items.map((item) => item.category)))], [items]);
  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        const searchable = `${item.name} ${item.description} ${item.category}`.toLowerCase();
        return matchesCategory && searchable.includes(search.toLowerCase());
      }),
    [items, search, selectedCategory],
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-20">
      <section className="relative overflow-hidden rounded-3xl bg-primary p-7 text-primary-foreground sm:p-12">
        <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full border-[28px] border-accent/20" />
        <div className="relative max-w-2xl">
          <SectionLabel>Today at the cafe</SectionLabel>
          <h1 className="mt-4 font-display text-5xl font-bold tracking-[-0.04em] sm:text-7xl">The menu board.</h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-primary-foreground/72">
            Things we want to eat, made in the order they’re meant to be enjoyed. Ask us what’s fresh when you arrive.
          </p>
          <div className="mt-8 flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[0.18em] text-accent">
            <ChefHat className="h-4 w-4" /> Prepared close to home
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="flex flex-col gap-4 border-b border-foreground/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Menu categories">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  selectedCategory === category ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
                data-testid={`button-category-${category.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {category}
              </button>
            ))}
          </div>
          <label className="relative block w-full sm:w-60">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Find a dish"
              className="h-10 w-full rounded-full border border-foreground/15 bg-card pl-9 pr-4 text-sm outline-none focus:border-primary"
              aria-label="Search menu"
              data-testid="input-search-menu"
            />
          </label>
        </div>

        <div className="mt-8">
          {menuQuery.isLoading && (
            <div className="grid gap-4 sm:grid-cols-2">
              <LoadingBlock lines={5} />
              <LoadingBlock lines={5} />
              <LoadingBlock lines={5} />
              <LoadingBlock lines={5} />
            </div>
          )}
          {menuQuery.isError && <ErrorNotice message="The chalkboard is being rewritten. Please refresh shortly." />}
          {!menuQuery.isLoading && !menuQuery.isError && filteredItems.length === 0 && (
            <div className="rounded-3xl border border-dashed border-foreground/20 bg-card px-6 py-16 text-center" data-testid="empty-menu">
              <UtensilsCrossed className="mx-auto h-8 w-8 text-secondary" />
              <h2 className="mt-4 font-display text-2xl font-semibold">Nothing by that name today.</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Try another category or clear the search. The good stuff is usually nearby.</p>
              <button type="button" onClick={() => { setSearch(''); setSelectedCategory('All'); }} className="mt-5 text-sm font-bold text-primary underline underline-offset-4" data-testid="button-reset-menu-filters">
                Show everything
              </button>
            </div>
          )}
          {!menuQuery.isLoading && !menuQuery.isError && filteredItems.length > 0 && (
            <div className="grid gap-x-10 sm:grid-cols-2">
              {filteredItems.map((item, index) => (
                <article key={item.id} className="group border-b border-foreground/10 py-6 transition-colors hover:border-secondary/60" data-testid={`card-menu-item-${item.id}`}>
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-display text-2xl font-semibold tracking-tight">{item.name}</h2>
                        {item.featured && <span className="rounded-full bg-accent px-2 py-0.5 font-mono-ui text-[9px] uppercase tracking-[0.1em] text-accent-foreground">House pick</span>}
                      </div>
                      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{item.description}</p>
                    </div>
                    <p className="shrink-0 pt-1 font-mono-ui text-xs font-medium text-secondary">{formatPrice(item.price, item.currency)}</p>
                  </div>
                  <p className="mt-4 flex items-center gap-2 font-mono-ui text-[9px] uppercase tracking-[0.17em] text-muted-foreground/75">
                    <span className="h-1.5 w-1.5 rounded-full bg-secondary" /> {item.category} <span className="opacity-0 transition-opacity group-hover:opacity-100"><ArrowRight className="inline h-3 w-3" /></span>
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mt-20 flex flex-col justify-between gap-5 rounded-2xl bg-accent p-6 sm:flex-row sm:items-center sm:p-8">
        <div>
          <p className="font-mono-ui text-[10px] uppercase tracking-[0.18em] text-foreground/65">A table makes it better</p>
          <h2 className="mt-2 font-display text-3xl font-bold">Bring your appetite.</h2>
        </div>
        <Link href="/reserve" className="inline-flex items-center gap-2 self-start rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 sm:self-auto" data-testid="link-menu-reserve">
          Reserve a table <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
