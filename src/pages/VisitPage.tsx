import { useState } from 'react';
import { MapPin, Phone, Clock, Instagram, Navigation, Copy, Check } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';

const INSTAGRAM_URL = 'https://www.instagram.com/all4rjay';

export function VisitPage() {
  const revealRef = useReveal<HTMLDivElement>();
  const [copied, setCopied] = useState(false);

  const copyPhone = async () => {
    try {
      await navigator.clipboard.writeText('09951141455');
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  return (
    <div ref={revealRef} className="min-h-screen bg-cream pt-28">
      {/* Header */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="reveal">
          <span className="eyebrow">
            <MapPin className="h-4 w-4" /> Find Us
          </span>
          <h1 className="mt-4 font-display text-5xl font-700 leading-tight text-crust-900 md:text-6xl">
            Come say <span className="underline-swoosh text-ocean-500">hello</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-crust-600">
            We're tucked into the heart of Calapan City, Oriental Mindoro. Follow the smell of
            fresh crust — or use the map below.
          </p>
        </div>
      </section>

      {/* Map + info */}
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Map */}
          <div className="reveal lg:col-span-3" data-reveal="left">
            <div className="relative h-[420px] overflow-hidden rounded-3xl shadow-crust lg:h-full">
              <iframe
                title="Crust & Crumb location on Google Maps"
                src="https://www.google.com/maps?q=Calapan+City+Oriental+Mindoro+Philippines&output=embed"
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Info card */}
          <div className="reveal flex flex-col gap-5 lg:col-span-2" data-reveal="right" data-delay="1">
            <InfoCard icon={MapPin} title="Address" lines={['Calapan City', 'Oriental Mindoro', 'Philippines, 5200']} />
            <InfoCard
              icon={Phone}
              title="Phone"
              lines={['0995 114 1555']}
              action={
                <button
                  onClick={copyPhone}
                  className="mt-3 inline-flex items-center gap-2 rounded-full bg-crust-100 px-4 py-2 text-sm font-semibold text-crust-700 transition-colors hover:bg-crust-200"
                >
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Copy number'}
                </button>
              }
            />
            <InfoCard icon={Clock} title="Hours" lines={['Tue – Sun · 6:00 AM – 6:00 PM', 'Closed Mondays for rest']} />
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="reveal flex items-center gap-4 rounded-2xl bg-gradient-to-br from-ocean-500 to-ocean-700 p-5 text-cream shadow-soft transition-all hover:shadow-glow"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-cream/15">
                <Instagram className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wider text-cream/70">Follow the bake</p>
                <p className="font-display text-xl font-700">@all4rjay</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Getting here */}
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="reveal text-center">
          <span className="eyebrow justify-center">
            <Navigation className="h-4 w-4" /> Getting Here
          </span>
          <h2 className="mt-4 font-display text-4xl font-700 text-crust-900 md:text-5xl">
            How to find us
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { n: '01', title: 'By tricycle', text: 'Tell the driver "bakery sa Calapan" — most drivers in the city centre know the area. We\'re a short ride from the public market.' },
            { n: '02', title: 'By car', text: 'Parking is available along the street. Mornings before 8 AM are easiest; weekends get busy after 9.' },
            { n: '03', title: 'On foot', text: 'We\'re walkable from the Calapan City Hall and the boulevard. Look for the blue awning and the chalkboard sign.' },
          ].map((step, i) => (
            <div
              key={step.n}
              className="reveal rounded-3xl bg-white p-8 shadow-soft"
              data-delay={(i + 1).toString()}
            >
              <span className="font-display text-5xl font-900 text-crust-100">{step.n}</span>
              <h3 className="mt-2 font-display text-xl font-700 text-crust-900">{step.title}</h3>
              <p className="mt-3 leading-relaxed text-crust-600">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Big CTA */}
      <section className="relative overflow-hidden bg-ocean-900 py-20 text-cream">
        <div className="grain-overlay absolute inset-0" />
        <div className="relative mx-auto max-w-3xl px-6 text-center lg:px-8">
          <div className="reveal">
            <h2 className="font-display text-3xl font-700 md:text-4xl">
              See you at dawn.
            </h2>
            <p className="mt-4 text-cream/75">
              The ovens fire early. Come hungry, bring a friend, and leave with a loaf.
            </p>
            <a href="tel:09951141455" className="btn-primary mt-6">
              <Phone className="h-5 w-5" /> Call ahead
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  lines,
  action,
}: {
  icon: typeof MapPin;
  title: string;
  lines: string[];
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-soft">
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-ocean-500 text-cream">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs uppercase tracking-wider text-crust-500">{title}</p>
          {lines.map((l) => (
            <p key={l} className="font-display text-lg font-600 leading-snug text-crust-900">
              {l}
            </p>
          ))}
          {action}
        </div>
      </div>
    </div>
  );
}
