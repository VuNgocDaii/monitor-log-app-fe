import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base-service';
import { AuthTokenResponse } from '../models/auth-model';

@Injectable({
    providedIn: 'root'
})
export class AuthService extends BaseService {
    override url = '/auth';

    login(payload: { username: string; password: string }): Observable<AuthTokenResponse> {
        return this.post(`${this.url}/login`, payload);
    }

    refresh(refreshToken: string): Observable<AuthTokenResponse> {
        return this.post(`${this.url}/refresh`, {
            refreshToken
        });
    }

    logout(refreshToken?: string): Observable<void> {
        return this.post(`${this.url}/logout`, {
            refreshToken
        });
    }

    changePassword(payload: any): Observable<any> {
        return this.post(`${this.url}/change-password`, payload);
    }

    changeRequiredPassword(payload: {
        username: string;
        currentPassword: string;
        newPassword: string;
    }): Observable<AuthTokenResponse> {
        return this.post(
            `${this.url}/change-required-password`,
            payload
        );
    }

    forgotPassword(email: string): Observable<any> {
        return this.post(`${this.url}/forgot-password`, {
            email
        });
    }

    resetPassword(payload: any): Observable<any> {
        return this.post(`${this.url}/reset-password`, payload);
    }

    getCurrentUser(): Observable<any> {
        return this.get(`${this.url}/me`);
    }

    getProfile(): Observable<any> {
        return this.get(`${this.url}/profile`);
    }

    updateProfile(payload: any): Observable<any> {
        return this.put(`${this.url}/profile`, payload);
    }

    validate(): Observable<any> {
        return this.get('/User/Me');
    }
}
