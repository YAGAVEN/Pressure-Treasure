/**
 * Analytics tracking for debugging and monitoring
 */

interface AnalyticsEvent {
  name: string;
  timestamp: number;
  data?: Record<string, any>;
  userAgent: string;
}

const EVENTS_STORAGE_KEY = 'app_events';
const MAX_EVENTS = 100;

class Analytics {
  private events: AnalyticsEvent[] = [];

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Track an event
   */
  track(name: string, data?: Record<string, any>) {
    const event: AnalyticsEvent = {
      name,
      timestamp: Date.now(),
      data,
      userAgent: navigator.userAgent,
    };

    this.events.push(event);

    // Keep only latest events
    if (this.events.length > MAX_EVENTS) {
      this.events = this.events.slice(-MAX_EVENTS);
    }

    this.saveToStorage();
    console.log('[Analytics]', name, data);
  }

  /**
   * Track error
   */
  trackError(error: Error, context?: Record<string, any>) {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      ...context,
    });
  }

  /**
   * Get all events
   */
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  /**
   * Get events by name
   */
  getEventsByName(name: string): AnalyticsEvent[] {
    return this.events.filter(e => e.name === name);
  }

  /**
   * Clear events
   */
  clear() {
    this.events = [];
    localStorage.removeItem(EVENTS_STORAGE_KEY);
  }

  /**
   * Export events as JSON
   */
  exportAsJson(): string {
    return JSON.stringify(this.events, null, 2);
  }

  /**
   * Load events from storage
   */
  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(EVENTS_STORAGE_KEY);
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (err) {
      console.error('Failed to load events from storage:', err);
    }
  }

  /**
   * Save events to storage
   */
  private saveToStorage() {
    try {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(this.events));
    } catch (err) {
      console.error('Failed to save events to storage:', err);
    }
  }
}

export const analytics = new Analytics();

// Track common events
export function trackGameEvent(event: string, data?: Record<string, any>) {
  analytics.track(`game:${event}`, data);
}

export function trackAuthEvent(event: string, data?: Record<string, any>) {
  analytics.track(`auth:${event}`, data);
}

export function trackNetworkEvent(event: string, data?: Record<string, any>) {
  analytics.track(`network:${event}`, data);
}
