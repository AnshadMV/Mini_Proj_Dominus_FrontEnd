// import { Injectable } from '@angular/core';
// import { CanActivate, Router, UrlTree } from '@angular/router';
// import { Observable, of } from 'rxjs';
// import { filter, map, switchMap, take, catchError } from 'rxjs/operators';
// import { AuthService } from '../services/auth.service';

// @Injectable({
//   providedIn: 'root'
// })
// export class UserGuard implements CanActivate {

//   constructor(
//     private auth: AuthService,
//     private router: Router
//   ) { }

//   canActivate(): Observable<boolean | UrlTree> {
//     return this.auth.isAuthenticated$.pipe(
//       filter(isAuth => isAuth !== null),
//       take(1),
//       switchMap(isAuth => {
//         if (!isAuth) {
//           return of(this.router.createUrlTree(['/app-login']));
//         }

//         return this.auth.getMyProfile().pipe(
//           map(response => {
//             if (response.statusCode === 200 && response.data) {
//               const userRole = response.data.role?.toLowerCase();
              
//               if (userRole === 'user' || userRole === 'admin') {
//                 return true;
//               } else {
//                 return this.router.createUrlTree(['/app-home']);
//               }
//             } else {
//               return this.router.createUrlTree(['/app-login']);
//             }
//           }),
//           catchError(err => {
//             console.error('UserGuard - Error:', err);
//             return of(this.router.createUrlTree(['/app-login']));
//           })
//         );
//       })
//     );
//   }
// }
