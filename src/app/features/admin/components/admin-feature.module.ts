import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DashBoardModule } from './dashboard/dashboard.module';
import { AdminOrdersComponent } from './orders/orders.component';
import { UsersComponent } from './users/users.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
    declarations: [
        UsersComponent,
        AdminOrdersComponent,
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule, FormsModule,

        FormsModule, DashBoardModule, SharedModule
    ],

})
export class AdminFeatureModule { }