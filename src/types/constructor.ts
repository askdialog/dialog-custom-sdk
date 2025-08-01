import { SimplifiedProduct } from './product';
import { Theme } from './theme';

export interface DialogConstructor {
  apiKey: string;
  locale: string;
  callbacks: {
    addToCart: ({
      productId,
      quantity,
      variantId,
    }: {
      productId: string;
      quantity: number;
      variantId?: string;
    }) => Promise<void>;
    getProduct: (
      productId: string,
      variantId?: string,
    ) => Promise<SimplifiedProduct>;
  };
  theme?: Partial<Theme>;
  userId?: string;
}
