export interface WishlistItem {
  productId: number;
  productName: string;
  price: number;
  currentStock: number;
  topSelling: boolean;
  images: string[];
  category?: string;
  colors:string;
}
