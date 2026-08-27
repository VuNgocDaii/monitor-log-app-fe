import { Pipe, PipeTransform } from '@angular/core';
import { Constants } from '../constants/constants';

@Pipe({
  name: 'operation'
})
export class Operation implements PipeTransform {
    VALUE_OPERATION = Constants.VALUE_OPERATION;
    constructor() {
    }

    transform(value: any): any {
        var Obj = this.getOperationFromBE(value);
        return Obj ? Obj.label : '';
    }

    getOperationFromBE(value: any){
        let objOperationBE = this.VALUE_OPERATION.find(
            obj => obj.value == value
        )
        return objOperationBE;
    }
}
