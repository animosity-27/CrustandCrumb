import { useEffect } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPeso } from '@/lib/format';

export function CartDrawer({
  onCheckout,
}: {
  onCheckout: () => void;
}) {
  const { items, isOpen, close, setQty, remove, subtotal, count } = useCart();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <div className={`fixed inset-0 z-[60] ${isOpen ? '' : 'pointer-events-none'}`} aria-hidden={!isOpen}>
      <div
        className={`absolute inset-0 bg-crust-900/50 backdrop-blur-sm transition-opacity duration-400 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={close}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream shadow-crust transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-crust-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-6 w-6 text-ocean-500" />
            <div>
              <h2 className="font-display text-xl font-700 text-crust-900">Your Basket</h2>
              <p className="text-xs text-crust-500">{count} item{count !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={close}
            className="flex h-10 w-10 items-center justify-center rounded-full text-crust-600 transition-colors hover:bg-crust-100 hover:text-crust-900"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-crust-100">
                <ShoppingBag className="h-9 w-9 text-crust-300" />
              </div>
              <p className="font-display text-lg font-600 text-crust-700">Your basket is empty</p>
              <p className="max-w-xs text-sm text-crust-500">
                Wander over to the menu and add something warm from the oven.
              </p>
              <button
                onClick={close}
                className="btn-ghost mt-2"
              >
                Browse the menu
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.product.id}
                  className="flex gap-4 rounded-2xl bg-white p-3 shadow-soft animate-rise-up"
                >
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-crust-100">
                    {item.product.image_url && (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-base font-600 leading-tight text-crust-900">
                        {item.product.name}
                      </h3>
                      <button
                        onClick={() => remove(item.product.id)}
                        className="text-crust-400 transition-colors hover:text-red-500"
                        aria-label={`Remove ${item.product.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-ocean-500 font-600">
                      {formatPeso(Number(item.product.price))}
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-full border border-crust-200 bg-cream p-1">
                        <button
                          onClick={() => setQty(item.product.id, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-crust-700 transition-colors hover:bg-crust-200"
                          aria-label="Decrease"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-7 text-center font-semibold text-crust-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => setQty(item.product.id, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-crust-700 transition-colors hover:bg-crust-200"
                          aria-label="Increase"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="font-display font-700 text-crust-900">
                        {formatPeso(Number(item.product.price) * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-crust-200 bg-white px-6 py-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm uppercase tracking-wider text-crust-500">Subtotal</span>
              <span className="font-display text-2xl font-700 text-crust-900">
                {formatPeso(subtotal)}
              </span>
            </div>
            <button onClick={onCheckout} className="btn-primary w-full text-base">
              Proceed to Checkout
              <ArrowRight className="h-5 w-5" />
            </button>
            <p className="mt-3 text-center text-xs text-crust-500">
              Pickup at our Calapan City bakery · Pay in store
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
