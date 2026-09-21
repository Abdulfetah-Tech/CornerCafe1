import { useEffect, useRef, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider, SignIn, SignUp, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ErrorBoundary } from '@/components/error-boundary';
import { SiteShell } from '@/components/site-shell';
import { OwnerGate } from '@/components/owner-shell';
import HomePage from '@/pages/home';
import MenuPage from '@/pages/menu';
import ReservePage from '@/pages/reserve';
import ContactPage from '@/pages/contact';
import AboutPage from '@/pages/about';
import OwnerDashboard from '@/pages/owner-dashboard';
import OwnerMenuPage from '@/pages/owner-menu';
import OwnerProfilePage from '@/pages/owner-profile';
import OwnerReservationsPage from '@/pages/owner-reservations';
import OwnerInquiriesPage from '@/pages/owner-inquiries';
import NotFound from '@/pages/not-found';
import { Route, Router as WouterRouter, Switch, useLocation } from 'wouter';

const queryClient = new QueryClient();
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

function stripBase(path: string) {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || '/'
    : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: '#155E63',
    colorForeground: '#25283D',
    colorMutedForeground: '#62677C',
    colorDanger: '#B84E3B',
    colorBackground: '#FFF9EE',
    colorInput: '#FFF9EE',
    colorInputForeground: '#25283D',
    colorNeutral: '#D9D0BD',
    fontFamily: 'DM Sans, sans-serif',
    borderRadius: '1rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-[#FFF9EE] rounded-2xl w-[440px] max-w-full overflow-hidden',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'font-display text-[#25283D]',
    headerSubtitle: 'text-[#62677C]',
    socialButtonsBlockButtonText: 'text-[#25283D]',
    formFieldLabel: 'text-[#25283D]',
    footerActionLink: 'text-[#155E63] font-semibold',
    footerActionText: 'text-[#62677C]',
    dividerText: 'text-[#62677C]',
    identityPreviewEditButton: 'text-[#155E63]',
    formFieldSuccessText: 'text-[#155E63]',
    alertText: 'text-[#B84E3B]',
    logoBox: 'mb-3',
    logoImage: 'h-14 w-14',
    socialButtonsBlockButton: 'border-[#D9D0BD] bg-[#FFF9EE]',
    formButtonPrimary: 'bg-[#155E63] hover:bg-[#0F4E52] text-[#FFF9EE]',
    formFieldInput: 'border-[#D9D0BD] bg-[#FFF9EE] text-[#25283D]',
    footerAction: 'bg-transparent',
    dividerLine: 'bg-[#D9D0BD]',
    alert: 'border-[#F08B67]/40 bg-[#F08B67]/10',
    otpCodeFieldInput: 'border-[#D9D0BD] bg-[#FFF9EE] text-[#25283D]',
    formFieldRow: 'gap-2',
    main: 'gap-5',
  },
};

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const previousUserId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (previousUserId.current !== undefined && previousUserId.current !== userId) {
        queryClient.clear();
      }
      previousUserId.current = userId;
    });
    return unsubscribe;
  }, [addListener]);

  return null;
}

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-10">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
      />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-10">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
      />
    </div>
  );
}

function ProtectedOwner({ children }: { children: ReactNode }) {
  return <OwnerGate>{children}</OwnerGate>;
}

function SeoController() {
  const [location] = useLocation();

  useEffect(() => {
    const pages: Record<string, { title: string; description: string }> = {
      '/': { title: 'Corner Cafe | Sheger City', description: 'Corner Cafe in Sheger City, Ethiopia — browse the menu, reserve a table, and get in touch.' },
      '/menu': { title: 'Menu | Corner Cafe', description: 'Browse the published Corner Cafe menu in Sheger City.' },
      '/reserve': { title: 'Reserve a table | Corner Cafe', description: 'Send Corner Cafe a reservation request for your next visit.' },
      '/about': { title: 'About | Corner Cafe', description: 'Learn more about Corner Cafe in Sheger City.' },
      '/contact': { title: 'Contact | Corner Cafe', description: 'Contact Corner Cafe with a question or request.' },
      '/owner': { title: 'Owner desk | Corner Cafe', description: 'Manage Corner Cafe operations.' },
      '/owner/profile': { title: 'Cafe profile | Corner Cafe', description: 'Manage the public Corner Cafe profile.' },
      '/owner/menu': { title: 'Menu library | Corner Cafe', description: 'Manage Corner Cafe menu items.' },
      '/owner/reservations': { title: 'Reservations | Corner Cafe', description: 'Manage Corner Cafe reservation requests.' },
      '/owner/inquiries': { title: 'Inquiries | Corner Cafe', description: 'Manage Corner Cafe customer inquiries.' },
    };
    const page = pages[location] ?? pages['/'];
    document.title = page.title;
    const description = document.querySelector('meta[name="description"]');
    description?.setAttribute('content', page.description);
    const canonical = document.querySelector('link[rel="canonical"]');
    canonical?.setAttribute('href', `${window.location.origin}${basePath}${location === '/' ? '/' : location}`);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', page.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', page.description);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', `${window.location.origin}${basePath}${location === '/' ? '/' : location}`);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', page.title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', page.description);
  }, [location]);

  return null;
}

function PublicRoutes() {
  return (
    <SiteShell>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/menu" component={MenuPage} />
        <Route path="/reserve" component={ReservePage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/about" component={AboutPage} />
        <Route component={NotFound} />
      </Switch>
    </SiteShell>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <SeoController />
      <Switch>
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />
        <Route path="/owner" component={() => <ProtectedOwner><OwnerDashboard /></ProtectedOwner>} />
        <Route path="/owner/profile" component={() => <ProtectedOwner><OwnerProfilePage /></ProtectedOwner>} />
        <Route path="/owner/menu" component={() => <ProtectedOwner><OwnerMenuPage /></ProtectedOwner>} />
        <Route path="/owner/reservations" component={() => <ProtectedOwner><OwnerReservationsPage /></ProtectedOwner>} />
        <Route path="/owner/inquiries" component={() => <ProtectedOwner><OwnerInquiriesPage /></ProtectedOwner>} />
        <Route component={PublicRoutes} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: { start: { title: 'Welcome back', subtitle: 'Sign in to your owner desk' } },
        signUp: { start: { title: 'Create an owner account', subtitle: 'Set up access to Corner Cafe' } },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
