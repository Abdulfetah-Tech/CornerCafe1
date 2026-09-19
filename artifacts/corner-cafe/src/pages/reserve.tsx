import { useMemo, useState, type FormEvent } from 'react';
import { ArrowRight, CalendarDays, Clock3, UsersRound } from 'lucide-react';
import { useCreateReservation } from '@workspace/api-client-react';
import { Field, SuccessNotice, TextAreaField } from '@/components/form-elements';
import { SectionLabel } from '@/components/site-shell';

type ReservationForm = {
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  partySize: string;
  notes: string;
};

const initialForm: ReservationForm = {
  name: '',
  phone: '',
  email: '',
  date: '',
  time: '',
  partySize: '2',
  notes: '',
};

export default function ReservePage() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ReservationForm, string>>>({});
  const reservationMutation = useCreateReservation();
  const minDate = useMemo(() => new Date().toISOString().split('T')[0], []);

  const update = (key: keyof ReservationForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof ReservationForm, string>> = {};
    if (form.name.trim().length < 2) nextErrors.name = 'Tell us who to look out for.';
    if (form.phone.trim().length < 6) nextErrors.phone = 'Please add a reachable number.';
    if (!form.date) nextErrors.date = 'Choose a day.';
    if (!form.time) nextErrors.time = 'Choose a time.';
    if (Number(form.partySize) < 1 || Number(form.partySize) > 20) nextErrors.partySize = 'Choose between 1 and 20 guests.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    reservationMutation.mutate(
      {
        data: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || null,
          date: form.date,
          time: form.time,
          partySize: Number(form.partySize),
          notes: form.notes.trim() || null,
        },
      },
      {
        onSuccess: () => setSubmitted(true),
      },
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-20">
      <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24">
        <section className="lg:pt-8">
          <SectionLabel>Make an evening of it</SectionLabel>
          <h1 className="mt-4 font-display text-5xl font-bold leading-[0.95] tracking-[-0.045em] sm:text-7xl">Save a seat.</h1>
          <p className="mt-6 max-w-sm text-base leading-7 text-muted-foreground">
            Tell us when you’re coming and we’ll keep a table warm. Requests are confirmed by the cafe team.
          </p>
          <div className="mt-10 space-y-5 border-t border-foreground/10 pt-6">
            {[
              { icon: CalendarDays, title: 'Pick your day', text: 'Plans are better with something to look forward to.' },
              { icon: Clock3, title: 'Name your time', text: 'We’ll do our best to have your table ready.' },
              { icon: UsersRound, title: 'Bring your people', text: 'Small table or bigger gathering, all are welcome.' },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-primary"><Icon className="h-4 w-4" /></span>
                <div><p className="text-sm font-bold">{title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p></div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-foreground/10 bg-card p-6 shadow-[8px_8px_0_hsl(var(--accent))] sm:p-10">
          {submitted ? (
            <div className="flex min-h-[460px] items-center">
              <SuccessNotice title="Request received.">
                We’ll review the details and get back to you soon to confirm your table. Keep your phone close.
                <button type="button" onClick={() => { setSubmitted(false); setForm(initialForm); }} className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground" data-testid="button-new-reservation">
                  Make another request <ArrowRight className="h-4 w-4" />
                </button>
              </SuccessNotice>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <div className="flex items-start justify-between gap-4 border-b border-foreground/10 pb-6">
                <div><p className="font-display text-2xl font-bold">Reservation request</p><p className="mt-1 text-sm text-muted-foreground">We’ll confirm the final details.</p></div>
                <span className="font-mono-ui text-[9px] uppercase tracking-[0.18em] text-secondary">01 / 01</span>
              </div>
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <Field label="Your name" placeholder="e.g. Hana" value={form.name} onChange={(event) => update('name', event.target.value)} error={errors.name} testId="input-reservation-name" autoComplete="name" />
                <Field label="Phone number" placeholder="+251 ..." value={form.phone} onChange={(event) => update('phone', event.target.value)} error={errors.phone} testId="input-reservation-phone" autoComplete="tel" />
                <Field label="Email" hint="optional" type="email" placeholder="you@example.com" value={form.email} onChange={(event) => update('email', event.target.value)} error={errors.email} testId="input-reservation-email" autoComplete="email" />
                <label className="block"><span className="mb-2 block text-sm font-semibold">Guests</span><select value={form.partySize} onChange={(event) => update('partySize', event.target.value)} className={`h-12 w-full rounded-xl border bg-card px-4 text-sm outline-none focus:border-primary ${errors.partySize ? 'border-destructive' : 'border-foreground/15'}`} data-testid="select-reservation-party-size">{Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1} {index === 0 ? 'guest' : 'guests'}</option>)}</select>{errors.partySize && <span className="mt-1 block text-xs text-destructive">{errors.partySize}</span>}</label>
                <Field label="Date" type="date" min={minDate} value={form.date} onChange={(event) => update('date', event.target.value)} error={errors.date} testId="input-reservation-date" />
                <Field label="Time" type="time" value={form.time} onChange={(event) => update('time', event.target.value)} error={errors.time} testId="input-reservation-time" />
              </div>
              <div className="mt-5"><TextAreaField label="Anything we should know?" hint="optional" placeholder="A birthday, a preferred corner, a little context..." value={form.notes} onChange={(event) => update('notes', event.target.value)} error={errors.notes} testId="textarea-reservation-notes" /></div>
              {reservationMutation.isError && <p className="mt-5 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive" data-testid="error-reservation-submit">We couldn’t send that request. Please check your details and try again.</p>}
              <button type="submit" disabled={reservationMutation.isPending} className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-secondary px-5 py-3.5 text-sm font-bold text-secondary-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60" data-testid="button-submit-reservation">
                {reservationMutation.isPending ? 'Sending request...' : 'Request this table'} {!reservationMutation.isPending && <ArrowRight className="h-4 w-4" />}
              </button>
              <p className="mt-4 text-center text-[11px] leading-5 text-muted-foreground">A request is not a final confirmation until our team replies.</p>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
