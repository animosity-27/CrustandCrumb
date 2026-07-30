import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LogOut, Package, ShoppingBag, TrendingUp, CheckCircle2, Plus, Minus,
  Search, Loader2, Clock, ChefHat, Bell, AlertTriangle, Pencil, Check, X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Page } from '@/lib/pages';
import type { Order, OrderItem, OrderStatus, Product } from '@/lib/types';
import { formatPeso } from '@/lib/format';
import { useReveal } from '@/hooks/useReveal';

type Tab = 'overview' | 'inventory' | 'orders';

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  received: 'preparing',
  preparing: 'ready',
  ready: 'completed',
  completed: null,
  cancelled: null,
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  received: 'Received',
  preparing: 'Baking',
  ready: 'Ready',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  received: 'bg-ocean-100 text-ocean-800',
  preparing: 'bg-amber-100 text-amber-800',
  ready: 'bg-gold/20 text-crust-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export function AdminPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const { signOut } = useAuth();
  const revealRef = useReveal<HTMLDivElement>();
  const [tab, setTab] = useState<Tab>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<(Order & { items?: OrderItem[] })[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    const { data } = await supabase.from('products').select('*').order('category, name', { ascending: true });
    setProducts((data as Product[]) ?? []);
  }, []);

  const loadOrders = useCallback(async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    setOrders((data as Order[]) ?? []);
  }, []);

  useEffect(() => {
    (async () => {
      await Promise.all([loadProducts(), loadOrders()]);
      setLoading(false);
    })();
  }, [loadProducts, loadOrders]);

  // Live orders polling
  useEffect(() => {
    const id = setInterval(loadOrders, 8000);
    return () => clearInterval(id);
  }, [loadOrders]);

  const stats = useMemo(() => {
    const total = orders.length;
    const completed = orders.filter((o) => o.status === 'completed').length;
    const live = orders.filter((o) => ['received', 'preparing', 'ready'].includes(o.status)).length;
    const revenue = orders
      .filter((o) => o.status === 'completed')
      .reduce((s, o) => s + Number(o.total), 0);
    return { total, completed, live, revenue };
  }, [orders]);

  const lowStock = products.filter((p) => p.stock <= 5);

  const handleSignOut = async () => {
    await signOut();
    sessionStorage.removeItem('currentPage');
    onNavigate('home');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ocean-900 text-cream">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div ref={revealRef} className="min-h-screen bg-sand pt-20">
      {/* Top bar */}
      <div className="border-b border-crust-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div>
            <h1 className="font-display text-2xl font-700 text-crust-900">Bakery Dashboard</h1>
            <p className="text-sm text-crust-500">Crust & Crumb · Calapan City</p>
          </div>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 rounded-full bg-crust-100 px-5 py-2.5 text-sm font-semibold text-crust-700 transition-all hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-crust-200 bg-white">
        <div className="mx-auto flex max-w-7xl gap-1 px-6 lg:px-8">
          {([
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'inventory', label: 'Inventory', icon: Package },
            { id: 'orders', label: 'Live Orders', icon: ShoppingBag },
          ] as { id: Tab; label: string; icon: typeof Package }[]).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-2 px-4 py-4 text-sm font-semibold transition-colors ${tab === t.id ? 'text-ocean-500' : 'text-crust-600 hover:text-crust-900'
                }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
              {t.id === 'orders' && stats.live > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white">
                  {stats.live}
                </span>
              )}
              {tab === t.id && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-ocean-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {tab === 'overview' && (
          <OverviewTab stats={stats} lowStock={lowStock} orders={orders} />
        )}
        {tab === 'inventory' && <InventoryTab products={products} onReload={loadProducts} />}
        {tab === 'orders' && <OrdersTab orders={orders} onReload={loadOrders} />}
      </div>
    </div>
  );
}

/* ------------------------------- OVERVIEW -------------------------------- */
function OverviewTab({
  stats,
  lowStock,
  orders,
}: {
  stats: { total: number; completed: number; live: number; revenue: number };
  lowStock: Product[];
  orders: Order[];
}) {
  const recent = orders.slice(0, 5);
  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={ShoppingBag}
          label="Total Orders"
          value={stats.total.toString()}
          color="bg-ocean-500"
        />
        <StatCard
          icon={Clock}
          label="Live Orders"
          value={stats.live.toString()}
          color="bg-amber-500"
          pulse={stats.live > 0}
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed Orders"
          value={stats.completed.toString()}
          color="bg-green-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Revenue (completed)"
          value={formatPeso(stats.revenue)}
          color="bg-crust-600"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Low stock alert */}
        <div className="rounded-3xl bg-white p-6 shadow-soft lg:col-span-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h2 className="font-display text-lg font-700 text-crust-900">Low Stock</h2>
          </div>
          {lowStock.length === 0 ? (
            <p className="mt-4 text-sm text-crust-500">All products are well stocked.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between rounded-xl bg-crust-50 px-3 py-2.5">
                  <span className="text-sm font-semibold text-crust-800">{p.name}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${p.stock <= 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}
                  >
                    {p.stock <= 0 ? 'Out' : `${p.stock} left`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent orders */}
        <div className="rounded-3xl bg-white p-6 shadow-soft lg:col-span-2">
          <h2 className="font-display text-lg font-700 text-crust-900">Recent Orders</h2>
          {recent.length === 0 ? (
            <p className="mt-4 text-sm text-crust-500">No orders yet — the day is just starting.</p>
          ) : (
            <ul className="mt-4 divide-y divide-crust-100">
              {recent.map((o) => (
                <li key={o.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-semibold text-crust-900">
                      #{o.order_number} · {o.customer_name}
                    </p>
                    <p className="text-xs text-crust-500">
                      {new Date(o.created_at).toLocaleString('en-PH', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display font-700 text-crust-900">{formatPeso(Number(o.total))}</span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_COLOR[o.status]}`}>
                      {STATUS_LABEL[o.status]}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  pulse,
}: {
  icon: typeof Package;
  label: string;
  value: string;
  color: string;
  pulse?: boolean;
}) {
  return (
    <div className="reveal rounded-3xl bg-white p-6 shadow-soft">
      <div className={`relative flex h-12 w-12 items-center justify-center rounded-2xl ${color} text-white`}>
        <Icon className="h-6 w-6" />
        {pulse && (
          <span className="absolute -right-1 -top-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
          </span>
        )}
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-crust-500">{label}</p>
      <p className="mt-1 font-display text-3xl font-700 text-crust-900">{value}</p>
    </div>
  );
}

/* ------------------------------- INVENTORY ------------------------------- */
function InventoryTab({ products, onReload }: { products: Product[]; onReload: () => Promise<void> }) {
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.category.toLowerCase().includes(query.toLowerCase())
  );

  const updateStock = async (id: string, newStock: number) => {
    setSaving(id);
    await supabase.from('products').update({ stock: newStock }).eq('id', id);
    await onReload();
    setSaving(null);
    setEditing((e) => {
      const next = { ...e };
      delete next[id];
      return next;
    });
  };

  const adjustStock = async (p: Product, delta: number) => {
    const newStock = Math.max(0, p.stock + delta);
    setSaving(p.id);
    await supabase.from('products').update({ stock: newStock }).eq('id', p.id);
    await onReload();
    setSaving(null);
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-crust-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full rounded-full border border-crust-200 bg-white py-2.5 pl-10 pr-4 text-sm text-crust-800 outline-none focus:border-ocean-400"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-crust-50 text-xs uppercase tracking-wider text-crust-500">
              <tr>
                <th className="px-5 py-4">Product</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Price</th>
                <th className="px-5 py-4">Stock</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-crust-100">
              {filtered.map((p) => {
                const editVal = editing[p.id];
                const isSaving = saving === p.id;
                return (
                  <tr key={p.id} className="transition-colors hover:bg-crust-50/50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg bg-crust-100">
                          {p.image_url && (
                            <img src={p.image_url} alt="" className="h-full w-full object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-crust-900">{p.name}</p>
                          {p.featured && (
                            <span className="text-xs text-gold">Signature</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-crust-600">{p.category}</td>
                    <td className="px-5 py-4 font-semibold text-crust-900">{formatPeso(Number(p.price))}</td>
                    <td className="px-5 py-4">
                      {editVal !== undefined ? (
                        <input
                          type="number"
                          value={editVal}
                          onChange={(e) => setEditing({ ...editing, [p.id]: e.target.value })}
                          className="w-20 rounded-lg border border-crust-200 px-2 py-1 text-crust-800 outline-none focus:border-ocean-400"
                          autoFocus
                        />
                      ) : (
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${p.stock <= 0
                            ? 'bg-red-100 text-red-700'
                            : p.stock <= 5
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-green-100 text-green-700'
                            }`}
                        >
                          {p.stock}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {editVal !== undefined ? (
                          <>
                            <button
                              onClick={() => updateStock(p.id, Number(editVal))}
                              disabled={isSaving}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white transition-colors hover:bg-green-700"
                              aria-label="Save"
                            >
                              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => setEditing((e) => { const n = { ...e }; delete n[p.id]; return n; })}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-crust-100 text-crust-600 transition-colors hover:bg-crust-200"
                              aria-label="Cancel"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => adjustStock(p, -1)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-crust-100 text-crust-700 transition-colors hover:bg-red-50 hover:text-red-600"
                              aria-label="Decrease stock"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => adjustStock(p, 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-crust-100 text-crust-700 transition-colors hover:bg-green-50 hover:text-green-600"
                              aria-label="Increase stock"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setEditing({ ...editing, [p.id]: String(p.stock) })}
                              className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg bg-ocean-500 text-white transition-colors hover:bg-ocean-600"
                              aria-label="Edit stock"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- ORDERS -------------------------------- */
function OrdersTab({ orders, onReload }: { orders: Order[]; onReload: () => Promise<void> }) {
  const [filter, setFilter] = useState<'live' | 'all' | 'completed'>('live');
  const [updating, setUpdating] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, OrderItem[]>>({});

  const visible = orders.filter((o) => {
    if (filter === 'live') return ['received', 'preparing', 'ready'].includes(o.status);
    if (filter === 'completed') return o.status === 'completed' || o.status === 'cancelled';
    return true;
  });

  const advance = async (o: Order) => {
    const next = NEXT_STATUS[o.status];
    if (!next) return;
    setUpdating(o.id);
    const patch: Partial<Order> = { status: next };
    if (next === 'completed') patch.completed_at = new Date().toISOString();
    await supabase.from('orders').update(patch).eq('id', o.id);
    await onReload();
    setUpdating(null);
  };

  const cancel = async (o: Order) => {
    setUpdating(o.id);
    await supabase.from('orders').update({ status: 'cancelled' }).eq('id', o.id);
    await onReload();
    setUpdating(null);
  };

  const expand = async (o: Order) => {
    if (expanded[o.id]) {
      setExpanded((e) => {
        const n = { ...e };
        delete n[o.id];
        return n;
      });
      return;
    }
    const { data } = await supabase.from('order_items').select('*').eq('order_id', o.id);
    setExpanded((e) => ({ ...e, [o.id]: (data as OrderItem[]) ?? [] }));
  };

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {([
          { id: 'live', label: 'Live', icon: Bell },
          { id: 'all', label: 'All', icon: ShoppingBag },
          { id: 'completed', label: 'Completed', icon: CheckCircle2 },
        ] as { id: typeof filter; label: string; icon: typeof Bell }[]).map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${filter === f.id ? 'bg-ocean-500 text-cream' : 'bg-white text-crust-700 hover:bg-crust-100'
              }`}
          >
            <f.icon className="h-4 w-4" /> {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center shadow-soft">
          <ShoppingBag className="mx-auto h-12 w-12 text-crust-200" />
          <p className="mt-4 font-display text-xl font-600 text-crust-700">No orders here</p>
          <p className="text-crust-500">New orders will appear here in real time.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((o) => {
            const items = expanded[o.id] ?? [];
            const isExpanded = !!expanded[o.id];
            const isUpdating = updating === o.id;
            return (
              <div key={o.id} className="overflow-hidden rounded-2xl bg-white shadow-soft">
                <button
                  onClick={() => expand(o)}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-crust-50/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-ocean-100 font-display text-lg font-700 text-ocean-700">
                      #{o.order_number}
                    </div>
                    <div>
                      <p className="font-semibold text-crust-900">{o.customer_name}</p>
                      <p className="text-xs text-crust-500">
                        {o.customer_phone} · {new Date(o.created_at).toLocaleString('en-PH', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display font-700 text-crust-900">{formatPeso(Number(o.total))}</span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_COLOR[o.status]}`}>
                      {STATUS_LABEL[o.status]}
                    </span>
                  </div>
                </button>

                {/* Expanded body */}
                {isExpanded && (
                  <div className="border-t border-crust-100 px-5 py-4 animate-rise-up">
                    {items.length > 0 && (
                      <ul className="mb-4 space-y-1.5 text-sm">
                        {items.map((it) => (
                          <li key={it.id} className="flex items-center justify-between">
                            <span className="text-crust-700">{it.quantity}× {it.product_name}</span>
                            <span className="font-semibold text-crust-900">{formatPeso(Number(it.unit_price) * it.quantity)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {o.notes && (
                      <p className="mb-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 ring-1 ring-amber-100">
                        <strong>Note:</strong> {o.notes}
                      </p>
                    )}
                    {o.customer_email && (
                      <p className="mb-3 text-xs text-crust-500">Email: {o.customer_email}</p>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      {NEXT_STATUS[o.status] && (
                        <button
                          onClick={() => advance(o)}
                          disabled={isUpdating}
                          className="inline-flex items-center gap-2 rounded-full bg-ocean-500 px-4 py-2 text-sm font-semibold text-cream transition-all hover:bg-ocean-600 disabled:opacity-60"
                        >
                          {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChefHat className="h-4 w-4" />}
                          {o.status === 'received' && 'Start baking'}
                          {o.status === 'preparing' && 'Mark ready'}
                          {o.status === 'ready' && 'Complete order'}
                        </button>
                      )}
                      {['received', 'preparing'].includes(o.status) && (
                        <button
                          onClick={() => cancel(o)}
                          disabled={isUpdating}
                          className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-all hover:bg-red-100 disabled:opacity-60"
                        >
                          <X className="h-4 w-4" /> Cancel
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
