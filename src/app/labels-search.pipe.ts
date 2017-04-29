import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'labelsSearch'
})
export class LabelsSearchPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return null;
  }

}
