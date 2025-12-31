import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  name = '';
  email = '';
  password = '';
  isSubmitting = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) { }

  onSubmit(form: NgForm): void {
    if (form.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    const payload = {
      name: this.name.trim(),
      email: this.email.trim(),
      password: this.password.trim()
    };

    this.authService.register(payload).subscribe({
      next: (res) => {
        this.toast.success(res.message);
        this.router.navigate(['/app-login']);
        this.isSubmitting = false;
      },
      error: (err) => {
        const msg =
          err.error?.message ||
          err.error?.title ||
          err.message ||
          'Registration failed';

        this.toast.error(msg);
        this.isSubmitting = false;
      }
    });
  }
}
