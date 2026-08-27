import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConfigService } from 'src/app/shared/app-config.service';
import { StorageKeys } from 'src/app/shared/constants/constants';
import { AuthService } from 'src/app/services/auth.service';
import { AuthStateService } from 'src/app/shared/app-state/auth-state.service';
import { NotificationService } from 'src/app/shared/notification.service';
import { Subscription } from 'rxjs';
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
      this.returnUrl = params.get('returnUrl') || '/admin';
    });
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  ngOnInit(): void {}

  login(): void {
    this.sub = this.authService.login(this.loginForm.value).subscribe(
      (res) => {
        if (res.isValid) {
          localStorage.setItem(StorageKeys.TOKEN, res.jsonData.token);
          localStorage.setItem(StorageKeys.USER, JSON.stringify(res.jsonData));
          this.authState.dispatch(res.jsonData);
          console.log(this.returnUrl);

          if (this.returnUrl == 'home') {
            this.router.navigate(['/']);
          } else {
            this.router.navigate(['/admin']);
          }
        } else {
          this.notification.error('Lỗi đăng nhập', res.errors[0].errorMessage);
        }
      },
      (error) => {
        if (error.error && error.error.message) {
          this.messageError = error.error.message;
          this.notification.error('Lỗi đăng nhập', 'Tên đăng nhập hoặc mật khẩu không đúng!');
        } else {
          this.messageError = StorageKeys.LOGIN_FAIL;
          this.notification.error('Lỗi đăng nhập', StorageKeys.LOGIN_FAIL);
        }
      },
    );
  }

  removeTextErrorLogin() {
    const parentElement = this.notifyLogin.nativeElement;
    parentElement.innerText = '';
  }
}
