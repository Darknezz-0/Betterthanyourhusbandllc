import { useState } from 'react';
import { MessageCircle, Phone, Mail, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { businessInfo } from '@/lib/business';

type FaqAction = 'quote' | 'call' | 'email';

type FaqItem = {
  id: string;
  group: string;
  question: string;
  answer: string;
  actions: FaqAction[];
};

const PHONE = businessInfo.phone;
const PHONE_HREF = businessInfo.phoneHref;
const EMAIL = businessInfo.contact.email;

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'services',
    group: 'Services',
    question: 'What services do you do?',
    answer:
      'Home repairs and maintenance, outdoor projects, property cleanups, pressure washing, gutters and exterior maintenance, mailboxes and small installations, flooring and finish work, and realtor and property services. We also take on custom projects — tap a question below for details on each one.',
    actions: ['quote'],
  },
  {
    id: 'home-repairs',
    group: 'Services',
    question: 'What home repairs do you handle?',
    answer:
      'The small-to-medium repairs that keep a home feeling cared for: doors, trim, drywall touch-ups, hardware, fixtures, and the list that keeps growing.',
    actions: ['quote', 'call'],
  },
  {
    id: 'outdoor',
    group: 'Services',
    question: 'What outdoor projects do you do?',
    answer:
      'Practical improvements for porches, fences, garden structures, exterior trim, and the outdoor spaces that make a property feel finished.',
    actions: ['quote', 'call'],
  },
  {
    id: 'washing-gutters',
    group: 'Services',
    question: 'Do you do pressure washing, gutters, or cleanups?',
    answer:
      'Yes. Pressure washing refreshes exterior surfaces with careful attention to the material, surrounding landscaping, and the details that make a clean look last. We also help with gutter clearing, exterior checks, and small repairs. Property cleanups reset neglected or in-between spaces with thoughtful cleanup, light hauling, seasonal preparation, and practical property refreshes.',
    actions: ['quote', 'call'],
  },
  {
    id: 'small-installs',
    group: 'Services',
    question: 'Do you do small installs like mailboxes or shelving?',
    answer:
      'Yes — mailboxes, shelving, fixtures, hardware, wall-mounted pieces, and the useful installations that make a property work better.',
    actions: ['quote', 'call'],
  },
  {
    id: 'flooring',
    group: 'Services',
    question: 'Do you do flooring and finish work?',
    answer:
      'Yes — finish-minded help with small flooring projects, transitions, caulking, paint-ready prep, and the final details that pull a room together.',
    actions: ['quote', 'call'],
  },
  {
    id: 'realtors',
    group: 'Services',
    question: 'Can you help realtors or property managers?',
    answer:
      'Yes. We help with punch lists, listing preparation, turnover tasks, and property-ready details for realtors, property managers, and property professionals.',
    actions: ['quote', 'call'],
  },
  {
    id: 'custom',
    group: 'Services',
    question: 'Do you take on custom projects?',
    answer:
      'Yes. If your project does not fit a neat category, share the details through the quote form. We will review the scope and let you know what is possible. All work is subject to project scope, applicable licensing requirements, local regulations, and company approval.',
    actions: ['quote'],
  },
  {
    id: 'get-price',
    group: 'Getting a price',
    question: 'How do I get a price?',
    answer:
      'Send a few details and photos through the quote form. We will review the request, then contact you to discuss scope and pricing.',
    actions: ['quote'],
  },
  {
    id: 'what-to-send',
    group: 'Getting a price',
    question: 'What details and photos should I send?',
    answer:
      'Tell us what needs done and send a few photos of the job, so we can review the scope before we contact you. You can add photos in the quote form.',
    actions: ['quote'],
  },
  {
    id: 'how-fast',
    group: 'Getting a price',
    question: 'How fast will I hear back?',
    answer:
      'After you send your details and photos, we will review the request and contact you within approximately 24–48 hours to discuss scope and pricing.',
    actions: ['quote', 'call'],
  },
  {
    id: 'payment',
    group: 'Getting a price',
    question: 'How does payment work?',
    answer:
      'Jobs priced at $500 or more require 50% of the job price upfront. Any remaining payment timing is discussed as part of the agreed project terms. This website does not collect payment or deposits.',
    actions: ['quote', 'call'],
  },
  {
    id: 'small-jobs',
    group: 'Getting a price',
    question: 'Do you only do small jobs?',
    answer:
      'Small jobs are our thing — "Small Jobs. Real Relief." Not every job needs a crew, and not every fix belongs on your weekend. Send us the details and we will review the scope and let you know what is possible.',
    actions: ['quote'],
  },
  {
    id: 'where',
    group: 'Contact & booking',
    question: 'Where do you work?',
    answer:
      'The Kansas City metropolitan area and surrounding communities in Missouri and Kansas. The LLC is registered in Missouri and is working toward registering to legally operate in Kansas. The company currently carries general liability insurance.',
    actions: ['quote', 'call'],
  },
  {
    id: 'examples',
    group: 'Contact & booking',
    question: 'Can I see examples of your work?',
    answer:
      'Yes — the Before & After section on the home page shows recent work. Drag the divider to compare the before and after photos.',
    actions: ['quote'],
  },
  {
    id: 'not-listed',
    group: 'Contact & booking',
    question: 'What if my job is not listed here?',
    answer:
      'Send the details through the quote form anyway, or call or email us. We will review the scope and let you know what is possible. All work is subject to project scope, applicable licensing requirements, local regulations, and company approval.',
    actions: ['quote', 'call', 'email'],
  },
];

const GROUPS = ['Services', 'Getting a price', 'Contact & booking'];

function ActionButtons({ actions }: { actions: FaqAction[] }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {actions.includes('quote') && (
        <Link
          href="/request-a-quote"
          className="inline-flex items-center gap-2 border border-primary bg-primary px-4 py-2.5 font-mono-brand text-[10px] uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-[#c9af78]"
          data-testid="faq-action-quote"
        >
          Get a Quote <ArrowRight size={14} />
        </Link>
      )}
      {actions.includes('call') && (
        <a
          href={PHONE_HREF}
          className="secondary-cta inline-flex items-center gap-2 px-4 py-2.5 font-mono-brand text-[10px] uppercase tracking-[0.14em]"
          data-testid="faq-action-call"
        >
          <Phone size={14} /> Call {PHONE}
        </a>
      )}
      {actions.includes('email') && (
        <a
          href={`mailto:${EMAIL}`}
          className="secondary-cta inline-flex items-center gap-2 px-4 py-2.5 font-mono-brand text-[10px] uppercase tracking-[0.14em]"
          data-testid="faq-action-email"
        >
          <Mail size={14} /> Email us
        </a>
      )}
    </div>
  );
}

export function FaqChatWidget() {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = FAQ_ITEMS.find((item) => item.id === selectedId) ?? null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 font-sans">
      {open && (
        <section
          role="dialog"
          aria-label="Frequently asked questions"
          className="flex max-h-[70vh] w-[min(92vw,380px)] flex-col overflow-hidden border border-[#b39860]/40 bg-[#202225] text-[#ede9df] shadow-2xl"
          data-testid="faq-chat-panel"
        >
          <div className="flex items-start justify-between gap-3 border-b border-[#b39860]/25 bg-[#141618] px-5 py-4">
            <div>
              <p className="font-mono-brand text-[10px] uppercase tracking-[0.18em] text-[#c2a76d]">
                Better Than Your Husband
              </p>
              <h2 className="mt-1 font-display text-lg leading-snug">Questions? Start here.</h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setSelectedId(null);
              }}
              aria-label="Close questions"
              className="shrink-0 p-1 text-[#c6c9c8] transition-colors hover:text-white"
              data-testid="faq-close"
            >
              <X size={20} />
            </button>
          </div>

          <div className="overflow-y-auto px-5 py-4">
            <p className="border-l-2 border-primary bg-[#242729] px-4 py-3 text-xs leading-6 text-[#c6c9c8]">
              Quick answers from our website. This is not a live chat — for a
              price, send your details and photos through the quote form and
              we will get back to you within approximately 24–48 hours.
            </p>

            {selected ? (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="inline-flex items-center gap-2 font-mono-brand text-[10px] uppercase tracking-[0.14em] text-[#c2a76d] transition-colors hover:text-white"
                  data-testid="faq-back"
                >
                  <ArrowLeft size={14} /> All questions
                </button>
                <h3 className="mt-3 font-display text-base leading-snug">{selected.question}</h3>
                <p className="mt-2 text-sm leading-7 text-[#d5d7d6]">{selected.answer}</p>
                <ActionButtons actions={selected.actions} />
              </div>
            ) : (
              GROUPS.map((group) => (
                <div key={group} className="mt-5 first:mt-4">
                  <p className="font-mono-brand text-[10px] uppercase tracking-[0.18em] text-[#bba16a]">
                    {group}
                  </p>
                  <ul className="mt-2 space-y-2">
                    {FAQ_ITEMS.filter((item) => item.group === group).map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(item.id)}
                          className="w-full border border-[#bfc4c5]/20 bg-[#242729] px-4 py-3 text-left text-sm leading-6 text-[#ede9df] transition-colors hover:border-[#b39860]/60 hover:bg-[#2a2d30]"
                          data-testid={`faq-question-${item.id}`}
                        >
                          {item.question}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>

          <div className="flex flex-wrap gap-2 border-t border-[#b39860]/25 bg-[#141618] px-5 py-3">
            <a
              href={PHONE_HREF}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#c2a76d] transition-colors hover:text-white"
              data-testid="faq-footer-call"
            >
              <Phone size={13} /> {PHONE}
            </a>
            <span className="text-[#5c6063]">·</span>
            <a
              href={`mailto:${EMAIL}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#c2a76d] transition-colors hover:text-white"
              data-testid="faq-footer-email"
            >
              <Mail size={13} /> Email us
            </a>
            <span className="text-[#5c6063]">·</span>
            <Link
              href="/request-a-quote"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#c2a76d] transition-colors hover:text-white"
              data-testid="faq-footer-quote"
            >
              Get a Quote <ArrowRight size={13} />
            </Link>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          if (open) setSelectedId(null);
        }}
        aria-expanded={open}
        aria-label={open ? 'Close questions' : 'Ask a question'}
        className="flex h-14 w-14 items-center justify-center rounded-full border border-[#d4be8e] bg-[#b39860] text-[#121416] shadow-2xl transition-colors hover:bg-[#c9af78] focus-visible:outline-2 focus-visible:outline-offset-4"
        data-testid="faq-chat-button"
      >
        {open ? <X size={24} /> : <MessageCircle size={26} />}
      </button>
    </div>
  );
}
