import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'listOTPipe'
})
export class ListOTPipe implements PipeTransform {
    papsmearConfigInfoBE: any = {};
    constructor() {
    }

    isEmpty(value: any) {
        return (
          value === undefined ||
          value === null ||
          (typeof value === "string" && value.trim().length === 0) ||
          (Array.isArray(value) && value.length === 0) ||
          (typeof value === "object" && Object.keys(value).length === 0)
        );
    }

    transform(id: any, value:any, args?: string): any {
        switch (args){
            case 'fromIdsTonNames' :
                let name = '';
                let listOTSeverityFE = value;
                // console.log('listOTSeverityBE: ', listOTSeverityBE);
                if(!this.isEmpty(listOTSeverityFE)){
                    let objOTSeverityBE = listOTSeverityFE.find(
                        (obj:any) => obj.id == id
                    )
                    name = objOTSeverityBE? objOTSeverityBE.name : 'Notthing';
                }else{
                    name =  'Nothing';
                }
                return name;
                break;
        }

    }
}
