import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, filter, map, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.auth.getMyProfile().pipe(
      map(res => {
        return true;   // logged in → allow
      }),
      catchError(() => {
        this.router.navigate(['/app-login']);
        return of(false); // not logged → block
      })
    );
  }
}
