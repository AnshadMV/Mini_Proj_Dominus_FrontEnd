export interface OrderItem {
  productId: number;
  productName: string;
  productImages: string[];
  quantity: number;
  price: number;
  colorName: string;
  category?: string;
}

