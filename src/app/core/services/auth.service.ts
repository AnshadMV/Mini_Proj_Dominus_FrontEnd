import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ToastService } from './toast.service';
import { AuthResponse } from '../models/Responce_models/auth-resonce.model';
import { ApiResponse } from '../models/Responce_models/api-response.model';
import { UserProfile } from '../models/user-profile.model';


@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private isInitializing = true;

    private apiUrl = environment.API.AUTH;
    private apiUrl_reg = environment.API.REG_URL;
    private apiUrl_log = environment.API.LOG_URL;

    public isAuthenticatedSubject =
        new BehaviorSubject<boolean | null>(null);
    isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

    constructor(
        private http: HttpClient,
        private router: Router,
        private toast: ToastService
    ) { }


    initAuthState(): void {
        this.isInitializing = true;
        this.getMyProfile().subscribe({
            next: () => {
                this.isAuthenticatedSubject.next(true);
                this.isInitializing = false;
            },
            error: () => {
                this.isAuthenticatedSubject.next(false);
                this.isInitializing = false;
            }
        });
    }


    /* =======================
        REGISTER
    ======================= */
    register(payload: {
        name: string;
        email: string;
        password: string;
    }): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(
            `${this.apiUrl}/register`,
            payload
        );
    }

    /* =======================
            LOGIN
    ======================= */
    login(email: string, password: string) {
        return this.http.post<AuthResponse>(
            `${this.apiUrl}/login`,
            { email, password },
            { withCredentials: true }
        ).pipe(
            tap(res => {
                if (res.statusCode === 200) {
                    this.isAuthenticatedSubject.next(true);
                }
            })
        );
    }
    /* =======================
            LOGOUT
    ======================= */
    logout() {
        return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
            .pipe(
                tap(() => this.forceLogout(false)),
                catchError(() => {
                    this.forceLogout(false);
                    return of(null);
                })
            );
    }
    forceLogout(showToast: boolean = true): void {
        this.isAuthenticatedSubject.next(false);

        if (showToast && !this.isInitializing) {
            this.toast.success('Logged out successfully');
        }

        this.router.navigate(['/app-login']);
    }


    /* =======================
        REFRESH TOKEN
    ======================= */
    refreshAccessToken(): Observable<AuthResponse | null> {
        return this.http.post<AuthResponse>(
            `${this.apiUrl}/Token/Refresh-Access`,
            {},
            { withCredentials: true }
        ).pipe(
            tap(res => {
                if (res?.statusCode === 200) {
                    this.isAuthenticatedSubject.next(true);
                }
            }),
            catchError(() => of(null))
        );
    }



    /* =======================
        USER PROFILE
    ======================= */
    getMyProfile() {
        return this.http.get<ApiResponse<UserProfile>>(
            `${this.apiUrl}/myProfile`,
            { withCredentials: true }
        );
    }

    /* =======================
        UPDATE PROFILE
    ======================= */
    updateProfile(payload: { name?: string }) {
        return this.http.put<AuthResponse>(
            `${this.apiUrl}/updateProfile`,
            payload,
            { withCredentials: true }
        );
    }


    /* =======================
FORGOT PASSWORD
======================= */
    forgotPassword(email: string = '') {
        return this.http.post<AuthResponse<string>>(
            `${this.apiUrl}/ForgotPassword`,
            { email },
            { withCredentials: true }
        );
    }




    /* =======================
    RESET PASSWORD
    ======================= */
    resetPassword(token: string, newPassword: string) {
        return this.http.post<AuthResponse>(
            `${this.apiUrl}/ResetPassword`,
            { token, newPassword }
        );
    }



    sendOtp(email: string) {
        return this.http.post<ApiResponse<string>>(
            `${this.apiUrl}/send-otp`,
            { email }
        );
    }

    resetPasswordforNotloggined(email: string, otp: string, newPassword: string) {
        return this.http.post<ApiResponse<string>>(
            `${this.apiUrl}/reset-password`,
            { email, otp, newPassword }
        );
    }


}