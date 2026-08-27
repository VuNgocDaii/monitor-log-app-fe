import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../models/app-config';
import { NotificationService } from './notification.service';

@Injectable({
    providedIn: 'root',
})
export class AppConfigService {
    private config = new AppConfig();
    private options = {
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            DataType: 'application/json',
        },
    };

    constructor(
        private http: HttpClient,
        private notification: NotificationService,
    ) {}

    load() {
        return new Promise((resolve, reject) => {
            this.http
                .get(
                    `../../assets/config/config.json`,
                    this.options
                )
                .subscribe({
                    next: (data: any) => {
                        // console.log(data);
                        this.setConfig(data);
                        resolve(true);
                    },
                    error: (error) => {
                        console.log('error', error);
                        throw new Error(error.message || 'Server Error');
                    },
                });
        });
    }

    private setConfig = (data: any): void => {
        this.config.api.baseUrl = 'http://' + data.api.baseUrl;
    };

    getConfig = () => this.config;
}
