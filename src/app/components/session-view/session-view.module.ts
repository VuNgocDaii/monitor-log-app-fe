import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { SessionViewComponent } from './session-view.component';
import { SessionViewRoutingModule } from './session-view-routing.module';

@NgModule({
  declarations: [SessionViewComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    SessionViewRoutingModule
  ]
})
export class SessionViewModule {}
