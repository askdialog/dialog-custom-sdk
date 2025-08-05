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
  GenericQuestionPayload,
  OpenAssistantPayload,
  ProductQuestionPayload,
} from './types/events';
import { SimplifiedProduct } from './types/product';
import { EventsHandler } from './EventsHandler';
import { Tracking } from './Tracking';
import { TrackingEvents } from './types/trackings';
import { loadSuggestions } from './services/suggestions';
import { config } from './config';
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
      variantId?: string;
      quantity: number;
    }) => Promise<void>;
    getProduct: (
      productId: string,
      variantId?: string,
    ) => Promise<SimplifiedProduct>;
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
    window.dialog = {
      instance: this,
    };
    this._loadAssistant();
  }

  public get apiKey(): string {
    return this._apiKey;
  }
  public get theme(): Theme {
    return this._theme;
  }
  public get userId(): string {
    return this._userId;
  }
  public get locale(): string {
    return this._locale;
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
    return loadSuggestions(this._apiKey, this._locale, productId);
  }

  // TODO: Not yet implemented on assistant
  public openAssistant(params: OpenAssistantPayload): void {
    this._eventsHandler.emitExternalEvent(DialogEvents.OPEN_ASSISTANT, params);
  }

  // TODO: Not yet implemented on assistant
  public closeAssistant(): void {
    this._eventsHandler.emitExternalEvent(DialogEvents.CLOSE_ASSISTANT);
  }

  public sendProductMessage(params: ProductQuestionPayload): void {
    this._eventsHandler.emitExternalEvent(DialogEvents.SEND_MESSAGE, params);
  }

  public sendGenericMessage(params: GenericQuestionPayload): void {
    this._eventsHandler.emitExternalEvent(
      DialogEvents.SEND_GENERIC_QUESTION,
      params,
    );
  }

  public getProduct(
    productId: string,
    variantId?: string,
  ): Promise<SimplifiedProduct> {
    return this._callbacks.getProduct(productId, variantId);
  }

  public async addToCart({
    productId,
    quantity,
    variantId,
  }: {
    productId: string;
    quantity: number;
    variantId?: string;
  }): Promise<void> {
    await this._callbacks.addToCart({ productId, variantId, quantity });
    this.registerAddToCartEvent({ productId, variantId, quantity });
    return;
  }

  public registerAddToCartEvent({
    productId,
    variantId,
    quantity,
  }: {
    productId: string;
    variantId?: string;
    quantity: number;
  }): void {
    this._tracking.track(TrackingEvents.USER_ADDED_TO_CART, {
      user_id: this._userId,
      product_id: productId,
      variant_id: variantId,
      quantity,
      locale: this._locale,
    });
  }

  public registerSubmitCheckoutEvent({
    productId,
    variantId,
    quantity,
  }: {
    productId: string;
    variantId?: string;
    quantity: number;
  }): void {
    this._tracking.track(TrackingEvents.USER_SUBMITTED_CHECKOUT, {
      user_id: this._userId,
      product_id: productId,
      variant_id: variantId,
      quantity,
      locale: this._locale,
    });
  }

  private _loadAssistant(): void {
    const localeInfo = getDetailedLocaleInfo(this._locale);

    if (localeInfo === null) {
      console.error('Missing locale information');

      return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.defer = true;
    script.async = true;
    script.type = 'module';
    script.src = config.assistantUrl;
    document.head.insertBefore(script, document.head.firstChild);

    const div = document.createElement('div');
    div.id = 'dialog-shopify-ai';
    div.dataset.shopIsoCode = this._locale;
    div.dataset.apiKey = this._apiKey;
    div.dataset.userId = this._userId;
    div.dataset.countryCode = localeInfo.countryCode;
    div.dataset.language = localeInfo.language;
    document.body.appendChild(div);
  }
}
