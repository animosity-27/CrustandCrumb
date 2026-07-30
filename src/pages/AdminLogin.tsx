import { useState } from 'react';
import { Lock, Mail, Loader2, ArrowLeft, ShieldCheck, UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { Page } from '@/lib/pages';
import { CrustLogo } from '@/components/CrustLogo';

export function AdminLogin({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [info, setInfo] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    if (mode === 'signin') {
      const { error: signInError } = await signIn(email, password);
      setLoading(false);
      if (signInError) {
        setError('Invalid email or password. Please try again.');
      }
    } else {
      const { error: signUpError } = await signUp(email, password);
      setLoading(false);
      if (signUpError) {
        setError(signUpError);
      } else {
        setInfo('Account created! You can now sign in.');
        setMode('signin');
      }
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-ocean-900 via-ocean-800 to-crust-900 px-6 py-16">
      <div className="grain-overlay absolute inset-0" />
      <div className="absolute -left-20 top-1/4 h-80 w-80 rounded-full bg-ocean-400/20 blur-[120px]" />
      <div className="absolute -right-20 bottom-1/4 h-80 w-80 rounded-full bg-gold/20 blur-[120px]" />

      <div className="relative w-full max-w-md">
        <button
          onClick={() => onNavigate('home')}
          className="mb-6 inline-flex items-center gap-2 text-sm text-cream/60 transition-colors hover:text-cream"
        >
          <ArrowLeft className="h-4 w-4" /> Back to site
        </button>

        <div className="rounded-3xl bg-cream/95 p-8 shadow-crust backdrop-blur-xl">
          <div className="flex flex-col items-center text-center">
            <CrustLogo className="h-14 w-14" />
            <h1 className="mt-4 font-display text-2xl font-700 text-crust-900">Admin Sign In</h1>
            <p className="mt-1 text-sm text-crust-500">
              Manage inventory, orders, and reviews
            </p>
          </div>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-crust-700">
                <Mail className="h-4 w-4 text-ocean-500" /> Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@crustandcrumb.ph"
                required
                className="w-full rounded-xl border border-crust-200 bg-white px-4 py-3 text-crust-800 outline-none transition-colors focus:border-ocean-400"
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-crust-700">
                <Lock className="h-4 w-4 text-ocean-500" /> Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-crust-200 bg-white px-4 py-3 text-crust-800 outline-none transition-colors focus:border-ocean-400"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
                {error}
              </div>
            )}
            {info && (
              <div className="rounded-xl bg-green-50 p-3 text-sm text-green-700 ring-1 ring-green-200">
                {info}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : mode === 'signin' ? (
                <ShieldCheck className="h-5 w-5" />
              ) : (
                <UserPlus className="h-5 w-5" />
              )}
              {loading ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create admin account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-crust-500">
            {mode === 'signin' ? (
              <p>
                First time setting up?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(null); setInfo(null); }}
                  className="font-semibold text-ocean-500 hover:text-ocean-700"
                >
                  Create an admin account
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError(null); setInfo(null); }}
                  className="font-semibold text-ocean-500 hover:text-ocean-700"
                >
                  Sign in instead
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
