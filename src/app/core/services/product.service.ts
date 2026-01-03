// C:\Bridgeon\Basics\angular\firstProject\dominus\src\app\core\services\product.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { website_constants } from '../constants/app.constant';
import { Product } from '../models/product.model';
import { environment } from 'src/environments/environment';
import { Category } from '../models/base-models/Category.model';


@Injectable({
    providedIn: 'root'
})
export class ProductService {

    private prod_url = environment.API.PRODUCTURL;

    constructor(private http: HttpClient) { }

    getAllProducts(): Observable<Product[]> {
        return this.http.get<any>(`${this.prod_url}/GetAll`).pipe(
            map(res => res.data)
        );
    }

    filterProducts(params: any) {
        return this.http.get<any>(`${this.prod_url}/Filter_Sort`, { params })
            .pipe(map(res => res.data));
    }

    getProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(this.prod_url);
    }
    getTopProducts(limit: number): Observable<Product[]> {
        return this.http.get<Product[]>(this.prod_url + '?_limit=' + limit);
    }
    getAllColors() {
        return this.http.get<any>(`${environment.API.BASE_URL}/Colors/GetAll`);
    }

    getProductById(id: number): Observable<Product | undefined> {
        return this.http.get<Product[]>(this.prod_url).pipe(
            map(products => products.find(product => product.id === id))
        );
    }


    createProduct(product: any) {
        const form = this.buildForm(product);
        return this.http.post(
            `${this.prod_url}/Admin/Create`,
            form,
            { withCredentials: true }
        );
    }

    searchProducts(term: string, page = 1, pageSize = 10) {
        return this.http.get<any>(
            `${environment.API.PRODUCTURL}/Search`,
            {
                params: { search: term, page, pageSize },
                withCredentials: true
            }
        );
    }
    addImages(productId: number, files: File[]) {
        const form = new FormData();
        form.append('ProductId', productId.toString());

        files.forEach(f => {
            form.append('Images', f);
        });

        return this.http.post(
            `${this.prod_url}/Admin/AddImages`,
            form,
            { withCredentials: true }
        );
    }

    updateProduct(dto: any) {

        const formData = new FormData();

        formData.append('Id', String(dto.id));
        formData.append('Name', dto.name ?? '');
        formData.append('Description', dto.description ?? '');
        formData.append('Price', String(dto.price ?? 0));
        formData.append('CurrentStock', String(dto.currentStock ?? 0));
        formData.append('CategoryId', String(dto.categoryId ?? 0));

        formData.append('IsActive', String(!!dto.isActive));
        formData.append('Status', String(!!dto.status));
        formData.append('TopSelling', String(!!dto.topSelling));

        formData.append('Warranty', dto.warranty ?? '');

        (dto.colorIds || []).forEach((id: number) => {
            formData.append('ColorIds', String(id));
        });

        if (dto.files && dto.files.length) {
            dto.files.forEach((f: File) => {
                formData.append('Images', f);
            });
        }

        return this.http.put(
            // `https://localhost:7121/api/Products/Admin/Update`,
            `${this.prod_url}/Admin/Update`,
            formData,
            { withCredentials: true }
        );
    }


    deleteProduct(id: number): Observable<any> {
        return this.http.delete(
            `${this.prod_url}/Admin/Delete/${id}`,
            { withCredentials: true }
        );
    }


    private buildForm(p: any): FormData {
        const fd = new FormData();

        fd.append('Name', p.name);
        fd.append('Description', p.description ?? '');
        fd.append('Price', p.price.toString());
        fd.append('CategoryId', p.categoryId.toString());
        fd.append('CurrentStock', p.currentStock.toString());
        fd.append('IsActive', String(p.isActive));
        fd.append('TopSelling', String(p.topSelling));
        fd.append('Status', String(p.status ?? true));   // ✅ ADD THIS

        if (p.warranty) {
            fd.append('Warranty', p.warranty);
        }

        // Colors (IDs only)
        (p.colorIds || []).forEach((id: number) => {
            fd.append('ColorIds', id.toString());
        });

        // Images
        (p.files || []).forEach((file: File) => {
            fd.append('Images', file);
        });

        return fd;
    }



}