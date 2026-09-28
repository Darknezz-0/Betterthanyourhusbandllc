import { Star } from 'lucide-react';

type CustomerReview = {
  text: string;
  customerName: string;
  rating?: 1 | 2 | 3 | 4 | 5;
};

// Add only customer-provided reviews here, with a rating only when supplied.
const customerReviews: CustomerReview[] = [];

export function CustomerReviews() {
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
            {customerReviews.map((review, index) => (
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
      </div>
    </section>
  );
}