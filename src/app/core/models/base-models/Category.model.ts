export interface Category {
  id: number;
  name: string;
  description?: string;
  status: boolean;   // map from isActive
  icon?: string;
  color?: string;
}
