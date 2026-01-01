import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router,
    private toast : ToastService
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

        // Check Admin Role
        if (user.role?.toLowerCase() === 'admin') {
          return true;
        }

        // NOT ADMIN
        console.log("Yuo can't have permission")
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
