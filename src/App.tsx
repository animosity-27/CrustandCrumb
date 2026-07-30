import { useEffect, useState } from 'react';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import type { Page } from '@/lib/pages';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { TrackOrderModal } from '@/components/TrackOrderModal';
import { HomePage } from '@/pages/HomePage';
import { MenuPage } from '@/pages/MenuPage';
import { PhilosophyPage } from '@/pages/PhilosophyPage';
import { VisitPage } from '@/pages/VisitPage';
import { ReviewsPage } from '@/pages/ReviewsPage';
import { AdminLogin } from '@/pages/AdminLogin';
import { AdminPage } from '@/pages/AdminPage';

function Shell() {
  const { session, loading } = useAuth();
  const [page, setPage] = useState<Page>('home');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);

  // Scroll progress bar
  useEffect(() => {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      bar.style.transform = `scaleX(${p})`;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navigate = (p: Page) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Admin route: login or dashboard
  if (page === 'admin') {
    if (loading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-ocean-900 text-cream">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cream/30 border-t-cream" />
        </div>
      );
    }
    return session ? (
      <AdminPage onNavigate={navigate} />
    ) : (
      <AdminLogin onNavigate={navigate} />
    );
  }

  return (
    <>
      <Navbar page={page} onNavigate={navigate} onOpenTrack={() => setTrackOpen(true)} />
      <main>
        {page === 'home' && <HomePage onNavigate={navigate} />}
        {page === 'menu' && <MenuPage />}
        {page === 'philosophy' && <PhilosophyPage onNavigate={navigate} />}
        {page === 'visit' && <VisitPage />}
        {page === 'reviews' && <ReviewsPage />}
      </main>
      <Footer onNavigate={navigate} />

      <CartDrawer onCheckout={() => setCheckoutOpen(true)} />
      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
      <TrackOrderModal open={trackOpen} onClose={() => setTrackOpen(false)} />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Shell />
      </CartProvider>
    </AuthProvider>
  );
}
