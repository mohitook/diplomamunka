import {
    Component,
    OnDestroy,
    AfterViewInit,
    EventEmitter,
    Input,
    Output, OnInit
} from '@angular/core';
import { EditorDirective } from '../editor.directive';
import { FirebaseListObservable } from "angularfire2";
import { AF } from "../providers/af";
import {NewsModel} from "../model/news.model";
import { ActivatedRoute, Router } from '@angular/router';

//declare var tinymce: any;

@Component({
    selector: 'app-add-new',
    templateUrl: './add-new.component.html',
    styleUrls: ['./add-new.component.css']
})
export class AddNewComponent implements OnInit {

    newsModel : NewsModel;

    public title;

    labels = [
        { value: 'all', checked: false },
        {  value: 'dota 2', checked: false },
        {  value: 'league of legends', checked: false },
        {  value: 'overwatch', checked: false }
    ]

    public newMessage: string;
    public messages: FirebaseListObservable<any>;
    constructor(private router: Router,public afService: AF) {
      this.newsModel = new NewsModel();
      this.title = "alma";
    }

    ngOnInit() {
    }

    get selectedOptions() {
        return this.labels
            .filter(label => label.checked)
            .map(label => label.value)
    }

    onSubmit(){
      this.newsModel.labels = this.selectedOptions;
      this.afService.sendNews(this.newsModel);
    }

}
