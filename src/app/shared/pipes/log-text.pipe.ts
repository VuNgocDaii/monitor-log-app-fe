import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'logText'
})
export class LogTextPipe implements PipeTransform {
    constructor(){}
    transform(logType: any): string {
        const parsed = parseInt(logType);
        switch (parsed) {
            case 1:
                return 'Ca khám';
            case 6:
                return 'Nhận chỉ định';
            case 11:
                return 'Thêm ca thăm khám';
            case 12:
                return 'Cập nhật ca thăm khám';
            case 15:
                return 'Chia sẻ ca thăm khám';
            case 3:
                return 'Key Image';
            case 41:
                return 'Đọc kết quả';
            case 42:
                return 'Duyệt kết quả';
            case 31:
                return 'Tải lên Key Image';
            case 32:
                return 'Tạo Key Image';
            case 4:
                return 'Báo cáo';
            case 33:
                return 'Tạo Key Image';
            case 5:
                return 'Tự động tải lên';
            default:
                return '';
        }
    }
}
