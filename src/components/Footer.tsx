import { Instagram, MapPin, Phone, Clock, Heart } from 'lucide-react';
import type { Page } from '@/lib/pages';
import { CrustLogo } from '@/components/CrustLogo';

const INSTAGRAM_URL = 'https://www.instagram.com/all4rjay';

export function Footer({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <footer className="relative overflow-hidden bg-ocean-900 text-cream">
      <div className="grain-overlay absolute inset-0" />
      {/* Decorative top wave */}
      <svg className="absolute -top-1 left-0 right-0 w-full text-cream" viewBox="0 0 1440 60" preserveAspectRatio="none">
        <path d="M0 30 C 240 60, 480 0, 720 30 S 1200 60, 1440 30 L 1440 60 L 0 60 Z" fill="currentColor" />
      </svg>

      <div className="relative mx-auto max-w-7xl px-6 pb-10 pt-20 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <CrustLogo className="h-12 w-12" />
              <div>
                <p className="font-display text-2xl font-700">
                  Crust <span className="text-gold">&</span> Crumb
                </p>
                <p className="font-script text-lg text-gold">artisan bakery</p>
              </div>
            </div>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-cream/70">
              A small wood-fired bakery in Calapan City, Oriental Mindoro. We bake wild-yeast
              sourdough, laminated pastries, and cakes from scratch every dawn — slow fermentation,
              local flour, and a whole lot of patience.
            </p>
            <button
              onClick={() => onNavigate('menu')}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-cream/30 px-5 py-2.5 text-sm font-medium transition-all duration-300 hover:border-gold hover:bg-cream/5 hover:text-gold"
            >
              See today's bake
            </button>
          </div>

          {/* Visit */}
          <div>
            <h3 className="font-display text-lg font-600 text-gold">Visit Us</h3>
            <ul className="mt-4 space-y-3 text-sm text-cream/75">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold" />
                <span>Calapan City, Oriental Mindoro, Philippines</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold" />
                <a href="tel:09951141455" className="transition-colors hover:text-cream">
                  0995 114 1555
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold" />
                <span>Tue – Sun · 6:00 AM – 6:00 PM<br />Closed Mondays for rest</span>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-display text-lg font-600 text-gold">Connect</h3>
            <ul className="mt-4 space-y-3 text-sm text-cream/75">
              <li>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 transition-colors hover:text-cream"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cream/10 transition-colors group-hover:bg-gold group-hover:text-ocean-900">
                    <Instagram className="h-4 w-4" />
                  </span>
                  <span>@all4rjay</span>
                </a>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('reviews')}
                  className="group flex items-center gap-3 transition-colors hover:text-cream"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cream/10 transition-colors group-hover:bg-gold group-hover:text-ocean-900">
                    <Heart className="h-4 w-4" />
                  </span>
                  <span>Read reviews</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="divider-stitch mt-12 opacity-40" />

        <div className="mt-6 flex flex-col items-center justify-between gap-3 text-xs text-cream/60 sm:flex-row">
          <p>© {new Date().getFullYear()} Crust & Crumb Artisan Bakery. Baked with patience in Calapan City.</p>
          <p className="flex items-center gap-1.5">
            Made with <Heart className="h-3 w-3 fill-gold text-gold" /> in Oriental Mindoro
          </p>
        </div>
      </div>
    </footer>
  );
}
