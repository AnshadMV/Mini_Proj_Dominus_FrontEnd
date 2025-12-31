// import { Injectable } from '@angular/core';
// import { CanActivate, Router } from '@angular/router';

// @Injectable({
//   providedIn: 'root'
// })
// export class AdminGuard implements CanActivate {

//   constructor(private router: Router) { }

//   // ✅ FIXED
//   canActivate(): boolean {
//     const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

//     console.log('AdminGuard checking user:', currentUser);
//     console.log('User role:', currentUser.role); // Add this for debugging

//     if (currentUser && currentUser.role === 'admin') {
//       console.log('Admin access granted');
//       return true;
//     } else {
//       console.log('Admin access denied - user role is:', currentUser.role);
//       this.router.navigate(['/app-home']); // Redirect to home instead of login
//       return false;
//     }
//   }
// }