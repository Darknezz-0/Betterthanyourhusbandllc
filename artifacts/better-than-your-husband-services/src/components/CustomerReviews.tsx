import { useRef, useState, type FormEvent } from 'react';
import { Star } from 'lucide-react';
import { submitReview } from '@workspace/api-client-react';

type CustomerReview = {
  text: string;
  customerName: string;
  rating?: 1 | 2 | 3 | 4 | 5;
};

// Add only customer-provided reviews here, with a rating only when supplied.
const customerReviews: CustomerReview[] = [];

export function CustomerReviews() {
  const [name, setName] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [review, setReview] = useState('');
  const [email, setEmail] = useState('');
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const sending = useRef(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    if (name.trim().length < 2 || !rating || review.trim().length < 15) {
      setError('Please enter your name, a star rating, and a review of at least 15 characters.');
      return;
    }
    sending.current = true;
    setPending(true);
    setError('');
    try {
      await submitReview({
        name: name.trim(),
        rating,
        review: review.trim(),
        ...(email.trim() ? { email: email.trim() } : {}),
      });
      setSubmitted(true);
    } catch {
      setError('Your review could not be submitted. Please try again.');
    } finally {
      sending.current = false;
      setPending(false);
    }
  }

  return (
    <section aria-labelledby="customer-reviews-heading" className="bg-[#1d2022] px-5 py-20 sm:px-8 lg:px-12 lg:py-28" data-testid="customer-reviews">
      <div className="mx-auto max-w-7xl">
        <p className="font-mono-brand text-[10px] uppercase tracking-[.2em] text-primary">Customer reviews</p>
        <h2 id="customer-reviews-heading" className="mt-5 font-display text-4xl leading-tight sm:text-5xl">What our customers say</h2>
        {customerReviews.length === 0 ? (
          <p className="mt-8 max-w-xl border-l-2 border-primary bg-[#242729] px-6 py-5 text-sm leading-7 text-muted-foreground">
            Genuine customer reviews will be shared here when available.
          </p>
        ) : (
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {customerReviews.slice(0, 6).map((review, index) => (
              <figure key={`${review.customerName}-${index}`} className="border border-border bg-card p-7">
                {review.rating && (
                  <div className="mb-6 flex gap-1 text-primary" aria-label={`${review.rating} out of 5 stars`}>
                    {Array.from({ length: review.rating }, (_, star) => <Star key={star} size={16} fill="currentColor" aria-hidden="true" />)}
                  </div>
                )}
                <blockquote className="text-base leading-8 text-foreground"><p>{review.text}</p></blockquote>
                <figcaption className="mt-7 font-mono-brand text-[10px] uppercase tracking-[.14em] text-primary">{review.customerName}</figcaption>
              </figure>
            ))}
          </div>
        )}
        <div className="mt-12 max-w-2xl border-t border-border pt-10">
          <h3 className="font-display text-2xl sm:text-3xl">Submit a Review</h3>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">Share your experience with us. Reviews are sent privately for approval and are not posted automatically.</p>
          {submitted ? (
            <p role="status" className="mt-7 border-l-2 border-primary bg-[#242729] px-5 py-4 text-sm leading-7 text-foreground" data-testid="review-success">
              Thank you! Your review has been submitted for approval.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6" data-testid="review-form">
              <div>
                <label htmlFor="review-name" className="font-mono-brand text-[10px] uppercase tracking-[.14em]">Name <span className="text-primary">*</span></label>
                <input id="review-name" name="name" required minLength={2} maxLength={100} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className="mt-3 w-full border border-input bg-[#1e2123] px-4 py-3 text-sm text-foreground outline-none focus:border-primary" />
              </div>
              <fieldset>
                <legend className="font-mono-brand text-[10px] uppercase tracking-[.14em]">Star rating <span className="text-primary">*</span></legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((stars) => (
                    <label key={stars} className={`inline-flex cursor-pointer items-center gap-2 border px-3 py-3 text-sm transition-colors ${rating === stars ? 'border-primary bg-primary/10 text-primary' : 'border-input bg-[#1e2123] text-foreground hover:border-primary'}`}>
                      <input type="radio" name="rating" value={stars} required checked={rating === stars} onChange={() => setRating(stars)} className="accent-[#b39860]" />
                      <Star size={16} fill={rating === stars ? 'currentColor' : 'none'} aria-hidden="true" /> {stars}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div>
                <label htmlFor="review-comment" className="font-mono-brand text-[10px] uppercase tracking-[.14em]">Review / comment <span className="text-primary">*</span></label>
                <textarea id="review-comment" name="review" required minLength={15} maxLength={2000} rows={5} value={review} onChange={(event) => setReview(event.target.value)} className="mt-3 w-full resize-y border border-input bg-[#1e2123] px-4 py-3 text-sm text-foreground outline-none focus:border-primary" />
                <p className="mt-2 text-xs text-muted-foreground">15–2000 characters</p>
              </div>
              <div>
                <label htmlFor="review-email" className="font-mono-brand text-[10px] uppercase tracking-[.14em]">Email address (optional)</label>
                <input id="review-email" name="email" type="email" maxLength={254} autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-3 w-full border border-input bg-[#1e2123] px-4 py-3 text-sm text-foreground outline-none focus:border-primary" />
              </div>
              {error && <p role="alert" className="border-l-2 border-destructive bg-destructive/10 px-4 py-3 text-sm text-foreground" data-testid="review-error">{error}</p>}
              <button type="submit" disabled={pending} className="inline-flex min-h-12 items-center gap-3 border border-primary bg-primary px-7 py-4 font-mono-brand text-[10px] uppercase tracking-[.14em] text-primary-foreground transition-colors hover:bg-[#c9af78] disabled:cursor-wait disabled:opacity-60" data-testid="review-submit">
                {pending ? 'Submitting…' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}