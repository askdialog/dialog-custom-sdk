import { uuidv7 } from 'uuidv7';
import { defaultTheme } from './constants/theme';
import { DialogConstructor } from './types/constructor';
import { Theme } from './types/theme';
import {
  DetailedLocaleInfo,
  getDetailedLocaleInfo,
} from './utils/localization';
import { ANONYMOUS_CUSTOMER_ID, CUSTOMER_ID } from './constants/user';
import { Suggestion } from './types/suggestion';
import {
  DialogEvents,
  OpenAssistantPayload,
  ProductQuestionPayload,
} from './types/events';
import { Product } from './types/product';
import { EventsHandler } from './EventsHandler';
import { Tracking } from './Tracking';
import { TrackingEvents } from './types/trackings';
export class Dialog {
  private _apiKey: string;
  private _locale: string;

  private _callbacks: {
    addToCart: ({
      productId,
      variantId,
      quantity,
    }: {
      productId: string;
      variantId: string;
      quantity: number;
    }) => Promise<void>;
    getProduct: (productId: string, variantId: string) => Promise<Product>;
  };
  private _theme: Theme;
  private _userId: string;
  private _eventsHandler: EventsHandler;
  private _tracking: Tracking;

  constructor({ apiKey, locale, callbacks, theme, userId }: DialogConstructor) {
    this._apiKey = apiKey;
    this._locale = locale;
    this._callbacks = callbacks;
    this._theme = { ...defaultTheme, ...theme };
    this._userId = this._createOrRetrieveUserId(userId);
    this._eventsHandler = new EventsHandler();
    this._tracking = new Tracking(apiKey);
  }

  public get theme(): Theme {
    return this._theme;
  }
  public get userId(): string {
    return this._userId;
  }

  public getLocalizationInformations(): DetailedLocaleInfo | null {
    return getDetailedLocaleInfo(this._locale);
  }

  private _createOrRetrieveUserId(userId?: string): string {
    if (userId !== undefined) {
      localStorage.setItem(CUSTOMER_ID, userId);

      return userId;
    }

    const existingAnonymousUserId = localStorage.getItem(ANONYMOUS_CUSTOMER_ID);
    if (existingAnonymousUserId !== null) {
      return existingAnonymousUserId;
    }

    const newUserId = uuidv7();
    localStorage.setItem(ANONYMOUS_CUSTOMER_ID, newUserId);

    return newUserId;
  }

  public async getSuggestions(productId: string): Promise<Suggestion> {
    const pagePath = window.location.pathname.split('?')[0];

    const response = await fetch(
      `/apps/dialog/ai/product-questions?pagePath=${pagePath}&locale=${this._locale}&productId=${
        productId
      }`,
      {
        headers: {
          Authorization: this._apiKey,
        },
      },
    );
    const data = await response.json();

    return data as Suggestion;
  }

  public openAssistant(params: OpenAssistantPayload): void {
    this._eventsHandler.emitExternalEvent(DialogEvents.OPEN_ASSISTANT, params);
  }

  public closeAssistant(): void {
    this._eventsHandler.emitExternalEvent(DialogEvents.CLOSE_ASSISTANT);
  }

  public sendMessage(params: ProductQuestionPayload): void {
    this._eventsHandler.emitExternalEvent(DialogEvents.SEND_MESSAGE, params);
  }

  public getProduct(productId: string, variantId: string): Promise<Product> {
    return this._callbacks.getProduct(productId, variantId);
  }

  public addToCart({
    productId,
    variantId,
    quantity,
  }: {
    productId: string;
    variantId: string;
    quantity: number;
  }): Promise<void> {
    return this._callbacks.addToCart({ productId, variantId, quantity });
  }

  public registerAddToCartEvent({
    productId,
    variantId,
    quantity,
  }: {
    productId: string;
    variantId: string;
    quantity: number;
  }): void {
    this._tracking.track(TrackingEvents.USER_ADDED_TO_CART, {
      product_id: productId,
      variant_id: variantId,
      quantity,
    });
  }

  public registerSubmitCheckoutEvent(): void {
    this._tracking.track(TrackingEvents.USER_SUBMITTED_CHECKOUT);
  }
}
