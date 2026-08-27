import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'appointmentPriorityString'
})
export class PriorityToTextPipe implements PipeTransform {

    transform(priority: any): string {
        const parsed = parseInt(priority);
        switch (parsed) {
            case 0:
                return 'NO SET';
            case 1:
                return 'Cao';
            case 2:
                return 'Trung bình';
            case 3:
                return 'Thấp';
            default: return '';
        }
    }

}
