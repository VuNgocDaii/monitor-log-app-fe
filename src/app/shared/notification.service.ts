import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  messaged401 = false;
  checkMessage(arg0: string, res: any) {
    throw new Error('Method not implemented.');
  }
  constructor(private messageService: MessageService) {}
  info(summary: string, detail: string = '', key = 'default') {
    this.messageService.add({ severity: 'info', summary: summary, detail: detail, key: key });
  }
  success(summary: string, detail: string = '', key = 'default') {
    this.messageService.add({ severity: 'success', summary: summary, detail: detail, key: key });
  }
  warn(summary: string, detail: string = '', key = 'default') {
    this.messageService.add({ severity: 'warn', summary: summary, detail: detail, key: key });
  }
  error(summary: string, detail: string = '', key = 'default') {
    this.messageService.add({ severity: 'error', summary: summary, detail: detail, key: key });
  }
  add(type: string, summary: string, detail: string = '', key = 'default', sticky = false) {
    this.messageService.add({ key: key, severity: type, summary: summary, detail: detail, sticky: sticky });
  }
  firebase(summary: string, detail: string = '') {
    this.messageService.add({ summary: summary, detail: detail, key: 'firebase', severity: 'info', sticky: false, life: 10000 });
  }
  checkErrorMessage(message: string, response: any) {
    if (response.errors && response.errors.length > 0) {
      response.errors.forEach((el: any) => {
        this.error(el.errorMessage);
      });
    } else {
      this.error(message);
    }
  }
  error401messge(summary: string, detail: string = '', key = 'default') {
    if (!this.messaged401) {
      this.messageService.add({ severity: 'error', summary: summary, detail: detail, key: key });
    }
    this.messaged401 = true;
    setTimeout(() => {
      this.messaged401 = false;
    }, 3000);
  }
  showCustomErrMessage(response:any,message:string){
    if (response.errors && response.errors.length > 0) {
        response.errors.forEach((el: any) => {
        //   this.error(el.errorMessage);
        });
      } else {
        // this.error(message);
      }
  }
}
