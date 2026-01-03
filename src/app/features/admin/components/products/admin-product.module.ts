import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AdminProductlistComponent } from './admin-productlist/admin-productlist.component';
import { AdminProductCategoriesComponent } from './admin-product-categories/admin-product-categories.component';
import { AdminProductRoutingModule } from './admin-product-routing.module';
// import { AdminModalComponent } from 'src/app/shared/componants/admin-modal/admin-modal.component';
import { AdminProductFormComponent } from './admin-product-form/admin-product-form.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { AdminProductColorsComponent } from './admin-product-colors/admin-product-colors.component';
import { AdminProductImageUploadComponent } from './admin-product-image/admin-product-image-upload.component';

@NgModule({
  declarations: [
    AdminProductlistComponent,
    AdminProductFormComponent,
    AdminProductCategoriesComponent,
    AdminProductColorsComponent,
    AdminProductImageUploadComponent
  

    // AdminModalComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    AdminProductRoutingModule,ReactiveFormsModule,
    SharedModule


  ]
})
export class AdminProductModule { }