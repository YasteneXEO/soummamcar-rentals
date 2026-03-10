/**
 * Analytics utilities for Google Analytics 4 and Facebook Pixel.
 * Called from components to track key events.
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}

// ─── Google Analytics 4 ────────────────────────────────────────
export function trackEvent(eventName: string, params?: Record<string, any>) {
  if (window.gtag) {
    window.gtag('event', eventName, params);
  }
}

export function trackPageView(path: string, title: string) {
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title,
    });
  }
}

// ─── Facebook Pixel ────────────────────────────────────────────
export function trackFbEvent(eventName: string, params?: Record<string, any>) {
  if (window.fbq) {
    window.fbq('track', eventName, params);
  }
}

// ─── Composite tracking for key business events ────────────────
export function trackBookingStarted(vehicleName: string, dailyRate: number) {
  trackEvent('begin_checkout', {
    currency: 'DZD',
    value: dailyRate,
    items: [{ item_name: vehicleName }],
  });
  trackFbEvent('InitiateCheckout', { content_name: vehicleName, currency: 'DZD', value: dailyRate });
}

export function trackBookingCompleted(reference: string, totalAmount: number) {
  trackEvent('purchase', {
    transaction_id: reference,
    currency: 'DZD',
    value: totalAmount,
  });
  trackFbEvent('Purchase', { currency: 'DZD', value: totalAmount });
}

export function trackVehicleViewed(vehicleName: string, dailyRate: number) {
  trackEvent('view_item', {
    currency: 'DZD',
    value: dailyRate,
    items: [{ item_name: vehicleName }],
  });
  trackFbEvent('ViewContent', { content_name: vehicleName });
}

export function trackWhatsAppClick() {
  trackEvent('whatsapp_click', { method: 'whatsapp' });
  trackFbEvent('Contact', { method: 'whatsapp' });
}
