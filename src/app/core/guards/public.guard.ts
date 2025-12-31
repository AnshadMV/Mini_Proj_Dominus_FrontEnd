import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PublicGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {

    return this.auth.getMyProfile().pipe(
      map(res => {
        // Profile exists → already logged in → block login page
        this.router.navigate(['/app-home']);
        return false;
      }),
      catchError(() => {
        // Not logged in → allow login/register
        return of(true);
      })
    );
  }
}
