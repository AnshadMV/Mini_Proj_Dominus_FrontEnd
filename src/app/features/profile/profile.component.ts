import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ShippingAddress } from 'src/app/core/models/shipping-address.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { ShippingAddressService } from 'src/app/core/services/shipping-address.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.component.html',
  styleUrls: ['profile.component.css']
})
export class ProfileComponent implements OnInit {
  userData: any;
  userName: string = ''
  userId: string | number = ''
  userEmail: string = ''
  userRole: string = ''
  userPassword: string = ''
  userSignedTime: string = ''
  showModal: boolean = false;
  showPasswordModal: boolean = false;
  showShippingModal: boolean = false;


  shippingAddresses: ShippingAddress[] = [];
  activeShipping: ShippingAddress | null = null;



  constructor(
    private router: Router,
    private toast: ToastService,
    private auth: AuthService,
    private shippingService: ShippingAddressService
  ) { }



  ngOnInit(): void {
    this.auth.getMyProfile().subscribe({
      next: res => {
        const user = res.data;

        this.userData = user;       // 👈 Store whole profile here
        this.userName = user.name;
        this.userId = user.id;
        this.userEmail = user.email;
        this.userRole = user.role;
        this.userSignedTime = user.createdOn;

        this.loadShippingAddresses();

      },
      error: () => {
        this.toast.error('Session expired');
        this.router.navigate(['/app-login']);
      }
    });



  }


  openModal() {
    this.showModal = true;
  }
  openPasswordModal() {
    this.showPasswordModal = true
  }
  openShippingModal() {
    this.showShippingModal = true;
  }
  closeModal() {
    this.showModal = false;
  }
  closePasswordModal() {
    this.showPasswordModal = false
  }
  closeShippingModal() {
    this.showShippingModal = false;
  }
  onUserUpdate(payload: { name: string }) {
    this.auth.updateProfile(payload).subscribe({
      next: () => {
        this.toast.success('Profile updated successfully');

        this.auth.getMyProfile().subscribe(res => {
          const user = res.data;
          this.userData = user;
          this.userName = user.name;
          this.userEmail = user.email;
        });

        this.closeModal();
      },
      error: err => {
        console.error(err);
        this.toast.error(err.error?.message || 'Failed to update profile');
      }
    });
  }

  loadShippingAddresses(): void {
    this.shippingService.getMyAddresses().subscribe({
      next: res => {
        this.shippingAddresses = res.data || [];
        this.activeShipping =
          this.shippingAddresses.find(a => a.isActive) || null;
      },
      error: () => {
        this.toast.error('Failed to load shipping addresses');
      }
    });
  }



}