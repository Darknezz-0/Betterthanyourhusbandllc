import { useEffect, useState, type ReactNode } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  ArrowRight,
  ChevronRight,
  ClipboardList,
  Clock3,
  Compass,
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
  X,
} from 'lucide-react';
import { Link, Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { businessInfo } from '@/lib/business';
import { QuoteForm } from '@/pages/QuoteForm';


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

function Logo({ footer = false }: { footer?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center" data-testid="link-logo">
      <img
        src={`${import.meta.env.BASE_URL}assets/official-logo.png`}
        alt={businessInfo.legalName}
        className={`object-contain transition-opacity group-hover:opacity-90 ${footer ? 'h-24 w-24' : 'h-16 w-16 sm:h-[68px] sm:w-[68px]'}`}
      />
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
    <header className="absolute inset-x-0 top-0 z-40 border-b border-white/15 bg-[#201f1b]/20 text-white backdrop-blur-[2px]">
      <div className="mx-auto flex h-[78px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
         <Logo />
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={`font-mono-brand text-[10px] uppercase tracking-[0.15em] transition-colors hover:text-[#d7bd87] ${location === link.href ? 'text-[#d7bd87]' : 'text-white/75'}`} data-testid={`link-nav-${link.label.toLowerCase()}`}>
              {link.label}
            </Link>
          ))}
          {location !== '/' && <Link href="/request-a-quote" className="border border-[#d7bd87]/80 px-5 py-3 font-mono-brand text-[10px] uppercase tracking-[0.14em] text-[#f7f1e7] transition-colors hover:bg-[#d7bd87] hover:text-[#211f1a]" data-testid="link-nav-request-quote">
            Request a Quote
          </Link>}
        </nav>
        <button type="button" className="md:hidden" onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'} data-testid="button-mobile-menu">
          {open ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>
      {open && (
        <div className="border-t border-white/15 bg-[#24231f] px-5 pb-6 pt-3 shadow-2xl md:hidden">
          {links.map((link) => <Link key={link.href} href={link.href} className="block border-b border-white/10 py-4 font-mono-brand text-[10px] uppercase tracking-[0.15em] text-white/80" data-testid={`link-mobile-${link.label.toLowerCase()}`}>{link.label}</Link>)}
          {location !== '/' && <Link href="/request-a-quote" className="mt-5 block bg-primary px-5 py-4 text-center font-mono-brand text-[10px] uppercase tracking-[0.15em] text-primary-foreground" data-testid="link-mobile-request-quote">Request a Quote</Link>}
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-[#25241f] text-[#eee8dc]">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.25fr_.8fr_.8fr] lg:px-12 lg:py-24">
        <div>
           <Logo footer />
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
          <a href={`mailto:${businessInfo.contact.email}`} className="mt-3 block break-all text-sm leading-6 text-[#aaa59c] transition-colors hover:text-[#d7bd87]" data-testid="link-footer-email">{businessInfo.contact.email}</a>
          <p className="mt-1 text-sm leading-6 text-[#aaa59c]">{businessInfo.contact.facebook || 'Facebook details coming soon'}</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 text-[11px] text-[#8d8981] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
           <p>© {new Date().getFullYear()} {businessInfo.displayName}</p>
           <div className="flex flex-wrap gap-x-5 gap-y-2">
             <Link href="/terms" className="hover:text-white" data-testid="link-footer-terms">Terms of Service</Link>
             <Link href="/privacy-policy" className="hover:text-white" data-testid="link-footer-privacy">Privacy Policy</Link>
             <Link href="/legal-disclaimer" className="hover:text-white" data-testid="link-footer-disclaimer">Legal Disclaimer</Link>
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
  return <Link href={href} className={`group inline-flex min-h-12 items-center gap-4 px-6 py-4 font-mono-brand text-[10px] uppercase tracking-[0.14em] transition-all ${secondary ? 'border border-current text-current hover:bg-white/10' : 'bg-primary text-primary-foreground shadow-[0_8px_18px_rgba(39,32,20,.12)] hover:bg-[#d6bb80]'}`} data-testid={`link-cta-${href.replaceAll('/', '') || 'home'}`}>
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
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(24,24,21,.98)_0%,rgba(24,24,21,.76)_45%,rgba(24,24,21,.28)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(24,24,21,.72)_0%,transparent_35%)]" />
        <Header />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-20 pt-40 sm:px-8 lg:px-12 lg:pb-28">
          <div className="max-w-3xl animate-rise-in">
            <SectionLabel light>Kansas City metropolitan area · Missouri + Kansas</SectionLabel>
            <h1 className="mt-7 max-w-4xl font-display text-5xl leading-[.98] tracking-[-.035em] text-[#f8f3e9] sm:text-7xl lg:text-[7.5rem]">BETTER<br /><span className="text-[#d7bd87]">THAN</span> YOUR<br />HUSBAND</h1>
            <p className="mt-7 max-w-md font-serif text-2xl leading-snug text-[#e3d7c4] sm:text-3xl">Small Jobs. Real Relief.</p>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/70">Professional handyman and property services for the jobs that need to get done.</p>
            <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row">
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
            <div><p className="max-w-2xl font-serif text-2xl leading-snug text-[#3c3a34] sm:text-3xl">Not every job needs a crew. Not every fix belongs on your weekend.</p><p className="mt-6 max-w-2xl text-base leading-8 text-[#676259]">{businessInfo.displayName} exists for the practical, visible, quietly important work that keeps a property running well. We bring a steady hand, clear communication, and a finish-minded approach to the list.</p><ButtonArrow href="/about#service-philosophy" secondary>Why we work this way</ButtonArrow></div>
        </div>
      </section>
      <section className="bg-background px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-7xl"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><SectionLabel>What we do</SectionLabel><h2 className="mt-5 max-w-xl font-display text-4xl leading-tight sm:text-5xl">The list, handled.</h2></div><Link href="/services" className="group inline-flex items-center gap-2 pb-1 font-mono-brand text-[10px] uppercase tracking-[.15em] text-primary" data-testid="link-home-all-services">View all services <ChevronRight size={15} className="transition-transform group-hover:translate-x-1" /></Link></div>
           <div className="mt-12 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">{serviceCategories.slice(0, 6).map(({ title, text, icon: Icon }, index) => <Link href="/services" key={title} className={`service-surface group bg-card p-7 transition-colors hover:bg-[#2a2924] hover:text-[#f4efe6] ${index === 0 ? 'lg:col-span-2' : ''}`} data-testid={`card-home-service-${index}`}><Icon size={23} strokeWidth={1.4} className="text-primary" /><h3 className="mt-14 max-w-xs font-display text-2xl leading-tight">{title}</h3><p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground group-hover:text-white/60">{text}</p><span className="mt-8 flex items-center gap-2 font-mono-brand text-[9px] uppercase tracking-[.14em] text-primary">Learn more <ArrowRight size={13} /></span></Link>)}</div>
        </div>
      </section>
      <section className="bg-[#25241f] px-5 py-20 text-[#f5f0e6] sm:px-8 lg:px-12 lg:py-28">
         <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_.9fr]"><div><SectionLabel light>A clear next step</SectionLabel><h2 className="mt-5 max-w-2xl font-display text-4xl leading-[1.06] sm:text-6xl">Tell us what needs doing.</h2><p className="mt-6 max-w-xl text-base leading-8 text-white/65">Send a few details and photos. We will review the request, then contact you within approximately 24–48 hours to discuss scope and pricing.</p><div className="mt-8 flex flex-col items-start gap-3 sm:flex-row"><ButtonArrow href="/estimate">Estimate your project</ButtonArrow><ButtonArrow href="/request-a-quote" secondary>Start a quote request</ButtonArrow></div></div><div className="border-l border-[#d4b879]/40 pl-7 lg:pl-12"><p className="font-mono-brand text-[10px] uppercase tracking-[.18em] text-[#d4b879]">The process</p><ol className="mt-6 space-y-6">{['Submit your request and photos', 'We review the project details', 'We contact you within approximately 24–48 hours', 'Scope, pricing, and scheduling are discussed'].map((step, i) => <li key={step} className="flex gap-4 text-sm text-white/75"><span className="font-mono-brand text-[#d4b879]">0{i + 1}</span>{step}</li>)}</ol></div></div>
      </section>
    </>
  );
}

function PageIntro({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return <section className="bg-[linear-gradient(115deg,#25241f_0%,#2d2b25_68%,#353126_100%)] px-5 pb-16 pt-36 text-[#f5f0e6] sm:px-8 lg:px-12 lg:pb-24"><div className="mx-auto max-w-7xl"><SectionLabel light>{eyebrow}</SectionLabel><h1 className="gold-rule mt-6 max-w-4xl font-display text-5xl leading-[1.02] tracking-[-.03em] sm:text-7xl">{title}</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">{text}</p></div></section>;
}

function ServicesPage() {
  usePageMeta('Services', `Explore home repairs, outdoor projects, cleanups, installations, and property services from ${businessInfo.displayName}.`);
  return <><div className="bg-[#25241f]"><Header /></div><PageIntro eyebrow="A considered scope of work" title="The jobs that need to get done." text="From the punch list to the property reset, we help make homes and properties feel more cared for. Start with a conversation about your project." /><main className="bg-background px-5 py-16 sm:px-8 lg:px-12 lg:py-24"><div className="mx-auto max-w-7xl"><div className="grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-3">{serviceCategories.map(({ title, text, icon: Icon }, index) => <article key={title} className="service-surface group bg-card p-8 transition-colors hover:bg-[#2a2924] hover:text-[#f4efe6]" data-testid={`card-service-${index}`}><Icon size={25} strokeWidth={1.4} className="text-primary" /><h2 className="mt-16 font-display text-2xl leading-tight">{title}</h2><p className="mt-4 text-sm leading-7 text-muted-foreground group-hover:text-white/60">{text}</p></article>)}</div><div className="mt-12 flex gap-4 border-l-2 border-primary bg-[#efe8dc] p-6 text-sm leading-7 text-[#4e4a42] shadow-[0_10px_28px_rgba(54,44,26,.06)]"><ShieldCheck className="mt-1 shrink-0 text-primary" size={19} /><p>{scopeNote}</p></div></div></main><section className="bg-[#f4efe6] px-5 py-20 sm:px-8 lg:px-12"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 lg:flex-row lg:items-center"><div><SectionLabel>Not sure where it fits?</SectionLabel><h2 className="mt-4 font-display text-4xl">Start with the details that matter.</h2></div><div className="flex flex-col items-start gap-3 sm:flex-row"><ButtonArrow href="/estimate">Estimate your project</ButtonArrow><ButtonArrow href="/request-a-quote" secondary>Share your project</ButtonArrow></div></div></section></>;
}

function AboutPage() {
  usePageMeta('About', `Learn about the service philosophy of ${businessInfo.displayName}.`);
  return <><div className="bg-[#25241f]"><Header /></div><PageIntro eyebrow="The company behind the list" title="Professional help, without the production." text={`${businessInfo.displayName} is a local property services company built around practical work, clear expectations, and respect for the places we enter.`} /><main><section id="service-philosophy" className="bg-[#f4efe6] px-5 py-20 sm:px-8 lg:px-12 lg:py-28"><div className="mx-auto max-w-7xl"><SectionLabel>Our service philosophy</SectionLabel><div className="mt-10 grid gap-12 md:grid-cols-3"><div><p className="font-display text-5xl text-primary">01</p><h3 className="mt-5 font-display text-2xl">Be clear</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">Good work starts with an honest understanding of the request, the property, and the limits of the scope.</p></div><div><p className="font-display text-5xl text-primary">02</p><h3 className="mt-5 font-display text-2xl">Be useful</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">We focus on the work that makes a real difference in how a home or property functions and feels.</p></div><div><p className="font-display text-5xl text-primary">03</p><h3 className="mt-5 font-display text-2xl">Leave it better</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">A thoughtful finish is part of the job: communicating, protecting the space, and respecting the result.</p></div></div></div></section></main></>;
}

function QuotePage() {
  usePageMeta('Request a Quote', `Share your project details and photos to request a quote from ${businessInfo.displayName}.`);
  return <><div className="bg-[#25241f]"><Header /></div><PageIntro eyebrow="Start with the details" title="Tell us what needs doing." text="A few specifics and photos help us understand the project before we speak. There is no checkout here—just a clear first step." /><main className="bg-background px-5 py-16 sm:px-8 lg:px-12 lg:py-24"><div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.15fr_.65fr]"><QuoteForm /><aside className="h-fit border-l-2 border-primary bg-[#efe8dc] p-7 lg:sticky lg:top-8"><Clock3 size={21} className="text-primary" /><h2 className="mt-5 font-display text-2xl">What happens next</h2><ol className="mt-6 space-y-5">{['You prepare the request and any helpful photos.', 'We review the project details after you contact us.', `We contact you within ${businessInfo.quoteResponseWindow}.`, 'We discuss scope, pricing, and scheduling.', 'Work is scheduled after both parties agree.'].map((item, i) => <li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground"><span className="font-mono-brand text-xs text-primary">0{i + 1}</span>{item}</li>)}</ol><p className="mt-7 border-t border-[#d6cdbd] pt-5 text-xs leading-6 text-muted-foreground">No payment checkout or deposit policy is handled through this site. {businessInfo.paymentNote}</p></aside></div></main></>;
}

function ContactPage() {
  usePageMeta('Contact', `Contact ${businessInfo.displayName} by phone for handyman and property services in the Kansas City metropolitan area.`);
   return <><div className="bg-[#25241f]"><Header /></div><PageIntro eyebrow="Let’s talk about the list" title="Phone first. People next." text="For the quickest path to a real conversation about your property, call directly. You can also email us or prepare quote details online." /><main className="bg-background px-5 py-20 sm:px-8 lg:px-12 lg:py-28"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_.8fr]"><div className="border border-border bg-card p-8 sm:p-12"><SectionLabel>Primary contact</SectionLabel><a href={businessInfo.phoneHref} className="mt-7 flex items-center gap-4 font-display text-4xl text-foreground transition-colors hover:text-primary sm:text-6xl" data-testid="link-contact-phone"><Phone size={30} className="text-primary sm:h-10 sm:w-10" />{businessInfo.phone}</a><p className="mt-6 max-w-lg text-base leading-8 text-muted-foreground">Call to discuss a project, ask whether a job may be a fit, or get help deciding where to begin.</p><Link href="/request-a-quote" className="mt-8 inline-flex items-center gap-4 bg-primary px-6 py-4 font-mono-brand text-[10px] uppercase tracking-[.14em] text-primary-foreground hover:bg-[#d6bb80]" data-testid="link-contact-quote">Request a quote <ArrowRight size={16} /></Link></div><div className="space-y-4"><div className="border border-border bg-[#f4efe6] p-7"><Compass size={20} className="text-primary" /><h2 className="mt-5 font-display text-2xl">Service area</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">{businessInfo.serviceArea} Availability depends on project and location.</p></div><div className="border border-border bg-[#f4efe6] p-7"><Mail size={20} className="text-primary" /><h2 className="mt-5 font-display text-2xl">Email & Facebook</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">Email us about a project or use the quote request form to prepare the details.</p><a href={`mailto:${businessInfo.contact.email}`} className="mt-4 block break-all font-mono-brand text-[10px] uppercase tracking-[.12em] text-primary hover:text-foreground" data-testid="link-contact-email">Email: {businessInfo.contact.email}</a><p className="mt-2 font-mono-brand text-[10px] uppercase tracking-[.12em] text-primary">Facebook: {businessInfo.contact.facebook || 'Not provided'}</p></div></div></div></main></>;
}

type LegalPageContent = {
  title: string;
  eyebrow: string;
  intro: string;
  effectiveDate: string;
  preamble?: string;
  sections: { heading: string; body: string | string[]; bullets?: string[] }[];
  closingLines?: string[];
};

const legalPages: Record<string, LegalPageContent> = {
  '/terms': {
    title: 'Terms of Service',
    eyebrow: 'Before you request',
    intro: 'These Terms of Service govern your use of the Better Than Your Husband LLC website and the services and information made available through the website.',
    effectiveDate: 'September 18, 2026',
    preamble: 'By using this website, submitting a request for an estimate or quote, or otherwise interacting with the website, you acknowledge that you have read and understood these Terms of Service.',
    sections: [
      {
        heading: 'About Our Services',
        body: [
          'Better Than Your Husband LLC provides handyman, property maintenance, repair, improvement, cleanup, installation, and related services within the scope of work the business is legally permitted and able to perform.',
          "Information about services shown on this website is provided for general informational purposes. Availability depends on the specific project, site conditions, applicable requirements, and the company's review.",
        ],
      },
      {
        heading: 'Estimate and Quote Requests',
        body: [
          'Customers may submit project information and request an estimate or quote.',
          'Submitting a request does not automatically create a contract, guarantee acceptance, or establish a final price.',
          'Website estimates are subject to review and may change after the project, scope, measurements, materials, site conditions, and other relevant factors are evaluated.',
          'A final price is established only after the project has been reviewed and the scope and pricing have been agreed upon by the customer and Better Than Your Husband LLC.',
        ],
      },
      {
        heading: 'Project Scope and Changes',
        body: [
          'The final scope depends on actual project conditions and the work agreed upon.',
          'Conditions discovered after an estimate or quote may affect the scope, materials, labor, time required, or final price.',
          'Additional or changed work should be reviewed and agreed upon before it is performed whenever reasonably possible.',
        ],
      },
      {
        heading: 'Customer Information and Photographs',
        body: [
          'Customers may submit their name, contact information, project details, photographs, measurements, descriptions, and other relevant information.',
          'Customers are responsible for providing reasonably accurate information and having the right to provide photographs or other materials they upload.',
          'Submitted information may be used to evaluate requests, communicate with customers, prepare estimates or quotes, and provide requested services.',
        ],
      },
      {
        heading: 'Customer Responsibilities',
        body: [
          'Customers are responsible for providing reasonable access to the property and areas where requested work is performed.',
          'Customers must provide relevant project information and communicate known hazards, access restrictions, property concerns, or other conditions that could affect the work.',
        ],
      },
      {
        heading: 'Payments and Deposits',
        body: [
          'For jobs priced at $500 or more, 50% of the job price is required upfront.',
          'Any additional payment requirements will be communicated as part of the agreed project terms.',
        ],
      },
      {
        heading: 'Service Call and Pricing',
        body: [
          'Where applicable, a $79 service-call fee may apply. When applicable to an approved repair, it is credited toward the approved repair.',
          'Website pricing is provided for convenience. Actual pricing is determined through review of the requested work and agreed scope.',
        ],
      },
      {
        heading: 'Materials and Project Costs',
        body: [
          'Project pricing may include labor, materials, equipment, disposal, delivery, permits, or other project-related costs when applicable.',
          'Actual costs depend on the specific project.',
          'Website estimator information does not guarantee final material availability or project pricing.',
        ],
      },
      {
        heading: 'Scheduling',
        body: [
          'Submitting a request does not guarantee a particular appointment or completion date.',
          'Scheduling is subject to project requirements, availability, scope, site conditions, and agreement between the customer and Better Than Your Husband LLC.',
        ],
      },
      {
        heading: 'Work Limitations',
        body: [
          'Not every requested project or service can necessarily be performed.',
          'Work is subject to applicable laws, regulations, permit requirements, property conditions, project complexity, and the scope of services Better Than Your Husband LLC is legally permitted and able to provide.',
          "Projects requiring work outside the company's permitted scope may be declined or limited.",
        ],
      },
      {
        heading: 'Website Information',
        body: [
          'Website information is provided for general informational purposes.',
          'Although reasonable efforts may be made to keep information accurate, the website does not guarantee that every page, description, price, service, availability statement, or other information is current or applicable to a particular project.',
          'A website inquiry is not an accepted job, and an estimate is not necessarily a final contract.',
        ],
      },
      {
        heading: 'Third-Party Services',
        body: [
          'The website may contain or use third-party services, tools, platforms, links, or other technology.',
          'Third-party services may have their own terms and privacy policies. Better Than Your Husband LLC is not responsible for their independent policies or practices.',
        ],
      },
      {
        heading: 'Website Use',
        body: 'You agree to use the website lawfully and not to intentionally interfere with its operation, attempt unauthorized access, submit malicious content, or misuse website forms or functionality.',
      },
      {
        heading: 'Intellectual Property',
        body: [
          'The website, its original content, branding, graphics, photographs, text, design, and other materials provided by Better Than Your Husband LLC are protected by applicable intellectual property laws.',
          'You may use the website for legitimate personal purposes related to obtaining information or requesting services. You may not reproduce, distribute, modify, or commercially exploit protected materials without authorization.',
        ],
      },
      {
        heading: 'Disclaimer of Warranties',
        body: [
          'The website and its general information are provided on an "as available" basis.',
          'Better Than Your Husband LLC does not guarantee that the website will always be available, uninterrupted, error-free, or free of technical issues.',
          'Website information, automated tools, estimates, and other preliminary information should not substitute for evaluation of the actual project when necessary.',
        ],
      },
      {
        heading: 'Limitation of Liability',
        body: [
          'To the extent permitted by applicable law, Better Than Your Husband LLC will not be responsible for losses resulting solely from reliance on general website information, preliminary estimates, website availability, technical interruptions, or information that was incomplete or inaccurately supplied by a customer.',
          'Nothing in these Terms excludes or limits responsibility that cannot legally be excluded or limited.',
        ],
      },
      {
        heading: 'Changes to These Terms',
        body: 'Better Than Your Husband LLC may update these Terms when necessary. The effective date at the beginning identifies the current version.',
      },
      {
        heading: 'General Terms',
        body: [
          'If any provision is unenforceable, the remaining provisions remain in effect to the extent permitted by law.',
          'These Terms govern website use and do not replace a separate written agreement governing a specific project.',
        ],
      },
      {
        heading: 'Contact',
        body: 'Questions regarding these Terms may be directed to Better Than Your Husband LLC through the contact information provided on the website.',
      },
    ],
  },
  '/privacy-policy': {
    title: 'Privacy Policy',
    eyebrow: 'A plain-language policy',
    intro: 'Better Than Your Husband LLC respects your privacy and is committed to handling information submitted through this website responsibly.',
    effectiveDate: 'September 18, 2026',
    preamble: 'This Privacy Policy explains what information may be collected through the website, how that information may be used, and the choices available to you.',
    sections: [
      {
        heading: 'Information You May Provide',
        body: [
          'Depending on how you use the website, you may voluntarily provide information such as:',
          'You should only provide information that is reasonably necessary for the purpose of your request.',
        ],
        bullets: [
          'Your name',
          'Phone number',
          'Email address',
          'Property or project information',
          'Descriptions of requested work',
          'Photographs or other images you submit',
          'Measurements or other project details',
          'Information you provide when requesting an estimate or quote',
          'Other information you voluntarily submit through website forms',
        ],
      },
      {
        heading: 'How Information Is Used',
        body: [
          'Information submitted through the website may be used to:',
          "Better Than Your Husband LLC does not use submitted information for purposes unrelated to the customer's request unless permitted or required by law.",
        ],
        bullets: [
          'Respond to inquiries',
          'Review project requests',
          'Understand the work being requested',
          'Prepare or review estimates and quotes',
          'Contact you regarding your request',
          'Schedule or coordinate services',
          'Communicate about an existing or potential project',
          'Improve the website and customer experience',
          'Protect the website and its users',
          'Meet applicable legal or business requirements',
        ],
      },
      {
        heading: 'Project Photographs and Other Uploaded Information',
        body: [
          'If you submit photographs, measurements, descriptions, or other project information, that information may be reviewed by Better Than Your Husband LLC in connection with your request.',
          'Customers are responsible for ensuring that they have the right to submit photographs or other materials they provide.',
          'Do not submit sensitive personal information that is not reasonably necessary for your project.',
        ],
      },
      {
        heading: 'Information Collected Automatically',
        body: [
          'When you visit a website, certain technical information may potentially be collected by the website or by services used to operate it.',
          "Depending on the website's current configuration, this may include device or browser information, general technical information, pages visited, basic usage information, and information necessary for website security and operation.",
          "The specific information collected may change as the website's technology and services change.",
          'Better Than Your Husband LLC does not represent that the website collects information through a particular analytics, advertising, tracking, or similar service unless that service is actually configured and in use.',
        ],
      },
      {
        heading: 'Cookies and Similar Technologies',
        body: [
          'The website may use cookies or similar technologies when necessary for website functionality, security, preferences, or other legitimate website purposes.',
          "The use of cookies or similar technologies may depend on the website's current configuration and the services used to operate it.",
          'You may be able to control certain cookies through your browser or device settings. Disabling certain technologies may affect website functionality.',
        ],
      },
      {
        heading: 'Sharing of Information',
        body: [
          'Better Than Your Husband LLC may share information when reasonably necessary to operate the business, respond to a request, provide requested services, comply with legal requirements, protect the business or others, or perform other legitimate business functions.',
          'Information may also be processed by service providers or technology platforms used to operate website functionality when applicable.',
          'Better Than Your Husband LLC does not sell customer information as a general business practice.',
        ],
      },
      {
        heading: 'Payment Information',
        body: [
          'The website does not represent that payment information is collected through the website unless a payment system has actually been configured and made available.',
          "When payment processing is handled through a third-party payment service, payment information may be subject to that provider's own privacy policy and terms.",
        ],
      },
      {
        heading: 'Communications',
        body: 'Information you provide may be used to communicate with you about your inquiry, estimate, quote, scheduling, project, or other matter related to your interaction with Better Than Your Husband LLC.',
      },
      {
        heading: 'Data Security',
        body: [
          'Better Than Your Husband LLC takes reasonable measures appropriate to the circumstances to protect information submitted through the website.',
          'However, no website, electronic transmission, or method of storing information can be guaranteed to be completely secure.',
        ],
      },
      {
        heading: 'Data Retention',
        body: 'Information may be retained for as long as reasonably necessary for the purpose for which it was collected, to maintain business records, to address disputes, to comply with legal obligations, or for other legitimate business purposes.',
      },
      {
        heading: 'Third-Party Websites and Services',
        body: [
          'The website may contain links to third-party websites or may use third-party services.',
          'Third-party websites and services operate under their own terms and privacy policies.',
          'Better Than Your Husband LLC is not responsible for the privacy practices, security practices, or content of third-party websites or services.',
        ],
      },
      {
        heading: "Children's Privacy",
        body: [
          'The website is intended for general use and is not specifically directed toward children.',
          'Better Than Your Husband LLC does not knowingly request personal information from children for purposes unrelated to the operation of the website or the provision of services.',
        ],
      },
      {
        heading: 'Your Privacy Choices',
        body: [
          'Depending on applicable law, you may have rights concerning personal information associated with you.',
          'These rights may include requesting information about personal information maintained by the business, requesting correction of inaccurate information, or requesting deletion where legally applicable.',
          'Requests may be subject to reasonable verification and to exceptions permitted or required by law.',
        ],
      },
      {
        heading: 'Changes to This Privacy Policy',
        body: [
          'Better Than Your Husband LLC may update this Privacy Policy when necessary to reflect changes to the website, business practices, technology, legal requirements, or other circumstances.',
          'The effective date shown at the beginning of this Privacy Policy identifies the current version.',
        ],
      },
      {
        heading: 'Contact',
        body: 'Questions or privacy-related requests may be directed to Better Than Your Husband LLC through the contact information provided on the website.',
      },
    ],
    closingLines: ['Better Than Your Husband LLC', 'Effective Date: September 18, 2026'],
  },
  '/legal-disclaimer': {
    title: 'Legal Disclaimer',
    eyebrow: 'Important website information',
    intro: 'The information provided on this website is intended for general informational purposes and to help customers understand the types of services that Better Than Your Husband LLC may provide.',
    effectiveDate: 'September 18, 2026',
    preamble: 'Nothing on this website should be interpreted as a guarantee that a particular service, project, material, repair, installation, or improvement will be available, appropriate, accepted, or legally permitted for a particular property or situation.',
    sections: [
      {
        heading: 'Estimates Are Not Final Quotes',
        body: [
          'Information displayed through the website, including estimated pricing, project information, service descriptions, calculators, examples, or other preliminary information, is provided for convenience and planning purposes.',
          'An online estimate or preliminary price is not a final quote, contract, or guarantee of the final cost.',
          "Actual pricing may depend on the project's scope, measurements, materials, labor, access, site conditions, existing damage, required preparation, disposal, permits, code requirements, and other factors.",
          'A final price is established only after the requested work has been reviewed and the scope and pricing have been agreed upon.',
        ],
      },
      {
        heading: 'Project Conditions',
        body: [
          'Information provided through a website form, photograph, description, measurement, or other remote submission may not reveal all conditions affecting a project.',
          'Conditions discovered during an in-person evaluation or while work is being performed may require changes to the scope, materials, labor, schedule, or price.',
          'Additional or changed work should be reviewed and agreed upon before it is performed whenever reasonably possible.',
        ],
      },
      {
        heading: 'Services and Legal Requirements',
        body: [
          'Not every project or requested service can necessarily be performed.',
          'Work is subject to applicable laws, regulations, permit requirements, property conditions, safety considerations, and the scope of work Better Than Your Husband LLC is legally permitted and able to provide.',
          "Where a project requires a permit, licensed trade, inspection, specialized professional, or other legal requirement outside the company's permitted scope, the project may be declined, limited, or referred to an appropriately qualified provider.",
        ],
      },
      {
        heading: 'No Professional Advice',
        body: [
          'Information on this website is not legal, engineering, architectural, structural, electrical, plumbing, financial, insurance, or other professional advice.',
          'Customers should obtain appropriate professional advice when a project requires specialized evaluation or professional services.',
        ],
      },
      {
        heading: 'Customer Responsibility',
        body: [
          'Customers are responsible for providing reasonably accurate information about the requested project and informing Better Than Your Husband LLC of known hazards, property conditions, access restrictions, previous work, or other circumstances that could affect the project.',
          'Customers are also responsible for obtaining any property-owner, landlord, homeowners association, or other required permission that is their responsibility.',
        ],
      },
      {
        heading: 'Third-Party Information and Links',
        body: [
          'The website may contain information, links, tools, or services provided by third parties.',
          'Better Than Your Husband LLC does not control third-party websites or services and is not responsible for their independent content, policies, availability, or practices.',
        ],
      },
      {
        heading: 'No Guarantee of Website Availability',
        body: 'Reasonable efforts may be made to keep website information accurate and available. However, Better Than Your Husband LLC does not guarantee that the website, forms, calculators, estimates, or other online features will always be available, uninterrupted, error-free, or current.',
      },
      {
        heading: 'No Automatic Contract',
        body: [
          'Submitting a website inquiry, requesting an estimate, uploading photographs, receiving preliminary pricing, or communicating through the website does not by itself create a contract or guarantee that Better Than Your Husband LLC will accept or perform the requested work.',
          'Specific projects may be governed by a separate written agreement, estimate, invoice, work authorization, or other project documentation.',
        ],
      },
      {
        heading: 'Limitation of Disclaimer',
        body: [
          'Nothing in this Legal Disclaimer is intended to waive, limit, or eliminate any right, remedy, warranty, obligation, or responsibility that cannot legally be waived, limited, or excluded under applicable law.',
          'This disclaimer is intended to clarify the nature and limitations of information provided through the website and does not replace the Terms of Service or any separate agreement governing a specific project.',
        ],
      },
      {
        heading: 'Changes',
        body: [
          'Better Than Your Husband LLC may update this Legal Disclaimer when necessary to reflect changes to the website, services, business practices, technology, or applicable requirements.',
          'The effective date identifies the current version.',
        ],
      },
      {
        heading: 'Contact',
        body: 'Questions regarding this Legal Disclaimer may be directed to Better Than Your Husband LLC through the contact information provided on the website.',
      },
    ],
    closingLines: ['Better Than Your Husband LLC', 'Effective Date: September 18, 2026'],
  },
  '/service-agreement': {
    title: 'Service Agreement',
    eyebrow: 'A framework for agreed work',
    intro: `Any project performed by ${businessInfo.legalName} is based on the scope and terms discussed and agreed by both parties.`,
    effectiveDate: '[Insert effective date]',
    sections: [
      { heading: 'Parties and approval', body: `The customer and ${businessInfo.legalName} agree on the customer’s requested work before scheduling.` },
      { heading: 'Scope and changes', body: 'The agreed scope should identify the work to be performed and any material assumptions. Changes, additions, site conditions, or work outside the original scope may require further discussion and approval.' },
      { heading: 'Scheduling and access', body: 'Work is scheduled after both parties agree on scope and pricing. The customer is responsible for providing reasonable access to the property and identifying relevant conditions or restrictions.' },
      { heading: 'Payment', body: 'Jobs priced at $500 or more require 50% of the job price upfront. Any remaining payment timing is discussed as part of the agreed project terms. This website does not collect payment or deposits.' },
      { heading: 'Project limitations', body: scopeNote },
    ],
  },
};

function LegalPage({ kind }: { kind: string }) {
  const page = legalPages[kind];
  usePageMeta(page.title, page.intro);
  return <><div className="bg-[#25241f]"><Header /></div><PageIntro eyebrow={page.eyebrow} title={page.title} text={page.intro} /><main className="bg-background px-5 py-16 sm:px-8 lg:px-12 lg:py-24"><article className="mx-auto max-w-3xl"><p className="mb-8 border-l-2 border-primary bg-[#efe8dc] px-5 py-4 font-mono-brand text-[10px] uppercase tracking-[.14em] text-[#4e4a42]">Effective date: {page.effectiveDate}</p>{page.preamble && <p className="mb-8 text-sm leading-8 text-muted-foreground">{page.preamble}</p>}{page.sections.map((section, index) => { const paragraphs = Array.isArray(section.body) ? section.body : [section.body]; return <section key={section.heading} className="border-b border-border py-8 first:pt-0"><div className="flex gap-6"><span className="font-mono-brand text-xs text-primary">{String(index + 1).padStart(2, '0')}</span><div><h2 className="font-display text-2xl">{section.heading}</h2><div className="mt-4 space-y-4 text-sm leading-8 text-muted-foreground"><p>{paragraphs[0]}</p>{section.bullets && <ul className="list-disc space-y-1 pl-5">{section.bullets.map((item) => <li key={item}>{item}</li>)}</ul>}{paragraphs.slice(1).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></div></div></section>; })}{page.closingLines && <div className="pt-8 font-serif text-lg leading-8 text-foreground">{page.closingLines.map((line) => <p key={line}>{line}</p>)}</div>}</article></main></>;
}

function NotFound() {
  usePageMeta('Page Not Found', 'The page you requested could not be found.');
  return <><div className="bg-[#25241f]"><Header /></div><main className="flex min-h-[650px] items-center justify-center bg-background px-5 py-28 text-center"><div><p className="font-mono-brand text-xs tracking-[.18em] text-primary">404 · Not found</p><h1 className="mt-6 font-display text-6xl">That page wandered off.</h1><p className="mx-auto mt-5 max-w-md text-muted-foreground">The page may have moved, but the list is still here.</p><ButtonArrow href="/">Return home</ButtonArrow></div></main></>;
}

function RouteScrollManager() {
  const [location] = useLocation();

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const frame = window.requestAnimationFrame(() => {
      if (hash) {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'auto', block: 'start' });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location]);

  return null;
}

function Router() {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}><Switch><Route path="/" component={HomePage} /><Route path="/services" component={ServicesPage} /><Route path="/estimate" component={QuotePage} /><Route path="/about" component={AboutPage} /><Route path="/request-a-quote" component={QuotePage} /><Route path="/contact" component={ContactPage} /><Route path="/privacy-policy">{() => <LegalPage kind="/privacy-policy" />}</Route><Route path="/terms">{() => <LegalPage kind="/terms" />}</Route><Route path="/legal-disclaimer">{() => <LegalPage kind="/legal-disclaimer" />}</Route><Route path="/service-agreement">{() => <LegalPage kind="/service-agreement" />}</Route><Route component={NotFound} /></Switch></ErrorBoundary>;
}

function App() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
  return <TooltipProvider><WouterRouter base={basePath}><RouteScrollManager /><Layout><Router /></Layout></WouterRouter><Toaster /></TooltipProvider>;
}

export default App;