import { ArrowLeft, Compass } from 'lucide-react';
import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-6xl items-center px-5 py-20 sm:px-8">
      <div className="max-w-xl">
        <Compass className="h-10 w-10 text-secondary" />
        <p className="mt-8 font-mono-ui text-[10px] uppercase tracking-[0.2em] text-secondary">A wrong turn</p>
        <h1 className="mt-4 font-display text-6xl font-bold tracking-[-0.05em] sm:text-8xl">This corner isn’t here.</h1>
        <p className="mt-6 max-w-md text-base leading-7 text-muted-foreground">The page you’re looking for may have moved. The cafe is still exactly where you left it.</p>
        <Link href="/" className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground hover:-translate-y-0.5 transition-transform" data-testid="link-not-found-home">
          <ArrowLeft className="h-4 w-4" /> Back to the cafe
        </Link>
      </div>
    </div>
  );
}
