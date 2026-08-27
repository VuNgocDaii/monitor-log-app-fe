import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ageStringFromDOB',
})
export class AgeStringFromDOBPipe implements PipeTransform {
  constructor() {}

  static calcAgeString(dob: any, isShowTextAge = true): string {
    var result = '';
    if (isNaN(Date.parse(dob))) {
      return result;
    }
    let now = new Date();
    let dobDate = new Date(dob);

    if (dobDate > now || dobDate.getFullYear() <= 1900) {
      return result;
    }

    if (
      now.getFullYear() == dobDate.getFullYear() &&
      now.getMonth() == dobDate.getMonth()
    ) {
      result = now.getDate() - dobDate.getDate() + ' ngày';
    } else if (now.getFullYear() == dobDate.getFullYear()) {
      result = now.getMonth() - dobDate.getMonth() + ' tháng';
    } else if (
      now.getFullYear() == dobDate.getFullYear() + 1 &&
      now.getMonth() < dobDate.getMonth()
    ) {
      result = now.getMonth() + 12 - dobDate.getMonth() + ' tháng';
    } else {
      result = now.getFullYear() - dobDate.getFullYear() + '';
    }
    if (isShowTextAge) result += ' tuổi';
    return result;
  }

  transform(dob: any, showTextAge: boolean = true): string {
    return AgeStringFromDOBPipe.calcAgeString(dob, showTextAge);
  }
}
