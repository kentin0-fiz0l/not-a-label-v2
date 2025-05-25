interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: Date;
  userId?: string;
  sessionId?: string;
}

interface PageViewEvent {
  path: string;
  referrer?: string;
  duration?: number;
}

class Analytics {
  private queue: AnalyticsEvent[] = [];
  private sessionId: string;
  private userId?: string;
  private isEnabled: boolean = true;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startHeartbeat();
    this.trackPageVisibility();
  }

  // Initialize analytics with user consent
  init(options: { userId?: string; enableTracking?: boolean }) {
    this.userId = options.userId;
    this.isEnabled = options.enableTracking ?? true;
    
    // Initialize third-party analytics if enabled
    if (this.isEnabled && typeof window !== 'undefined') {
      // Google Analytics
      if (process.env.NEXT_PUBLIC_GA_ID) {
        this.initGoogleAnalytics();
      }
      
      // Mixpanel
      if (process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
        this.initMixpanel();
      }
    }
  }

  // Track custom events
  track(eventName: string, properties?: Record<string, any>) {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      name: eventName,
      properties,
      timestamp: new Date(),
      userId: this.userId,
      sessionId: this.sessionId,
    };

    this.queue.push(event);
    this.sendEvent(event);
  }

  // Track page views
  trackPageView(page: string, properties?: Record<string, any>) {
    this.track('page_view', {
      path: page,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      ...properties,
    });
  }

  // Track user interactions
  trackClick(elementId: string, properties?: Record<string, any>) {
    this.track('click', {
      element_id: elementId,
      ...properties,
    });
  }

  // Track form submissions
  trackFormSubmit(formName: string, properties?: Record<string, any>) {
    this.track('form_submit', {
      form_name: formName,
      ...properties,
    });
  }

  // Track errors
  trackError(error: Error, properties?: Record<string, any>) {
    this.track('error', {
      error_message: error.message,
      error_stack: error.stack,
      ...properties,
    });
  }

  // Track timing events
  trackTiming(category: string, variable: string, time: number) {
    this.track('timing', {
      timing_category: category,
      timing_variable: variable,
      timing_value: time,
    });
  }

  // Music-specific tracking
  trackPlayback(trackId: string, duration: number, completed: boolean) {
    this.track('track_playback', {
      track_id: trackId,
      duration,
      completed,
      completion_rate: completed ? 100 : (duration / 30) * 100, // Assume 30s preview
    });
  }

  trackUpload(trackId: string, fileSize: number, duration: number) {
    this.track('track_upload', {
      track_id: trackId,
      file_size: fileSize,
      upload_duration: duration,
      upload_speed: fileSize / duration,
    });
  }

  trackShare(contentType: string, contentId: string, platform: string) {
    this.track('share', {
      content_type: contentType,
      content_id: contentId,
      share_platform: platform,
    });
  }

  // E-commerce tracking
  trackRevenue(amount: number, currency: string, source: string) {
    this.track('revenue', {
      amount,
      currency,
      source,
    });
  }

  // User properties
  setUserProperties(properties: Record<string, any>) {
    if (!this.isEnabled || !this.userId) return;

    // Send to analytics providers
    if (typeof window !== 'undefined') {
      // Mixpanel
      if ((window as any).mixpanel) {
        (window as any).mixpanel.people.set(properties);
      }
      
      // Google Analytics
      if ((window as any).gtag) {
        (window as any).gtag('set', 'user_properties', properties);
      }
    }
  }

  // Private methods
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private sendEvent(event: AnalyticsEvent) {
    // Send to internal analytics API
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    }).catch(console.error);

    // Send to third-party providers
    if (typeof window !== 'undefined') {
      // Google Analytics
      if ((window as any).gtag) {
        (window as any).gtag('event', event.name, event.properties);
      }
      
      // Mixpanel
      if ((window as any).mixpanel) {
        (window as any).mixpanel.track(event.name, event.properties);
      }
    }
  }

  private startHeartbeat() {
    if (typeof window === 'undefined') return;

    // Track engagement time
    let startTime = Date.now();
    let totalTime = 0;

    setInterval(() => {
      if (document.visibilityState === 'visible') {
        totalTime += Date.now() - startTime;
        this.track('heartbeat', {
          session_duration: totalTime,
          page_path: window.location.pathname,
        });
      }
      startTime = Date.now();
    }, 30000); // Every 30 seconds
  }

  private trackPageVisibility() {
    if (typeof document === 'undefined') return;

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.track('page_hidden', {
          page_path: window.location.pathname,
        });
      } else {
        this.track('page_visible', {
          page_path: window.location.pathname,
        });
      }
    });
  }

  private initGoogleAnalytics() {
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`;
    script.async = true;
    document.head.appendChild(script);

    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]) {
      (window as any).dataLayer.push(args);
    }
    gtag('js', new Date());
    gtag('config', process.env.NEXT_PUBLIC_GA_ID);
  }

  private initMixpanel() {
    // Mixpanel initialization code
    (function(f: any, b: any) {
      if (!b.__SV) {
        var e: any, g: any, i: any, h: any;
        window.mixpanel = b;
        b._i = [];
        b.init = function(e: any, f: any, c: any) {
          // Mixpanel init implementation
        };
        // ... rest of Mixpanel snippet
      }
    })(document, (window as any).mixpanel || []);
    
    (window as any).mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN);
  }
}

// Export singleton instance
export const analytics = new Analytics();

// React hooks for analytics
export function useAnalytics() {
  return analytics;
}

// HOC for tracking page views
export function withPageTracking<P extends object>(
  Component: React.ComponentType<P>,
  pageName: string
) {
  return function TrackedComponent(props: P) {
    React.useEffect(() => {
      analytics.trackPageView(pageName);
    }, []);

    return <Component {...props} />;
  };
}