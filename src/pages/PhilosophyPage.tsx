import { useEffect, useRef, useState } from 'react';
import { Wheat, Clock, Flame, HandHeart, Leaf, Droplets } from 'lucide-react';
import type { Page } from '@/lib/pages';
import { useReveal } from '@/hooks/useReveal';

export function PhilosophyPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const revealRef = useReveal<HTMLDivElement>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth;
      setProgress(max > 0 ? el.scrollLeft / max : 0);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div ref={revealRef} className="min-h-screen bg-cream pt-28">
      {/* Intro */}
      <section className="mx-auto max-w-4xl px-6 py-16 text-center lg:px-8">
        <div className="reveal">
          <span className="eyebrow justify-center">
            <span className="h-px w-8 bg-ocean-500" /> Our Philosophy <span className="h-px w-8 bg-ocean-500" />
          </span>
          <h1 className="mt-5 font-display text-5xl font-700 leading-tight text-crust-900 md:text-7xl">
            We believe bread
            <br />
            should <span className="italic font-300 text-ocean-500">take its time.</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-crust-600">
            In a world of instant everything, we choose the slow way. Not because it's easy —
            because it tastes better. These are the principles we bake by every single day.
          </p>
        </div>
      </section>

      {/* Scroll horizontally through principles */}
      <section className="relative">
        <div className="mb-4 flex items-center justify-between px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-crust-500">
            Scroll sideways →
          </p>
          <div className="h-1 w-32 overflow-hidden rounded-full bg-crust-200">
            <div
              className="h-full rounded-full bg-ocean-500 transition-all duration-150"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-8 lg:px-8"
          style={{ scrollbarWidth: 'thin' }}
        >
          <Principle
            icon={Wheat}
            n="01"
            title="Wild yeast, never commercial"
            text="Our starter is a living culture we've kept alive for years. It gives our bread its tangy depth and a crumb that stays moist for days — something a packet of baker's yeast simply can't do."
            color="bg-ocean-500"
          />
          <Principle
            icon={Clock}
            n="02"
            title="48 hours of patience"
            text="We ferment our dough cold for two full days. The long wait lets enzymes break down starches and proteins, building flavour complexity and making the bread easier to digest."
            color="bg-crust-600"
          />
          <Principle
            icon={Flame}
            n="03"
            title="Wood-fired deck oven"
            text="Our oven radiates heat from stone decks at 260°C, flash-steaming the loaves the moment they land. That's how you get a crust that crackles when you tear it."
            color="bg-ocean-700"
          />
          <Principle
            icon={Leaf}
            n="04"
            title="Local flour, honest labels"
            text="We source stone-milled flour from Mindoro mills and write every ingredient on the tag. No improvers, no dough conditioners, no preservatives. Just what bread is made of."
            color="bg-crust-700"
          />
          <Principle
            icon={Droplets}
            n="05"
            title="Hydration over shortcuts"
            text="Our loaves are 78% water — wet dough that's tricky to shape but bakes into the open, custardy crumb that defines real sourdough. We'd rather shape carefully than cut the water."
            color="bg-ocean-500"
          />
          <Principle
            icon={HandHeart}
            n="06"
            title="Bake small, waste nothing"
            text="We bake in small batches through the morning and stop when the baskets are full. Whatever isn't sold by closing goes to our neighbours, not the bin."
            color="bg-crust-600"
          />
        </div>
      </section>

      {/* Pull quote */}
      <section className="relative overflow-hidden bg-ocean-900 py-28 text-cream">
        <div className="grain-overlay absolute inset-0" />
        <div className="absolute -left-20 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-gold/20 blur-[120px]" />
        <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-8">
          <div className="reveal">
            <span className="font-script text-3xl text-gold">a note from the baker</span>
            <blockquote className="mt-6 font-display text-3xl font-500 leading-snug md:text-5xl md:font-400">
              "We don't bake bread to be fast. We bake it to be <em className="text-shimmer not-italic font-600">remembered</em> —
              the kind of loaf you tear into at the table and everyone goes quiet."
            </blockquote>
            <p className="mt-8 text-sm uppercase tracking-[0.3em] text-cream/60">
              — Crust & Crumb, Calapan City
            </p>
          </div>
        </div>
      </section>

      {/* Values grid */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="reveal text-center">
          <span className="eyebrow justify-center">
            <span className="h-px w-8 bg-ocean-500" /> The Details <span className="h-px w-8 bg-ocean-500" />
          </span>
          <h2 className="mt-4 font-display text-4xl font-700 leading-tight text-crust-900 md:text-5xl">
            What goes in. What stays out.
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="reveal rounded-3xl bg-green-50 p-8 ring-1 ring-green-200" data-reveal="left">
            <h3 className="font-display text-2xl font-700 text-green-800">What's in our bread</h3>
            <ul className="mt-5 space-y-3 text-crust-700">
              {['Stone-milled flour', 'Filtered water', 'Sea salt', 'Wild yeast starter', 'Time. Lots of it.'].map((x) => (
                <li key={x} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-sm text-white">✓</span>
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="reveal rounded-3xl bg-red-50 p-8 ring-1 ring-red-200" data-reveal="right" data-delay="1">
            <h3 className="font-display text-2xl font-700 text-red-800">What's never in our bread</h3>
            <ul className="mt-5 space-y-3 text-crust-700">
              {['Commercial baker\'s yeast', 'Dough improvers or conditioners', 'Preservatives', 'Added sugar in the bread', 'Shortcuts of any kind'].map((x) => (
                <li key={x} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-sm text-white">✕</span>
                  {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-crust-50 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
          <div className="reveal">
            <h2 className="font-display text-3xl font-700 text-crust-900 md:text-4xl">
              Taste what patience makes.
            </h2>
            <button onClick={() => onNavigate('menu')} className="btn-primary mt-6">
              Browse today's bake
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Principle({
  icon: Icon,
  n,
  title,
  text,
  color,
}: {
  icon: typeof Wheat;
  n: string;
  title: string;
  text: string;
  color: string;
}) {
  return (
    <article className="reveal flex w-[85vw] flex-shrink-0 snap-center flex-col rounded-3xl bg-white p-8 shadow-soft sm:w-[420px] md:w-[440px]">
      <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${color} text-cream`}>
        <Icon className="h-8 w-8" />
      </div>
      <span className="mt-6 font-display text-6xl font-900 text-crust-100">{n}</span>
      <h3 className="mt-2 font-display text-2xl font-700 leading-tight text-crust-900">{title}</h3>
      <p className="mt-4 flex-1 leading-relaxed text-crust-600">{text}</p>
    </article>
  );
}
