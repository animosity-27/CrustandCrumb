import { useEffect, useState } from 'react';
import { X, Search, Loader2, Package, ChefHat, CheckCircle2, PartyPopper, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Order, OrderItem, OrderStatus } from '@/lib/types';
import { formatPeso } from '@/lib/format';

const STEPS: { status: OrderStatus; label: string; icon: typeof Package }[] = [
  { status: 'received', label: 'Order received', icon: Package },
  { status: 'preparing', label: 'Baking', icon: ChefHat },
  { status: 'ready', label: 'Ready for pickup', icon: Clock },
  { status: 'completed', label: 'Completed', icon: CheckCircle2 },
];

const STATUS_ORDER: OrderStatus[] = ['received', 'preparing', 'ready', 'completed'];

export function TrackOrderModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      setQuery('');
      setOrder(null);
      setItems([]);
      setError(null);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    setOrder(null);
    setItems([]);

    const numeric = q.replace(/^#/, '');
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', Number(numeric))
      .maybeSingle();

    setLoading(false);

    if (error || !data) {
      setError(`We couldn't find order #${numeric}. Double-check the number from your confirmation.`);
      return;
    }

    const foundOrder = data as Order;
    setOrder(foundOrder);

    const { data: itemData } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', foundOrder.id);
    setItems((itemData as OrderItem[]) ?? []);
  };

  if (!open) return null;

  const currentStep = order ? STATUS_ORDER.indexOf(order.status) : -1;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-crust-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-cream shadow-crust animate-rise-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-crust-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-ocean-500" />
            <h2 className="font-display text-xl font-700 text-crust-900">Track your order</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-crust-600 transition-colors hover:bg-crust-100"
            aria-label="Close track order"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Search */}
          <form onSubmit={search} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-crust-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter order number (e.g. 42)"
                className="w-full rounded-full border border-crust-200 bg-white py-3 pl-10 pr-4 text-crust-800 outline-none transition-colors focus:border-ocean-400"
              />
            </div>
            <button type="submit" className="btn-primary px-5" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Track'}
            </button>
          </form>

          {error && (
            <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
              {error}
            </div>
          )}

          {/* Result */}
          {order && (
            <div className="mt-6 animate-rise-up">
              {order.status === 'cancelled' ? (
                <div className="rounded-2xl bg-red-50 p-6 text-center ring-1 ring-red-200">
                  <p className="font-display text-xl font-700 text-red-800">Order cancelled</p>
                  <p className="mt-2 text-sm text-red-700">
                    Order #{order.order_number} was cancelled. Please call us if you think this is a mistake.
                  </p>
                </div>
              ) : (
                <>
                  {/* Order header */}
                  <div className="flex items-center justify-between rounded-2xl bg-ocean-500 px-5 py-4 text-cream">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-cream/70">Order</p>
                      <p className="font-display text-2xl font-700">#{order.order_number}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-wider text-cream/70">Placed</p>
                      <p className="text-sm font-semibold">
                        {new Date(order.created_at).toLocaleDateString('en-PH', {
                          month: 'short', day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Stepper */}
                  <div className="mt-6">
                    <ol className="relative">
                      {STEPS.map((step, i) => {
                        const done = i < currentStep;
                        const active = i === currentStep;
                        return (
                          <li key={step.status} className="relative flex gap-4 pb-8 last:pb-0">
                            {/* Connector */}
                            {i < STEPS.length - 1 && (
                              <span
                                className={`absolute left-5 top-11 h-full w-0.5 ${
                                  done ? 'bg-ocean-500' : 'bg-crust-200'
                                }`}
                              />
                            )}
                            {/* Icon */}
                            <span
                              className={`relative z-10 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full transition-all duration-500 ${
                                done
                                  ? 'bg-ocean-500 text-cream'
                                  : active
                                  ? 'bg-gold text-crust-900 ring-4 ring-gold/30 animate-dough-pulse'
                                  : 'bg-crust-100 text-crust-400'
                              }`}
                            >
                              <step.icon className="h-5 w-5" />
                            </span>
                            {/* Label */}
                            <div className="pt-2">
                              <p
                                className={`font-display font-700 ${
                                  active ? 'text-ocean-500' : done ? 'text-crust-900' : 'text-crust-400'
                                }`}
                              >
                                {step.label}
                              </p>
                              {active && (
                                <p className="text-sm text-crust-500">
                                  {step.status === 'received' && "We've got your order — heading to the oven soon."}
                                  {step.status === 'preparing' && "Your bake is in the oven right now."}
                                  {step.status === 'ready' && "Ready! Come pick it up — it's still warm."}
                                </p>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  </div>

                  {/* Items */}
                  <div className="mt-4 rounded-2xl bg-white p-4 shadow-soft">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-crust-500">
                      In this order
                    </p>
                    <ul className="space-y-2 text-sm">
                      {items.map((it) => (
                        <li key={it.id} className="flex items-center justify-between">
                          <span className="text-crust-700">
                            {it.quantity}× {it.product_name}
                          </span>
                          <span className="font-semibold text-crust-900">
                            {formatPeso(Number(it.unit_price) * it.quantity)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 flex items-center justify-between border-t border-crust-100 pt-3">
                      <span className="font-display font-700 text-crust-900">Total</span>
                      <span className="font-display text-lg font-700 text-ocean-500">
                        {formatPeso(Number(order.total))}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {!order && !error && !loading && (
            <div className="mt-8 flex flex-col items-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-crust-100">
                <PartyPopper className="h-7 w-7 text-crust-400" />
              </div>
              <p className="text-sm text-crust-500">
                Enter your order number to see its progress in real time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
