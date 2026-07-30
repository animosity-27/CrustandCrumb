import { useEffect, useState } from 'react';
import { Star, Quote, Send, Loader2, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Review } from '@/lib/types';
import { useReveal } from '@/hooks/useReveal';

export function ReviewsPage() {
  const revealRef = useReveal<HTMLDivElement>();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    setReviews((data as Review[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      setError('Please add your name and a few words.');
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error: insError } = await supabase.from('reviews').insert({
      customer_name: name.trim(),
      rating,
      comment: comment.trim(),
    });
    setSubmitting(false);
    if (insError) {
      setError('Something went wrong posting your review. Please try again.');
      return;
    }
    setSubmitted(true);
    setName('');
    setRating(5);
    setComment('');
    await load();
    window.setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div ref={revealRef} className="min-h-screen bg-parchment pt-28">
      {/* Header */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="reveal text-center">
          <span className="eyebrow justify-center">
            <Star className="h-4 w-4 fill-gold text-gold" /> Kind Words
          </span>
          <h1 className="mt-4 font-display text-5xl font-700 leading-tight text-crust-900 md:text-6xl">
            Reviews from <span className="underline-swoosh text-ocean-500">our table</span>
          </h1>
          {reviews.length > 0 && (
            <div className="mt-6 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 shadow-soft">
              <span className="font-display text-3xl font-700 text-crust-900">{avg.toFixed(1)}</span>
              <span className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < Math.round(avg) ? 'fill-gold text-gold' : 'text-crust-200'}`}
                  />
                ))}
              </span>
              <span className="text-sm text-crust-500">from {reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </section>

      {/* Form + list */}
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-5">
          {/* Form */}
          <div className="reveal lg:col-span-2" data-reveal="left">
            <div className="sticky top-28 rounded-3xl bg-white p-8 shadow-soft">
              <h2 className="font-display text-2xl font-700 text-crust-900">Leave a review</h2>
              <p className="mt-2 text-sm text-crust-500">
                Had a loaf you loved? Tell us — and the next customer.
              </p>

              {submitted ? (
                <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl bg-green-50 p-6 text-center ring-1 ring-green-200">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white">
                    <Check className="h-7 w-7" />
                  </span>
                  <p className="font-display text-lg font-700 text-green-800">Thank you!</p>
                  <p className="text-sm text-green-700">Your review is now live on the page.</p>
                </div>
              ) : (
                <form onSubmit={submit} className="mt-6 space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-crust-700">Your name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Maria Santos"
                      className="w-full rounded-xl border border-crust-200 bg-cream px-4 py-3 text-crust-800 outline-none transition-colors focus:border-ocean-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-crust-700">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setRating(n)}
                          onMouseEnter={() => setHoverRating(n)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="transition-transform hover:scale-110"
                          aria-label={`${n} star${n !== 1 ? 's' : ''}`}
                        >
                          <Star
                            className={`h-8 w-8 ${
                              n <= (hoverRating || rating) ? 'fill-gold text-gold' : 'text-crust-200'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-crust-700">Your review</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={4}
                      placeholder="The sourdough here is the best I've had in Mindoro..."
                      className="w-full resize-none rounded-xl border border-crust-200 bg-cream px-4 py-3 text-crust-800 outline-none transition-colors focus:border-ocean-400"
                    />
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full disabled:opacity-60"
                  >
                    {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    {submitting ? 'Posting...' : 'Post review'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* List */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-3xl bg-white p-6 shadow-soft">
                    <div className="h-5 w-32 rounded bg-crust-100" />
                    <div className="mt-3 h-4 w-full rounded bg-crust-100" />
                    <div className="mt-2 h-4 w-3/4 rounded bg-crust-100" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((r, i) => (
                  <figure
                    key={r.id}
                    className="reveal rounded-3xl bg-white p-6 shadow-soft"
                    data-delay={((i % 4) + 1).toString()}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ocean-500 font-display text-lg font-700 text-cream">
                          {r.customer_name.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <figcaption className="font-display font-700 text-crust-900">{r.customer_name}</figcaption>
                          <p className="text-xs text-crust-500">
                            {new Date(r.created_at).toLocaleDateString('en-PH', {
                              year: 'numeric', month: 'long', day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <span className="flex gap-0.5">
                        {Array.from({ length: r.rating }).map((_, j) => (
                          <Star key={j} className="h-4 w-4 fill-gold text-gold" />
                        ))}
                      </span>
                    </div>
                    <Quote className="mt-4 h-6 w-6 text-gold/40" />
                    <blockquote className="mt-2 leading-relaxed text-crust-700">{r.comment}</blockquote>
                  </figure>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
