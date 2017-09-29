import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'betting_percentage'
})
export class BettingPercentagePipe implements PipeTransform {

  transform(value: any, otherValue: any): any {
    //console.log('first:' + value + ' | second: ' + otherValue);

    const returnValue = Math.floor(value / ((value + otherValue) / 100));

    return returnValue + '%';
  }

}