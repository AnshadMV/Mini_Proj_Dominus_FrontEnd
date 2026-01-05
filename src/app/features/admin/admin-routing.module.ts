import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import { AdminGuard } from '../../core/guards/admin.guard';
import { AdminComponent } from './admin.component';
import { UsersComponent } from './components/users/users.component';
import { AdminOrdersComponent } from './components/orders/orders.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AdminGuard } from 'src/app/core/guards/admin.guard';
import { AdminProductModule } from './components/products/admin-product.module';
import { ProductListComponent } from '../products/product-list/product-list.component';
const routes: Routes = [
    {
        path: '',
        component: AdminComponent,
        // canActivate: [AdminGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard',
                 component: DashboardComponent,
                // loadChildren: () => import('./components/dashboard/dashboard.module').then(m => m.DashBoardModule),
                }, // Clean route
            {
                path: 'products',
                loadChildren: () => import('./components/products/admin-product.module').then(m => m.AdminProductModule),


            },
            // {
            //     path: 'products',
            //     loadChildren: () => import('./components/products/admin-product.module').then(m => m.AdminProductModule),
            // //    component: AdminProductModule

            // },
            // {
            //     path: 'products',
            //     children: [
            //         { path: '', component: ProductListComponent },
            //         { path: 'create', component: ProductListComponent },
            //         { path: ':id', component: ProductListComponent },
            //     ]
            // },
            {
                path: 'users',
                component: UsersComponent
            },
            {
                path: 'orders',
                component: AdminOrdersComponent
            },
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminRoutingModule { }