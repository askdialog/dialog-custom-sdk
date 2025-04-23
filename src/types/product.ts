export interface SimplifiedProductVariant {
  id: string;
  title?: string;
  displayName?: string;
  selectedOptions?: {
    name: string;
    value: string;
  }[];
  image?: {
    url?: string;
  } | null;
  inventoryQuantity?: number;
  price?: string;
  currencyCode?: string;
  compareAtPrice?: string | null;
  translations?: {
    key: string;
    value: string;
  }[];
}

export interface SimplifiedProductOption {
  translations?: {
    key: string;
    value: string;
  }[];
  values: string[];
  id: string;
  name: string;
  position: number;
}

export interface SimplifiedProduct {
  id: string;
  variantId?: string;
  title: string;
  descriptionHtml?: string;
  featuredImage?: {
    url?: string;
  } | null;
  totalInventory: number;
  variants: SimplifiedProductVariant[];
  options?: SimplifiedProductOption[];
  handle: string;
}
