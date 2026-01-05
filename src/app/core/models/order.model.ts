export interface Order {
  orderId: number;
  orderDate: string;
  status: string;
  totalAmount: number;
  shippingAddress: string; 
  orderDateRaw: Date;
  paymentMethod: string;
  items: {
    name: string;
    image: string;
    quantity: number;
    price: number;
    color: string;
    category: string;
  }[];
}
