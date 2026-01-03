import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, map } from 'rxjs';
import { User } from '../models/user.model';

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private api = environment.API.USERS;
  constructor(private http: HttpClient) { }

  getAllUsers(): Observable<User[]> {
    return this.http
      .get<ApiResponse<User[]>>(`${this.api}/GetAll`, { withCredentials: true })
      .pipe(map(res => res.data));
  }

  getUserById(id: number): Observable<User> {
    return this.http
      .get<ApiResponse<User>>(`${this.api}/GetBy_${id}`, { withCredentials: true })
      .pipe(map(res => res.data));
  }

  blockUnblockUser(id: number) {
    return this.http.put(
      `${this.api}/Toggle/Block_Unblock?id=${id}`,
      {},
      { withCredentials: true }
    );
  }

  softDeleteUser(id: number) {
    return this.http.delete(
      `${this.api}/DeleteBy_${id}`,
      { withCredentials: true }
    );
  }
}
