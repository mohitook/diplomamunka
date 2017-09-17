import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'betting_hours'
})
export class BettingHoursPipe implements PipeTransform {

  transform(value: any, args?: any): any {

    var timeDifference = Math.abs(value - Date.now());

    var difInHours = Math.floor(timeDifference / (60*60*1000));

    var difInMinutes = Math.floor((timeDifference - (difInHours * 60*60*1000)) /(60*1000));

    return difInHours + 'h ' + difInMinutes + 'm';
  }

}