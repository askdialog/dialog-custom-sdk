import { DIALOG_CUSTOM_EVENT, DialogEvent } from './types/events';

export class EventsHandler {
  constructor() {}

  public emitExternalEvent(
    type: DialogEvent['type'],
    payload?: DialogEvent['payload'],
  ): void {
    const event = new CustomEvent(DIALOG_CUSTOM_EVENT, {
      detail: { type, payload },
    });

    window.dispatchEvent(event);
  }
}
