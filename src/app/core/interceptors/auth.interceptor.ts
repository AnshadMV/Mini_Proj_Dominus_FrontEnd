// import { Injectable } from '@angular/core';
// import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
// import { Observable, throwError } from 'rxjs';
// import { catchError, switchMap } from 'rxjs/operators';
// import { AuthService } from '../services/auth.service';
// import { Router } from '@angular/router';
// @Injectable()
// export class AuthInterceptor implements HttpInterceptor {

//   private isRefreshing = false;

//   constructor(private auth: AuthService) {}

//   intercept(req: HttpRequest<any>, next: HttpHandler) {

//     const isPublic =
//       req.url.includes('/login') ||
//       req.url.includes('/register') ||
//       req.url.includes('/forgotPassword') ||
//       req.url.includes('/resetPassword') ||
//       req.url.includes('/Token/Refresh-Access');
//        req.url.includes('/myProfile');

//     const request = isPublic
//       ? req
//       : req.clone({ withCredentials: true });

//     return next.handle(request).pipe(
//       catchError((err: HttpErrorResponse) => {

//         if (err.status === 401 && !isPublic && !this.isRefreshing) {
//           this.isRefreshing = true;

//           return this.auth.refreshAccessToken().pipe(
//             switchMap(res => {
//               this.isRefreshing = false;

//               // 🔴 IMPORTANT CHECK
//               if (!res || res.statusCode !== 200) {
//                 this.auth.forceLogout();
//                 return throwError(() => err);
//               }

//               // retry original request
//               return next.handle(request);
//             }),
//             catchError(() => {
//               this.isRefreshing = false;
//               this.auth.forceLogout();
//               return throwError(() => err);
//             })
//           );
//         }

//         return throwError(() => err);
//       })
//     );
//   }
// }
