import {
  HttpBackend,
  HttpClient,
  HttpContextToken,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, finalize, map, Observable, shareReplay, switchMap, throwError } from 'rxjs';
import { AuthStateService } from '../app-state/auth-state.service';
import { AppConfigService } from '../app-config.service';
import { NotificationService } from '../notification.service';
import { Router } from '@angular/router';
import { AuthTokenResponse } from '../../models/auth-model';

const RETRIED_AFTER_REFRESH = new HttpContextToken<boolean>(() => false);

@Injectable()
export class CustomHttpInterceptor implements HttpInterceptor {
  private readonly refreshHttp: HttpClient;
  private refreshRequest$?: Observable<string>;

  constructor(
    private readonly notification: NotificationService,
    private readonly router: Router,
    private readonly configService: AppConfigService,
    httpBackend: HttpBackend,
    private readonly authState: AuthStateService,
  ) {
    this.refreshHttp = new HttpClient(httpBackend);
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isApiUrl = this.isApiUrl(request.url);
    const isPublicAuthRequest = this.isPublicAuthRequest(request.url);
    const token = this.authState.getAccessToken();
    const authenticatedRequest = token && isApiUrl && !isPublicAuthRequest
      ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : request;

    return next.handle(authenticatedRequest).pipe(
      map(event => {
        if (event instanceof HttpResponse && event.body?.isValid === false && event.body?.errors?.[0]) {
          // Legacy response envelope is intentionally ignored here.
        }
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        if (
          error.status !== 401 || !isApiUrl || isPublicAuthRequest ||
          authenticatedRequest.context.get(RETRIED_AFTER_REFRESH)
        ) {
          return throwError(() => error);
        }

        return this.refreshAccessToken().pipe(
          switchMap(accessToken => next.handle(authenticatedRequest.clone({
            context: authenticatedRequest.context.set(RETRIED_AFTER_REFRESH, true),
            setHeaders: { Authorization: `Bearer ${accessToken}` },
          }))),
          catchError(refreshError => {
            this.endSession();
            return throwError(() => refreshError);
          })
        );
      })
    );
  }

  private refreshAccessToken(): Observable<string> {
    if (this.refreshRequest$) return this.refreshRequest$;

    const refreshToken = this.authState.getRefreshToken();
    if (!refreshToken) return throwError(() => new Error('Không có refresh token.'));

    this.refreshRequest$ = this.refreshHttp.post<AuthTokenResponse>(
      `${this.configService.getConfig().api.baseUrl}/auth/refresh`,
      { refreshToken }
    ).pipe(
      map(response => {
        this.authState.loginSuccess(response);
        return response.accessToken as string;
      }),
      finalize(() => { this.refreshRequest$ = undefined; }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    return this.refreshRequest$;
  }

  private endSession(): void {
    this.authState.logout();
    this.notification.error401messge('Phiên đăng nhập đã hết hạn', '');
    void this.router.navigate(['/login']);
  }

  private isPublicAuthRequest(url: string): boolean {
    return [
      '/auth/login', '/auth/register', '/auth/refresh', '/auth/change-required-password',
      '/auth/forgot-password', '/auth/reset-password', '/system-config/password-policy',
    ].some(path => url.endsWith(path));
  }

  private isApiUrl(url: string): boolean {
    const baseUrl = this.configService.getConfig().api.baseUrl;
    return !!baseUrl && url.startsWith(baseUrl);
  }
}
