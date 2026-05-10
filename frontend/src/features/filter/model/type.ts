export type SortOption =
  | "recommended"
  | "newest"
  | "top-selling"
  | "price-high-to-low"
  | "price-low-to-high";

export type PriceRange = {
  min: number;
  max: number;
};

export type FilterState = {
  brand?: string;
  category: string[];
  style: string[];
  color: string[];
  sortBy?: SortOption;
  priceRange: PriceRange;
};

export const PRICE_MIN = 0;
export const PRICE_MAX = 5000;

export const DEFAULT_FILTER: FilterState = {
  brand: undefined,
  category: [],
  style: [],
  color: [],
  sortBy: undefined,
  priceRange: { min: PRICE_MIN, max: PRICE_MAX },
};

export const FILTER_OPTIONS = {
  categories: ["Seating", "Beds", "Tables", "Storage", "Shelving", "Office", "Decor"],
  sortOptions: [
    { label: "Recommended", value: "recommended" as SortOption },
    { label: "Newest", value: "newest" as SortOption },
    { label: "Top Selling", value: "top-selling" as SortOption },
    { label: "Price: High–Low", value: "price-high-to-low" as SortOption },
    { label: "Price: Low–High", value: "price-low-to-high" as SortOption },
  ],
};

export const STYLE_OPTIONS = [
  {
    name: "Japandi",
    subtitle: "East meets West",
    imageUrl: "https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?w=120&h=120&fit=crop",
  },
  {
    name: "Modern",
    subtitle: "Sleek & Sophisticated",
    imageUrl: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=120&h=120&fit=crop",
  },
  {
    name: "Minimalist",
    subtitle: "Less is more",
    imageUrl: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=120&h=120&fit=crop",
  },
  {
    name: "Scandinavian",
    subtitle: "Cozy & Light",
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=120&h=120&fit=crop",
  },
  {
    name: "Boho",
    subtitle: "Eclectic & Free",
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=120&h=120&fit=crop",
  },
  {
    name: "Mid-Century",
    subtitle: "Retro Revival",
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=120&h=120&fit=crop",
  },
  {
    name: "Industrial",
    subtitle: "Raw & Edgy",
    imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=120&h=120&fit=crop",
  },
];

export const FLAT_COLOR_OPTIONS = [
  { name: "Warm Neutral", subtitle: "Beige, Cream, Sand", hex: "#D8C7A1" },
  { name: "Cool Neutral", subtitle: "Slate, Ash, Mist", hex: "#A9BDCA" },
  { name: "Vibrant", subtitle: "Cyan, Electric, Pop", hex: "#0097E6" },
  { name: "Earthy", subtitle: "Sage, Olive, Terracotta", hex: "#5D7A4F" },
  { name: "B & W", subtitle: "Monochrome, Ink", hex: "#1A1A1A" },
  { name: "Pastel", subtitle: "Soft Pink, Lavender", hex: "#FFB3C6" },
];

export const BRAND_OPTIONS = [
  { name: "IKEA", logoUrl: "https://logo.clearbit.com/ikea.com" },
  { name: "Amazon", logoUrl: "https://logo.clearbit.com/amazon.com" },
  { name: "Wayfair", logoUrl: "https://logo.clearbit.com/wayfair.com" },
];
