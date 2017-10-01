import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'match_filter' 
})
export class MatchFilterPipe implements PipeTransform {
 //todo: filter írása meccsekhez + beégetni a sidenav-ot a 3 játékra!
  transform(value: any, label: string): any {

    if(value==null){
      return;
    }

    var filter = '';

    switch (label) {
      case 'League of Legends':
        filter = 'LoL';
        break;
      case 'Dota 2':
        filter = 'Dota 2';
        break;
      case 'Counter Strike GO':
        filter = 'CS GO';
        break;
      default:
        return value;
    }

    var returnList = new Array<any>();

    value.forEach(match => {
      if(match.game == filter){
        returnList.push(match);
      }
    });

    return returnList;
  }

}