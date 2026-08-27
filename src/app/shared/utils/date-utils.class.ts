export class DateUtils {
  static checkRangeDate(fromDateCheck:any, toDateCheck:any, fromDate:any, toDate:any): any {
    if (!fromDate || !toDate ) { return false; }
    const fdateCheck = Date.parse(fromDateCheck);
    const tdateCheck = Date.parse(toDateCheck);
    const fdate = Date.parse(fromDate);
    const tdate = Date.parse(toDate);

    if (
      (fdateCheck <= fdate && tdateCheck  >= fdate && tdateCheck <= tdate) ||
      (fdateCheck >= fdate && fdateCheck <= tdate && tdateCheck  >= fdate && tdateCheck <= tdate) ||
      (fdateCheck <= fdate && tdateCheck >= tdate) ||
      (fdateCheck >= fdate && fdateCheck  <= tdate && tdateCheck >= tdate)) {
      return true;
    }
    return false;
  }


  static checkBackDate( date1: Date, date2: Date, backNumber: number  ): number {
    if (date1 && date2 && date1 instanceof Date && date2 instanceof Date) {
      const backDate = new Date(date2.getFullYear() - backNumber, date2.getMonth(), date2.getDate());
      if (date1.getTime() > backDate.getTime()) {
        return 1;
      } else if (date1.getTime() === backDate.getTime()) {
        return 0;
      } else {
        return -1;
      }
    }

    return -1;

  }

  static compareDate(date1: Date, date2: Date, back: number = 0): number {
    if (date1 && date2 && date1 instanceof Date && date2 instanceof Date) {

      const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
      const d2 = new Date(date2.getFullYear()  - back, date2.getMonth(), date2.getDate());
      if (d1 > d2) { return 1; } else if ( d1 < d2) { return -1; } else { return 0; }
    }
    return -1;
  }
}
