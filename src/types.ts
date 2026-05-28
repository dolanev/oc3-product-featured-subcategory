export const Settings = {
  pagingationPageSize: 15,
} as const;

export type Product = {
  productId: string;
  name: string;
  price: number;
  brand: string;
  status: boolean;
};

export type RawProduct = {
  product_id: `${number}`;
  name: string;
  model: string;
  price: string;
  status: '0' | '1';
  sku?: string;
  image?: string;
  manufacturer_id?: `${number}` | '' | null;
  quantity?: `${number}` | null;
};

export type CategorySelectedProducts =
  Window['ProductFeaturedSubcategoryConfig']['selectedProducts'];

export type TProductsResponse = RawProduct[];
