// C:\Bridgeon\Basics\angular\firstProject\dominus\src\app\core\services\product.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VideoServices } from '../models/homevideoservice.model';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})

export class HomeVideoService {

    private videoServicesUrl = `${environment.API.BASE_URL}/videoservices`;

    constructor(private http: HttpClient) { }


   getVideoServices(): Observable<VideoServices[]> {
    return this.http.get<VideoServices[]>(this.videoServicesUrl);
  }

  getFeaturedVideoServices(limit?: number): Observable<VideoServices[]> {
    const url = limit
      ? `${this.videoServicesUrl}/featured?limit=${limit}`
      : `${this.videoServicesUrl}/featured`;

    return this.http.get<VideoServices[]>(url);
  }
}