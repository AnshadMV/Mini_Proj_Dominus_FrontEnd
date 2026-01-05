import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OrderService {
    private api = `${environment.API.BASE_URL}/Order`;

    constructor(private http: HttpClient) { }

    getMyOrders(): Observable<any[]> {
        return this.http
            .get<any>(`${this.api}/MyOrders`, { withCredentials: true })
            .pipe(map(res => res.data));
    }

    getAllOrders_Admin() {
        return this.http
            .get<any>(`${this.api}/Admin/GetAll_Orders`, { withCredentials: true })
            .pipe(
                map(res => {
                    // ✔ handle: { data: { items: [] } }
                    if (res?.data?.items) return res.data.items;

                    // ✔ handle: { items: [] }
                    if (res?.items) return res.items;

                    // ✔ handle: plain array
                    if (Array.isArray(res)) return res;

                    // ✔ fallback
                    return [];
                })
            );
    }


    toggleOrderStatus(orderId: number, status: string) {
        return this.http.patch<any>(
            `${this.api}/Admin/toggle/OrderStatus?orderId=${orderId}&status=${status}`,
            null,
            { withCredentials: true }
        );
    }
    cancelMyOrder(orderId: number) {
        return this.http.patch<any>(
            `${this.api}/Cancel?orderId=${orderId}`,
            null,
            { withCredentials: true }
        );
    }

}
