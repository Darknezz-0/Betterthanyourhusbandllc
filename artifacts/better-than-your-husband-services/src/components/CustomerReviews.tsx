import { Star } from 'lucide-react';

type CustomerReview = {
  text: string;
  customerName: string;
  customerRole: string;
  rating?: 1 | 2 | 3 | 4 | 5;
};

// Add only owner-approved, customer-provided reviews here.
const customerReviews: CustomerReview[] = [
  {
    text: '"I had a punch list a mile long. He knocked it out in one day and the place looks amazing. Highly recommend!"',
    customerName: 'SARAH T.',
    customerRole: 'REAL ESTATE AGENT',
    rating: 5,
  },
  {
    text: '"Finally found someone reliable who actually cares about the details. Top-notch work and a great attitude."',
    customerName: 'MIKE R.',
    customerRole: 'HOMEOWNER',
    rating: 5,
  },
  {
    text: '"He mounted my TV perfectly and even hid the wires. Fast, clean, and super professional. I\'ll never DIY again."',
    customerName: 'JASON M.',
    customerRole: 'HOMEOWNER',
    rating: 5,
  },
];

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
            {customerReviews.slice(0, 6).map((review, index) => (
              <figure key={`${review.customerName}-${index}`} className="border border-border bg-card p-7">
                {review.rating && (
                  <div className="mb-6 flex gap-1 text-primary" aria-label={`${review.rating} out of 5 stars`}>
                    {Array.from({ length: review.rating }, (_, star) => <Star key={star} size={16} fill="currentColor" aria-hidden="true" />)}
                  </div>
                )}
                <blockquote className="text-base leading-8 text-foreground"><p>{review.text}</p></blockquote>
                 <figcaption className="mt-7 font-mono-brand text-[10px] uppercase tracking-[.14em] text-primary">
                   <span className="block">{review.customerName}</span>
                   <span className="mt-2 block text-muted-foreground">{review.customerRole}</span>
                 </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}