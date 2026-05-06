import { Product } from "./type";

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "mock-1",
    title: "Cloud Sofa",
    category: "Sofa",
    brand: "Nordic Home",
    style: "Modern",
    color: "Beige",
    price: 899,
    roomType: "Living Room",
    imageUrl:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
    productUrl: "https://example.com/products/cloud-sofa",
  },
  {
    id: "mock-2",
    title: "Oak Dining Table",
    category: "Table",
    brand: "Woodlane",
    style: "Scandinavian",
    color: "Oak",
    price: 640,
    roomType: "Dining Room",
    imageUrl:
      "https://images.unsplash.com/photo-1604578762246-41134e37f9cc?auto=format&fit=crop&w=1200&q=80",
    productUrl: "https://example.com/products/oak-dining-table",
  },
  {
    id: "mock-3",
    title: "Luna Accent Chair",
    category: "Chair",
    brand: "Atelier Seat",
    style: "Contemporary",
    color: "Terracotta",
    price: 320,
    roomType: "Living Room",
    imageUrl:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    productUrl: "https://example.com/products/luna-accent-chair",
  },
  {
    id: "mock-4",
    title: "Aster Bed Frame",
    category: "Bed",
    brand: "Quiet Nest",
    style: "Minimal",
    color: "Walnut",
    price: 740,
    roomType: "Bedroom",
    imageUrl:
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
    productUrl: "https://example.com/products/aster-bed-frame",
  },
  {
    id: "mock-5",
    title: "Arc Floor Lamp",
    category: "Lighting",
    brand: "Glowcraft",
    style: "Industrial",
    color: "Black",
    price: 145,
    roomType: "Bedroom",
    imageUrl:
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80",
    productUrl: "https://example.com/products/arc-floor-lamp",
  },
];

export type MockProductDetail = {
  colors: string[];
  specs: { label: string; value: string }[];
  description: string;
};

export const MOCK_PRODUCT_DETAILS: Record<string, MockProductDetail> = {
  "mock-1": {
    colors: ["#D8C7A1", "#8A8A8A", "#3D3D3D"],
    specs: [
      { label: "Dimensions", value: '86"W x 38"D x 34"H' },
      { label: "Weight", value: "185 lbs" },
      { label: "Material", value: "Feather Fill, Linen Blend" },
    ],
    description:
      "The Cloud Sofa envelops you in plush comfort with its signature oversized cushions and low-profile silhouette. Designed for long evenings and lazy mornings, it brings effortless warmth to any living room.",
  },
  "mock-2": {
    colors: ["#C19A6B", "#5C3D2E", "#F2F2F2"],
    specs: [
      { label: "Dimensions", value: '72"W x 36"D x 30"H' },
      { label: "Weight", value: "120 lbs" },
      { label: "Material", value: "Solid White Oak" },
    ],
    description:
      "The Oak Dining Table is crafted from solid white oak, its natural grain telling the story of decades of growth. Seats six comfortably and built to be passed down through generations.",
  },
  "mock-3": {
    colors: ["#C27251", "#D8C7A1", "#222222"],
    specs: [
      { label: "Dimensions", value: '30"W x 32"D x 34"H' },
      { label: "Weight", value: "45 lbs" },
      { label: "Material", value: "Solid Oak, Wool Fabric" },
    ],
    description:
      "The Luna Accent Chair balances organic geometry with uncompromising comfort. Its warm terracotta upholstery and sculpted oak frame make it a true centerpiece for any modern living space.",
  },
  "mock-4": {
    colors: ["#5C3D2E", "#D8C7A1", "#8A8A8A"],
    specs: [
      { label: "Dimensions", value: '62"W x 84"D x 48"H' },
      { label: "Weight", value: "95 lbs" },
      { label: "Material", value: "Walnut Veneer, Steel" },
    ],
    description:
      "The Aster Bed Frame combines clean minimal lines with the richness of walnut veneer. Its low-profile headboard and tapered steel legs bring a quiet sophistication to the bedroom.",
  },
  "mock-5": {
    colors: ["#222222", "#8A8A8A", "#C19A6B"],
    specs: [
      { label: "Height", value: "72 inches" },
      { label: "Weight", value: "12 lbs" },
      { label: "Material", value: "Powder-coated Steel" },
    ],
    description:
      "The Arc Floor Lamp casts a wide, even glow with its dramatic arching form. Industrial in spirit, refined in execution — it anchors any room with bold, functional elegance.",
  },
};
