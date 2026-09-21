import {
  getGetOwnerSummaryQueryKey,
  getListOwnerReservationsQueryKey,
  useListOwnerReservations,
  useUpdateOwnerReservation,
  type Reservation,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Check, Clock3, Mail, Phone, Users } from 'lucide-react';
import { useState } from 'react';
import { errorMessage } from '@/components/owner-shell';

const statuses = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'declined', label: 'Declined' },
  { value: 'completed', label: 'Completed' },
] as const;

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${date}T00:00:00`));
}

export default function OwnerReservationsPage() {
  const queryClient = useQueryClient();
  const reservationsQuery = useListOwnerReservations({
    query: { queryKey: getListOwnerReservationsQueryKey(), retry: 1 },
    request: { credentials: 'include' },
  });
  const update = useUpdateOwnerReservation({ request: { credentials: 'include' } });
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const changeStatus = (reservation: Reservation, status: string) => {
    setFeedback('');
    setError('');
    update.mutate(
      { id: reservation.id, data: { status: status as 'pending' | 'confirmed' | 'declined' | 'completed' } },
      {
        onSuccess: () => {
          setFeedback(`Reservation for ${reservation.name} marked ${status}.`);
          void queryClient.invalidateQueries({ queryKey: getListOwnerReservationsQueryKey() });
          void queryClient.invalidateQueries({ queryKey: getGetOwnerSummaryQueryKey() });
        },
        onError: (reason) => setError(errorMessage(reason, 'The reservation status could not be updated.')),
      },
    );
  };

  return (
    <div className="space-y-8" data-testid="page-owner-reservations">
      <header className="border-b border-foreground/10 pb-7">
        <p className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-secondary">The room book</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">Reservations</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Review every request, then keep its status clear for the team.</p>
      </header>
      {feedback && <p className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary" data-testid="success-reservation-action"><Check className="mr-2 inline h-4 w-4" />{feedback}</p>}
      {error && <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" data-testid="error-reservation-action">{error}</p>}
      {reservationsQuery.isLoading && <div className="space-y-4 animate-pulse">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-44 rounded-3xl bg-muted" />)}</div>}
      {reservationsQuery.isError && <div className="rounded-2xl border border-secondary/30 bg-secondary/10 p-6" data-testid="error-owner-reservations"><h2 className="font-display text-2xl font-bold">Reservations unavailable.</h2><p className="mt-2 text-sm text-muted-foreground">{errorMessage(reservationsQuery.error, 'We could not load reservation requests.')}</p></div>}
      {!reservationsQuery.isLoading && !reservationsQuery.isError && reservationsQuery.data?.length === 0 && <div className="rounded-3xl border border-dashed border-foreground/20 bg-card p-12 text-center" data-testid="empty-owner-reservations"><CalendarDays className="mx-auto h-9 w-9 text-secondary" /><p className="mt-4 font-display text-3xl font-bold">No requests yet.</p><p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">New customer reservation requests will appear here.</p></div>}
      <div className="space-y-4">
        {reservationsQuery.data?.map((reservation) => (
          <article key={reservation.id} className="owner-panel rounded-3xl border border-foreground/10 bg-card p-5 sm:p-6" data-testid={`card-reservation-${reservation.id}`}>
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-accent/60 px-3 py-1 font-mono-ui text-[10px] uppercase tracking-wider text-foreground">{reservation.status}</span>
                  <span className="text-xs text-muted-foreground">Request #{reservation.id}</span>
                </div>
                <h2 className="mt-4 font-display text-2xl font-bold">{reservation.name}</h2>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-secondary" />{formatDate(reservation.date)}</span>
                  <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-secondary" />{reservation.time}</span>
                  <span className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-secondary" />{reservation.partySize} {reservation.partySize === 1 ? 'guest' : 'guests'}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <a href={`tel:${reservation.phone}`} className="inline-flex items-center gap-2 font-semibold text-primary hover:underline"><Phone className="h-4 w-4" />{reservation.phone}</a>
                  {reservation.email && <a href={`mailto:${reservation.email}`} className="inline-flex items-center gap-2 font-semibold text-primary hover:underline"><Mail className="h-4 w-4" />{reservation.email}</a>}
                </div>
                {reservation.notes && <p className="mt-4 max-w-2xl rounded-2xl bg-muted/70 px-4 py-3 text-sm leading-6 text-muted-foreground">{reservation.notes}</p>}
              </div>
              <label className="w-full shrink-0 lg:w-44">
                <span className="mb-2 block font-mono-ui text-[10px] uppercase tracking-wider text-muted-foreground">Update status</span>
                <select value={reservation.status} onChange={(event) => changeStatus(reservation, event.target.value)} disabled={update.isPending} className="owner-focus h-11 w-full rounded-xl border border-foreground/15 bg-background px-3 text-sm font-semibold" data-testid={`select-reservation-status-${reservation.id}`}>
                  {statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                </select>
              </label>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}