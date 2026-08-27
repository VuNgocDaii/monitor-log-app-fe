import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Subscription } from 'rxjs';
import { IAuthModel, INIT_AUTH_MODEL } from '../models/auth-model';
import { AuthStateService } from './app-state/auth-state.service';
import { NotificationService } from './notification.service';
import { Roles, StorageKeys } from './constants/constants';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, OnDestroy {
  protected _authSubscription: Subscription;
  currentUser = INIT_AUTH_MODEL;

  constructor(private router: Router, private notification: NotificationService, private authState: AuthStateService) {
    this._authSubscription = this.authState.subscribe((m: IAuthModel) => {
      this.currentUser = m;
        console.log(m);
    });
  }

  public ngOnDestroy(): void {
    // this._authSubscription.unsubscribe();
  }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    // const token = localStorage.getItem(StorageKeys.TOKEN);
    // // console.log(route.data['role']);
    // if (route.data['role']) {
    //   if (route.data['role'].includes(this.currentUser.role)) {
    //     return true;
    //   }

    //   if (route.routeConfig?.path === 'admin' && this.currentUser.role && this.currentUser.role == Roles.Editor) {
    //     this.router.navigate(['/']);
    //     return false;
    //   }
    // } else if (this.currentUser.id) {

    //   return true;
    // }
    // this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    // return false;
    return true;
  }
}
