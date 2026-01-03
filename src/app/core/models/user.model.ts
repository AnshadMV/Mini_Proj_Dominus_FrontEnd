
export interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  createdAt?: string;
  createdOn: string;
  role: string;
  // cart:string[];
  wishlist: string[];
  orders: string[];
  isBlocked?: boolean;
  blockedAt?: string;
  blockedReason?: string;
  RefreshTokenExpiryTime?: string;
  CreatedBy?: string;
  ModifiedOn?: string;
  ModifiedBy?: string;
  DeletedOn?: string;
  DeletedBy?: string;
  IsDeleted?: string;
  PasswordResetToken?: string;
  PasswordResetTokenExpiry?: string;

}



//new