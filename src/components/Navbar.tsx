import { useEffect, useState } from 'react';
import { Menu, X, ShoppingBag, MapPin, Phone, User } from 'lucide-react';

import type { Page } from '@/lib/pages';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { CrustLogo } from '@/components/CrustLogo';


const NAV: { id: Page; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'menu', label: 'Menu' },
  { id: 'philosophy', label: 'Philosophy' },
  { id: 'visit', label: 'Visit' },
  { id: 'reviews', label: 'Reviews' },
];



export function Navbar({
  page,
  onNavigate,
  onOpenTrack,
}: {
  page: Page;
  onNavigate: (p: Page) => void;
  onOpenTrack: () => void;
}) {


  const { count, open: openCart } = useCart();

  const { session, signOut } = useAuth();


  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);



  useEffect(() => {

    const onScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    onScroll();

    window.addEventListener(
      'scroll',
      onScroll,
      { passive:true }
    );


    return () => {
      window.removeEventListener(
        'scroll',
        onScroll
      );
    };


  }, []);




  const go = (p: Page) => {

    onNavigate(p);

    setMenuOpen(false);

    window.scrollTo({
      top:0,
      behavior:'smooth'
    });

  };



  const logout = async () => {

    await signOut();

    go('home');

  };




  return (

    <>


<header
className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
scrolled
? 'bg-cream/85 backdrop-blur-xl shadow-soft'
: 'bg-transparent'
}`}
>


<nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">


<button
onClick={() => go('home')}
className="group flex items-center gap-3"
>

<CrustLogo className="h-11 w-11 transition-transform duration-500 group-hover:rotate-[8deg]" />


<span className="flex flex-col items-start leading-none">

<span className="font-display text-xl font-700 tracking-tight text-crust-800">
Crust <span className="text-ocean-500">&</span> Crumb
</span>

<span className="font-script text-sm text-gold -mt-0.5">
artisan bakery
</span>

</span>

</button>





<div className="hidden items-center gap-1 lg:flex">

{NAV.map((item)=>(

<button
key={item.id}
onClick={() => go(item.id)}
className={`group relative px-4 py-2 text-sm font-medium transition-colors ${
page === item.id
? 'text-ocean-500'
: 'text-crust-700 hover:text-ocean-500'
}`}
>

{item.label}

<span
className={`absolute inset-x-3 -bottom-0.5 h-0.5 bg-ocean-500 transition-transform ${
page === item.id
? 'scale-x-100'
: 'scale-x-0 group-hover:scale-x-100'
}`}
/>

</button>

))}

</div>





<div className="flex items-center gap-2">


<button
onClick={onOpenTrack}
className="hidden rounded-full px-4 py-2 text-sm font-medium text-crust-700 hover:text-ocean-500 md:inline-flex"
>
Track Order
</button>



{/* ADMIN */}

<button
onClick={() => go('admin')}
className="flex h-10 w-10 items-center justify-center rounded-full text-crust-700 hover:bg-crust-100 hover:text-ocean-500"
title="Admin"
>
<User className="h-5 w-5"/>
</button>



{/* LOGOUT */}

{session && (

<button
onClick={logout}
className="hidden rounded-full px-4 py-2 text-sm font-medium text-crust-700 hover:text-red-500 md:inline-flex"
>
Logout
</button>

)}




<button
onClick={openCart}
className="relative flex h-11 w-11 items-center justify-center rounded-full bg-ocean-500 text-cream hover:bg-ocean-600"
>

<ShoppingBag className="h-5 w-5"/>


{count > 0 && (

<span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[11px] font-bold text-crust-900">

{count}

</span>

)}

</button>





<button
onClick={() => setMenuOpen(o=>!o)}
className="flex h-10 w-10 items-center justify-center rounded-full text-crust-800 lg:hidden"
>

{menuOpen
? <X className="h-6 w-6"/>
: <Menu className="h-6 w-6"/>
}

</button>


</div>


</nav>



<div
id="scroll-progress"
className="h-[3px] origin-left scale-x-0 bg-gradient-to-r from-gold via-ocean-400 to-ocean-600"
/>


</header>






<div className={`fixed inset-0 z-40 lg:hidden ${menuOpen ? '' : 'pointer-events-none'}`}>

<div
className={`absolute inset-0 bg-crust-900/40 transition-opacity ${
menuOpen ? 'opacity-100':'opacity-0'
}`}
onClick={()=>setMenuOpen(false)}
/>



<div
className={`absolute right-0 top-0 h-full w-72 bg-cream shadow-crust transition-transform ${
menuOpen ? 'translate-x-0':'translate-x-full'
}`}
>


<div className="flex flex-col gap-1 p-6 pt-24">


{NAV.map(item=>(

<button
key={item.id}
onClick={()=>go(item.id)}
className="rounded-2xl px-4 py-3 text-left font-display text-lg text-crust-800 hover:bg-crust-100"
>

{item.label}

</button>

))}



<button
onClick={()=>{
setMenuOpen(false);
onOpenTrack();
}}
className="rounded-2xl px-4 py-3 text-left font-display text-lg text-crust-800 hover:bg-crust-100"
>
Track Order
</button>




<button
onClick={()=>go('admin')}
className="rounded-2xl px-4 py-3 text-left font-display text-lg text-crust-800 hover:bg-crust-100"
>
Admin
</button>



{session && (

<button
onClick={logout}
className="rounded-2xl px-4 py-3 text-left font-display text-lg text-red-500 hover:bg-crust-100"
>
Logout
</button>

)}





<div className="mt-6 space-y-2 border-t border-crust-200 pt-6 text-sm text-crust-600">


<p className="flex items-center gap-2">
<MapPin className="h-4 w-4 text-ocean-500"/>
Calapan City, Oriental Mindoro
</p>


<p className="flex items-center gap-2">
<Phone className="h-4 w-4 text-ocean-500"/>
0995 114 1555
</p>


</div>


</div>


</div>

</div>


</>

);

}