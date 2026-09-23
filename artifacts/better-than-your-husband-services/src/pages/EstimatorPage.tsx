import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { ArrowLeft, ArrowRight, Upload } from "lucide-react";
import { Link, useLocation } from "wouter";
import { SignIn, SignUp, useUser } from "@clerk/react";
import { businessInfo } from "@/lib/business";
import { setEstimatorDraft } from "@/lib/estimatorDraft";

type Option = { id: string; label: string; priceAdjustment: number | null };
type Question = { id: string; type: "multiple_choice" | "checkboxes" | "short_answer" | "paragraph" | "yes_no" | "number" | "photo_upload"; title: string; helper: string; placeholder: string; required: boolean; enabled: boolean; options: Option[]; condition: { questionId: string; value: string } | null; pricingRule: { perUnitAdjustment: number | null } };
type Config = { version: number; services: { id: string; label: string; basePrice: number | null }[]; questions: Question[]; pricing: { minimumProjectPrice: number | null; lowRangePercent: number; highRangePercent: number } };
const makeOption = (id: string, label: string): Option => ({ id, label, priceAdjustment: null });
const fieldClass = "mt-3 w-full border border-input bg-card px-4 py-3 text-base outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary";
function useMeta(title: string) { useEffect(() => { document.title = `${title} | ${businessInfo.displayName}`; }, [title]); }
function visible(q: Question, answers: Record<string, string>) { return q.enabled && (!q.condition || answers[q.condition.questionId] === q.condition.value); }
async function getConfig(): Promise<Config> {
  const response = await fetch("/api/estimator-config");
  if (!response.ok) throw new Error("The estimator is temporarily unavailable.");
  return response.json();
}

export function EstimatorPage({ previewConfig }: { previewConfig?: Config } = {}) {
  useMeta("Estimate Your Project");
  const [, navigate] = useLocation();
  const [config, setConfig] = useState<Config | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [position, setPosition] = useState(0);
  const [error, setError] = useState("");
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [position]);
  useEffect(() => {
    if (previewConfig) {
      setConfig(previewConfig);
      return;
    }
    getConfig().then(setConfig).catch((e) => setError(e.message));
  }, [previewConfig]);
  const questions = useMemo(() => config?.questions.filter((q) => visible(q, answers)) ?? [], [config, answers]);
  const current = questions[position];
  useEffect(() => {
    if (position > questions.length && questions.length) {
      setPosition(questions.length - 1);
    }
  }, [position, questions.length]);
  const update = (value: string) => { if (current) setAnswers((old) => ({ ...old, [current.id]: value })); setError(""); };
  const next = () => {
    if (current?.required && !answers[current.id]?.trim()) { setError("Please answer this question before continuing."); return; }
    setError(""); setPosition((value) => value + 1);
  };
  const summary = config ? config.questions
    .filter((q) => visible(q, answers) && answers[q.id]?.trim())
    .map((q) => {
      const answer = answers[q.id];
      const labels = q.type === "checkboxes"
        ? answer.split("|").map((id) => q.options.find((option) => option.id === id)?.label ?? id).join(", ")
        : q.options.find((option) => option.id === answer)?.label ?? (answer === "yes" ? "Yes" : answer === "no" ? "No" : answer);
      return `${q.title}: ${labels}`;
    })
    .join("\n") : "";
  if (error && !config) return <main className="min-h-screen bg-background px-5 py-32 text-center"><p className="text-destructive">{error}</p></main>;
  if (!config) return <main className="min-h-screen bg-background px-5 py-32 text-center"><p className="text-muted-foreground">Loading your project estimator…</p></main>;
  const serviceId = answers["project-type"];
  const result = position >= questions.length;
  if (result) {
    const service = config.services.find((item) => item.id === serviceId);
    const goQuote = () => { setEstimatorDraft({ serviceId: service?.id ?? "", serviceLabel: service?.label ?? "Project", summary, photos: files }); navigate("/request-a-quote?from=estimator"); };
    return <><div className="bg-[#25241f]"><EstimatorHeader /></div><main className="bg-background px-5 py-20 sm:px-8 lg:px-12"><div className="mx-auto max-w-3xl"><p className="font-mono-brand text-[10px] uppercase tracking-[.16em] text-primary">Project request</p><h1 className="mt-5 font-display text-5xl leading-tight">Your project details are ready.</h1><div className="mt-10 border border-border bg-card p-7 sm:p-12"><p className="text-base leading-8 text-muted-foreground">Continue to add your contact and property information. We will review the complete request before pricing or scheduling is determined.</p></div><button type="button" onClick={goQuote} className="mt-8 inline-flex items-center gap-4 bg-primary px-7 py-4 font-mono-brand text-[10px] uppercase tracking-[.14em] text-primary-foreground" data-testid="button-request-detailed-quote">Continue to Contact Information <ArrowRight size={16} /></button><button type="button" onClick={() => setPosition(Math.max(0, questions.length - 1))} className="ml-4 mt-8 border border-border px-6 py-4 font-mono-brand text-[10px] uppercase tracking-[.14em]">Edit answers</button></div></main></>;
  }
  if (!current) return <main className="min-h-screen bg-background px-5 py-32 text-center"><p className="text-muted-foreground">Preparing the next question…</p></main>;
  const setPhoto = (event: ChangeEvent<HTMLInputElement>) => setFiles(Array.from(event.target.files ?? []));
  const selected = answers[current.id]?.split("|").filter(Boolean) ?? [];
  return <><div className="bg-[#25241f]"><EstimatorHeader /></div><main className="min-h-[760px] bg-background px-5 py-16 sm:px-8 lg:px-12 lg:py-24"><div className="mx-auto max-w-3xl"><div className="flex items-center justify-between gap-5"><p className="font-mono-brand text-[10px] uppercase tracking-[.14em] text-primary">Question {position + 1} of {questions.length}</p><p className="text-sm text-muted-foreground">{Math.round(((position + 1) / questions.length) * 100)}%</p></div><div className="mt-3 h-1 bg-muted"><div className="h-1 bg-primary transition-all" style={{ width: `${((position + 1) / questions.length) * 100}%` }} /></div><h1 className="mt-14 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">{current.title}{current.required && <span className="text-primary"> *</span>}</h1>{current.helper && <p className="mt-5 max-w-2xl whitespace-pre-line text-base leading-8 text-muted-foreground">{current.helper}</p>}<div className="mt-10">
    {current.type === "multiple_choice" && <div className="grid gap-3">{current.options.map((option) => <label key={option.id} className={`flex cursor-pointer items-center gap-4 border p-5 text-base transition-colors ${answers[current.id] === option.id ? "border-primary bg-[#efe8dc]" : "border-border bg-card hover:border-primary"}`}><input type="radio" name={current.id} value={option.id} checked={answers[current.id] === option.id} onChange={() => update(option.id)} className="h-5 w-5 accent-[#bd9545]" />{option.label}</label>)}</div>}
    {current.type === "yes_no" && <div className="grid gap-3 sm:grid-cols-2">{["yes", "no"].map((value) => <label key={value} className={`flex cursor-pointer items-center gap-4 border p-5 text-base capitalize ${answers[current.id] === value ? "border-primary bg-[#efe8dc]" : "border-border bg-card"}`}><input type="radio" name={current.id} value={value} checked={answers[current.id] === value} onChange={() => update(value)} className="h-5 w-5 accent-[#bd9545]" />{value}</label>)}</div>}
    {current.type === "checkboxes" && <div className="grid gap-3">{current.options.map((option) => <label key={option.id} className={`flex cursor-pointer items-center gap-4 border p-5 text-base ${selected.includes(option.id) ? "border-primary bg-[#efe8dc]" : "border-border bg-card"}`}><input type="checkbox" checked={selected.includes(option.id)} onChange={(event) => update(event.target.checked ? [...selected, option.id].join("|") : selected.filter((id) => id !== option.id).join("|"))} className="h-5 w-5 accent-[#bd9545]" />{option.label}</label>)}</div>}
    {(current.type === "short_answer" || current.type === "number") && <input type={current.type === "number" ? "number" : "text"} value={answers[current.id] ?? ""} onChange={(event) => update(event.target.value)} placeholder={current.placeholder} className={fieldClass} data-testid={`input-estimator-${current.id}`} />}
    {current.type === "paragraph" && <textarea value={answers[current.id] ?? ""} onChange={(event) => update(event.target.value)} placeholder={current.placeholder} rows={current.id === "project-description" ? 12 : 7} className={`${fieldClass} resize-y`} data-testid={`input-estimator-${current.id}`} />}
    {current.type === "photo_upload" && <label className="flex cursor-pointer flex-col items-center justify-center border border-dashed border-input bg-card px-5 py-12 text-center hover:border-primary"><Upload size={24} className="text-primary" /><span className="mt-4 text-base">Choose project photos (optional)</span><span className="mt-2 text-sm text-muted-foreground">JPG, PNG, or HEIC</span><input type="file" accept="image/*" multiple className="sr-only" onChange={setPhoto} data-testid="input-estimator-photos" />{files.length > 0 && <span className="mt-4 text-sm text-primary">{files.length} photo{files.length === 1 ? "" : "s"} selected</span>}</label>}
  </div>{error && <p role="alert" className="mt-8 border-l-2 border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}<div className="mt-12 flex flex-wrap gap-3"><button type="button" onClick={() => setPosition((value) => Math.max(0, value - 1))} disabled={position === 0} className="inline-flex items-center gap-3 border border-border px-6 py-4 font-mono-brand text-[10px] uppercase tracking-[.14em] disabled:opacity-40"><ArrowLeft size={15} /> Back</button><button type="button" onClick={next} className="inline-flex items-center gap-3 bg-primary px-7 py-4 font-mono-brand text-[10px] uppercase tracking-[.14em] text-primary-foreground">{position === questions.length - 1 ? "Continue to contact information" : "Continue"} <ArrowRight size={15} /></button></div></div></main></>;
}

function EstimatorHeader() { return <header className="mx-auto flex h-[78px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12"><Link href="/" className="font-display text-2xl text-white">Better Than Your Husband</Link><Link href="/request-a-quote" className="font-mono-brand text-[10px] uppercase tracking-[.14em] text-white/80">Request a quote</Link></header>; }

export function SignInPage() { useMeta("Sign In"); return <main className="min-h-screen bg-[#25241f] px-5 py-16"><div className="mx-auto max-w-md"><Link href="/" className="font-display text-2xl text-white">Better Than Your Husband</Link><div className="mt-12"><SignIn routing="path" path={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/sign-in`} /></div></div></main>; }
export function SignUpPage() { useMeta("Create Owner Account"); return <main className="min-h-screen bg-[#25241f] px-5 py-16"><div className="mx-auto max-w-md"><Link href="/" className="font-display text-2xl text-white">Better Than Your Husband</Link><div className="mt-12"><SignUp routing="path" path={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/sign-up`} /></div></div></main>; }