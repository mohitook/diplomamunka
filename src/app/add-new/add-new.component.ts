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
import {Observable} from 'rxjs/Observable';

//declare var tinymce: any;

@Component({
    selector: 'app-add-new',
    templateUrl: './add-new.component.html',
    styleUrls: ['./add-new.component.css']
})
export class AddNewComponent implements OnInit {

    newsModel : NewsModel;

    public title;

    labels = ["All"];

    items = ['Nop', 'Pasta', 'Parmesan'];

    existingLabels : FirebaseListObservable<any>;
    existingLabelsValue: Array<string> = new Array();

    public newMessage: string;
    public messages: FirebaseListObservable<any>;
    constructor(private router: Router,public afService: AF) {
      this.newsModel = new NewsModel();
      this.title = "alma";
      this.existingLabels = this.afService.labels;
      this.existingLabels.subscribe(x=>{
        this.existingLabelsValue = new Array();
        x.forEach(y=>{
          this.existingLabelsValue.push(y.value);
        })
      });
    }

    ngOnInit() {
    }

    onSubmit(){
      this.newsModel.labels = this.labels;
      this.afService.sendNews(this.newsModel);

      this.clearAll();
    }

    clearAll(){
      this.newsModel = new NewsModel();
      this.title = "alma";
      this.existingLabels = this.afService.labels;
      this.existingLabels.subscribe(x=>{
        this.existingLabelsValue = new Array();
        x.forEach(y=>{
          this.existingLabelsValue.push(y.value);
        })
      });
    }

    getCurrentLabels(){
      console.log(this.labels);
    }
    onItemAdded(){
      console.log("asdasdasd");
    }

    //végtelenszer kéregeti és jön a sub...
    getObservable(){
      //this.afService.labels.map(x=>x.value).subscribe(x=>console.log(x));
        //return this.afService.labels.map(x=>x.value);
    }

}
