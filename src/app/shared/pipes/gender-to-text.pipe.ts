import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
  name: 'genderText',
})
export class GenderToTextPipe implements PipeTransform {
  constructor() {}
  transform(genderNum: any): string {
      const parsed = parseInt(genderNum);
    switch (parsed) {
      case 0:
        return 'Nữ';
      case 1:
        return 'Nam';
      case 2:
        return 'Không xác định';
      default:
        return '';
    }
  }
}
