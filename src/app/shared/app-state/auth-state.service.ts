import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { IAuthModel, INIT_AUTH_MODEL } from 'src/app/models/auth-model';
import { StorageKeys } from '../constants/constants';
import { AuthService } from 'src/app/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  protected subject: BehaviorSubject<IAuthModel>;
  protected authData: IAuthModel;

  constructor(private authService: AuthService) {
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
  loginSuccess(response: any) {
    let authData = { ...response.jsonData, isLock: false };
    localStorage.setItem(StorageKeys.TOKEN, response.jsonData.token);
    localStorage.setItem(StorageKeys.USER, JSON.stringify(authData));
    this.dispatch(authData);
  }

  logout() {
    localStorage.removeItem(StorageKeys.TOKEN);
    localStorage.removeItem(StorageKeys.USER);
    this.dispatch(INIT_AUTH_MODEL);
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
