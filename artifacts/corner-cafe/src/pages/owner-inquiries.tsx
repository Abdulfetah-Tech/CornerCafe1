import {
  getGetOwnerSummaryQueryKey,
  getListOwnerInquiriesQueryKey,
  useListOwnerInquiries,
  useUpdateOwnerInquiry,
  type Inquiry,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Archive, Check, Mail, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { errorMessage } from '@/components/owner-shell';

const statuses = [
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'archived', label: 'Archived' },
] as const;

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(date));
}

export default function OwnerInquiriesPage() {
  const queryClient = useQueryClient();
  const inquiriesQuery = useListOwnerInquiries({
    query: { queryKey: getListOwnerInquiriesQueryKey(), retry: 1 },
    request: { credentials: 'include' },
  });
  const update = useUpdateOwnerInquiry({ request: { credentials: 'include' } });
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const changeStatus = (inquiry: Inquiry, status: string) => {
    setFeedback('');
    setError('');
    update.mutate(
      { id: inquiry.id, data: { status: status as 'new' | 'read' | 'archived' } },
      {
        onSuccess: () => {
          setFeedback(`Inquiry from ${inquiry.name} marked ${status}.`);
          void queryClient.invalidateQueries({ queryKey: getListOwnerInquiriesQueryKey() });
          void queryClient.invalidateQueries({ queryKey: getGetOwnerSummaryQueryKey() });
        },
        onError: (reason) => setError(errorMessage(reason, 'The inquiry status could not be updated.')),
      },
    );
  };

  return (
    <div className="space-y-8" data-testid="page-owner-inquiries">
      <header className="border-b border-foreground/10 pb-7">
        <p className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-secondary">The message tray</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">Inquiries</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Keep customer questions visible until they have a clear next step.</p>
      </header>
      {feedback && <p className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary" data-testid="success-inquiry-action"><Check className="mr-2 inline h-4 w-4" />{feedback}</p>}
      {error && <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" data-testid="error-inquiry-action">{error}</p>}
      {inquiriesQuery.isLoading && <div className="space-y-4 animate-pulse">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-48 rounded-3xl bg-muted" />)}</div>}
      {inquiriesQuery.isError && <div className="rounded-2xl border border-secondary/30 bg-secondary/10 p-6" data-testid="error-owner-inquiries"><h2 className="font-display text-2xl font-bold">Inquiries unavailable.</h2><p className="mt-2 text-sm text-muted-foreground">{errorMessage(inquiriesQuery.error, 'We could not load customer inquiries.')}</p></div>}
      {!inquiriesQuery.isLoading && !inquiriesQuery.isError && inquiriesQuery.data?.length === 0 && <div className="rounded-3xl border border-dashed border-foreground/20 bg-card p-12 text-center" data-testid="empty-owner-inquiries"><MessageCircle className="mx-auto h-9 w-9 text-secondary" /><p className="mt-4 font-display text-3xl font-bold">The inbox is clear.</p><p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">New messages from the public contact form will appear here.</p></div>}
      <div className="grid gap-4">
        {inquiriesQuery.data?.map((inquiry) => (
          <article key={inquiry.id} className="owner-panel rounded-3xl border border-foreground/10 bg-card p-5 sm:p-6" data-testid={`card-inquiry-${inquiry.id}`}>
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 font-mono-ui text-[10px] uppercase tracking-wider ${inquiry.status === 'new' ? 'bg-secondary/15 text-secondary' : inquiry.status === 'archived' ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>{inquiry.status}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(inquiry.createdAt)}</span>
                </div>
                <h2 className="mt-4 font-display text-2xl font-bold">{inquiry.subject}</h2>
                <p className="mt-1 text-sm font-semibold">{inquiry.name}</p>
                <a href={`mailto:${inquiry.email}`} className="mt-2 inline-flex items-center gap-2 text-sm text-primary hover:underline"><Mail className="h-4 w-4" />{inquiry.email}</a>
                <p className="mt-5 max-w-3xl whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{inquiry.message}</p>
              </div>
              <label className="w-full shrink-0 lg:w-44">
                <span className="mb-2 block font-mono-ui text-[10px] uppercase tracking-wider text-muted-foreground">Update status</span>
                <select value={inquiry.status} onChange={(event) => changeStatus(inquiry, event.target.value)} disabled={update.isPending} className="owner-focus h-11 w-full rounded-xl border border-foreground/15 bg-background px-3 text-sm font-semibold" data-testid={`select-inquiry-status-${inquiry.id}`}>
                  {statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                </select>
                {inquiry.status === 'archived' && <span className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><Archive className="h-3 w-3" /> Archived from active view</span>}
              </label>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}