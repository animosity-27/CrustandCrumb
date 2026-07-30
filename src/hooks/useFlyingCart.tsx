import { useCallback, useState } from 'react';

type FlyingItem = {
  id: number;
  startX: number;
  startY: number;
  image: string;
};

let counter = 0;

/** Animates a product image flying from a click point to the cart icon. */
export function useFlyingCart() {
  const [flyers, setFlyers] = useState<FlyingItem[]>([]);

  const launch = useCallback((startX: number, startY: number, image: string) => {
    const id = ++counter;
    setFlyers((prev) => [...prev, { id, startX, startY, image }]);
    window.setTimeout(() => {
      setFlyers((prev) => prev.filter((f) => f.id !== id));
    }, 900);
  }, []);

  return { flyers, launch };
}

export function FlyingCartLayer({ flyers }: { flyers: FlyingItem[] }) {
  // Cart icon sits top-right ~ around x: viewport-90, y: 56
  return (
    <div className="pointer-events-none fixed inset-0 z-[70]">
      {flyers.map((f) => (
        <FlyingDot key={f.id} item={f} />
      ))}
    </div>
  );
}

function FlyingDot({ item }: { item: FlyingItem }) {
  const targetX = window.innerWidth - 56;
  const targetY = 56;

  return (
    <div
      className="absolute h-16 w-16 overflow-hidden rounded-full bg-crust-100 shadow-crust"
      style={{
        left: item.startX,
        top: item.startY,
        animation: `fly-to-cart 0.9s cubic-bezier(0.5, -0.3, 0.9, 0.6) forwards`,
        // CSS variables consumed by the keyframes below
        ['--start-x' as string]: `${item.startX}px`,
        ['--start-y' as string]: `${item.startY}px`,
        ['--end-x' as string]: `${targetX}px`,
        ['--end-y' as string]: `${targetY}px`,
      } as React.CSSProperties}
    >
      <img src={item.image} alt="" className="h-full w-full object-cover" />
    </div>
  );
}
