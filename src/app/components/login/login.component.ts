import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConfigService } from 'src/app/shared/app-config.service';
import { AuthService } from 'src/app/services/auth.service';
import { AuthStateService } from 'src/app/shared/app-state/auth-state.service';
import { NotificationService } from 'src/app/shared/notification.service';
import { finalize, Subscription } from 'rxjs';
import { AuthTokenResponse } from 'src/app/models/auth-model';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  @ViewChild('notify_login', { read: ElementRef }) notifyLogin!: ElementRef;
  loginForm!: FormGroup;
  slogan = {
    content: '',
    author: '',
  };
  loading = false;
  sub!: Subscription;
  messageError!: string;
  returnUrl!: string;
  constructor(public configService: AppConfigService, private fb: FormBuilder, private route: ActivatedRoute, private router: Router, private authState: AuthStateService, private authService: AuthService, private notification: NotificationService) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
    this.route.queryParamMap.subscribe((params) => {
      this.returnUrl = params.get('returnUrl') || '/workspace';
    });
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  ngOnInit(): void {}

  login(): void {
    if (this.loginForm.invalid || this.loading) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const credentials = {
      username: this.loginForm.controls['username'].value.trim(),
      password: this.loginForm.controls['password'].value,
    };
    this.sub = this.authService.login(credentials).pipe(
      finalize(() => { this.loading = false; })
    ).subscribe({
      next: (response: AuthTokenResponse) => {
        if (response.mustChangePassword) {
          void this.router.navigate(['/login/change-required-password'], {
            queryParams: { username: response.username, returnUrl: this.returnUrl },
          });
          return;
        }

        try {
          this.authState.loginSuccess(response);
          void this.router.navigateByUrl(this.returnUrl);
        } catch {
          this.notification.error('Lỗi đăng nhập', 'Máy chủ không trả về token hợp lệ.');
        }
      },
      error: error => {
        const detail = error?.error?.detail ?? error?.error?.title ?? error?.error?.message;
        this.notification.error('Lỗi đăng nhập', detail || 'Tên đăng nhập hoặc mật khẩu không đúng.');
      },
    });
  }

  removeTextErrorLogin() {
    const parentElement = this.notifyLogin.nativeElement;
    parentElement.innerText = '';
  }
}
