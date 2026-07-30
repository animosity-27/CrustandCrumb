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


const validPages: Page[] = [
  'home',
  'menu',
  'philosophy',
  'visit',
  'reviews',
  'admin',
];


function Shell() {

  const { session, loading, getRole } = useAuth();


  const [page, setPage] = useState<Page>(() => {

    const saved = localStorage.getItem('currentPage') as Page;

    if (saved && validPages.includes(saved)) {
      return saved;
    }

    return 'home';

  });


  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);



  useEffect(() => {

    async function checkAdmin() {

      setCheckingRole(true);


      if (!session) {

        setIsAdmin(false);
        setCheckingRole(false);

        return;

      }


      const role = await getRole();


      setIsAdmin(role === 'admin');
      setCheckingRole(false);

    }


    checkAdmin();


  }, [session, getRole]);




  const navigate = (newPage: Page) => {

    localStorage.setItem(
      'currentPage',
      newPage
    );


    setPage(newPage);


    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

  };




  if (loading || checkingRole) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-ocean-900">

        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />

      </div>

    );

  }




  if (page === 'admin') {


    if (!session || !isAdmin) {

      return (

        <AdminLogin
          onNavigate={navigate}
        />

      );

    }


    return (

      <AdminPage
        onNavigate={navigate}
      />

    );

  }




  return (

    <>

      <Navbar
        page={page}
        onNavigate={navigate}
        onOpenTrack={() => setTrackOpen(true)}
      />


      <main>

        {page === 'home' &&
          <HomePage onNavigate={navigate}/>
        }


        {page === 'menu' &&
          <MenuPage/>
        }


        {page === 'philosophy' &&
          <PhilosophyPage onNavigate={navigate}/>
        }


        {page === 'visit' &&
          <VisitPage/>
        }


        {page === 'reviews' &&
          <ReviewsPage/>
        }

      </main>



      <Footer
        onNavigate={navigate}
      />



      <CartDrawer
        onCheckout={() => setCheckoutOpen(true)}
      />



      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />



      <TrackOrderModal
        open={trackOpen}
        onClose={() => setTrackOpen(false)}
      />

    </>

  );

}



export default function App() {

  return (

    <AuthProvider>

      <CartProvider>

        <Shell/>

      </CartProvider>

    </AuthProvider>

  );

}