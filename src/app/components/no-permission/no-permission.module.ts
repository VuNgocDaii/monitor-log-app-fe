import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NoPermissionRoutingModule } from './no-permission-routing.module';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { NotificationService } from 'src/app/shared/notification.service';
import { NoPermissionComponent } from './no-permission.component';


@NgModule({
  declarations: [
    NoPermissionComponent
  ],
  imports: [
    CommonModule,
    NoPermissionRoutingModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    PasswordModule,
    RippleModule,
    ButtonModule,
    ToastModule
  ],
  providers: [
    MessageService,
    NotificationService
  ]
})
export class NoPermissionModule { }
