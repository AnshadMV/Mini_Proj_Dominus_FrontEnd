import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-password-edit',
  templateUrl: './password-edit.component.html'
})
export class PasswordEditComponent {

  @Input() visible = false;
  @Output() closePasswordModal = new EventEmitter<void>();

  step: 1 | 2 = 1;

  resetToken = '';
  newPassword = '';
showPassword = false;

  loading = false;

  constructor(
    private auth: AuthService,
    private toast: ToastService
  ) { }

  close() {
    this.step = 1;
    this.resetToken = '';
    this.newPassword = '';
    this.closePasswordModal.emit();
  }

  /* STEP 1 — Generate Token */
  generateToken() {
    this.loading = true;

    this.auth.forgotPassword('')
      .subscribe({
        next: res => {
          console.log('TOKEN =>', res.accessToken);
          this.resetToken = res.accessToken!;
          this.resetToken = res.data!;
          this.toast.success(res.message);

          this.step = 2;
          this.loading = false;
        },
        error: err => {
          this.toast.error(err.error?.message || 'Failed to generate token');
          this.loading = false;
        }
      }); console.log(this.resetToken)
  }





  /* STEP 2 — Reset Password */
  resetPassword() {
    if (!this.resetToken || !this.newPassword) {
      this.toast.error('Token and new password required');
      return;
    }

    this.loading = true;

    this.auth.resetPassword(this.resetToken, this.newPassword.trim())
      .subscribe({
        next: () => {
          this.toast.success('Password reset successfully');
          this.close();
        },
        error: err => {
            this.toast.error(this.getBackendError(err));
          this.toast.error(err.error?.message || 'Reset failed');
          this.loading = false;
        }
      });
  }   


  private getBackendError(err: any): string {
  // If backend sends { message: "" }
  if (err?.error?.message) return err.error.message;

  // If backend sends model validation errors
  if (err?.error?.errors) {
    const firstKey = Object.keys(err.error.errors)[0];
    return err.error.errors[firstKey][0];
  }

  // If backend sends plain string
  if (typeof err?.error === 'string') return err.error;

  // fallback
  return 'Something went wrong';
}

}
