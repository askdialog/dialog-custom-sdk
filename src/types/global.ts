import { Dialog } from '../Dialog';

declare global {
  interface Window {
    dialog?: {
      instance?: Dialog;
    };
  }
}

export {};
