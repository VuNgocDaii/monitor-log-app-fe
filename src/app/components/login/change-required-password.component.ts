import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AuthTokenResponse } from 'src/app/models/auth-model';
import { AuthService } from 'src/app/services/auth.service';
import { AuthStateService } from 'src/app/shared/app-state/auth-state.service';
import { NotificationService } from 'src/app/shared/notification.service';

@Component({
  selector: 'app-change-required-password',
  templateUrl: './change-required-password.component.html',
  styleUrls: ['./login.component.scss'],
})
export class ChangeRequiredPasswordComponent implements OnInit, OnDestroy {
  readonly form = this.formBuilder.group({
    username: ['', [Validators.required, Validators.maxLength(150)]],
    currentPassword: ['', Validators.required],
    newPassword: ['', Validators.required],
    confirmPassword: ['', Validators.required],
  });

  loading = false;
  private returnUrl = '/workspace';
  private subscription?: Subscription;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly authState: AuthStateService,
    private readonly notification: NotificationService,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.form.controls['username'].setValue(params.get('username') ?? '');
      this.returnUrl = params.get('returnUrl') || '/workspace';
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  submit(): void {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.form.controls['newPassword'].value !== this.form.controls['confirmPassword'].value) {
      this.notification.error('Mật khẩu không khớp', 'Xác nhận mật khẩu mới cần trùng với mật khẩu mới.');
      return;
    }

    this.loading = true;
    const value = this.form.getRawValue();
    this.subscription = this.authService.changeRequiredPassword({
      username: (value.username ?? '').trim(),
      currentPassword: value.currentPassword ?? '',
      newPassword: value.newPassword ?? '',
    }).pipe(
      finalize(() => { this.loading = false; })
    ).subscribe({
      next: (response: AuthTokenResponse) => {
        try {
          this.authState.loginSuccess(response);
          void this.router.navigateByUrl(this.returnUrl);
        } catch {
          this.notification.error('Không thể đổi mật khẩu', 'Máy chủ không trả về token hợp lệ.');
        }
      },
      error: error => {
        const detail = error?.error?.detail ?? error?.error?.title ?? error?.error?.message;
        this.notification.error('Không thể đổi mật khẩu', detail || 'Vui lòng kiểm tra lại thông tin.');
      },
    });
  }
}
