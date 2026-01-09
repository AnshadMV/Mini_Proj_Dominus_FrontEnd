import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-password-edit',
  templateUrl: './password-edit.component.html'
})
export class PasswordEditComponent {

  @Input() visible = false;
  @Input() email!: string;

  @Output() closePasswordModal = new EventEmitter<void>();

  step: 1 | 2 = 1;

  otp = '';
  newPassword = '';
  loading = false;
  showPassword = false;

  constructor(private auth: AuthService, private toast: ToastService) {}

  close() {
    this.step = 1;
    this.otp = '';
    this.newPassword = '';
    this.closePasswordModal.emit();
  }

  /* STEP 1 — SEND OTP */
  sendOtp() {
    if (!this.email) {
      this.toast.error('User email not found');
      return;
    }

    this.loading = true;

    this.auth.sendOtp(this.email).subscribe({
      next: res => {
        this.toast.success(res.message || 'OTP sent to your email');
        this.step = 2;
        this.loading = false;
      },
      error: err => {
        this.toast.error(err.error?.message || 'Failed to send OTP');
        this.loading = false;
      }
    });
  }

  /* STEP 2 — RESET PASSWORD */
  resetPassword() {
    if (!this.otp.trim() || !this.newPassword.trim()) {
      this.toast.error('OTP and new password are required');
      return;
    }

    this.loading = true;

    this.auth.resetPassword(this.email, this.otp.trim(), this.newPassword.trim())
      .subscribe({
        next: res => {
          this.toast.success(res.message || 'Password reset successfully');
          this.loading = false;
          this.close();
        },
        error: err => {
          this.toast.error(
            err?.error?.message
            || err?.error?.errors
            || 'Reset failed'
          );
          this.loading = false;
        }
      });
  }

}
