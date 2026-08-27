import { FormGroup } from '@angular/forms';
import { NotificationService } from '../notification.service';

export default class Utils {
  constructor(private notify: NotificationService) {}
  static extractContent(html: string) {
    return new DOMParser().parseFromString(html, 'text/html').documentElement.textContent;
  }

  static humanFileSize(size: number) {
    var i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(2) + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
  }

  static saveLocalFile(url: string, filename: string) {
    var a = document.createElement('a');
    document.body.appendChild(a);
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  static compareObject(object1: Object, object2: Object) {
    return JSON.stringify(object1) === JSON.stringify(object2);
  }

  static hasDuplicate(arr: Array<any>) {
    const filtered = arr.filter((v, i) => arr.indexOf(v) !== i);
    return filtered.length > 0;
  }

  static maskDirtyFormControl(formgroup: FormGroup) {
    Object.values(formgroup.controls).forEach((control) => {
      if (control.invalid) {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      }
    });
  }

  static addDays(date: any, days: number) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  static checkIsDate(date: any) {
    return date instanceof Date && !isNaN(date.valueOf());
  }

}
