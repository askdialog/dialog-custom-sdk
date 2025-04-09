import posthog, { PostHog } from 'posthog-js';
import { TrackingEvents } from './types/trackings';

export class Tracking {
  private _posthog: PostHog;
  private readonly _token = 'phc_EKMR6Jt4OTMEYmoUlz0v58KPwqcFxI7aZCLckpSD8Tv';
  private readonly _apiHost = 'https://eu.i.posthog.com';

  constructor(apiKey: string) {
    this._posthog = posthog.init(this._token, {
      api_host: this._apiHost,
    });
    this._posthog.identify(apiKey, {
      host: window.location.hostname,
    });
  }

  public track(
    event: TrackingEvents,
    properties?: Record<string, unknown>,
  ): void {
    this._posthog.capture(event, properties);
  }
}
