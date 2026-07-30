import { useEffect, useState } from 'react';
import { X, Loader2, Check, ShoppingBag, MapPin, Phone, User, Mail, MessageSquare, PartyPopper } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPeso } from '@/lib/format';
import { supabase } from '@/lib/supabase';

type Phase = 'form' | 'submitting' | 'success' | 'error';

export function CheckoutModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { items, subtotal, clear } = useCart();
  const [phase, setPhase] = useState<Phase>('form');
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
  });

  useEffect(() => {
    if (open) {
      setPhase('form');
      setOrderNumber(null);
      setErrorMsg('');
    }
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setErrorMsg('Please add your name and phone number so we can reach you.');
      setPhase('error');
      return;
    }
    setPhase('submitting');
    setErrorMsg('');

    const payload = {
      customer_name: form.name.trim(),
      customer_phone: form.phone.trim(),
      customer_email: form.email.trim() || null,
      total: subtotal.toFixed(2),
      notes: form.notes.trim() || null,
      items: items.map((i) => ({
        product_id: i.product.id,
        quantity: i.quantity,
      })),
    };

    const { data, error } = await supabase.rpc('place_order', { p_order: payload });

    if (error || !data) {
      setErrorMsg(error?.message ?? 'Could not place your order. Please try again.');
      setPhase('error');
      return;
    }

    // Fetch the order number for the confirmation screen
    const { data: orderRow } = await supabase
      .from('orders')
      .select('order_number')
      .eq('id', data as string)
      .maybeSingle();

    setOrderNumber((orderRow as { order_number: number } | null)?.order_number ?? null);
    setPhase('success');
    clear();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-crust-900/60 backdrop-blur-sm" onClick={phase !== 'submitting' ? onClose : undefined} />
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-cream shadow-crust animate-rise-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-crust-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-6 w-6 text-ocean-500" />
            <h2 className="font-display text-xl font-700 text-crust-900">Checkout</h2>
          </div>
          {phase !== 'submitting' && (
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full text-crust-600 transition-colors hover:bg-crust-100"
              aria-label="Close checkout"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {phase === 'success' ? (
            <SuccessBody orderNumber={orderNumber} onClose={onClose} />
          ) : (
            <form onSubmit={submit} className="space-y-5 p-6">
              {/* Order summary */}
              <div className="rounded-2xl bg-white p-4 shadow-soft">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-crust-500">
                  Order summary
                </p>
                <ul className="space-y-2 text-sm">
                  {items.map((i) => (
                    <li key={i.product.id} className="flex items-center justify-between gap-3">
                      <span className="text-crust-700">
                        {i.quantity}× {i.product.name}
                      </span>
                      <span className="font-semibold text-crust-900">
                        {formatPeso(Number(i.product.price) * i.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex items-center justify-between border-t border-crust-100 pt-3">
                  <span className="font-display text-lg font-700 text-crust-900">Total</span>
                  <span className="font-display text-xl font-700 text-ocean-500">{formatPeso(subtotal)}</span>
                </div>
              </div>

              {/* Customer details */}
              <Field
                icon={User}
                label="Full name *"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
                placeholder="Juan dela Cruz"
              />
              <Field
                icon={Phone}
                label="Phone number *"
                value={form.phone}
                onChange={(v) => setForm({ ...form, phone: v })}
                placeholder="0917 123 4567"
                type="tel"
              />
              <Field
                icon={Mail}
                label="Email (optional)"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
                placeholder="juan@example.com"
                type="email"
              />
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-crust-700">
                  <MessageSquare className="h-4 w-4 text-ocean-500" /> Pickup notes (optional)
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  placeholder="Pickup at 8 AM, please wrap separately..."
                  className="w-full resize-none rounded-xl border border-crust-200 bg-white px-4 py-3 text-crust-800 outline-none transition-colors focus:border-ocean-400"
                />
              </div>

              {/* Pickup notice */}
              <div className="flex items-start gap-3 rounded-2xl bg-ocean-50 p-4 text-sm text-ocean-800 ring-1 ring-ocean-100">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-ocean-500" />
                <p>
                  Pickup at our Calapan City bakery. Pay in store when you collect your order —
                  we'll text you when it's ready.
                </p>
              </div>

              {phase === 'error' && (
                <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={phase === 'submitting' || items.length === 0}
                className="btn-primary w-full text-base disabled:opacity-60"
              >
                {phase === 'submitting' ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Placing order...
                  </>
                ) : (
                  <>Place order · {formatPeso(subtotal)}</>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  icon: typeof User;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-crust-700">
        <Icon className="h-4 w-4 text-ocean-500" /> {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-crust-200 bg-white px-4 py-3 text-crust-800 outline-none transition-colors focus:border-ocean-400"
      />
    </div>
  );
}

function SuccessBody({ orderNumber, onClose }: { orderNumber: number | null; onClose: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 p-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 animate-rise-up">
        <PartyPopper className="h-10 w-10" />
      </div>
      <h3 className="font-display text-3xl font-700 text-crust-900">Order placed!</h3>
      <p className="max-w-sm text-crust-600">
        We've received your order and will start preparing it fresh. Save your order number —
        you can track its progress anytime from the top of the site.
      </p>
      {orderNumber !== null && (
        <div className="my-2 rounded-2xl bg-ocean-500 px-8 py-4 text-cream">
          <p className="text-xs uppercase tracking-wider text-cream/70">Your order number</p>
          <p className="font-display text-4xl font-900">#{orderNumber}</p>
        </div>
      )}
      <button onClick={onClose} className="btn-primary mt-2">
        <Check className="h-5 w-5" /> Done
      </button>
    </div>
  );
}
