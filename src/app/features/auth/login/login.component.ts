import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { WebsiteAssetsService } from '../services/website-assets.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  logoUrl = '';
  email = '';
  password = '';
  showPassword = false;
  isSubmitting = false;

  constructor(
    private authService: AuthService,
    private assetsService: WebsiteAssetsService,
    private router: Router,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    this.assetsService.getLogo().subscribe(url => {
      this.logoUrl = url;
    });

  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(form: NgForm): void {
    if (form.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    this.authService.login(
      this.email.trim(),
      this.password.trim()
    ).subscribe({
      next: (res) => {
        this.isSubmitting = false;

        this.authService.getMyProfile().subscribe({
          next: (profileRes) => {
            const role = profileRes?.data?.role?.toLowerCase();

            this.toast.success("Login Success");
            this.toast.success("Welcome to Dominus");

            if (role === 'admin') {
              this.router.navigate(['/admin/dashboard']);
            } else {
              this.router.navigate(['/app-home']);
            }
          },
        })

        // this.router.navigate(['/app-home']);   // or /product-list
        // this.toast.success("Login Success")
        // this.toast.success("Welcome to Dominus")
        // The auth state will be updated by the service

      },
      error: (err) => {
        this.isSubmitting = false;
        this.toast.error(err.error?.message || 'Login failed');
      }
    });
  }
}