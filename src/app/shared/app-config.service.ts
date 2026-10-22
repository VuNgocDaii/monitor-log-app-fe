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

    load(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.http
                .get(
                    `../../assets/config/config.json`,
                    this.options
                )
                .subscribe({
                    next: (data: any) => {
                        try {
                            this.setConfig(data);
                            resolve();
                        } catch (error) {
                            reject(error);
                        }
                    },
                    error: (error) => {
                        reject(new Error(error.message || 'Không tải được cấu hình ứng dụng.'));
                    },
                });
        });
    }

    private setConfig = (data: any): void => {
        const baseUrl = data?.api?.baseUrl;
        if (typeof baseUrl !== 'string' || !/^https?:\/\//i.test(baseUrl)) {
            throw new Error('api.baseUrl phải là URL đầy đủ, ví dụ https://api.example.com/api.');
        }
        this.config.api.baseUrl = baseUrl.replace(/\/+$/, '');
    };

    getConfig = () => this.config;
}
