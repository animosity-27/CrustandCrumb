import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Wheat, Clock, Flame, Sparkles, Star, Quote } from 'lucide-react';
import type { Page } from '@/lib/pages';
import type { Product, Review } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { useReveal, useMouseParallax } from '@/hooks/useReveal';
import { useCart } from '@/context/CartContext';
import { formatPeso } from '@/lib/format';

export function HomePage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const revealRef = useReveal<HTMLDivElement>();
  const { add } = useCart();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    (async () => {
      const [{ data: fp }, { data: rv }] = await Promise.all([
        supabase.from('products').select('*').eq('featured', true).limit(4),
        supabase.from('reviews').select('*').order('created_at', { ascending: false }).limit(3),
      ]);
      setFeatured((fp as Product[]) ?? []);
      setReviews((rv as Review[]) ?? []);
    })();
  }, []);

  return (
    <div ref={revealRef}>
      <Hero onNavigate={onNavigate} />
      <MarqueeStrip />
      <StoryBand onNavigate={onNavigate} />
      <FeaturedSection products={featured} onNavigate={onNavigate} onAdd={add} />
      <ProcessSection onNavigate={onNavigate} />
      <ReviewsTeaser reviews={reviews} onNavigate={onNavigate} />
      <CTASection onNavigate={onNavigate} />
    </div>
  );
}

/* ---------------------------------- HERO --------------------------------- */
function Hero({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const { ref, offset } = useMouseParallax<HTMLDivElement>(25);

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen items-center overflow-hidden bg-gradient-to-b from-ocean-900 via-ocean-800 to-crust-800 pt-24"
    >
      {/* Grain + glow */}
      <div className="grain-overlay absolute inset-0" />
      <div className="absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-gold/20 blur-[120px]" />
      <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-ocean-400/30 blur-[120px]" />

      {/* Floating breads */}
      {/* Floating bakery images */}
      <FloatingBread
        src="https://i.imgur.com/GydtxWu.jpeg"
        alt="Bakery product"
        className="absolute right-[8%] top-[24%] h-40 w-40 lg:h-56 lg:w-56"
        style={{
          transform: `translate(${offset.x * 1.5}px, ${offset.y * 1.5}px)`,
        }}
        floatClass="animate-float-slow"
      />

      <FloatingBread
        src="https://i.imgur.com/UXWvEGK.jpeg"
        alt="Bakery product"
        className="absolute right-[28%] top-[60%] h-28 w-28 lg:h-40 lg:w-40"
        style={{
          transform: `translate(${offset.x * -1.2}px, ${offset.y * -1.2}px)`,
        }}
        floatClass="animate-float-slower"
      />

      <FloatingBread
        src="https://i.imgur.com/Mcb2MR9.jpg"
        alt="Bakery product"
        className="absolute right-[3%] bottom-[14%] h-24 w-24 lg:h-36 lg:w-36"
        style={{
          transform: `translate(${offset.x * 0.8}px, ${offset.y * 0.8}px)`,
        }}
        floatClass="animate-float-slow"
      />

      {/* Steam particles */}
      <SteamParticles className="absolute left-[18%] bottom-[12%]" />

      {/* Content */}
      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:px-8">
        <div className="text-cream">
          <div className="reveal flex items-center gap-2">
            <span className="eyebrow text-gold">
              <Sparkles className="h-4 w-4" /> Calapan City · Since the first loaf
            </span>
          </div>
          <h1 className="reveal mt-5 font-display text-5xl font-700 leading-[1.05] sm:text-6xl lg:text-7xl" data-delay="1">
            Bread that
            <br />
            <span className="text-shimmer">tastes of</span>
            <br />
            <span className="italic font-300">patience.</span>
          </h1>
          <p className="reveal mt-6 max-w-md text-lg leading-relaxed text-cream/75" data-delay="2">
            Wild yeast, local flour, and a 48-hour wait. We bake sourdough, laminated
            pastries, and cakes the slow way, because good bread can't be rushed.
          </p>
          <div className="reveal mt-8 flex flex-wrap gap-3" data-delay="3">
            <button onClick={() => onNavigate('menu')} className="btn-primary text-base">
              See the Menu <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => onNavigate('philosophy')}
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-cream/30 px-6 py-3 font-semibold text-cream transition-all duration-300 hover:border-gold hover:text-gold"
            >
              Our Philosophy
            </button>
          </div>

          {/* Stats */}
          <div className="reveal mt-12 grid max-w-md grid-cols-3 gap-4 border-t border-cream/15 pt-6" data-delay="4">
            <HeroStat value="48h" label="Ferment" />
            <HeroStat value="6 AM" label="Fresh daily" />
            <HeroStat value="100%" label="From scratch" />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-2xl font-700 text-gold lg:text-3xl">{value}</p>
      <p className="text-xs uppercase tracking-wider text-cream/60">{label}</p>
    </div>
  );
}

function FloatingBread({
  src,
  alt,
  className,
  style,
  floatClass,
}: {
  src: string;
  alt: string;
  className: string;
  style?: React.CSSProperties;
  floatClass: string;
}) {
  return (
    <div
      className={className}
      style={{
        ...style,
        transition: 'transform 0.6s ease-out',
      }}
    >
      <div className={`${floatClass} h-full w-full`}>
        <div className="h-full w-full overflow-hidden rounded-full border-4 border-cream/10 shadow-crust">
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

function SteamParticles({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none ${className}`}>
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="absolute bottom-0 left-1/2 h-24 w-3 -translate-x-1/2 rounded-full bg-gradient-to-t from-cream/0 via-cream/40 to-cream/0 blur-sm animate-steam-rise"
          style={{
            animationDelay: `${i * 0.9}s`,
            left: `${i * 12 - 18}px`,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------ MARQUEE STRIP ----------------------------- */
function MarqueeStrip() {
  const items = ['Sourdough', 'Croissants', 'Cinnamon Rolls', 'Cheesecake', 'Cookies', 'Baguettes', 'Cakes', 'Bread'];
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden border-y-2 border-crust-200 bg-crust-50 py-4">
      <div className="flex w-max animate-marquee items-center gap-8 whitespace-nowrap">
        {row.map((word, i) => (
          <span key={i} className="flex items-center gap-8">
            <span className="font-display text-2xl font-600 text-crust-700">{word}</span>
            <Wheat className="h-5 w-5 text-gold" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ STORY BAND ------------------------------- */
function StoryBand({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <section className="relative overflow-hidden bg-cream py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:px-8">
        {/* Image collage */}
        <div className="reveal relative" data-reveal="left">
          <div className="overflow-hidden rounded-[2rem] shadow-crust">
            <img
              src="https://images.pexels.com/photos/30567743/pexels-photo-30567743.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Artisan sourdough on wooden board"
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-8 -right-4 w-44 overflow-hidden rounded-2xl border-8 border-cream shadow-crust lg:-right-8 lg:w-56">
            <img
              src="https://images.pexels.com/photos/965741/pexels-photo-965741.jpeg?auto=compress&cs=tinysrgb&w=400"
              alt="Fresh pastries"
              className="aspect-square w-full object-cover"
            />
          </div>
          {/* Badge */}
          <div className="absolute -left-4 top-8 flex h-28 w-28 animate-spin-slow items-center justify-center rounded-full bg-ocean-500 text-cream lg:-left-10 lg:h-36 lg:w-36">
            <svg viewBox="0 0 100 100" className="absolute h-full w-full">
              <defs>
                <path id="circle-text" d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" />
              </defs>
              <text className="fill-cream text-[10px] font-semibold uppercase tracking-[0.2em]">
                <textPath href="#circle-text">
                  baked fresh daily · baked fresh daily ·
                </textPath>
              </text>
            </svg>
            <Flame className="h-8 w-8 text-gold" />
          </div>
        </div>

        {/* Copy */}
        <div className="reveal" data-reveal="right" data-delay="1">
          <span className="eyebrow">
            <span className="h-px w-8 bg-ocean-500" /> Our Story
          </span>
          <h2 className="mt-4 font-display text-4xl font-700 leading-tight text-crust-900 md:text-5xl">
            A tiny bakery with a <span className="text-ocean-500">big oven</span> and bigger patience.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-crust-600">
            Crust & Crumb started with one wood-fired deck oven and a stubborn belief that bread
            should taste like where it was made. We feed our wild yeast by hand, ferment our dough
            for two full days, and bake in small batches until the baskets are empty.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-crust-600">
            No improvers, no shortcuts — just flour, water, salt, time, and the smell of crust
            at dawn.
          </p>
          <button
            onClick={() => onNavigate('philosophy')}
            className="btn-crust mt-8"
          >
            Read our philosophy <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- FEATURED SECTION -------------------------- */
function FeaturedSection({
  products,
  onNavigate,
  onAdd,
}: {
  products: Product[];
  onNavigate: (p: Page) => void;
  onAdd: (p: Product) => void;
}) {
  return (
    <section className="relative overflow-hidden bg-ocean-900 py-24 text-cream">
      <div className="grain-overlay absolute inset-0" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="reveal flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="eyebrow text-gold">
              <Flame className="h-4 w-4" /> Crowd Favourites
            </span>
            <h2 className="mt-3 font-display text-4xl font-700 leading-tight md:text-5xl">
              Today's <span className="text-shimmer">Signatures</span>
            </h2>
          </div>
          <button
            onClick={() => onNavigate('menu')}
            className="group inline-flex items-center gap-2 text-sm font-semibold text-cream/80 transition-colors hover:text-gold"
          >
            View full menu
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {products.length === 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-3xl bg-white/5 p-4">
                <div className="aspect-square rounded-2xl bg-white/5" />
                <div className="mt-4 h-5 w-3/4 rounded bg-white/5" />
                <div className="mt-2 h-4 w-1/2 rounded bg-white/5" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p, i) => (
              <article
                key={p.id}
                className="reveal group relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-sm transition-all duration-500 hover:bg-white/10"
                data-delay={(i + 1).toString()}
              >
                <div className="relative aspect-square overflow-hidden rounded-t-3xl">
                  {p.image_url && (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ocean-900/80 via-transparent to-transparent" />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg font-600 leading-tight">{p.name}</h3>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-display text-lg font-700 text-gold">
                      {formatPeso(Number(p.price))}
                    </span>
                    <button
                      onClick={() => onAdd(p)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-crust-900 transition-all hover:bg-cream active:scale-90"
                      aria-label={`Add ${p.name}`}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ----------------------------- PROCESS SECTION --------------------------- */
function ProcessSection({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const steps = [
    { icon: Wheat, time: 'Day 1 · 6 AM', title: 'Feed the starter', text: 'Our wild-yeast culture wakes up with fresh flour and water, bubbling back to life overnight.' },
    { icon: Clock, time: 'Day 1 · 4 PM', title: 'Mix & autolyse', text: 'Flour, water, and salt meet. We let them rest so the gluten develops without any kneading.' },
    { icon: Flame, time: 'Day 2 · 5 AM', title: 'Shape & bake', text: 'Cold from the fridge, the loaves hit the wood-fired deck oven and spring into crust.' },
  ];

  return (
    <section className="relative overflow-hidden bg-cream py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="reveal text-center">
          <span className="eyebrow justify-center">
            <span className="h-px w-8 bg-ocean-500" /> The Slow Way <span className="h-px w-8 bg-ocean-500" />
          </span>
          <h2 className="mt-4 font-display text-4xl font-700 leading-tight text-crust-900 md:text-5xl">
            From starter to <span className="text-ocean-500">crust</span> in 48 hours
          </h2>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="reveal relative rounded-3xl bg-white p-8 shadow-soft"
              data-delay={(i + 1).toString()}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ocean-500 text-cream">
                <step.icon className="h-7 w-7" />
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-gold">{step.time}</p>
              <h3 className="mt-2 font-display text-xl font-700 text-crust-900">{step.title}</h3>
              <p className="mt-3 leading-relaxed text-crust-600">{step.text}</p>
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="absolute -right-4 top-1/2 hidden h-px w-8 bg-crust-200 md:block" />
              )}
            </div>
          ))}
        </div>

        <div className="reveal mt-12 text-center" data-delay="4">
          <button onClick={() => onNavigate('philosophy')} className="btn-ghost">
            Why we wait <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- REVIEWS TEASER ---------------------------- */
function ReviewsTeaser({ reviews, onNavigate }: { reviews: Review[]; onNavigate: (p: Page) => void }) {
  return (
    <section className="relative overflow-hidden bg-parchment py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="reveal flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="eyebrow">
              <Star className="h-4 w-4 fill-gold text-gold" /> Kind Words
            </span>
            <h2 className="mt-3 font-display text-4xl font-700 leading-tight text-crust-900 md:text-5xl">
              What Calapan is <span className="text-ocean-500">saying</span>
            </h2>
          </div>
          <button
            onClick={() => onNavigate('reviews')}
            className="text-sm font-semibold text-ocean-500 transition-colors hover:text-ocean-700"
          >
            Read all reviews →
          </button>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {reviews.length === 0 ? (
            <p className="col-span-full text-center text-crust-500">Loading reviews...</p>
          ) : (
            reviews.map((r, i) => (
              <figure
                key={r.id}
                className="reveal relative rounded-3xl bg-white p-8 shadow-soft"
                data-delay={(i + 1).toString()}
              >
                <Quote className="h-8 w-8 text-gold/40" />
                <blockquote className="mt-4 leading-relaxed text-crust-700">
                  "{r.comment}"
                </blockquote>
                <figcaption className="mt-6 flex items-center justify-between">
                  <span className="font-display font-700 text-crust-900">{r.customer_name}</span>
                  <span className="flex gap-0.5">
                    {Array.from({ length: r.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-gold text-gold" />
                    ))}
                  </span>
                </figcaption>
              </figure>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- CTA SECTION ----------------------------- */
function CTASection({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-crust-700 via-crust-800 to-ocean-900 py-24 text-cream">
      <div className="grain-overlay absolute inset-0" />
      <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-gold/20 blur-[100px]" />
      <div className="relative mx-auto max-w-3xl px-6 text-center lg:px-8">
        <div className="reveal">
          <span className="eyebrow justify-center text-gold">
            <Clock className="h-4 w-4" /> Open in 30 minutes? Almost.
          </span>
          <h2 className="mt-4 font-display text-4xl font-700 leading-tight md:text-6xl">
            Come early.
            <br />
            <span className="text-shimmer">We sell out.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-cream/75">
            The oven fires at 4 AM and the baskets fill by 6. Drop by our Calapan City bakery,
            or order ahead and skip the line.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button onClick={() => onNavigate('menu')} className="btn-primary text-base">
              Order ahead <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => onNavigate('visit')}
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-cream/30 px-6 py-3 font-semibold text-cream transition-all duration-300 hover:border-gold hover:text-gold"
            >
              Find us
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
