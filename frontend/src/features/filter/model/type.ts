// features/filter/model/type.ts

export type SortOption =
  | "newest"
  | "oldest"
  | "top-selling"
  | "price-high-to-low"
  | "price-low-to-high";

export type PriceRange = {
  min: number;
  max: number;
};

export type FilterState = {
  brand?: string;       // single select
  category: string[];   // multi select
  color: string[];      // multi select
  sortBy?: SortOption;  // single select
  priceRange: PriceRange;
};

export const PRICE_MIN = 50;
export const PRICE_MAX = 5000;

export const DEFAULT_FILTER: FilterState = {
  brand: undefined,
  category: [],
  color: [],
  sortBy: undefined,
  priceRange: { min: PRICE_MIN, max: PRICE_MAX },
};

export const FILTER_OPTIONS = {
  brands: [
    "IKEA",
    "Living Spaces",
    "BEKVÄM",
    "HEMNES",
    "NORBERG",
    "STEFAN",
    "SOLVINDEN",
  ],
  categories: [
    "Bedroom",
    "Living Room",
    "Dining Room",
    "Kitchen",
    "Office",
    "Outdoor",
  ],
  sortOptions: [
    { label: "Newest", value: "newest" as SortOption },
    { label: "Oldest", value: "oldest" as SortOption },
    { label: "Top Selling", value: "top-selling" as SortOption },
    { label: "Price: High to Low", value: "price-high-to-low" as SortOption },
    { label: "Price: Low to High", value: "price-low-to-high" as SortOption },
  ],
};

export const COLOR_GROUPS = [
  {
    label: "Neutral Tones",
    colors: ["White", "Cream/Ivory", "Beige", "Light Gray", "Dark Gray"],
  },
  {
    label: "Wood Tones",
    colors: ["Light Wood", "Medium Wood", "Dark Wood"],
  },
  {
    label: "Dark & Classic",
    colors: ["Black", "Charcoal", "Navy"],
  },
  {
    label: "Bold & Bright",
    colors: ["Red", "Blue", "Green", "Yellow"],
  },
  {
    label: "Earth Tones",
    colors: ["Brown", "Tan", "Terracotta"],
  },
];

// TEMP: brand image map for UI testing
export const BRAND_IMAGES: Record<string, string> = {
  IKEA: "https://picsum.photos/seed/ikea-brand/120/120",
  "Living Spaces": "https://picsum.photos/seed/livingspaces/120/120",
  "BEKVÄM": "https://picsum.photos/seed/bekvam/120/120",
  HEMNES: "https://picsum.photos/seed/hemnes/120/120",
  NORBERG: "https://picsum.photos/seed/norberg/120/120",
  STEFAN: "https://picsum.photos/seed/stefan/120/120",
  SOLVINDEN: "https://picsum.photos/seed/solvinden/120/120",
};
