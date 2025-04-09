import { Product } from './product';
import { Theme } from './theme';

export interface DialogConstructor {
  apiKey: string;
  locale: string;
  callbacks: {
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
  theme?: Theme;
  userId?: string;
}
