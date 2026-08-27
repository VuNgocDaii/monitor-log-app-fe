import { APP_INITIALIZER, NgModule } from '@angular/core';
import { CommonModule, DatePipe, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CustomHttpInterceptor } from './shared/interceptors/custom-http.interceptor';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { NotificationService } from './shared/notification.service';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireMessagingModule } from '@angular/fire/compat/messaging';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { AppConfigService } from './shared/app-config.service';
import { NgIdleModule } from '@ng-idle/core';
import { LoadingModule } from './shared/components/loading/loading.module';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
export function initAppConfig(appConfigService: AppConfigService) {
    return () => appConfigService.load();
 }

@NgModule({
    declarations: [
      AppComponent,
    ],
    imports: [
      CommonModule,
      HttpClientModule,
      BrowserModule,
      BrowserAnimationsModule,
      AppRoutingModule,
      AngularFireMessagingModule,
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      }),
      NgIdleModule.forRoot(),
      LoadingModule

    ],
    providers: [
      DatePipe,
      { provide: LocationStrategy, useClass: PathLocationStrategy },
      { provide: HTTP_INTERCEPTORS, useClass: CustomHttpInterceptor, multi: true },
      MessageService,
      NotificationService,
      AppConfigService,

    {
      provide: APP_INITIALIZER,
      useFactory: initAppConfig,
      deps: [AppConfigService],
      multi: true,
    },

    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
