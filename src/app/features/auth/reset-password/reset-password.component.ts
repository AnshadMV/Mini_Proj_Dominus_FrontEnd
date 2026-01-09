import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent {

  email = '';
  otp = '';
  newPassword = '';
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private toast: ToastService,
    private router: Router
  ) {
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
  }

  submit() {
    if (!this.email || !this.otp || !this.newPassword) return;

    this.loading = true;

    this.auth.resetPassword(this.email, this.otp, this.newPassword)
      .subscribe({
        next: res => {
          this.loading = false;
          this.toast.success('Password reset successfully');
          this.router.navigate(['/app-login']);
        },
        error: err => {
          this.loading = false;
          this.toast.error(err.error?.message || 'Something went wrong');
        }
      });
  }
}
