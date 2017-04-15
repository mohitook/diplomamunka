import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'labelFilter',
    pure: false
})
export class LabelFilterPipe implements PipeTransform {

  transform(value: any, arg1: any): any {
    var filteredValues: Array<any> = new Array<any>();

    if(value == null){
      return null;
    }
    arg1.forEach(x=>{
      value.forEach(y=>{
        if(y.label==x.label){
          filteredValues.push(y);
        }
      });
    })
    return filteredValues;
  }

}
