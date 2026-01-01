import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Category } from '../../models/base-models/Category.model';
@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  private baseUrl = environment.API.CATEGORYURL;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<any>(`${this.baseUrl}/Get_All`)
      .pipe(
        map(res => res.data as Category[])
      );
  }

  addCategory(category: Partial<Category>) {
    const body = {
      name: category.name,
      description: category.description ?? '',
      isActive: category.isActive ?? true
    };

    return this.http.post(`${this.baseUrl}/Admin/Create`, body);
  }

  updateCategory(category: Partial<Category>) {
    const body = {
      id: category.id,
      name: category.name,
      description: category.description ?? '',
      isActive: category.isActive
    };

    return this.http.put(`${this.baseUrl}/Admin/Update`, body);
  }

  deleteCategory(id: number) {
    return this.http.delete(`${this.baseUrl}/Admin/DeleteBy_${id}`);
  }

  toggleStatus(id: number) {
    return this.http.patch(`${this.baseUrl}/Admin/toggle/status${id}`, null);
  }
}
