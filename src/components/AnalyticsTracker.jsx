import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    // Only track on the production domain (protects against localhost and Vercel preview pollution)
    const hostname = window.location.hostname;
    if (hostname !== 'kosalai.in' && hostname !== 'www.kosalai.in') {
      return;
    }

    // Do not track admin routes to prevent admin usage from skewing customer metrics
    if (location.pathname.startsWith('/admin')) {
      return;
    }

    // Ensure gtag is defined (it's initialized in index.html)
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: location.pathname + location.search,
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  }, [location]); // Re-run effect whenever the route or search query changes

  return null; // This is a logic-only component, it renders nothing
}
