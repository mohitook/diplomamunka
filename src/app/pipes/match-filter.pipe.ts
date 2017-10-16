import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'match_filter' 
})
export class MatchFilterPipe implements PipeTransform {
 //todo: filter írása meccsekhez + beégetni a sidenav-ot a 3 játékra!
  transform(value: any, label: string, filterArray:any, dummy:number): any {

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
        break;
    }

    var returnList = new Array<any>();

    if(filter != ''){
      value.forEach(match => {
        if(match.game == filter){
          returnList.push(match);
        }
      });
    }
    else{
      returnList = value;
    }

    var filteredReturnList = [];

    if(filterArray!=null){
      returnList.forEach(match => {
        if(filterArray[match.$key]!=null){
          filteredReturnList.push(match);
        }
      });
      return filteredReturnList;
    }

    return returnList;
  }

}