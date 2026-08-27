import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpInterceptor,
  HttpErrorResponse,
  HttpEvent,
  HttpResponse,
} from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { AppConfigService } from '../app-config.service';
import { StorageKeys } from '../constants/constants';
import { NotificationService } from '../notification.service';
import { Router } from '@angular/router';
@Injectable()
export class CustomHttpInterceptor  implements HttpInterceptor {
  baseUrl = '';
  constructor(
    private notification: NotificationService,
    private router: Router,
    public configService: AppConfigService,
  ) {
    this.baseUrl = this.configService.getConfig().api.baseUrl;
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any>  {
    const token = localStorage.getItem(StorageKeys.TOKEN)
    const isApiUrl = request.url.includes(this.baseUrl);
    if (token && (isApiUrl )) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    }
    return next.handle(request).pipe(
      map((res: HttpEvent<any>) => {
        if (res instanceof HttpResponse) {
          if (res.body.isValid === false && res.body.errors[0]) {
            // this.notification.error('DEV: Có lỗi xảy ra! Error: ' + res.body.errors[0].errorMessage, request.url);
          }
        }
        return res;
      }),
      catchError((error:HttpErrorResponse) => {
        if (error.status === 401) {
            this.notification.error401messge('Phiên đăng nhập đã hết hạn', '');
            localStorage.removeItem(StorageKeys.TOKEN);
            localStorage.removeItem(StorageKeys.USER);
            this.router.navigate(['/login']);
        }
        else 
          // if(!environment.production) 
          {
        //   this.notification.error('DEV: Có lỗi xảy ra! Error: ' + error.status, request.url);
          }
        return throwError(() => error);
      }));
  }

}
