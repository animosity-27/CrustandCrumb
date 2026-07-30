import { useRef, useState } from 'react';
import { Plus, Check, Flame } from 'lucide-react';
import type { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { formatPeso } from '@/lib/format';

export function ProductCard({
  product,
  index,
  onLaunch,
}: {
  product: Product;
  index: number;
  onLaunch: (x: number, y: number, image: string) => void;
}) {
  const { add } = useCart();
  const btnRef = useRef<HTMLButtonElement>(null);
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock <= 0;

  const handleAdd = (e: React.MouseEvent) => {
    if (outOfStock) return;
    add(product);

    // Launch flyer from the button center
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) {
      onLaunch(rect.left + rect.width / 2 - 32, rect.top + rect.height / 2 - 32, product.image_url || '');
    }

    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  };

  return (
    <article
      className="reveal card-lift group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-soft"
      data-delay={((index % 3) + 1).toString()}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-crust-100">
        {product.image_url && (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            loading="lazy"
          />
        )}
        {/* Category chip */}
        <span className="absolute left-3 top-3 rounded-full bg-ocean-900/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cream backdrop-blur-sm">
          {product.category}
        </span>
        {/* Featured badge */}
        {product.featured && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-gold px-2.5 py-1 text-xs font-bold text-crust-900">
            <Flame className="h-3 w-3" /> Signature
          </span>
        )}
        {/* Stock indicator */}
        {outOfStock ? (
          <div className="absolute inset-0 flex items-center justify-center bg-crust-900/60 backdrop-blur-[2px]">
            <span className="rounded-full bg-crust-900 px-4 py-2 text-sm font-bold uppercase tracking-wider text-cream">
              Sold out today
            </span>
          </div>
        ) : product.stock <= 5 ? (
          <span className="absolute bottom-3 left-3 rounded-full bg-red-500/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            Only {product.stock} left
          </span>
        ) : null}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-700 leading-tight text-crust-900">
          {product.name}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-crust-600 line-clamp-3">
          {product.description}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span className="font-display text-xl font-700 text-ocean-500">
            {formatPeso(Number(product.price))}
          </span>
          <button
            ref={btnRef}
            onClick={handleAdd}
            disabled={outOfStock}
            className={`flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-all duration-300 active:scale-90 ${
              outOfStock
                ? 'cursor-not-allowed bg-crust-100 text-crust-400'
                : added
                ? 'bg-green-600 text-white'
                : 'bg-crust-700 text-cream hover:bg-ocean-500 hover:shadow-glow'
            }`}
            aria-label={`Add ${product.name} to cart`}
          >
            {added ? (
              <>
                <Check className="h-4 w-4" /> Added
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
