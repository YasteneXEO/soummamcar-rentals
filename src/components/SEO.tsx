import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
}

/**
 * Dynamic head meta tag manager.
 * Updates document.title and meta tags for SEO.
 */
export function SEO({
  title = 'SoummamCar — Location de voitures à Béjaïa',
  description = 'Louez votre véhicule à Béjaïa, Algérie. Large flotte, réservation en ligne, service diaspora. Paiement CIB, Edahabia, Stripe.',
  canonical,
  ogImage = '/og-image.jpg',
  ogType = 'website',
  noindex = false,
}: SEOProps) {
  useEffect(() => {
    // Title
    document.title = title.includes('SoummamCar') ? title : `${title} | SoummamCar`;

    // Helper to create or update a meta tag
    const setMeta = (name: string, content: string, attr = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', description);
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:type', ogType, 'property');
    setMeta('og:image', ogImage, 'property');
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);

    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = canonical;
    }

    if (noindex) {
      setMeta('robots', 'noindex,nofollow');
    }
  }, [title, description, canonical, ogImage, ogType, noindex]);

  return null;
}
