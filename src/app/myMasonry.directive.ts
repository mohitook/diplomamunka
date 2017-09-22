import { Directive, ElementRef, Input, Renderer } from '@angular/core';

@Directive({
  selector: '[appMyMasonry]'
})
export class MyMasonryDirective {

  num:0;

  constructor(public el: ElementRef, public renderer: Renderer) {}

  ngOnInit(){
      //console.log('bennevagyok a directivaban!!!');
  }

  sortElements(){
    this.num++;
    console.log('called ' + this.num);
    var left=0;
    var right=0;

    //console.log(Array.from(this.el.nativeElement.childNodes));
    var children = this.el.nativeElement.childNodes;

    var selected = this.el.nativeElement.querySelectorAll('div.box');
    //console.log(selected);
    var array = Array.prototype.slice.call(selected);
    //console.log(array);

    array.forEach(element => {
      //console.log(element.style);
      if (left > right) //left is longer... go to right column
      {
        this.renderer.setElementStyle(element, 'top', right+'px');
        this.renderer.setElementStyle(element, 'left', '50%');
        right+= parseInt(getComputedStyle(element).height);
      }
      else  //go to the left column
      {
        this.renderer.setElementStyle(element, 'top', left+'px');
        this.renderer.setElementStyle(element, 'left', ''); //fix in case of mixed picture loading
        left += parseInt(getComputedStyle(element).height); 
      }
    });
     var heighest = left > right ? left : right;

     this.renderer.setElementStyle(this.el.nativeElement, 'height', heighest+"px");
  }

}