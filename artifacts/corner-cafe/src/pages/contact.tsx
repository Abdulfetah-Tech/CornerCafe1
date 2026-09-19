import { useState, type FormEvent } from 'react';
import { ArrowRight, Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { useCreateInquiry, useGetCafeProfile } from '@workspace/api-client-react';
import { Field, SuccessNotice, TextAreaField } from '@/components/form-elements';
import { ErrorNotice, SectionLabel } from '@/components/site-shell';

type InquiryForm = { name: string; email: string; subject: string; message: string };
const initialForm: InquiryForm = { name: '', email: '', subject: '', message: '' };

export default function ContactPage() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof InquiryForm, string>>>({});
  const profileQuery = useGetCafeProfile();
  const inquiryMutation = useCreateInquiry();
  const profile = profileQuery.data;
  const update = (key: keyof InquiryForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Partial<Record<keyof InquiryForm, string>> = {};
    if (form.name.trim().length < 2) nextErrors.name = 'Please add your name.';
    if (!form.email.includes('@')) nextErrors.email = 'Please use a valid email.';
    if (form.subject.trim().length < 2) nextErrors.subject = 'Give your message a subject.';
    if (form.message.trim().length < 5) nextErrors.message = 'A little more detail would help.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    inquiryMutation.mutate({ data: { name: form.name.trim(), email: form.email.trim(), subject: form.subject.trim(), message: form.message.trim() } }, { onSuccess: () => setSubmitted(true) });
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-20">
      <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
        <section>
          <SectionLabel>Come say hello</SectionLabel>
          <h1 className="mt-4 font-display text-5xl font-bold leading-[0.95] tracking-[-0.05em] sm:text-7xl">Talk to us.</h1>
          <p className="mt-6 max-w-sm text-base leading-7 text-muted-foreground">Questions about the menu, a gathering, or just want to tell us about your favorite corner? Our inbox is open.</p>
          <div className="mt-10 space-y-5 border-t border-foreground/10 pt-6">
            {profile?.address && <div className="flex gap-3 text-sm"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-secondary" /><span data-testid="text-contact-address">{profile.address}</span></div>}
            {profile?.phone && <a href={`tel:${profile.phone}`} className="flex gap-3 text-sm hover:text-secondary" data-testid="link-contact-phone"><Phone className="h-4 w-4 text-secondary" />{profile.phone}</a>}
            {profile?.email && <a href={`mailto:${profile.email}`} className="flex gap-3 text-sm hover:text-secondary" data-testid="link-contact-email"><Mail className="h-4 w-4 text-secondary" />{profile.email}</a>}
            {profile?.instagramUrl && <a href={profile.instagramUrl} target="_blank" rel="noreferrer" className="flex gap-3 text-sm hover:text-secondary" data-testid="link-contact-instagram"><Instagram className="h-4 w-4 text-secondary" />Find us on Instagram</a>}
          </div>
        </section>
        <section className="rounded-3xl border border-foreground/10 bg-card p-6 sm:p-10">
          {submitted ? (
            <div className="flex min-h-[430px] items-center">
              <SuccessNotice title="Message sent.">
                Thanks for reaching out. Someone from our corner will get back to you soon.
                <button type="button" onClick={() => { setSubmitted(false); setForm(initialForm); }} className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground" data-testid="button-new-inquiry">
                  Send another message <ArrowRight className="h-4 w-4" />
                </button>
              </SuccessNotice>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <div className="border-b border-foreground/10 pb-6"><p className="font-display text-2xl font-bold">Leave a note</p><p className="mt-1 text-sm text-muted-foreground">We read every message.</p></div>
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <Field label="Your name" placeholder="e.g. Dawit" value={form.name} onChange={(event) => update('name', event.target.value)} error={errors.name} testId="input-inquiry-name" autoComplete="name" />
                <Field label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={(event) => update('email', event.target.value)} error={errors.email} testId="input-inquiry-email" autoComplete="email" />
              </div>
              <div className="mt-5"><Field label="Subject" placeholder="What’s on your mind?" value={form.subject} onChange={(event) => update('subject', event.target.value)} error={errors.subject} testId="input-inquiry-subject" /></div>
              <div className="mt-5"><TextAreaField label="Message" placeholder="Write us a few lines..." value={form.message} onChange={(event) => update('message', event.target.value)} error={errors.message} testId="textarea-inquiry-message" /></div>
              {inquiryMutation.isError && <div className="mt-5"><ErrorNotice message="We couldn’t send your note this time." /></div>}
              <button type="submit" disabled={inquiryMutation.isPending} className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60" data-testid="button-submit-inquiry">
                {inquiryMutation.isPending ? 'Sending note...' : 'Send the note'} {!inquiryMutation.isPending && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
