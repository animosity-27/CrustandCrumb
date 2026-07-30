import { useEffect, useRef, useState } from 'react';

/**
 * Adds the `is-visible` class to any descendant element with the `reveal`
 * class as it scrolls into view. One observer per component tree.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const items = Array.from(root.querySelectorAll<HTMLElement>('.reveal'));
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return ref;
}

/** Tracks mouse position relative to an element for parallax effects. */
export function useMouseParallax<T extends HTMLElement = HTMLDivElement>(strength = 20) {
  const ref = useRef<T>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const node = el;

    function handle(e: MouseEvent) {
      const rect = node.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      setOffset({ x: dx * strength, y: dy * strength });
    }

    const reset = () => setOffset({ x: 0, y: 0 });
    node.addEventListener('mousemove', handle);
    node.addEventListener('mouseleave', reset);
    return () => {
      node.removeEventListener('mousemove', handle);
      node.removeEventListener('mouseleave', reset);
    };
  }, [strength]);

  return { ref, offset };
}

/** Returns scroll progress 0→1 of the whole page. */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return progress;
}

/** Live ticking clock. */
export function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}
