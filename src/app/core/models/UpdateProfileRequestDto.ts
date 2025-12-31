export interface UpdateProfileRequestDto {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  // Add shipping if extending backend
  shippingDetails?: {
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    phone?: string;
    email?: string;
  };
}