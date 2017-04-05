import { Pipe, PipeTransform } from '@angular/core';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';

@Pipe({name: 'keyValues'})
export class SafePipe implements PipeTransform {
  transform(value, args:string[]) : any {
    let keys = [];
    for (let key in value) {
      keys.push({key: key, value: value[key]});
    }
    return keys;
  }
}
