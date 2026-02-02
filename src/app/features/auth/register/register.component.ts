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
  isPasswordVisible: boolean = false;
  togglePassword(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
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
        let errorMessage = 'Registration failed';

        // Check if it's a validation error (status 400 with errors object)
        if (err.status === 400 && err.error?.errors) {
          // Extract the first error from the errors object
          const errors = err.error.errors;
          const firstErrorKey = Object.keys(errors)[0];

          if (firstErrorKey && errors[firstErrorKey]?.length > 0) {
            // Get the first error message for that field
            errorMessage = errors[firstErrorKey][0];
          } else if (err.error?.message) {
            errorMessage = err.error.message;
          }
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.error?.title) {
          errorMessage = err.error.title;
        } else if (err.message) {
          errorMessage = err.message;
        }

        this.toast.error(errorMessage);
        this.isSubmitting = false;
      }
    });
  }
}
