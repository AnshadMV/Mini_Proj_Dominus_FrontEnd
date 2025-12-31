import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/Responce_models/api-response.model';
import { environment } from 'src/environments/environment';
import { ShippingAddress } from '../models/shipping-address.model';


@Injectable({ providedIn: 'root' })


export class ShippingAddressService {
    private apiUrl = environment.API.SHIPPING_ADDRESS;

    constructor(private http: HttpClient) { }

    getMyAddresses() {
        return this.http.get<ApiResponse<ShippingAddress[]>>(
            `${this.apiUrl}/my`,
            { withCredentials: true }
        );
    }

    add(payload: ShippingAddress) {
        return this.http.post(
            `${this.apiUrl}/add`,
            payload,
            { withCredentials: true }
        );
    }

    update(id: number, payload: ShippingAddress) {
        return this.http.put(
            `${this.apiUrl}/update/${id}`,
            payload,
            { withCredentials: true }
        );
    }

    setActive(id: number) {
        return this.http.put(
            `${this.apiUrl}/set-active/${id}`,
            {},
            { withCredentials: true }
        );
    }
}
