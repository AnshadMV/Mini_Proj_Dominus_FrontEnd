import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminProductlistComponent } from './admin-productlist/admin-productlist.component';
import { AdminProductFormComponent } from './admin-product-form/admin-product-form.component';
import { AdminProductCategoriesComponent } from './admin-product-categories/admin-product-categories.component';
import { AdminProductColorsComponent } from './admin-product-colors/admin-product-colors.component';
import { AdminProductImageUploadComponent } from './admin-product-image/admin-product-image-upload.component';

const routes: Routes = [
    {
        path: '',
        children: [
            { path: '', redirectTo: 'list', pathMatch: 'full' },
            { path: 'list', component: AdminProductlistComponent },
            { path: 'new', component: AdminProductFormComponent },
            { path: 'edit/:id', component: AdminProductFormComponent },
            { path: 'images', component: AdminProductImageUploadComponent },
            { path: 'categories', component: AdminProductCategoriesComponent },
            { path: 'colors', component: AdminProductColorsComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminProductRoutingModule { }