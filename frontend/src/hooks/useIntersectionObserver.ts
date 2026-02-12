import { useEffect, useState, type RefObject } from 'react';

export function useIntersectionObserver(
  elementRef: RefObject<Element | null>,
  { threshold = 0.1, root = null, rootMargin = '0px' }: IntersectionObserverInit = {}
): boolean {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const node = elementRef.current;
    if (!node) return;

    if (!('IntersectionObserver' in window)) {
      setIntersecting(true); // Fallback for older browsers
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIntersecting(true);
          observer.disconnect(); // Stop observing once visible to save resources
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [elementRef, threshold, root, rootMargin]);

  return isIntersecting;
}
