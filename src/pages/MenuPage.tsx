import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/ProductCard';
import { useReveal } from '@/hooks/useReveal';
import { useFlyingCart } from '@/hooks/useFlyingCart';
import { FlyingCartLayer } from '@/hooks/useFlyingCart';

const CATEGORIES = ['All', 'Bread', 'Pastry', 'Cake', 'Cookies'] as const;
type Category = (typeof CATEGORIES)[number];

export function MenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category>('All');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'featured' | 'price-low' | 'price-high'>('featured');
  const revealRef = useReveal<HTMLDivElement>();
  const { flyers, launch } = useFlyingCart();

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: true });
      if (!active) return;
      if (error) {
        console.error(error);
      }
      setProducts((data as Product[]) ?? []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    let list = products;
    if (category !== 'All') list = list.filter((p) => p.category === category);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q)
      );
    }
    if (sort === 'price-low') list = [...list].sort((a, b) => Number(a.price) - Number(b.price));
    else if (sort === 'price-high') list = [...list].sort((a, b) => Number(b.price) - Number(a.price));
    else list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
    return list;
  }, [products, category, query, sort]);

  return (
    <div ref={revealRef} className="min-h-screen bg-cream pt-28">
      <FlyingCartLayer flyers={flyers} />

      {/* Header */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="reveal flex flex-col items-start gap-4">
          <span className="eyebrow">
            <span className="h-px w-8 bg-ocean-500" /> Today's Bake
          </span>
          <h1 className="font-display text-5xl font-700 leading-tight text-crust-900 md:text-6xl">
            The <span className="underline-swoosh text-ocean-500">Menu</span>
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-crust-600">
            Everything is mixed, shaped, and baked in-house each morning. When it's gone,
            it's gone — come early for the best pick.
          </p>
        </div>

        {/* Controls */}
        <div className="reveal mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between" data-delay="1">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                  category === cat
                    ? 'bg-ocean-500 text-cream shadow-soft'
                    : 'bg-white text-crust-700 hover:bg-crust-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search + sort */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-crust-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search the bake..."
                className="w-full rounded-full border border-crust-200 bg-white py-2.5 pl-10 pr-4 text-sm text-crust-800 outline-none transition-colors focus:border-ocean-400 sm:w-56"
              />
            </div>
            <div className="relative">
              <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-crust-400" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="w-full appearance-none rounded-full border border-crust-200 bg-white py-2.5 pl-10 pr-8 text-sm font-medium text-crust-800 outline-none focus:border-ocean-400 sm:w-44"
              >
                <option value="featured">Featured first</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-3xl bg-white p-4 shadow-soft">
                <div className="aspect-[4/3] rounded-2xl bg-crust-100" />
                <div className="mt-4 h-5 w-3/4 rounded bg-crust-100" />
                <div className="mt-2 h-4 w-full rounded bg-crust-100" />
                <div className="mt-4 h-10 w-32 rounded-full bg-crust-100" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <p className="font-display text-2xl font-600 text-crust-700">No bakes found</p>
            <p className="text-crust-500">Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} onLaunch={launch} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
