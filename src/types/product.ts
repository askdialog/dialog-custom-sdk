export interface Product {
  id: string;
  title: string;
  handle: string;
  variants: {
    id: string;
    title: string;
    price: number;
    compareAtPrice: number;
    availableQuantity: number;
    image: {
      src: string;
    };
  }[];
}
