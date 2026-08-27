import { Pipe, PipeTransform } from '@angular/core';
import {DatePipe} from "@angular/common";

@Pipe({
  name: 'customDate'
})
export class CustomDatePipe implements PipeTransform {
    constructor(){}

  transform(value: string, format: string): string {
    const datePipe = new DatePipe('en-US');
    const parsedDate = this.parseDateString(value);
    const formattedDate = parsedDate ? datePipe.transform(parsedDate, format) : null;
    return formattedDate ?? value;
  }

  private parseDateString(dateString: string): Date | null {
        const dateParts = dateString.split('/');
        const day = +dateParts[0];
        const month = +dateParts[1] - 1;
        const year = + dateParts[2].split('')[0];

        const time = dateParts[2].split('')[1];
        const [hour, minute, second] = time.split(':').map(Number);

        if(isNaN(day) || isNaN(month) || isNaN(year) || isNaN(hour) || isNaN(minute) || isNaN(second)){
            return null;
        }

        return new Date(year, month, day, hour, minute, second);
  }

}
