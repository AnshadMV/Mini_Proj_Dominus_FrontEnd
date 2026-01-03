import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Color } from '../../models/base-models/Color.model';

@Injectable({
  providedIn: 'root'
})
export class ColorService {

  private baseUrl = "https://localhost:7121/api/Colors";

  constructor(private http: HttpClient) {}

  getAll(): Observable<Color[]> {
    return this.http.get<Color[]>(`${this.baseUrl}/GetAll`, { withCredentials: true });
  }

  create(data: Partial<Color>) {
    return this.http.post(`${this.baseUrl}/Admin/Create`, data, { withCredentials: true });
  }

  update(data: Partial<Color>) {
    return this.http.put(`${this.baseUrl}/Admin/Update`, data, { withCredentials: true });
  }

  toggle(id: number) {
    return this.http.patch(`${this.baseUrl}/Admin/toggle/status${id}`, {}, { withCredentials: true });
  }

  delete(id: number) {
    return this.http.delete(`${this.baseUrl}/Admin/Delete${id}`, { withCredentials: true });
  }

}
