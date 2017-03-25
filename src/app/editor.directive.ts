import {Directive, OnInit} from '@angular/core';
declare var tinymce: any;

// Tinymce directive
@Directive({
    inputs: ['htmlEditor'],
    selector: '[htmlEditor]'
})
export class EditorDirective implements OnInit {

ngOnInit(){
    tinymce.init({
        selector: 'textarea', //change this to a specific class/id
        schema: 'html5',
        skin_url: 'assets/skins/lightgray'
    });
}
}
