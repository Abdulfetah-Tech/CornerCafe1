import { getGetCafeProfileQueryKey, getGetOwnerSummaryQueryKey, useGetCafeProfile, useUpdateOwnerCafeProfile, type CafeHour, type CafeProfileInput } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Check, Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { errorMessage } from '@/components/owner-shell';

const blank: CafeProfileInput = { name: '', tagline: '', description: '', address: '', mapUrl: '', phone: '', email: '', instagramUrl: '', hours: [] };
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function OwnerProfilePage() {
  const profileQuery = useGetCafeProfile({ query: { queryKey: getGetCafeProfileQueryKey(), retry: 1 }, request: { credentials: 'include' } });
  const update = useUpdateOwnerCafeProfile();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CafeProfileInput>(blank);
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState('');
  const initialized = useRef(false);

  useEffect(() => {
    if (profileQuery.data && !initialized.current) {
      initialized.current = true;
      setForm({ ...profileQuery.data, phone: profileQuery.data.phone ?? '', email: profileQuery.data.email ?? '', instagramUrl: profileQuery.data.instagramUrl ?? '' });
    }
  }, [profileQuery.data]);

  const setField = (key: keyof Omit<CafeProfileInput, 'hours'>, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const setHour = (index: number, key: keyof CafeHour, value: string) => setForm((current) => ({ ...current, hours: current.hours.map((hour, i) => i === index ? { ...hour, [key]: value } : hour) }));
  const addHour = () => setForm((current) => ({ ...current, hours: [...current.hours, { day: days[current.hours.length % days.length], hours: '08:00 – 17:00' }] }));
  const removeHour = (index: number) => setForm((current) => ({ ...current, hours: current.hours.filter((_, i) => i !== index) }));
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    setSaved(false);
    const payload: CafeProfileInput = { ...form, name: form.name.trim(), tagline: form.tagline.trim(), description: form.description.trim(), address: form.address.trim(), phone: form.phone?.trim() || null, email: form.email?.trim() || null, instagramUrl: form.instagramUrl?.trim() || null };
    update.mutate({ data: payload, request: { credentials: 'include' } } as never, {
      onSuccess: (profile) => {
        queryClient.setQueryData(getGetCafeProfileQueryKey(), profile);
        void queryClient.invalidateQueries({ queryKey: getGetOwnerSummaryQueryKey() });
        setSaved(true);
      },
      onError: (error) => setFormError(errorMessage(error)),
    });
  };

  if (profileQuery.isLoading) return <div className="space-y-4 animate-pulse"><div className="h-12 w-72 rounded bg-muted" /><div className="h-96 rounded-3xl bg-muted" /></div>;
  if (profileQuery.isError) return <div className="rounded-2xl border border-secondary/30 bg-secondary/10 p-6" data-testid="error-owner-profile"><h1 className="font-display text-2xl font-bold">Profile unavailable.</h1><p className="mt-2 text-sm text-muted-foreground">{errorMessage(profileQuery.error, 'We could not load the cafe profile.')}</p></div>;

  return (
    <div className="mx-auto max-w-5xl space-y-8" data-testid="page-owner-profile">
      <header className="border-b border-foreground/10 pb-7"><p className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-secondary">Public presence</p><h1 className="mt-2 font-display text-4xl font-bold tracking-tight">Cafe profile</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">This is the verified information guests see across the site. Keep it specific, warm, and current.</p></header>
      <form onSubmit={submit} className="space-y-6">
        <section className="owner-panel rounded-3xl border border-foreground/10 bg-card p-6 sm:p-8"><div className="mb-7 flex items-center justify-between gap-4"><div><h2 className="font-display text-2xl font-bold">The details</h2><p className="mt-1 text-sm text-muted-foreground">Name, story, and ways to find you.</p></div><span className="hidden rounded-full bg-accent/50 px-3 py-1 font-mono-ui text-[10px] uppercase tracking-wider text-primary sm:inline-flex"><Check className="mr-1 h-3 w-3" /> Verified listing</span></div><div className="grid gap-5 sm:grid-cols-2">
          {([['name', 'Cafe name', 'The name on the sign.'], ['tagline', 'Tagline', 'A short line worth remembering.'], ['address', 'Address', 'What guests should type into their maps.'], ['mapUrl', 'Map URL', 'A full public map link.'], ['phone', 'Phone', 'Optional, shown to guests.'], ['email', 'Email', 'Optional, shown to guests.'], ['instagramUrl', 'Instagram URL', 'Optional social link.']] as const).map(([key, label, hint]) => <label key={key} className="block"><span className="mb-2 flex justify-between text-sm font-semibold">{label}<small className="font-normal text-muted-foreground">{hint}</small></span><input value={form[key] ?? ''} onChange={(event) => setField(key, event.target.value)} className="owner-focus h-12 w-full rounded-xl border border-foreground/15 bg-background px-4 text-sm" data-testid={`input-profile-${key}`} /></label>)}
          <label className="block sm:col-span-2"><span className="mb-2 block text-sm font-semibold">Description</span><textarea value={form.description} onChange={(event) => setField('description', event.target.value)} className="owner-focus min-h-32 w-full resize-y rounded-xl border border-foreground/15 bg-background px-4 py-3 text-sm" data-testid="input-profile-description" /></label>
        </div></section>
        <section className="owner-panel rounded-3xl border border-foreground/10 bg-card p-6 sm:p-8"><div className="flex items-start justify-between gap-5"><div><h2 className="font-display text-2xl font-bold">Opening hours</h2><p className="mt-1 text-sm text-muted-foreground">One clear row per day or service window.</p></div><button type="button" onClick={addHour} className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/5" data-testid="button-add-hour"><Plus className="h-4 w-4" /> Add row</button></div><div className="mt-6 space-y-3">{form.hours.length === 0 && <p className="rounded-2xl border border-dashed border-foreground/20 p-6 text-sm text-muted-foreground" data-testid="empty-profile-hours">No opening hours yet. Add the first service window.</p>}{form.hours.map((hour, index) => <div key={`${hour.day}-${index}`} className="grid gap-3 sm:grid-cols-[1fr_1.5fr_auto]"><input value={hour.day} onChange={(event) => setHour(index, 'day', event.target.value)} className="owner-focus h-11 rounded-xl border border-foreground/15 bg-background px-4 text-sm" aria-label={`Day ${index + 1}`} data-testid={`input-hour-day-${index}`} /><input value={hour.hours} onChange={(event) => setHour(index, 'hours', event.target.value)} className="owner-focus h-11 rounded-xl border border-foreground/15 bg-background px-4 text-sm" aria-label={`Hours ${index + 1}`} data-testid={`input-hour-value-${index}`} /><button type="button" onClick={() => removeHour(index)} className="grid h-11 w-11 place-items-center rounded-xl border border-destructive/25 text-destructive hover:bg-destructive/10" aria-label={`Remove hour ${index + 1}`} data-testid={`button-remove-hour-${index}`}><Trash2 className="h-4 w-4" /></button></div>)}</div></section>
        {formError && <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" data-testid="error-profile-save">{formError}</p>}
        {saved && <p className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary" data-testid="success-profile-save">Profile saved and visible on the public site.</p>}
        <div className="flex justify-end"><button type="submit" disabled={update.isPending} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-[3px_3px_0_hsl(var(--secondary))] disabled:cursor-wait disabled:opacity-60" data-testid="button-save-profile"><Save className="h-4 w-4" />{update.isPending ? 'Saving profile…' : 'Save profile'}</button></div>
      </form>
    </div>
  );
}