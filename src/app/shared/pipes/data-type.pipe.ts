import { Pipe, PipeTransform } from '@angular/core';
import { Constants } from "../constants/constants";

@Pipe({
  name: 'dataType'
})
export class DataTypePipe implements PipeTransform {
    DATA_TYPES = Constants.DATA_TYPES;
    constructor() {}
    transform(value: any,  args?: string): string {
        let str = '';
        switch (args) {
            case 'toNameDataType':
                // //console.log('keyDataType : ', value);
                let ob = this.DATA_TYPES.find(
                    it => it.keyValue === value
                );
                // //console.log('ob', ob);
                str = ob?.name ?? '';
                break;
            case 'toDataType':
                str =  typeof value;

                break;

            case 'toBooleanText':

                if(value){
                    str =  'Enabled'
                }else{
                    str =  'Disabled'
                }

                break;
        }
        return str;



    }


}
