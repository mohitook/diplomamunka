import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'match-filter'
})
export class MatchFilterPipe implements PipeTransform {
 //todo: filter írása meccsekhez + beégetni a sidenav-ot a 3 játékra!
  transform(value: any, args?: any): any {
    return null;
  }

}