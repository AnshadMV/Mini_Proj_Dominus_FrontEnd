import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class WishlistService {

  private baseUrl = `${environment.API.WISH_URL}`;

  constructor(private http: HttpClient) {}

  getMyWishlist() {
    return this.http.get<any>(`${this.baseUrl}/MyWishlist`, {
      withCredentials: true
    });
  }

  toggle(productId: number) {
    return this.http.post<any>(`${this.baseUrl}/Toggle/${productId}`, {}, {
      withCredentials: true
    });
  }

  clear() {
    return this.http.delete<any>(`${this.baseUrl}/Clear`, {
      withCredentials: true
    });
  }

}
