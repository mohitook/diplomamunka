import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'paginationPipe'
})
export class PaginationPipePipe implements PipeTransform {

  transform(value: any, start: any, stop:any): any {

    if(value==null){
      return;
    }

    var returnValue : Array<any> = new Array();

    for(var i = start; i<=stop && i<value.length ; i++){
      returnValue.push(value[i]);
    }
    return returnValue;
  }

}
