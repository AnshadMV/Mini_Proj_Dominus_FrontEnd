import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class CartService {
  private api = `${environment.API.BASE_URL}/cart`;

  constructor(private http: HttpClient) {}

  getMyCart(): Observable<any> {
    return this.http.get(`${this.api}/myCart`, {
      withCredentials: true
    });
  }

  addToCart(productId: number, quantity: number) {
    return this.http.post(
      `${this.api}/add`,
      { productId, quantity },
      { withCredentials: true }
    );
  }

  updateItem(cartItemId: number, quantity: number) {
    return this.http.put(
      `${this.api}/update`,
      { cartItemId, quantity },
      { withCredentials: true }
    );
  }

  removeItem(cartItemId: number) {
    return this.http.delete(
      `${this.api}/delete/${cartItemId}`,
      { withCredentials: true }
    );
  }

  clearCart() {
    return this.http.delete(`${this.api}/clear`, {
      withCredentials: true
    });
  }
}
