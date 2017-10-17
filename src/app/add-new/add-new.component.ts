import { FormControl, Validators } from '@angular/forms';
import {
  Component,
  OnDestroy,
  AfterViewInit,
  EventEmitter,
  Input,
  Output, OnInit, Inject
} from '@angular/core';
import { EditorDirective } from '../editor.directive';
import { FirebaseListObservable } from "angularfire2";
import { AF } from "../providers/af";
import { NewsModel } from "../model/news.model";
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';

import { MediaChange, ObservableMedia } from "@angular/flex-layout";

import { MdSidenav, MdDialog, MdDialogRef, MD_DIALOG_DATA } from '@angular/material';

declare var $: any; //for custom buttons in text editor

@Component({
  selector: 'app-add-new',
  templateUrl: './add-new.component.html',
  styleUrls: ['./add-new.component.css']
})
export class AddNewComponent implements OnInit {

  editorContent;

  newsModel: NewsModel;

  public title;

  labels = ['All'];

  selectedSidenav;

  existingLabels: FirebaseListObservable<any>;
  existingLabelsValue: Array<string> = new Array();

  public newMessage: string;
  public messages: FirebaseListObservable<any>;

  NOT_EMPTY_REGEX = /^.*[^ ].*$/;
  HTTP_REGEX = /^^(http|https|ftp):\/\/.*$/;

  titleFormControl = new FormControl('', [
    Validators.required,
    Validators.pattern(this.NOT_EMPTY_REGEX)]);

  imageUrlFormControl = new FormControl('', [
    Validators.required,
    Validators.pattern(this.NOT_EMPTY_REGEX),
    Validators.pattern(this.HTTP_REGEX)]);

  summaryFormControl = new FormControl('', [
    Validators.required,
    Validators.pattern(this.NOT_EMPTY_REGEX)]);

  constructor(private router: Router, public afService: AF, private media: ObservableMedia, public dialog: MdDialog) {
    this.newsModel = new NewsModel();
    this.title = "alma";
    this.existingLabels = this.afService.labels;
    this.existingLabels.subscribe(x => {
      this.existingLabelsValue = new Array();
      x.forEach(y => {
        this.existingLabelsValue.push(y.value);
      })
    });
  }

  ngOnInit() {
    $.FroalaEditor.DefineIcon('alert', { NAME: 'info' });
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
    toolbarButtonsSM: ['fullscreen', 'bold', 'italic', 'underline', 'paragraphFormat', 'alert'],
    toolbarButtonsXS: ['fullscreen', 'bold', 'italic', 'underline', 'paragraphFormat', 'alert'],
  };


  onSubmit() {
    this.newsModel.labels = this.labels;
    this.afService.sendNews(this.newsModel).subscribe(x => {
      this.router.navigate(['news/' + x.$key]);
    });
  }

  onSidenavClick(sidenavItem: any) {
    this.selectedSidenav = sidenavItem;
    //this.router.navigate(['./gamenews', sidenavItem.label]);
  }

  openPreviewDialog(): void {
    let dialogRef = this.dialog.open(PreviewDialog, {
      width: '60%',
      data: {
        newsModel: this.newsModel
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');

    });
  } 

}

@Component({
  selector: 'preview-dialog',
  templateUrl: 'preview-dialog.html',
  styleUrls: ['./add-new.component.css']
})
export class PreviewDialog {

  newsModel;

  tileView = false;

  constructor(public afService: AF,
    public dialogRef: MdDialogRef<PreviewDialog>,
    @Inject(MD_DIALOG_DATA) public data: any) { 
      this.newsModel = data.newsModel;
    }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onButton(){
    this.tileView = !this.tileView;
  }

}