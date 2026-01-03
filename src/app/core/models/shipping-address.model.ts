export interface ShippingAddress {
  id?: number;
  addressLine: string;
  city: string;
  state: string;
  pincode: number;
  phone: number;
  isActive?: boolean;
}



//new