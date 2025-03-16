import { useEffect, useRef } from 'react';

export function useScrollAnimation() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Create intersection observer
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // Make elements visible as soon as they start entering the viewport
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          entry.target.classList.remove('invisible');
        }
      });
    }, {
      threshold: 0.1, // Trigger when 10% of element is visible
      rootMargin: '50px' // Start animation slightly before element enters viewport
    });

    // Get all elements with scroll-fade class
    const scrollElements = document.querySelectorAll('.scroll-fade');
    
    // Observe each element
    scrollElements.forEach((element) => {
      if (observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);
} 