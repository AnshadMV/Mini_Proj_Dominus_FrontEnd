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
        map(res => res.data.map((c: any) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          status: c.isActive,
          color: '#3498db',
          icon: 'https://via.placeholder.com/150'
        })))
      );
  }

  addCategory(category: Partial<Category>) {
    const body = {
      name: category.name,
      description: category.description ?? '',
      isActive: category.status ?? true
    };

    return this.http.post(`${this.baseUrl}/Admin/Create`, body);
  }

  updateCategory(id: number, category: Partial<Category>) {
    const body = {
      id: id,
      name: category.name,
      description: category.description ?? '',
      isActive: category.status
    };

    return this.http.put(`${this.baseUrl}/Admin/Update`, body);
  }

  deleteCategory(id: number) {
    return this.http.delete(`${this.baseUrl}/Admin/DeleteBy_${id}`);
  }
}
