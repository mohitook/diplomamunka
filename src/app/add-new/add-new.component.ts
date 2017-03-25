import {
    Component,
    OnDestroy,
    AfterViewInit,
    EventEmitter,
    Input,
    Output, OnInit
} from '@angular/core';
import { EditorDirective } from '../editor.directive';

//declare var tinymce: any;

@Component({
    selector: 'app-add-new',
    templateUrl: './add-new.component.html',
    styleUrls: ['./add-new.component.css']
})
export class AddNewComponent implements OnInit {

    ckeditorContent;
    summary;

    constructor() {
        this.ckeditorContent = ``;

    }

    ngOnInit() {
    }

    onSubmit(){
      console.log(this.ckeditorContent)
    }

}
