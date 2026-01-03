import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { SharedModule } from "src/app/shared/shared.module";
import { DashBoardModule } from './components/dashboard/dashboard.module';
import { AdminFeatureModule } from './components/admin-feature.module';

@NgModule({
  declarations: [
    AdminComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AdminRoutingModule,
    FormsModule,
    SharedModule,DashBoardModule,AdminFeatureModule
  ],
})
export class AdminModule { }