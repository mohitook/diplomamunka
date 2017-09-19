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
import { FroalaEditorModule, FroalaViewModule} from 'angular-froala-wysiwyg';

import {MediaChange, ObservableMedia} from "@angular/flex-layout";

import {MdSidenav, MdDialog, MdDialogRef, MD_DIALOG_DATA} from '@angular/material';

declare var $ :any; //for custom buttons in text editor

@Component({
    selector: 'app-add-new',
    templateUrl: './add-new.component.html',
    styleUrls: ['./add-new.component.css']
})
export class AddNewComponent implements OnInit {

   editorContent;
    
    newsModel : NewsModel;

    public title;

    labels = ['All'];

    isMobileView: boolean;

    sidenavLabels = [
      {name: 'Add news', icon: 'add'},
      {name: 'Delete news', icon: 'delete'},
      {name: 'Modify categories', icon: 'class'}
    ];

    selectedSidenav;

    existingLabels : FirebaseListObservable<any>;
    existingLabelsValue: Array<string> = new Array();

    public newMessage: string;
    public messages: FirebaseListObservable<any>;
    constructor(private router: Router,public afService: AF, private media: ObservableMedia, public dialog: MdDialog) {
      this.newsModel = new NewsModel();
      this.title = "alma";
      this.existingLabels = this.afService.labels;
      this.existingLabels.subscribe(x=>{
        this.existingLabelsValue = new Array();
        x.forEach(y=>{
          this.existingLabelsValue.push(y.value);
        })
      });

      // https://github.com/angular/material2/issues/1130
      this.isMobileView = (this.media.isActive('xs') || this.media.isActive('sm'));
      this.media.subscribe((change: MediaChange) => {
          this.isMobileView = (change.mqAlias === 'xs' || change.mqAlias === 'sm');
      });

      this.selectedSidenav = this.sidenavLabels[0];
    }

    ngOnInit() {
      $.FroalaEditor.DefineIcon('alert', {NAME: 'info'});
      $.FroalaEditor.RegisterCommand('alert', {
      title: 'Hello',
      focus: false,
      undo: false,
      refreshAfterCallback: false,
      callback: function () {
      alert('Hello!');
      }
      });
    }

    public options: Object = {
      charCounterCount: true,
      //toolbarButtons: ['bold', 'italic', 'underline', 'paragraphFormat','alert'],
      //toolbarButtonsMD: ['bold', 'italic', 'underline', 'paragraphFormat','alert'],
      toolbarButtonsSM: ['fullscreen','bold', 'italic', 'underline', 'paragraphFormat','alert'],
      toolbarButtonsXS: ['fullscreen','bold', 'italic', 'underline', 'paragraphFormat','alert'],
    };


    onSubmit(){
      this.newsModel.labels = this.labels;
      this.afService.sendNews(this.newsModel);
      console.log("onSubmitEnd");
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

    onLinkClick(menuSidenav: MdSidenav): void {
      if (this.isMobileView) {
        menuSidenav.close();
      }
    }

    onSidenavClick(sidenavItem: any){
      this.selectedSidenav = sidenavItem;
      //this.router.navigate(['./gamenews', sidenavItem.label]);
    }
}
