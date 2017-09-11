import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild,Pipe,PipeTransform,Sanitizer, Inject } from '@angular/core';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { AF } from "../providers/af";
import { FirebaseListObservable, FirebaseObjectObservable } from "angularfire2";
import {Observable} from 'rxjs/Observable';
import "rxjs/add/operator/map";
import { Subject } from 'rxjs/Subject';

import {NgxPaginationModule, PaginationInstance} from 'ngx-pagination';

import { Router } from "@angular/router";

import {MediaChange, ObservableMedia} from "@angular/flex-layout";

import {MdSidenav, MdDialog, MdDialogRef, MD_DIALOG_DATA} from '@angular/material';


@Component({
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

  public configFavourite: PaginationInstance = {
        id: 'configFavourite',
        itemsPerPage: 10,
        currentPage: 1
    };

    public configAll: PaginationInstance = {
          id: 'configAll',
          itemsPerPage: 10,
          currentPage: 1
      };

      //test
      animal: string;
      name: string;

    selectedLabel:string;

    startNumber:number = 0;
    endNumber:number = 1;

    news: FirebaseListObservable<any>;
    labels: FirebaseListObservable<any>;
    userLabels: FirebaseListObservable<any>;
    allNews: FirebaseListObservable<any>;
    specificNews: FirebaseListObservable<any>;

    public valueSubject: Subject<any>;

    labelFilter:  any[] = [{ label: '' }];

    selectedLabels: Array<any>;

    selectedLabelsToSend: Array<any>;

    ///default selected value in the specific news /ng-select
    currentItem : string;

    dropdownSelected: any = {label:"Favourites", image:''};

    isMobileView: boolean;
    labelsAreAvailable: boolean = false;

    constructor(public afService: AF, private sanitizer: DomSanitizer, private media: ObservableMedia, public dialog: MdDialog){

      this.startNumber = 0;
      this.endNumber = 1;

      this.labels = this.afService.labels;
      this.selectedLabelsToSend = new Array<any>();

      this.allNews = this.afService.allNews;

      // https://github.com/angular/material2/issues/1130
      this.isMobileView = (this.media.isActive('xs') || this.media.isActive('sm'));
      this.media.subscribe((change: MediaChange) => {
          this.isMobileView = (change.mqAlias === 'xs' || change.mqAlias === 'sm');
      });

      this.labels.subscribe(x=>{
        if(x != null){
          this.labelsAreAvailable = true;
        }
      })

      console.log('home-page constructor end');
    }

    ngOnInit() {

      console.log('ngOnInit');

      // HLTV.getMatches().then((res) => {
      //   console.log(res);
      // });

      if(this.afService.uid_prop != null){
        this.afService.getUserLastSelected().subscribe(y=>{
          this.specificNews = this.afService.selectSpecificNews(y.$value);
        });
      }
      else {
        this.afService.uidUpdate.subscribe(x=>{
          console.log(x);
          this.afService.getUserLastSelected().subscribe(y=>{
            this.selectedLabel = y.$value;
            this.specificNews = this.afService.selectSpecificNews(y.$value);
            this.specificNews.subscribe(xxx => console.log(xxx));
          });
        });
      }
    }

    onLinkClick(menuSidenav : MdSidenav):void {
      if (this.isMobileView) {
        menuSidenav.close();
      }
    }

    dropdownButtonOnClick(){
      //itt használom mivel az afservice.user még nicns inicializálva amikor ráhívnék a constructorban

      if(this.afService.user == null){
        return;
      }

      this.afService.user.subscribe(x => {
        this.selectedLabels = new Array<any>();
        this.selectedLabelsToSend = new Array<any>();
        this.labelFilter = new Array<any>();
        if(x.labels == null){
          return;
        }
        x.labels.forEach(y=>{
          this.selectedLabels.push(y);
          this.selectedLabelsToSend.push(y);
          this.labelFilter.push({label:y});
        });
      });
    }

    onMultipleSelected(item) {
        this.selectedLabelsToSend.push(item.label);
    }

    onMultipleDeselected(item) {
        this.selectedLabelsToSend = this.selectedLabelsToSend.filter(x => x !== item.label);
    }

    onSingleSelected(item) {
        console.log('- selected (value: ' + item.value  + ', label:' +
                       item.label + ')');

        // this.afService.filterBy('labels/'+item.label,true);
        this.selectedLabel = item.label;
        this.specificNews = this.afService.selectSpecificNews(item.label);
    }

    onDropDownSelected(item){
      console.log(item);
      this.dropdownSelected = item;
      this.specificNews = this.afService.selectSpecificNews(item.label);
    }

    saveFavourites(){
      this.afService.setUserLabels(this.selectedLabelsToSend);
    }

    onNextPage(){
      this.afService.limitNumber += 2;
      console.log(this.selectedLabel);
      this.specificNews = this.afService.selectSpecificNews(this.selectedLabel);
      this.startNumber += 2;
      this.endNumber += 2;
    }

    openDialog(): void {
      let dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
        width: '250px',
        data: { name: this.name, animal: this.animal }
      });
  
      dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
        this.animal = result;
      });
    }
  

}


@Component({
  selector: 'dialog-overview-example-dialog',
  template: `<h2 md-dialog-title>Delete all</h2>
  <md-dialog-content>Are you sure?</md-dialog-content>
  <md-dialog-actions>
    <button md-button md-dialog-close>No</button>
    <!-- Can optionally provide a result for the closing dialog. -->
    <button md-button [md-dialog-close]="true">Yes</button>
  </md-dialog-actions>`,
})
export class DialogOverviewExampleDialog {

  constructor(
    public dialogRef: MdDialogRef<DialogOverviewExampleDialog>,
    @Inject(MD_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
