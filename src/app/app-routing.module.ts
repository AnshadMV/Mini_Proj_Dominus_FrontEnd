import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './features/about/about.component';
import { HomeComponent } from './features/home/home.component';
import { NotFoundComponent } from './features/not-found/not-found.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { CartComponent } from './features/cart/cart.component';
import { WishlistComponent } from './features/wishlist/wishlist.component';
import { OrdersComponent } from './features/orders/orders.component';
// import { AuthGuard } from './core/guards/auth.guard';
import { ContactUsComponent } from './features/contact-us/contact-us.component';
import { PublicGuard } from './core/guards/public.guard';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';
import { PaymentComponent } from './features/payment/payment.component';
import { UserGuard } from './core/guards/user.guard';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';
// import { PublicGuard } from './core/guards/public.guard';

const routes: Routes = [
  {
    path: 'app-about',
    component: AboutComponent,
    // data: { title: 'Dominus' }
  },
  {
    path: 'app-login',
    component: LoginComponent,
    canActivate: [PublicGuard],


  },
  {
    path: 'app-register',
    component: RegisterComponent,
    canActivate: [PublicGuard],


  },
  {
    path: 'app-home',
    component: HomeComponent,
    // canActivate: [AuthGuard] 

  },

  {
    path: 'app-orders',
    component: OrdersComponent,
    canActivate: [AuthGuard, UserGuard]
  },
  {
    path: 'app-payment/:orderId',
    component: PaymentComponent,
    canActivate: [AuthGuard, UserGuard]

  }, { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },


  {
    path: 'app-wishlist',
    component: WishlistComponent,
    canActivate: [AuthGuard, UserGuard]

  },
  {
    path: 'app-cart',
    component: CartComponent,
    canActivate: [AuthGuard, UserGuard]
  },

  {
    path: 'app-contact-us',
    component: ContactUsComponent,
  },
  {
    path: 'products',
    loadChildren: () => import('./features/products/product.module').then(m => m.ProductModule),
    // canActivate: [AuthGuard]

  },
  {
    path: 'app-profile',
    loadChildren: () =>
      import('./features/profile/profile.module').then(m => m.ProfileModule),
    canActivate: [AuthGuard, UserGuard]
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.module').then(m => m.AdminModule),
    canActivate: [AdminGuard]
  },

  { path: '', redirectTo: '/app-home', pathMatch: 'full' },
  {
    path: '**',
    component: NotFoundComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
