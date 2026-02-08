// features/filter/model/types.ts

export type PriceRange = {
  min: number;
  max: number;
};

export type FilterState = {
  brand?: string;
  category?: string;
  color?: string;
  style?: string;
  sort?: "newest" | "top-selling";
  priceRange: PriceRange;
};

export const DEFAULT_FILTER: FilterState = {
  brand: undefined,
  category: undefined,
  color: undefined,
  style: undefined,
  sort: undefined,
  priceRange: {
    min: 100,
    max: 5000,
  },
};
