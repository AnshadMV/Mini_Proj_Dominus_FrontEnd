import { NgModule } from '@angular/core';
import { ProfileComponent } from './profile.component';
import { ProfileEditComponent } from './profile-edit-model/profile-edit.component';
import { PasswordEditComponent } from './password-edit-model/password-edit.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShippingAddressModalComponent } from './shipping-address-modal/shipping-address-modal.component';
import { RouterModule } from '@angular/router';
import { ProfileRoutingModule } from './profile-routing.module';

@NgModule({
  declarations: [
    ProfileComponent,
    ProfileEditComponent,
    PasswordEditComponent,
    ShippingAddressModalComponent,
  ],
  imports: [
    CommonModule, FormsModule, RouterModule,ProfileRoutingModule
  ],
  exports: [
    ProfileComponent, ProfileEditComponent
  ]
})
export class ProfileModule { }
