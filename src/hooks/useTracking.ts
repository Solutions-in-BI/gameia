import { useCallback } from "react";

type TrackingEvent = 
  | "view_pricing"
  | "view_product"
  | "view_usecases"
  | "view_security"
  | "view_contact"
  | "click_demo"
  | "click_cta"
  | "click_plan"
  | "submit_lead"
  | "submit_contact";

interface TrackingProperties {
  [key: string]: string | number | boolean | undefined;
}

export function useTracking() {
  const trackEvent = useCallback((event: TrackingEvent, properties?: TrackingProperties) => {
    // Log to console in development
    if (import.meta.env.DEV) {
      console.log(`[Tracking] ${event}`, properties);
    }

    // Push to dataLayer for Google Tag Manager (if configured)
    if (typeof window !== "undefined" && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event,
        ...properties,
      });
    }

    // Future: Add other analytics providers here
    // - Google Analytics 4
    // - Mixpanel
    // - Amplitude
    // - etc.
  }, []);

  const trackPageView = useCallback((pageName: string) => {
    trackEvent(`view_${pageName}` as TrackingEvent, { page: pageName });
  }, [trackEvent]);

  const trackCTAClick = useCallback((ctaName: string, location: string) => {
    trackEvent("click_cta", { cta: ctaName, location });
  }, [trackEvent]);

  const trackDemoClick = useCallback((source: string) => {
    trackEvent("click_demo", { source });
  }, [trackEvent]);

  const trackPlanClick = useCallback((planName: string) => {
    trackEvent("click_plan", { plan: planName });
  }, [trackEvent]);

  const trackLeadSubmit = useCallback((formType: string, properties?: TrackingProperties) => {
    trackEvent("submit_lead", { form: formType, ...properties });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackCTAClick,
    trackDemoClick,
    trackPlanClick,
    trackLeadSubmit,
  };
}
