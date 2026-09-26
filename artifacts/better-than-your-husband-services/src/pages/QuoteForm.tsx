import { useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react';
import { businessInfo } from '@/lib/business';

type Details = {
  projectType: string;
  otherProjectType: string;
  project: string;
  size: string;
  condition: string;
  materials: string;
  additional: string;
  name: string;
  phone: string;
  address: string;
  email: string;
  contact: string;
  timeframe: string;
};

const initialDetails: Details = {
  projectType: '', otherProjectType: '', project: '', size: '', condition: '',
  materials: '', additional: '', name: '', phone: '', address: '', email: '',
  contact: '', timeframe: '',
};

const projectTypes = [
  'Maintenance / Punch List', 'Property Cleanup', 'Hauling / Cleanout',
  'Outdoor / Curb Appeal', 'Installation', 'Fixtures', 'Drywall / Trim / Caulking',
  'Fence / Deck', 'Flooring', 'Mailbox', 'Gutters', 'Pressure Washing',
  'Yard / Tree Cleanup', 'Realtor / Property Punch List', 'Inspection Repairs',
  'Other / Not Listed',
];

const steps = ['Project Information', 'Materials & Additional Details', 'Contact Information'];
const inputClass = 'mt-3 w-full border border-input bg-[#1e2123] px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-[#a2a8aa] focus:border-primary';

type DetailKey = keyof Details;

export function QuoteForm() {
  const [step, setStep] = useState(0);
  const [details, setDetails] = useState<Details>(initialDetails);
  const [error, setError] = useState('');

  const change = (key: DetailKey, value: string) => {
    setDetails((previous) => ({ ...previous, [key]: value }));
    setError('');
  };

  const field = (key: DetailKey, label: string, placeholder: string, required = false, type = 'text') => (
    <div>
      <label htmlFor={key} className="font-mono-brand text-[10px] uppercase tracking-[.14em]">
        {label} {required && <span className="text-primary">*</span>}
      </label>
       <input id={key} name={key} type={type} required={required} value={details[key]} onChange={(event) => change(key, event.target.value)} placeholder={placeholder} className={inputClass} data-testid={`input-${key}`} />
    </div>
  );

  const textArea = (key: DetailKey, label: string, placeholder: string, required = false, rows = 4) => (
    <div>
      <label htmlFor={key} className="font-mono-brand text-[10px] uppercase tracking-[.14em]">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      <textarea id={key} name={key} required={required} value={details[key]} onChange={(event) => change(key, event.target.value)} rows={rows} placeholder={placeholder} className={`${inputClass} resize-y`} data-testid={`input-${key}`} />
    </div>
  );

  const select = (key: DetailKey, label: string, options: string[]) => (
    <div>
      <label htmlFor={key} className="font-mono-brand text-[10px] uppercase tracking-[.14em]">{label}</label>
      <div className="relative mt-3">
         <select id={key} name={key} value={details[key]} onChange={(event) => change(key, event.target.value)} className="w-full appearance-none border border-input bg-[#1e2123] px-4 py-3 text-sm text-foreground outline-none focus:border-primary" data-testid={`select-${key}`}>
          <option value="">Select one</option>
          {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute right-4 top-3.5 text-muted-foreground" />
      </div>
    </div>
  );

  const advance = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity() || (step === 0 && !details.project.trim())) {
      setError('Please complete the required fields before sending your request.');
      form.reportValidity();
      return;
    }
    if (step === 0 && details.projectType === 'Other / Not Listed' && !details.otherProjectType.trim()) {
      setError('Please describe your other project type before continuing.');
      return;
    }
    setError('');
    if (step < 2) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    // The existing process prepares an email; the visitor sends it from their email app.
    const subject = encodeURIComponent(`Project request from ${details.name || 'website visitor'}`);
    const body = encodeURIComponent([
      `Name: ${details.name}`,
      `Phone: ${details.phone}`,
      `Email: ${details.email}`,
      `Property address: ${details.address}`,
      `Preferred contact method: ${details.contact || 'Not specified'}`,
      `Preferred timeframe: ${details.timeframe || 'Not specified'}`,
      '',
      'Project details:',
      `Project Type: ${details.projectType || 'Not specified'}`,
      ...(details.projectType === 'Other / Not Listed' ? [`Other Project Type: ${details.otherProjectType}`] : []),
      `Describe Your Project: ${details.project}`,
      `Size / Dimensions: ${details.size || 'Not specified'}`,
      `Condition / Current Situation: ${details.condition || 'Not specified'}`,
      `Materials / Specifications: ${details.materials || 'Not specified'}`,
      `Additional Information: ${details.additional || 'Not specified'}`,
    ].join('\n'));
    window.location.href = `mailto:${businessInfo.contact.email}?subject=${subject}&body=${body}`;
  };

  return (
    <form onSubmit={advance} className="space-y-8" noValidate data-testid="quote-form">
       <div className="stationery-corner pl-5 pt-7 sm:pl-7">
        <p className="font-mono-brand text-[10px] uppercase tracking-[.14em] text-primary">Page {step + 1} of 3</p>
        <div className="mt-3 h-1 bg-muted"><div className="h-1 bg-primary" style={{ width: `${((step + 1) / 3) * 100}%` }} /></div>
        <h2 className="mt-7 font-display text-3xl sm:text-4xl">{steps[step]}</h2>
      </div>

      {step === 0 && (
        <>
          {select('projectType', 'Project Type (Optional)', projectTypes)}
          {details.projectType === 'Other / Not Listed' && field('otherProjectType', 'Other Project Type', 'Describe the type of work', true)}
          {textArea('project', 'Describe Your Project', 'Tell us about the project, the property, and anything useful to know.', true, 6)}
          {field('size', 'Size / Dimensions (if applicable)', 'For example: 12 ft × 16 ft, three rooms, or about 200 sq ft')}
          {textArea('condition', 'Condition / Current Situation', 'What does the area or item look like now?')}
        </>
      )}
      {step === 1 && (
        <>
          {textArea('materials', 'Materials / Specifications', 'Product names, materials, colors, finishes, or other preferences')}
          {textArea('additional', 'Additional Information', 'Anything else you would like us to know')}
          <p className="text-sm leading-7 text-muted-foreground">After submitting, please attach any photos in your email before sending.</p>
        </>
      )}
      {step === 2 && (
        <>
          <div className="grid gap-6 sm:grid-cols-2">
            {field('name', 'Your name', 'Full name', true)}
            {field('phone', 'Phone number', '913-000-0000', true, 'tel')}
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {field('address', 'Property address', 'Street, city, state', true)}
            {field('email', 'Email address (optional)', 'You@email.com', false, 'email')}
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {select('contact', 'Preferred contact method', ['Phone call', 'Text message', 'Email'])}
            {select('timeframe', 'Preferred timeframe', ['As soon as possible', 'Within the next 2 weeks', 'Within the next month', 'I am planning ahead'])}
          </div>
          <div>
            <p className="mb-4 max-w-2xl text-sm font-medium leading-6 text-foreground">After submitting, please attach any photos in your email before sending.</p>
            <p className="mb-4 max-w-2xl text-xs leading-6 text-muted-foreground">Submitting this request does not constitute a final estimate or agreement to perform work. The information provided will be reviewed by the business before pricing and scheduling are determined.</p>
          </div>
        </>
      )}
      {error && <p role="alert" className="border-l-2 border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive" data-testid="text-form-error">{error}</p>}
      <div className="flex flex-wrap gap-3">
         {step > 0 && <button type="button" onClick={() => { setError(''); setStep(step - 1); window.scrollTo({ top: 0, behavior: 'auto' }); }} className="inline-flex items-center gap-3 border border-[#b39860]/65 px-6 py-4 font-mono-brand text-[10px] uppercase tracking-[.14em] text-foreground hover:bg-[#b39860]/10" data-testid="button-quote-back"><ArrowLeft size={15} /> Back</button>}
         <button type="submit" className="inline-flex items-center gap-4 border border-primary bg-primary px-7 py-4 font-mono-brand text-[10px] uppercase tracking-[.14em] text-primary-foreground transition-colors hover:bg-[#c9af78]" data-testid={step === 2 ? 'button-submit-quote' : 'button-quote-continue'}>{step === 2 ? 'Prepare quote request' : 'Continue'} <ArrowRight size={16} /></button>
      </div>
    </form>
  );
}