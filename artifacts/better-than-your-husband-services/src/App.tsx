import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  ClipboardList,
  Clock3,
  Compass,
  Calculator,
  FileText,
  Hammer,
  Home,
  Mail,
  Menu,
  Phone,
  Plus,
  Ruler,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import { Link, Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { businessInfo } from '@/lib/business';
import { getEstimatorService, isQuestionVisible, estimatorServices, type EstimatorQuestion } from '@/lib/pricing';
import { getEstimatorDraft, setEstimatorDraft } from '@/lib/estimatorDraft';

const queryClient = new QueryClient();

const serviceCategories = [
  { title: 'Home Repairs & Maintenance', text: 'The small-to-medium repairs that keep a home feeling cared for: doors, trim, drywall touch-ups, hardware, fixtures, and the list that keeps growing.', icon: Home },
  { title: 'Outdoor Projects', text: 'Practical improvements for porches, fences, garden structures, exterior trim, and the outdoor spaces that make a property feel finished.', icon: Ruler },
  { title: 'Property Cleanups', text: 'Reset neglected or in-between spaces with thoughtful cleanup, light hauling, seasonal preparation, and practical property refreshes.', icon: Sparkles },
  { title: 'Pressure Washing', text: 'Exterior surfaces refreshed with careful attention to the material, surrounding landscaping, and the details that make a clean look last.', icon: Compass },
  { title: 'Gutters & Exterior Maintenance', text: 'Help with gutter clearing, exterior checks, small repairs, and maintenance tasks that protect the home’s first line of defense.', icon: ShieldCheck },
  { title: 'Mailboxes & Small Installations', text: 'Mailboxes, shelving, fixtures, hardware, wall-mounted pieces, and the useful installations that make a property work better.', icon: Plus },
  { title: 'Flooring & Finish Work', text: 'Finish-minded help with small flooring projects, transitions, caulking, paint-ready prep, and the final details that pull a room together.', icon: Hammer },
  { title: 'Realtor & Property Services', text: 'Punch lists, listing preparation, turnover tasks, and property-ready details for realtors, property managers, and property professionals.', icon: ClipboardList },
  { title: 'Custom Projects', text: 'Have a project that does not fit a neat category? Share the details. We will review the scope and let you know what is possible.', icon: FileText },
];

const scopeNote = 'All work is subject to project scope, applicable licensing requirements, local regulations, and company approval.';

function usePageMeta(title: string, description: string) {
  useEffect(() => {
    document.title = `${title} | ${businessInfo.displayName}`;
    const setMeta = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };
    setMeta('description', description);
    setMeta('og:title', `${title} | ${businessInfo.displayName}`);
    setMeta('og:description', description);
    setMeta('og:type', 'website');
  }, [title, description]);
}

function Logo({ light = false }: { light?: boolean }) {
  const [assetFailed, setAssetFailed] = useState(false);
  return (
    <Link href="/" className="group inline-flex items-center gap-3" data-testid="link-logo">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center border ${light ? 'border-[#c8a86b] text-[#d8bd86]' : 'border-primary text-primary'}`}>
        {!assetFailed ? <img src="/assets/logo.svg" alt="" className="h-7 w-7 object-contain" onError={() => setAssetFailed(true)} /> : <span className="font-serif text-xl leading-none">B</span>}
      </span>
      <span className={`block max-w-[156px] font-mono-brand text-[9px] font-bold uppercase leading-[1.25] tracking-[0.18em] ${light ? 'text-[#f6f0e5]' : 'text-foreground'}`}>
        Better Than<br />Your Husband
      </span>
    </Link>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  useEffect(() => setOpen(false), [location]);
  const links = [
    { href: '/', label: 'Home' },
    { href: '/services', label: 'Services' },
    { href: '/estimate', label: 'Estimate' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];
  return (
    <header className="absolute inset-x-0 top-0 z-40 border-b border-white/15 text-white">
      <div className="mx-auto flex h-[78px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
        <Logo light />
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={`font-mono-brand text-[10px] uppercase tracking-[0.15em] transition-colors hover:text-[#d7bd87] ${location === link.href ? 'text-[#d7bd87]' : 'text-white/75'}`} data-testid={`link-nav-${link.label.toLowerCase()}`}>
              {link.label}
            </Link>
          ))}
          <Link href="/request-a-quote" className="border border-[#d7bd87] px-5 py-3 font-mono-brand text-[10px] uppercase tracking-[0.14em] text-[#f7f1e7] transition-colors hover:bg-[#d7bd87] hover:text-[#211f1a]" data-testid="link-nav-request-quote">
            Request a Quote
          </Link>
        </nav>
        <button type="button" className="md:hidden" onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'} data-testid="button-mobile-menu">
          {open ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>
      {open && (
        <div className="border-t border-white/15 bg-[#24231f] px-5 pb-6 pt-3 md:hidden">
          {links.map((link) => <Link key={link.href} href={link.href} className="block border-b border-white/10 py-4 font-mono-brand text-[10px] uppercase tracking-[0.15em] text-white/80" data-testid={`link-mobile-${link.label.toLowerCase()}`}>{link.label}</Link>)}
          <Link href="/request-a-quote" className="mt-5 block bg-primary px-5 py-4 text-center font-mono-brand text-[10px] uppercase tracking-[0.15em] text-primary-foreground" data-testid="link-mobile-request-quote">Request a Quote</Link>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-[#25241f] text-[#eee8dc]">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.25fr_.8fr_.8fr] lg:px-12 lg:py-20">
        <div>
          <Logo light />
          <p className="mt-6 max-w-sm font-serif text-2xl leading-snug text-[#e0d1b5]">Small jobs. Real relief.</p>
          <p className="mt-4 max-w-sm text-sm leading-7 text-[#aaa59c]">Professional handyman and property services for the jobs that need to get done across the Kansas City metropolitan area and surrounding communities in Missouri and Kansas.</p>
        </div>
        <div>
          <p className="font-mono-brand text-[10px] uppercase tracking-[0.18em] text-[#c8a86b]">Explore</p>
          <div className="mt-5 flex flex-col items-start gap-3 text-sm text-[#c7c1b5]">
            <Link href="/services" className="transition-colors hover:text-white" data-testid="link-footer-services">Services</Link>
            <Link href="/about" className="transition-colors hover:text-white" data-testid="link-footer-about">About the company</Link>
            <Link href="/request-a-quote" className="transition-colors hover:text-white" data-testid="link-footer-quote">Request a quote</Link>
             <Link href="/estimate" className="transition-colors hover:text-white" data-testid="link-footer-estimate">Estimate your project</Link>
            <Link href="/contact" className="transition-colors hover:text-white" data-testid="link-footer-contact">Contact</Link>
          </div>
        </div>
        <div>
          <p className="font-mono-brand text-[10px] uppercase tracking-[0.18em] text-[#c8a86b]">Reach us</p>
          <a href={businessInfo.phoneHref} className="mt-5 flex items-center gap-3 text-lg text-white hover:text-[#d7bd87]" data-testid="link-footer-phone"><Phone size={17} /> {businessInfo.phone}</a>
          <p className="mt-3 text-sm leading-6 text-[#aaa59c]">{businessInfo.contact.email || 'Email details coming soon'}</p>
          <p className="mt-1 text-sm leading-6 text-[#aaa59c]">{businessInfo.contact.facebook || 'Facebook details coming soon'}</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 text-[11px] text-[#8d8981] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
           <p>© {new Date().getFullYear()} {businessInfo.displayName}</p>
          <div className="flex gap-5">
            <Link href="/privacy-policy" className="hover:text-white" data-testid="link-footer-privacy">Privacy</Link>
            <Link href="/terms" className="hover:text-white" data-testid="link-footer-terms">Terms</Link>
            <Link href="/service-agreement" className="hover:text-white" data-testid="link-footer-agreement">Service agreement</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Layout({ children }: { children: ReactNode }) {
  return <div className="grain min-h-[100dvh] bg-background">{children}<Footer /></div>;
}

function ButtonArrow({ children, href = '/request-a-quote', secondary = false }: { children: ReactNode; href?: string; secondary?: boolean }) {
  return <Link href={href} className={`group inline-flex items-center gap-4 px-6 py-4 font-mono-brand text-[10px] uppercase tracking-[0.14em] transition-all ${secondary ? 'border border-current text-current hover:bg-white/10' : 'bg-primary text-primary-foreground hover:bg-[#d6bb80]'}`} data-testid={`link-cta-${href.replaceAll('/', '') || 'home'}`}>
    {children}<ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
  </Link>;
}

function SectionLabel({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <p className={`font-mono-brand text-[10px] uppercase tracking-[0.2em] ${light ? 'text-[#d4b879]' : 'text-primary'}`}>{children}</p>;
}

function HomePage() {
  usePageMeta('Small Jobs. Real Relief.', 'Professional handyman and property services for the Kansas City metropolitan area and surrounding communities in Missouri and Kansas.');
  return (
    <>
      <section className="relative flex min-h-[720px] items-end overflow-hidden bg-[#25241f] text-white lg:min-h-[790px]">
        <img src="/assets/hero-craftsmanship.jpg" alt="Detail of careful home craftsmanship" className="absolute inset-0 h-full w-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(24,24,21,.97)_0%,rgba(24,24,21,.72)_45%,rgba(24,24,21,.25)_100%)]" />
        <Header />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-20 pt-40 sm:px-8 lg:px-12 lg:pb-28">
          <div className="max-w-3xl animate-rise-in">
            <SectionLabel light>Kansas City metropolitan area · Missouri + Kansas</SectionLabel>
            <h1 className="mt-7 max-w-4xl font-display text-5xl leading-[.98] tracking-[-.035em] text-[#f8f3e9] sm:text-7xl lg:text-[7.5rem]">BETTER<br /><span className="text-[#d7bd87]">THAN</span> YOUR<br />HUSBAND</h1>
            <p className="mt-7 max-w-md font-serif text-2xl leading-snug text-[#e3d7c4] sm:text-3xl">Small Jobs. Real Relief.</p>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/70">Professional handyman and property services for the jobs that need to get done.</p>
            <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row">
              <ButtonArrow>Request a Quote</ButtonArrow>
              <ButtonArrow href="/services" secondary>Explore Our Services</ButtonArrow>
            </div>
          </div>
          <div className="mt-20 flex items-center gap-4 border-t border-white/20 pt-5 text-[10px] uppercase tracking-[0.16em] text-white/55">
            <span className="h-px w-10 bg-[#d7bd87]" /> Thoughtful work for the places you live and work
          </div>
        </div>
      </section>
      <section className="bg-[#f4efe6] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.8fr_1.25fr] lg:gap-24">
          <div><SectionLabel>The useful middle</SectionLabel><h2 className="mt-5 max-w-sm font-display text-4xl leading-tight tracking-[-.025em] text-[#2b2a25] sm:text-5xl">A good home has a long list.</h2></div>
           <div><p className="max-w-2xl font-serif text-2xl leading-snug text-[#3c3a34] sm:text-3xl">Not every job needs a crew. Not every fix belongs on your weekend.</p><p className="mt-6 max-w-2xl text-base leading-8 text-[#676259]">{businessInfo.displayName} exists for the practical, visible, quietly important work that keeps a property running well. We bring a steady hand, clear communication, and a finish-minded approach to the list.</p><ButtonArrow href="/about" secondary>Why we work this way</ButtonArrow></div>
        </div>
      </section>
      <section className="bg-background px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-7xl"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><SectionLabel>What we do</SectionLabel><h2 className="mt-5 max-w-xl font-display text-4xl leading-tight sm:text-5xl">The list, handled.</h2></div><Link href="/services" className="group inline-flex items-center gap-2 pb-1 font-mono-brand text-[10px] uppercase tracking-[.15em] text-primary" data-testid="link-home-all-services">View all services <ChevronRight size={15} className="transition-transform group-hover:translate-x-1" /></Link></div>
          <div className="mt-12 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">{serviceCategories.slice(0, 6).map(({ title, text, icon: Icon }, index) => <Link href="/services" key={title} className={`group bg-card p-7 transition-colors hover:bg-[#2a2924] hover:text-[#f4efe6] ${index === 0 ? 'lg:col-span-2' : ''}`} data-testid={`card-home-service-${index}`}><Icon size={23} strokeWidth={1.4} className="text-primary" /><h3 className="mt-14 max-w-xs font-display text-2xl leading-tight">{title}</h3><p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground group-hover:text-white/60">{text}</p><span className="mt-8 flex items-center gap-2 font-mono-brand text-[9px] uppercase tracking-[.14em] text-primary">Learn more <ArrowRight size={13} /></span></Link>)}</div>
        </div>
      </section>
      <section className="bg-[#25241f] px-5 py-20 text-[#f5f0e6] sm:px-8 lg:px-12 lg:py-28">
         <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_.9fr]"><div><SectionLabel light>A clear next step</SectionLabel><h2 className="mt-5 max-w-2xl font-display text-4xl leading-[1.06] sm:text-6xl">Tell us what needs doing.</h2><p className="mt-6 max-w-xl text-base leading-8 text-white/65">Send a few details and photos. We will review the request, then contact you within approximately 24–48 hours to discuss scope and pricing.</p><div className="mt-8 flex flex-col items-start gap-3 sm:flex-row"><ButtonArrow href="/estimate">Estimate your project</ButtonArrow><ButtonArrow href="/request-a-quote" secondary>Start a quote request</ButtonArrow></div></div><div className="border-l border-[#d4b879]/40 pl-7 lg:pl-12"><p className="font-mono-brand text-[10px] uppercase tracking-[.18em] text-[#d4b879]">The process</p><ol className="mt-6 space-y-6">{['Submit your request and photos', 'We review the project details', 'We contact you within approximately 24–48 hours', 'Scope, pricing, and scheduling are discussed'].map((step, i) => <li key={step} className="flex gap-4 text-sm text-white/75"><span className="font-mono-brand text-[#d4b879]">0{i + 1}</span>{step}</li>)}</ol></div></div>
      </section>
    </>
  );
}

function PageIntro({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return <section className="bg-[#25241f] px-5 pb-16 pt-36 text-[#f5f0e6] sm:px-8 lg:px-12 lg:pb-24"><div className="mx-auto max-w-7xl"><SectionLabel light>{eyebrow}</SectionLabel><h1 className="mt-6 max-w-4xl font-display text-5xl leading-[1.02] tracking-[-.03em] sm:text-7xl">{title}</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">{text}</p></div></section>;
}

function ServicesPage() {
  usePageMeta('Services', `Explore home repairs, outdoor projects, cleanups, installations, and property services from ${businessInfo.displayName}.`);
  return <><div className="bg-[#25241f]"><Header /></div><PageIntro eyebrow="A considered scope of work" title="The jobs that need to get done." text="From the punch list to the property reset, we help make homes and properties feel more cared for. Start with a conversation about your project." /><main className="bg-background px-5 py-16 sm:px-8 lg:px-12 lg:py-24"><div className="mx-auto max-w-7xl"><div className="grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-3">{serviceCategories.map(({ title, text, icon: Icon }, index) => <article key={title} className="group bg-card p-8 transition-colors hover:bg-[#2a2924] hover:text-[#f4efe6]" data-testid={`card-service-${index}`}><div className="flex items-start justify-between"><Icon size={25} strokeWidth={1.4} className="text-primary" /><span className="font-mono-brand text-[10px] text-muted-foreground group-hover:text-white/40">0{index + 1}</span></div><h2 className="mt-16 font-display text-2xl leading-tight">{title}</h2><p className="mt-4 text-sm leading-7 text-muted-foreground group-hover:text-white/60">{text}</p></article>)}</div><div className="mt-12 flex gap-4 border-l-2 border-primary bg-[#efe8dc] p-6 text-sm leading-7 text-[#4e4a42]"><ShieldCheck className="mt-1 shrink-0 text-primary" size={19} /><p>{scopeNote}</p></div></div></main><section className="bg-[#f4efe6] px-5 py-20 sm:px-8 lg:px-12"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 lg:flex-row lg:items-center"><div><SectionLabel>Not sure where it fits?</SectionLabel><h2 className="mt-4 font-display text-4xl">Start with the details that matter.</h2></div><div className="flex flex-col items-start gap-3 sm:flex-row"><ButtonArrow href="/estimate">Estimate your project</ButtonArrow><ButtonArrow href="/request-a-quote" secondary>Share your project</ButtonArrow></div></div></section></>;
}

function AboutPage() {
  usePageMeta('About', `Learn about the service philosophy of ${businessInfo.displayName}.`);
  return <><div className="bg-[#25241f]"><Header /></div><PageIntro eyebrow="The company behind the list" title="Professional help, without the production." text={`${businessInfo.displayName} is a local property services company built around practical work, clear expectations, and respect for the places we enter.`} /><main><section className="bg-[#f4efe6] px-5 py-20 sm:px-8 lg:px-12 lg:py-28"><div className="mx-auto max-w-7xl"><SectionLabel>Our service philosophy</SectionLabel><div className="mt-10 grid gap-12 md:grid-cols-3"><div><p className="font-display text-5xl text-primary">01</p><h3 className="mt-5 font-display text-2xl">Be clear</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">Good work starts with an honest understanding of the request, the property, and the limits of the scope.</p></div><div><p className="font-display text-5xl text-primary">02</p><h3 className="mt-5 font-display text-2xl">Be useful</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">We focus on the work that makes a real difference in how a home or property functions and feels.</p></div><div><p className="font-display text-5xl text-primary">03</p><h3 className="mt-5 font-display text-2xl">Leave it better</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">A thoughtful finish is part of the job: communicating, protecting the space, and respecting the result.</p></div></div></div></section></main></>;
}

function EstimatorPage() {
  usePageMeta('Estimate Your Project', `Choose a project type and share the details that can help ${businessInfo.displayName} review your request.`);
  const [, navigate] = useLocation();
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [step, setStep] = useState<'details' | 'review'>('details');
  const [error, setError] = useState('');
  const service = getEstimatorService(selectedServiceId);
  const visibleQuestions = service?.questions.filter((question) => isQuestionVisible(question, answers)) ?? [];

  const selectService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setAnswers({});
    setFiles([]);
    setError('');
    setStep('details');
  };

  const updateAnswer = (question: EstimatorQuestion, value: string) => {
    setAnswers((current) => ({ ...current, [question.id]: value }));
    setError('');
  };

  const reviewDetails = () => {
    const missing = visibleQuestions.find((question) => question.required && !answers[question.id]?.trim());
    if (missing) {
      setError(`Please answer “${missing.label}” before reviewing your project.`);
      return;
    }
    setError('');
    setStep('review');
  };

  const summary = service
    ? [
        `Project type: ${service.label}`,
        ...visibleQuestions
          .filter((question) => answers[question.id]?.trim())
          .map((question) => `${question.label}: ${answers[question.id]}`),
      ].join('\n')
    : '';

  const continueToQuote = () => {
    if (!service) return;
    setEstimatorDraft({
      serviceId: service.id,
      serviceLabel: service.label,
      summary,
      photos: files,
    });
    navigate('/request-a-quote?from=estimator');
  };

  return (
    <>
      <div className="bg-[#25241f]"><Header /></div>
      <PageIntro eyebrow="A clearer first step" title="Estimate your project." text="Choose the kind of work you have in mind, answer only the questions that apply, and carry the details into a quote request for review." />
      <main className="bg-background px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-7xl">
          {!service && (
            <section aria-labelledby="estimator-services-heading">
              <div className="flex items-end justify-between gap-6">
                <div>
                  <SectionLabel>Choose a project type</SectionLabel>
                  <h2 id="estimator-services-heading" className="mt-5 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">Start with the work that sounds closest.</h2>
                </div>
                <Calculator className="hidden text-primary sm:block" size={34} strokeWidth={1.3} aria-hidden="true" />
              </div>
              <div className="mt-12 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
                {estimatorServices.map((option, index) => (
                  <button key={option.id} type="button" onClick={() => selectService(option.id)} className="group min-h-48 bg-card p-7 text-left transition-colors hover:bg-[#2a2924] hover:text-[#f4efe6]" data-testid={`button-estimator-service-${option.id}`}>
                    <span className="font-mono-brand text-[10px] text-primary">0{index + 1}</span>
                    <h3 className="mt-10 font-display text-2xl leading-tight">{option.label}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground group-hover:text-white/60">{option.summary}</p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {service && step === 'details' && (
            <section aria-labelledby="estimator-details-heading">
              <button type="button" onClick={() => setSelectedServiceId('')} className="font-mono-brand text-[10px] uppercase tracking-[.15em] text-primary hover:text-foreground" data-testid="button-estimator-change-service">← Change project type</button>
              <div className="mt-7 grid gap-14 lg:grid-cols-[1.15fr_.65fr]">
                <div>
                  <SectionLabel>{service.label}</SectionLabel>
                  <h2 id="estimator-details-heading" className="mt-5 font-display text-4xl leading-tight sm:text-5xl">A few details help us review the work.</h2>
                  <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">Only the questions relevant to {service.label.toLowerCase()} are shown. Approximate measurements are welcome when you have them.</p>
                  <div className="mt-12 space-y-8">
                    {visibleQuestions.map((question) => (
                      <div key={question.id}>
                        <label htmlFor={`estimate-${question.id}`} className="font-mono-brand text-[10px] uppercase tracking-[.14em]">
                          {question.label} {question.required && <span className="text-primary" aria-hidden="true">*</span>}
                        </label>
                        {question.type === 'select' && (
                          <div className="relative mt-3">
                            <select id={`estimate-${question.id}`} value={answers[question.id] ?? ''} onChange={(event) => updateAnswer(question, event.target.value)} className="w-full appearance-none border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary" required={question.required} data-testid={`select-estimator-${question.id}`}>
                              <option value="" disabled>{question.required ? 'Select one' : 'Select if known'}</option>
                              {question.options?.map((option) => <option key={option} value={option}>{option}</option>)}
                            </select>
                            <ChevronDown size={16} className="pointer-events-none absolute right-4 top-3.5 text-muted-foreground" aria-hidden="true" />
                          </div>
                        )}
                        {question.type === 'number' && (
                          <input id={`estimate-${question.id}`} type="number" min={question.min} value={answers[question.id] ?? ''} onChange={(event) => updateAnswer(question, event.target.value)} placeholder={question.placeholder} className="mt-3 w-full border border-input bg-card px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/70 focus:border-primary" required={question.required} data-testid={`input-estimator-${question.id}`} />
                        )}
                        {question.type === 'text' && (
                          <input id={`estimate-${question.id}`} type="text" value={answers[question.id] ?? ''} onChange={(event) => updateAnswer(question, event.target.value)} placeholder={question.placeholder} className="mt-3 w-full border border-input bg-card px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/70 focus:border-primary" required={question.required} data-testid={`input-estimator-${question.id}`} />
                        )}
                        {question.type === 'textarea' && (
                          <textarea id={`estimate-${question.id}`} value={answers[question.id] ?? ''} onChange={(event) => updateAnswer(question, event.target.value)} placeholder={question.placeholder} rows={4} className="mt-3 w-full resize-y border border-input bg-card px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/70 focus:border-primary" required={question.required} data-testid={`textarea-estimator-${question.id}`} />
                        )}
                        {question.helper && <p className="mt-2 text-xs leading-5 text-muted-foreground">{question.helper}</p>}
                      </div>
                    ))}
                  </div>
                  <div className="mt-10">
                    <label htmlFor="estimate-photos" className="font-mono-brand text-[10px] uppercase tracking-[.14em]">Project photos (optional)</label>
                    <label htmlFor="estimate-photos" className="mt-3 flex cursor-pointer flex-col items-center justify-center border border-dashed border-input bg-card px-5 py-8 text-center transition-colors hover:border-primary" data-testid="label-estimator-upload">
                      <Upload size={20} className="text-primary" aria-hidden="true" />
                      <span className="mt-3 text-sm">Add photos that may help with review</span>
                      <span className="mt-1 text-xs text-muted-foreground">JPG, PNG, or HEIC · Select more than one if helpful</span>
                      <input id="estimate-photos" type="file" accept="image/*" multiple className="sr-only" onChange={(event) => setFiles(Array.from(event.target.files ?? []))} data-testid="input-estimator-photos" />
                    </label>
                    {files.length > 0 && <ul className="mt-3 space-y-2" aria-label="Selected project photos">{files.map((file) => <li key={file.name} className="flex items-center gap-2 text-xs text-muted-foreground"><Check size={14} className="text-primary" aria-hidden="true" /> {file.name}</li>)}</ul>}
                  </div>
                  {error && <p role="alert" className="mt-8 border-l-2 border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive" data-testid="text-estimator-error">{error}</p>}
                  <button type="button" onClick={reviewDetails} className="mt-10 inline-flex items-center gap-4 bg-primary px-7 py-4 font-mono-brand text-[10px] uppercase tracking-[.14em] text-primary-foreground transition-colors hover:bg-[#d6bb80]" data-testid="button-estimator-review">Review project details <ArrowRight size={16} aria-hidden="true" /></button>
                </div>
                <aside className="h-fit border-l-2 border-primary bg-[#efe8dc] p-7 lg:sticky lg:top-8">
                  <Calculator size={21} className="text-primary" aria-hidden="true" />
                  <h2 className="mt-5 font-display text-2xl">Review first, price later.</h2>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">This estimator is collecting project information only. Verified business pricing rules have not been added, so no dollar amount is shown.</p>
                  <p className="mt-5 border-t border-[#d6cdbd] pt-5 text-sm leading-7 text-muted-foreground">After you review your details, they will be carried into the existing Request a Quote process.</p>
                </aside>
              </div>
            </section>
          )}

          {service && step === 'review' && (
            <section aria-labelledby="estimator-review-heading">
              <button type="button" onClick={() => setStep('details')} className="font-mono-brand text-[10px] uppercase tracking-[.15em] text-primary hover:text-foreground" data-testid="button-estimator-edit">← Edit project details</button>
              <div className="mt-7 grid gap-14 lg:grid-cols-[1fr_.7fr]">
                <div>
                  <SectionLabel>Review before continuing</SectionLabel>
                  <h2 id="estimator-review-heading" className="mt-5 font-display text-4xl leading-tight sm:text-5xl">Here is what you told us.</h2>
                  <div className="mt-10 whitespace-pre-line border border-border bg-card p-6 text-sm leading-8 text-muted-foreground sm:p-8">{summary}</div>
                  {files.length > 0 && <p className="mt-4 text-xs text-muted-foreground">{files.length} project photo{files.length === 1 ? '' : 's'} will stay selected for this quote handoff.</p>}
                  <button type="button" onClick={continueToQuote} className="mt-10 inline-flex items-center gap-4 bg-primary px-7 py-4 font-mono-brand text-[10px] uppercase tracking-[.14em] text-primary-foreground transition-colors hover:bg-[#d6bb80]" data-testid="button-estimator-continue">Continue to Request a Quote <ArrowRight size={16} aria-hidden="true" /></button>
                </div>
                <aside className="h-fit border-l-2 border-primary bg-[#efe8dc] p-7">
                  <ShieldCheck size={21} className="text-primary" aria-hidden="true" />
                  <h2 className="mt-5 font-display text-2xl">Manual review is next.</h2>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">Based on the information provided, this project requires a review before an estimate can be provided.</p>
                  <p className="mt-5 border-t border-[#d6cdbd] pt-5 text-sm leading-7 text-muted-foreground">When verified pricing is added later, any automated result will be labeled “Estimated Project Range,” never a guaranteed price or final quote.</p>
                </aside>
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}

function QuotePage() {
  usePageMeta('Request a Quote', `Share your project details and photos to request a quote from ${businessInfo.displayName}.`);
  const draft = getEstimatorDraft();
   const [prepared, setPrepared] = useState(false);
  const [files, setFiles] = useState<File[]>(() => draft?.photos ?? []);
  const [error, setError] = useState('');
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) { setError('Please complete the required fields before sending your request.'); form.reportValidity(); return; }
    setError('');
     if (businessInfo.contact.email) {
       const values = new FormData(form);
       const subject = encodeURIComponent(`Quote request from ${values.get('name') || 'website visitor'}`);
       const body = encodeURIComponent([
         `Name: ${values.get('name') || ''}`,
         `Phone: ${values.get('phone') || ''}`,
         `Email: ${values.get('email') || ''}`,
         `Property address: ${values.get('address') || ''}`,
         `Preferred contact method: ${values.get('contact') || ''}`,
         `Preferred timeframe: ${values.get('timeframe') || ''}`,
         '',
         `Project details: ${values.get('project') || ''}`,
         '',
         `Project photos selected: ${files.map((file) => file.name).join(', ') || 'None'}`,
       ].join('\n'));
       window.location.href = `mailto:${businessInfo.contact.email}?subject=${subject}&body=${body}`;
     }
     setPrepared(true);
  };
   if (prepared) return <><div className="bg-[#25241f]"><Header /></div><main className="flex min-h-[650px] items-center bg-background px-5 py-28 sm:px-8 lg:px-12"><div className="mx-auto max-w-xl text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center border border-primary text-primary"><CircleCheck size={30} /></div><SectionLabel>Next step ready</SectionLabel><h1 className="mt-5 font-display text-5xl">Your details are ready.</h1><p className="mt-5 text-base leading-8 text-muted-foreground">No email destination is configured for this site yet, so the request has not been sent online. Please call <a className="whitespace-nowrap text-foreground underline decoration-primary underline-offset-4" href={businessInfo.phoneHref}>{businessInfo.phone}</a> to share the project details and photos. This site does not process payment or create a scheduled appointment.</p><a href={businessInfo.phoneHref} className="mt-8 inline-flex items-center gap-3 bg-primary px-6 py-4 font-mono-brand text-[10px] uppercase tracking-[.14em] text-primary-foreground hover:bg-[#d6bb80]" data-testid="link-call-to-finish">Call {businessInfo.phone} <Phone size={15} /></a><br /><button type="button" onClick={() => setPrepared(false)} className="mt-5 border border-border px-5 py-3 font-mono-brand text-[10px] uppercase tracking-[.14em] hover:bg-muted" data-testid="button-edit-quote">Edit details</button></div></main></>;
   return <><div className="bg-[#25241f]"><Header /></div><PageIntro eyebrow="Start with the details" title="Tell us what needs doing." text="A few specifics and photos help us understand the project before we speak. There is no checkout here—just a clear first step." /><main className="bg-background px-5 py-16 sm:px-8 lg:px-12 lg:py-24"><div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.15fr_.65fr]"><form onSubmit={submit} className="space-y-8" noValidate>{draft && <div className="border-l-2 border-primary bg-[#efe8dc] px-5 py-4 text-sm leading-7 text-[#4e4a42]" data-testid="estimator-handoff"><strong className="font-semibold">Estimator details added.</strong> Your {draft.serviceLabel.toLowerCase()} notes are included below. You can add or change anything before preparing the request.</div>}<div className="grid gap-6 sm:grid-cols-2"><Field label="Your name" name="name" placeholder="Full name" required /><Field label="Phone number" name="phone" type="tel" placeholder="913-000-0000" required /></div><div className="grid gap-6 sm:grid-cols-2"><Field label="Property address" name="address" placeholder="Street, city, state" required /><Field label="Email address (optional)" name="email" type="email" placeholder="You@email.com" /></div><div><label htmlFor="project" className="font-mono-brand text-[10px] uppercase tracking-[.14em]">What needs doing? <span className="text-primary">*</span></label><textarea id="project" name="project" required rows={6} defaultValue={draft?.summary ?? ''} placeholder="Tell us about the project, the property, and anything useful to know." className="mt-3 w-full resize-y border border-input bg-card px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary" data-testid="input-project-details" /></div><div className="grid gap-6 sm:grid-cols-2"><SelectField label="Preferred contact method" name="contact" options={['Phone call', 'Text message', 'Email']} /><SelectField label="Preferred timeframe" name="timeframe" options={['As soon as possible', 'Within the next 2 weeks', 'Within the next month', 'I am planning ahead']} /></div><div><label htmlFor="photos" className="font-mono-brand text-[10px] uppercase tracking-[.14em]">Project photos (optional)</label><label htmlFor="photos" className="mt-3 flex cursor-pointer flex-col items-center justify-center border border-dashed border-input bg-card px-5 py-8 text-center transition-colors hover:border-primary" data-testid="label-upload-photos"><Upload size={20} className="text-primary" /><span className="mt-3 text-sm">Add one or more photos</span><span className="mt-1 text-xs text-muted-foreground">JPG, PNG, or HEIC · Helpful but not required</span><input id="photos" name="photos" type="file" accept="image/*" multiple className="sr-only" onChange={(event) => setFiles((current) => [...current, ...Array.from(event.target.files ?? [])])} data-testid="input-project-photos" /></label>{files.length > 0 && <ul className="mt-3 space-y-2">{files.map((file) => <li key={file.name} className="flex items-center gap-2 text-xs text-muted-foreground"><Check size={14} className="text-primary" /> {file.name}</li>)}</ul>}</div>{error && <p role="alert" className="border-l-2 border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive" data-testid="text-form-error">{error}</p>}<button type="submit" className="inline-flex items-center gap-4 bg-primary px-7 py-4 font-mono-brand text-[10px] uppercase tracking-[.14em] text-primary-foreground transition-colors hover:bg-[#d6bb80]" data-testid="button-submit-quote">Prepare quote request <ArrowRight size={16} /></button></form><aside className="h-fit border-l-2 border-primary bg-[#efe8dc] p-7 lg:sticky lg:top-8"><Clock3 size={21} className="text-primary" /><h2 className="mt-5 font-display text-2xl">What happens next</h2><ol className="mt-6 space-y-5">{['You prepare the request and any helpful photos.', 'We review the project details after you contact us.', `We contact you within ${businessInfo.quoteResponseWindow}.`, 'We discuss scope, pricing, and scheduling.', 'Work is scheduled after both parties agree.'].map((item, i) => <li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground"><span className="font-mono-brand text-xs text-primary">0{i + 1}</span>{item}</li>)}</ol><p className="mt-7 border-t border-[#d6cdbd] pt-5 text-xs leading-6 text-muted-foreground">No payment checkout or deposit policy is handled through this site. {businessInfo.paymentNote}</p></aside></div></main></>;
}

function Field({ label, name, placeholder, type = 'text', required = false }: { label: string; name: string; placeholder: string; type?: string; required?: boolean }) {
  return <div><label htmlFor={name} className="font-mono-brand text-[10px] uppercase tracking-[.14em]">{label} {required && <span className="text-primary">*</span>}</label><input id={name} name={name} type={type} required={required} placeholder={placeholder} className="mt-3 w-full border border-input bg-card px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary" data-testid={`input-${name}`} /></div>;
}

function SelectField({ label, name, options }: { label: string; name: string; options: string[] }) {
  return <div><label htmlFor={name} className="font-mono-brand text-[10px] uppercase tracking-[.14em]">{label}</label><div className="relative mt-3"><select id={name} name={name} defaultValue="" className="w-full appearance-none border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary" data-testid={`select-${name}`}><option value="" disabled>Select one</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select><ChevronDown size={16} className="pointer-events-none absolute right-4 top-3.5 text-muted-foreground" /></div></div>;
}

function ContactPage() {
  usePageMeta('Contact', `Contact ${businessInfo.displayName} by phone for handyman and property services in the Kansas City metropolitan area.`);
   return <><div className="bg-[#25241f]"><Header /></div><PageIntro eyebrow="Let’s talk about the list" title="Phone first. People next." text="For the quickest path to a real conversation about your property, call directly. Quote details can also be prepared online for a future email handoff." /><main className="bg-background px-5 py-20 sm:px-8 lg:px-12 lg:py-28"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_.8fr]"><div className="border border-border bg-card p-8 sm:p-12"><SectionLabel>Primary contact</SectionLabel><a href={businessInfo.phoneHref} className="mt-7 flex items-center gap-4 font-display text-4xl text-foreground transition-colors hover:text-primary sm:text-6xl" data-testid="link-contact-phone"><Phone size={30} className="text-primary sm:h-10 sm:w-10" />{businessInfo.phone}</a><p className="mt-6 max-w-lg text-base leading-8 text-muted-foreground">Call to discuss a project, ask whether a job may be a fit, or get help deciding where to begin.</p><Link href="/request-a-quote" className="mt-8 inline-flex items-center gap-4 bg-primary px-6 py-4 font-mono-brand text-[10px] uppercase tracking-[.14em] text-primary-foreground hover:bg-[#d6bb80]" data-testid="link-contact-quote">Request a quote <ArrowRight size={16} /></Link></div><div className="space-y-4"><div className="border border-border bg-[#f4efe6] p-7"><Compass size={20} className="text-primary" /><h2 className="mt-5 font-display text-2xl">Service area</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">{businessInfo.serviceArea} Availability depends on project and location.</p></div><div className="border border-border bg-[#f4efe6] p-7"><Mail size={20} className="text-primary" /><h2 className="mt-5 font-display text-2xl">Email & Facebook</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">These contact channels are being prepared. Please use the phone number above or the quote request form for now.</p><p className="mt-4 font-mono-brand text-[10px] uppercase tracking-[.12em] text-primary">Email: {businessInfo.contact.email || 'Not provided'}</p><p className="mt-2 font-mono-brand text-[10px] uppercase tracking-[.12em] text-primary">Facebook: {businessInfo.contact.facebook || 'Not provided'}</p></div></div></div></main></>;
}

const legalPages: Record<string, { title: string; eyebrow: string; intro: string; sections: { heading: string; body: string }[] }> = {
  '/privacy-policy': { title: 'Privacy Policy', eyebrow: 'A plain-language policy', intro: `This page explains the information this website may receive when you use it to contact ${businessInfo.legalName}.`, sections: [{ heading: 'Information you choose to provide', body: 'When you prepare a quote request, you may provide your name, phone number, property address, email address, project details, preferred contact method, timeframe, and project photos. This information may be used to review and respond to your request.' }, { heading: 'How information is used', body: 'Information may be used to communicate about a requested project, understand project scope, coordinate next steps, and maintain appropriate business records. The business should review and update this section before publishing a final version of this policy.' }, { heading: 'Photos and sensitive details', body: 'Please share only photos and information relevant to the project. Do not include passwords, financial account information, or other sensitive personal information in a request.' }, { heading: 'Questions', body: 'For questions about this policy or the information you submit, please call 913-346-0205. Email contact details are not currently provided.' }] },
  '/terms': { title: 'Terms & Conditions', eyebrow: 'Before you request', intro: 'These general website terms describe how this informational site and quote-request process are intended to work.', sections: [{ heading: 'Informational requests', body: 'Submitting a form is a request for contact, not an acceptance of work, a quote, a contract, or a scheduled appointment. Project availability, scope, pricing, and timing are discussed separately.' }, { heading: 'Project scope', body: 'All work is subject to project scope, applicable licensing requirements, local regulations, and company approval. A request may be declined or revised if the work is outside the company’s service capability or requirements.' }, { heading: 'No checkout', body: 'This website does not process payment, collect deposits, or create a checkout transaction. Payment terms can be discussed; payment is generally requested upon completion of agreed work.' }, { heading: 'Contact', body: 'Questions about a project or these terms can be directed to 913-346-0205.' }] },
  '/service-agreement': { title: 'Service Agreement', eyebrow: 'A framework for agreed work', intro: `Any project performed by ${businessInfo.legalName} is based on the scope and terms discussed and agreed by both parties.`, sections: [{ heading: 'Parties and approval', body: `The customer and ${businessInfo.legalName} agree on the customer’s requested work before scheduling.` }, { heading: 'Scope and changes', body: 'The agreed scope should identify the work to be performed and any material assumptions. Changes, additions, site conditions, or work outside the original scope may require further discussion and approval.' }, { heading: 'Scheduling and access', body: 'Work is scheduled after both parties agree on scope and pricing. The customer is responsible for providing reasonable access to the property and identifying relevant conditions or restrictions.' }, { heading: 'Payment', body: 'Payment terms can be discussed as part of the project conversation. Payment is generally requested upon completion of agreed work. This website does not collect payment or deposits.' }, { heading: 'Project limitations', body: scopeNote }] },
};

function LegalPage({ kind }: { kind: string }) {
  const page = legalPages[kind];
  usePageMeta(page.title, page.intro);
  return <><div className="bg-[#25241f]"><Header /></div><PageIntro eyebrow={page.eyebrow} title={page.title} text={page.intro} /><main className="bg-background px-5 py-16 sm:px-8 lg:px-12 lg:py-24"><article className="mx-auto max-w-3xl">{page.sections.map((section, index) => <section key={section.heading} className="border-b border-border py-8 first:pt-0"><div className="flex gap-6"><span className="font-mono-brand text-xs text-primary">0{index + 1}</span><div><h2 className="font-display text-2xl">{section.heading}</h2><p className="mt-4 text-sm leading-8 text-muted-foreground">{section.body}</p></div></div></section>)}</article></main></>;
}

function NotFound() {
  usePageMeta('Page Not Found', 'The page you requested could not be found.');
  return <><div className="bg-[#25241f]"><Header /></div><main className="flex min-h-[650px] items-center justify-center bg-background px-5 py-28 text-center"><div><p className="font-mono-brand text-xs tracking-[.18em] text-primary">404 · Not found</p><h1 className="mt-6 font-display text-6xl">That page wandered off.</h1><p className="mx-auto mt-5 max-w-md text-muted-foreground">The page may have moved, but the list is still here.</p><ButtonArrow href="/">Return home</ButtonArrow></div></main></>;
}

function Router() {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}><Switch><Route path="/" component={HomePage} /><Route path="/services" component={ServicesPage} /><Route path="/estimate" component={EstimatorPage} /><Route path="/about" component={AboutPage} /><Route path="/request-a-quote" component={QuotePage} /><Route path="/contact" component={ContactPage} /><Route path="/privacy-policy">{() => <LegalPage kind="/privacy-policy" />}</Route><Route path="/terms">{() => <LegalPage kind="/terms" />}</Route><Route path="/service-agreement">{() => <LegalPage kind="/service-agreement" />}</Route><Route component={NotFound} /></Switch></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Layout><Router /></Layout></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;