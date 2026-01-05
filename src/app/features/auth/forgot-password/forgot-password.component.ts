import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  email = '';
  loading = false;

  constructor(
    private auth: AuthService,
    private toast: ToastService,
    private router: Router
  ) {}

  submit() {
    if (!this.email.trim()) return;

    this.loading = true;

    this.auth.sendOtp(this.email.trim()).subscribe({
      next: res => {
        this.loading = false;
        this.toast.success('OTP sent to your email');

        // Move to reset password page + pass email forward
        this.router.navigate(['/reset-password'], {
          queryParams: { email: this.email }
        });
      },
      error: err => {
        this.loading = false;
        this.toast.error(err.error?.message || 'Something went wrong');
      }
    });
  }
}
