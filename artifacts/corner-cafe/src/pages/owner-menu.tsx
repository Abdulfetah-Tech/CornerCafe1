import { getListMenuItemsQueryKey, getListOwnerMenuItemsQueryKey, getGetOwnerSummaryQueryKey, MenuItemInputStatus, useCreateOwnerMenuItem, useDeleteOwnerMenuItem, useListOwnerMenuItems, useUpdateOwnerMenuItem, type MenuItem, type MenuItemInput } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Check, Edit3, MoreHorizontal, Plus, Trash2, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { errorMessage } from '@/components/owner-shell';

const fresh: MenuItemInput = { name: '', description: '', category: '', price: 0, currency: 'ETB', featured: false, status: 'draft', dietaryLabels: [] };
const statuses = [{ value: 'published', label: 'Published', tone: 'bg-primary/10 text-primary' }, { value: 'draft', label: 'Draft', tone: 'bg-accent/50 text-foreground' }, { value: 'unavailable', label: 'Unavailable', tone: 'bg-secondary/15 text-secondary' }] as const;

function StatusPill({ status }: { status: string }) {
  const match = statuses.find((item) => item.value === status) ?? statuses[1];
  return <span className={`inline-flex rounded-full px-2.5 py-1 font-mono-ui text-[10px] uppercase tracking-wider ${match.tone}`} data-testid={`status-menu-${status}`}>{match.label}</span>;
}

export default function OwnerMenuPage() {
  const menuQuery = useListOwnerMenuItems({ query: { queryKey: getListOwnerMenuItemsQueryKey(), retry: 1 }, request: { credentials: 'include' } });
  const request = { credentials: 'include' as const };
  const create = useCreateOwnerMenuItem({ request });
  const update = useUpdateOwnerMenuItem({ request });
  const remove = useDeleteOwnerMenuItem({ request });
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<MenuItemInput>(fresh);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const openNew = () => { setEditing(null); setForm(fresh); setError(''); setSuccess(''); };
  const openEdit = (item: MenuItem) => { setEditing(item); setForm({ name: item.name, description: item.description, category: item.category, price: item.price, currency: item.currency, featured: item.featured, status: item.status, dietaryLabels: item.dietaryLabels }); setError(''); setSuccess(''); };
  const refresh = () => { void queryClient.invalidateQueries({ queryKey: getListOwnerMenuItemsQueryKey() }); void queryClient.invalidateQueries({ queryKey: getListMenuItemsQueryKey() }); void queryClient.invalidateQueries({ queryKey: getGetOwnerSummaryQueryKey() }); };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(''); setSuccess('');
    const payload = { ...form, name: form.name.trim(), description: form.description.trim(), category: form.category.trim(), price: Number(form.price), dietaryLabels: form.dietaryLabels.map((label) => label.trim()).filter(Boolean) };
    const onSuccess = () => { refresh(); setSuccess(editing ? 'Menu item updated.' : 'Menu item added.'); setEditing(null); setForm(fresh); };
    const onError = (reason: unknown) => setError(errorMessage(reason, 'The menu item could not be saved.'));
    if (editing) update.mutate({ id: editing.id, data: payload }, { onSuccess, onError });
    else create.mutate({ data: payload }, { onSuccess, onError });
  };
  const deleteItem = (item: MenuItem) => {
    if (!window.confirm(`Delete ${item.name}? This cannot be undone.`)) return;
    setError('');
    remove.mutate({ id: item.id }, { onSuccess: () => { refresh(); setSuccess('Menu item deleted.'); }, onError: (reason) => setError(errorMessage(reason, 'The menu item could not be deleted.')) });
  };
  const busy = create.isPending || update.isPending || remove.isPending;

  return (
    <div className="space-y-8" data-testid="page-owner-menu">
      <header className="flex flex-col justify-between gap-5 border-b border-foreground/10 pb-7 sm:flex-row sm:items-end"><div><p className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-secondary">What is on the counter</p><h1 className="mt-2 font-display text-4xl font-bold tracking-tight">Menu library</h1><p className="mt-3 text-sm text-muted-foreground">Shape the menu guests see. Draft freely, publish deliberately.</p></div><button type="button" onClick={openNew} className="inline-flex items-center justify-center gap-2 rounded-full bg-secondary px-5 py-3 text-sm font-bold text-secondary-foreground shadow-[3px_3px_0_hsl(var(--primary))]" data-testid="button-add-menu-item"><Plus className="h-4 w-4" /> Add item</button></header>
      {success && <p className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary" data-testid="success-menu-action"><Check className="mr-2 inline h-4 w-4" />{success}</p>}
      {error && <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" data-testid="error-menu-action">{error}</p>}
      {menuQuery.isLoading && <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 animate-pulse">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-56 rounded-3xl bg-muted" />)}</div>}
      {menuQuery.isError && <div className="rounded-2xl border border-secondary/30 bg-secondary/10 p-6"><h2 className="font-display text-2xl font-bold">Menu unavailable.</h2><p className="mt-2 text-sm text-muted-foreground">{errorMessage(menuQuery.error, 'We could not load menu items.')}</p></div>}
      {!menuQuery.isLoading && !menuQuery.isError && menuQuery.data?.length === 0 && <div className="rounded-3xl border border-dashed border-foreground/20 bg-card p-12 text-center" data-testid="empty-owner-menu"><p className="font-display text-3xl font-bold">A quiet counter.</p><p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">Add your first dish, then decide when it is ready for the public menu.</p><button type="button" onClick={openNew} className="mt-6 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground" data-testid="button-empty-add-menu">Add first item</button></div>}
      {!menuQuery.isLoading && !menuQuery.isError && Boolean(menuQuery.data?.length) && <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{menuQuery.data?.map((item) => <article key={item.id} className="owner-panel flex min-h-56 flex-col rounded-3xl border border-foreground/10 bg-card p-5" data-testid={`card-menu-item-${item.id}`}><div className="flex items-start justify-between gap-3"><span className="font-mono-ui text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{item.category}</span><StatusPill status={item.status} /></div><h2 className="mt-6 font-display text-2xl font-bold">{item.name}</h2><p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{item.description}</p><div className="mt-auto flex items-end justify-between gap-3 pt-7"><div><span className="font-mono-ui text-lg font-medium">{item.currency} {item.price.toFixed(2)}</span>{item.featured && <span className="ml-2 text-xs font-semibold text-secondary">Featured</span>}</div><div className="flex gap-1"><button type="button" onClick={() => openEdit(item)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted" aria-label={`Edit ${item.name}`} data-testid={`button-edit-menu-${item.id}`}><Edit3 className="h-4 w-4" /></button><button type="button" onClick={() => deleteItem(item)} className="grid h-9 w-9 place-items-center rounded-full text-destructive hover:bg-destructive/10" aria-label={`Delete ${item.name}`} data-testid={`button-delete-menu-${item.id}`}><Trash2 className="h-4 w-4" /></button></div></div></article>)}</div>}
      {(editing || form.name === '') && <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/25 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={editing ? 'Edit menu item' : 'Add menu item'}><form onSubmit={submit} className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-3xl border border-foreground/10 bg-card p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between"><div><p className="font-mono-ui text-[10px] uppercase tracking-[0.2em] text-secondary">{editing ? 'Edit dish' : 'New dish'}</p><h2 className="mt-2 font-display text-3xl font-bold">{editing ? editing.name : 'Add to the menu'}</h2></div><button type="button" onClick={() => { setEditing(null); setForm({ ...fresh, name: ' ' }); }} className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted" aria-label="Close menu form" data-testid="button-close-menu-form"><X className="h-4 w-4" /></button></div><div className="mt-7 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2"><span className="mb-2 block text-sm font-semibold">Name</span><input required minLength={2} value={form.name.trimStart()} onChange={(event) => setForm({ ...form, name: event.target.value })} className="owner-focus h-12 w-full rounded-xl border border-foreground/15 bg-background px-4 text-sm" data-testid="input-menu-name" /></label>
          <label className="sm:col-span-2"><span className="mb-2 block text-sm font-semibold">Description</span><textarea required minLength={2} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="owner-focus min-h-24 w-full rounded-xl border border-foreground/15 bg-background px-4 py-3 text-sm" data-testid="input-menu-description" /></label>
          <label><span className="mb-2 block text-sm font-semibold">Category</span><input required minLength={2} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="owner-focus h-12 w-full rounded-xl border border-foreground/15 bg-background px-4 text-sm" data-testid="input-menu-category" /></label>
          <label><span className="mb-2 block text-sm font-semibold">Price</span><input required min={0} step="0.01" type="number" value={form.price} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} className="owner-focus h-12 w-full rounded-xl border border-foreground/15 bg-background px-4 text-sm" data-testid="input-menu-price" /></label>
          <label><span className="mb-2 block text-sm font-semibold">Currency</span><input required minLength={1} value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })} className="owner-focus h-12 w-full rounded-xl border border-foreground/15 bg-background px-4 text-sm" data-testid="input-menu-currency" /></label>
          <label><span className="mb-2 block text-sm font-semibold">Dietary labels</span><input value={form.dietaryLabels.join(', ')} onChange={(event) => setForm({ ...form, dietaryLabels: event.target.value.split(',') })} placeholder="vegetarian, spicy" className="owner-focus h-12 w-full rounded-xl border border-foreground/15 bg-background px-4 text-sm placeholder:text-muted-foreground/70" data-testid="input-menu-dietary" /></label>
          <label className="sm:col-span-2"><span className="mb-2 block text-sm font-semibold">Publication state</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as MenuItemInputStatus })} className="owner-focus h-12 w-full rounded-xl border border-foreground/15 bg-background px-4 text-sm" data-testid="select-menu-status">{statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></label>
          <label className="flex items-center gap-3 sm:col-span-2"><input type="checkbox" checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })} className="h-4 w-4 accent-[hsl(var(--primary))]" data-testid="checkbox-menu-featured" /><span className="text-sm font-semibold">Feature this item on the public menu</span></label>
        </div><div className="mt-8 flex justify-end gap-3"><button type="button" onClick={() => { setEditing(null); setForm({ ...fresh, name: ' ' }); }} className="rounded-full px-4 py-2.5 text-sm font-semibold hover:bg-muted" data-testid="button-cancel-menu">Cancel</button><button type="submit" disabled={busy} className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60" data-testid="button-submit-menu">{busy ? 'Saving…' : editing ? 'Save changes' : 'Create item'}</button></div></form></div>}
    </div>
  );
}