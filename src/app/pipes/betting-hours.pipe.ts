import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'betting_hours'
})
export class BettingHoursPipe implements PipeTransform {
  //set hours true if you will get the remaining hours, set it false if you'll get the minutes
  transform(value: any, hours: boolean): any {

    var timeDifference = Math.abs(value - Date.now());

    var difInHours = Math.floor(timeDifference / (60*60*1000));

    var difInMinutes = Math.floor((timeDifference - (difInHours * 60*60*1000)) /(60*1000));

    if(hours){
      return difInHours + 'h';
    }
    else
      return difInMinutes + 'm';

  }

}