import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Injectable({ providedIn: 'root' })
export class UserGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  canActivate(): Observable<boolean> {
    return this.auth.getMyProfile().pipe(
      map(res => {
        const user = res?.data;

        // Not logged in
        if (!user) {
          this.router.navigate(['/app-login']);
          return false;
        }

        // Blocked user
        if (user.isBlocked) {
          this.router.navigate(['/app-login']);
          return false;
        }

        // Check USER role
        if (user.role?.toLowerCase() === 'user') {
          return true;
        }

        // NOT USER
        this.toast.error("You don't have permission to access this page");
        this.router.navigate(['/app-home']);
        return false;
      }),
      catchError(() => {
        this.router.navigate(['/app-login']);
        return of(false);
      })
    );
  }
}
