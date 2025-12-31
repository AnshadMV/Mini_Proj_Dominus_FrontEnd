import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  private apiUrl = 'api/admin/auth';
  private isAuthenticated = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient) { }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (response.token && response.user.role === 'admin') {
          localStorage.setItem('admin_token', response.token);
          localStorage.setItem('admin_user', JSON.stringify(response.user));
          this.isAuthenticated.next(true);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('currentUser');
    this.isAuthenticated.next(false);
  }


  // ✅ FIXED
  getAdminUser(): any {
    const user = localStorage.getItem('currentUser'); // Fixed: using correct key
    return user ? JSON.parse(user) : null;
  }

  isAdminLoggedIn(): boolean {
    const user = this.getAdminUser();
    return user?.role === 'admin'; // Removed token check since you're using currentUser
  }

  getToken(): string | null {
    return localStorage.getItem('admin_token');
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('admin_token');
  }
}