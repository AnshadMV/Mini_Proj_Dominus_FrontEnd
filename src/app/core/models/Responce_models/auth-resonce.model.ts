export interface AuthResponse <T = any>{
  statusCode: number;
  message: string;
  accessToken?: string;
  refreshToken?: string;
   data?: T;
}
