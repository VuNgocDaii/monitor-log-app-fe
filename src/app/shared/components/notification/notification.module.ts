import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationComponent } from './notification.component';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    ToastModule,
    RippleModule,
    FormsModule
  ],
  exports: [NotificationComponent],
  declarations: [NotificationComponent]
})
export class NotificationModule { }
