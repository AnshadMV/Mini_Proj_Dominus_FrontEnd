import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private api = environment.API.USERS;

  constructor(private http: HttpClient) {}

  getAllUsers() {
    return this.http.get<any>(this.api);
  }

  getUserById(id: number) {
    return this.http.get<any>(`${this.api}/${id}`);
  }

  blockUnblockUser(id: number) {
    return this.http.patch<any>(`${this.api}/block-unblock/${id}`, {});
  }

  softDeleteUser(id: number) {
    return this.http.delete<any>(`${this.api}/${id}`);
  }
}
