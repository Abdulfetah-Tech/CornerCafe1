import { type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { Check } from 'lucide-react';

type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  testId: string;
};

export function Field({
  label,
  hint,
  error,
  testId,
  ...props
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between text-sm font-semibold">
        {label}
        {hint && <span className="font-normal text-muted-foreground">{hint}</span>}
      </span>
      <input
        {...props}
        className={`h-12 w-full rounded-xl border bg-card px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15 ${error ? 'border-destructive' : 'border-foreground/15'}`}
        data-testid={testId}
      />
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}

export function TextAreaField({
  label,
  hint,
  error,
  testId,
  ...props
}: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between text-sm font-semibold">
        {label}
        {hint && <span className="font-normal text-muted-foreground">{hint}</span>}
      </span>
      <textarea
        {...props}
        className={`min-h-32 w-full resize-y rounded-xl border bg-card px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15 ${error ? 'border-destructive' : 'border-foreground/15'}`}
        data-testid={testId}
      />
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}

export function SuccessNotice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-primary/20 bg-primary p-6 text-primary-foreground" data-testid="success-notice">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground"><Check className="h-4 w-4" /></div>
      <h3 className="font-display text-2xl font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-primary-foreground/75">{children}</p>
    </div>
  );
}
