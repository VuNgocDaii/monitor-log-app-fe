import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { StorageKeys } from '../constants/constants';
import { AuthTokenResponse, IAuthModel, INIT_AUTH_MODEL } from 'src/app/models/auth-model';

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  protected subject: BehaviorSubject<IAuthModel>;
  protected authData: IAuthModel;

  constructor() {
    this.authData = this.initializeAuthData();
    this.subject = new BehaviorSubject<IAuthModel>(this.authData);
  }

  private initializeAuthData(): IAuthModel {
    const localAuthData = localStorage.getItem(StorageKeys.USER);
    if (localAuthData) {
      try {
        const data = JSON.parse(localAuthData) as IAuthModel;
        if (data.isLock) {
          return INIT_AUTH_MODEL;
        }
        return data;
      } catch (error) {
        console.error('Error parsing local storage auth data:', error);
        return INIT_AUTH_MODEL;
      }
    }
    return INIT_AUTH_MODEL;
  }

  public subscribe(callback: (model: IAuthModel) => void): Subscription {
    return this.subject.subscribe(callback);
  }
  loginSuccess(response: AuthTokenResponse): void {
    if (!response.accessToken || !response.refreshToken) {
      throw new Error('Phản hồi đăng nhập không có đầy đủ token.');
    }

    const authData: IAuthModel = {
      ...INIT_AUTH_MODEL,
      id: response.userId,
      username: response.username,
      fullName: response.fullName,
      fullname: response.fullName ?? '',
      role: response.roles[0] ?? '',
      roles: response.roles ?? [],
      permissions: response.permissions ?? [],
      token: response.accessToken,
      isLock: false,
    };
    localStorage.setItem(StorageKeys.TOKEN, response.accessToken);
    localStorage.setItem(StorageKeys.REFRESH_TOKEN, response.refreshToken);
    localStorage.setItem(StorageKeys.USER, JSON.stringify(authData));
    this.authData = authData;
    this.subject.next({ ...authData });
  }

  logout(): void {
    localStorage.removeItem(StorageKeys.TOKEN);
    localStorage.removeItem(StorageKeys.REFRESH_TOKEN);
    localStorage.removeItem(StorageKeys.USER);
    this.authData = { ...INIT_AUTH_MODEL };
    this.subject.next({ ...this.authData });
  }

  getAccessToken(): string | null {
    return localStorage.getItem(StorageKeys.TOKEN);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(StorageKeys.REFRESH_TOKEN);
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  lockScreen() {
    let authData = { ...this.authData, isLock: true };
    localStorage.setItem(StorageKeys.USER, JSON.stringify(authData));
    this.dispatch(authData);
  }

  public dispatch(payload: Partial<IAuthModel> | null): void {
    if (!payload) return;
    this.authData = { ...this.authData, ...payload };
    const dispatchedModel: IAuthModel = { ...this.authData };
    this.subject.next(dispatchedModel);
  }
}
