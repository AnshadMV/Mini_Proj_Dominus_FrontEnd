// C:\Bridgeon\Basics\angular\firstProject\dominus\src\app\core\services\product.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { website_constants } from '../constants/app.constant';
import { Product } from '../models/product.model';
import { Category } from '../models/category.model';
import { environment } from 'src/environments/environment';


@Injectable({
    providedIn: 'root'
})
export class ProductService {

    private apiUrl = website_constants.API.PRODUCTURL;
    private prod_url = environment.API.PRODUCTURL;
    private categoryUrl = environment.API.CATEGORYURL;
    constructor(private http: HttpClient) { }
    getAllProducts(): Observable<Product[]> {
        return this.http.get<any>(`${this.prod_url}/GetAll`).pipe(
            map(res => res.data)
        );
    }
    getCategories(): Observable<Category[]> {
        return this.http.get<Category[]>(`${this.categoryUrl}/Get_All`);
    }
    filterProducts(params: any) {
        return this.http.get<any>(`${this.prod_url}/Filter_Sort`, { params })
            .pipe(map(res => res.data));
    }

    getProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(this.apiUrl);
    }
    getTopProducts(limit: number): Observable<Product[]> {
        return this.http.get<Product[]>(this.apiUrl + '?_limit=' + limit);
    }
    getAllColors() {
        return this.http.get<any>(`${environment.API.BASE_URL}/Colors/GetAll`);
    }

    getProductById(id: number): Observable<Product | undefined> {
        return this.http.get<Product[]>(this.apiUrl).pipe(
            map(products => products.find(product => product.id === id))
        );
    }
    updateProduct(id: number | string, product: any) {
        return this.http.put(`http://localhost:3000/products/${id}`, product);
    }
    deleteProduct(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`);
    }
    createProduct(product: any) {
        return this.http.post(this.apiUrl, product);
    }


}