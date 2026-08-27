import { Pipe, PipeTransform } from '@angular/core';
import { Constants } from '../constants/constants';

@Pipe({
  name: 'common',
})
export class CommonPipe implements PipeTransform {
  constructor() {}

  transform(value: any, info: 'label' | 'icon'|'color',sources:any[]): any {
    let result = '';
    for (const key in sources) {
      const element = sources[key];
      if (element.hasOwnProperty(info) && element.value == value) {
        result = element[info];
      }
    }
    return result;
  }
}

export interface CommonObject{
  value: any;
  label: string;
  icon: string;
}
