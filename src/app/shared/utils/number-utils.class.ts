export class NumberUtils {
  static currencyFormat(value: any) {
    if (value) {
     value = value.toString();
     value =  value.length > 1 ? value.replace(/^0+/, '') : value;
     return  value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    }
    return null;
  }

  static convertCurrencyToNumber(value: any): number {
    if (value) {
      return Number(value.toString().replace(/,/g, ''));
    }
    return -1;
  }
}
